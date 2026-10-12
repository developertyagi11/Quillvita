import re
from collections.abc import Sequence
from dataclasses import dataclass

from starlette.concurrency import run_in_threadpool

from app.core.config import Settings
from app.schemas.customize import CustomizeResponse, LLMCustomization
from app.schemas.resume import ResumeContent, SectionName
from app.services.file_validation import ValidatedFile, validate_resume_file
from app.services.input_validation import (
    clean_confirmed_skills,
    resolve_sections,
    validate_job_description,
)
from app.services.llm.base import LLMClient
from app.services.prompts import CUSTOMIZE_SYSTEM_PROMPT, build_customize_prompt
from app.services.resume_parser import extract_resume_text
from app.services.structured_output import generate_structured
from app.services.truthfulness import (
    drop_present_keywords,
    drop_unsupported_changes,
    revert_unsupported_claims,
    unsupported_terms,
)

MIN_SKILL_WORD_LENGTH = 2
_WORD = re.compile(r"[a-z0-9]+")


def _lock_sections(
    original: ResumeContent, tailored: ResumeContent, sections: Sequence[SectionName]
) -> ResumeContent:
    """Copy identity, education and unselected sections verbatim from the original."""
    return tailored.model_copy(
        update={
            "name": original.name,
            "contact": original.contact,
            "education": original.education,
            "summary": tailored.summary if "summary" in sections else original.summary,
            "skills": tailored.skills if "skills" in sections else original.skills,
            "experience": tailored.experience if "experience" in sections else original.experience,
            "projects": tailored.projects if "projects" in sections else original.projects,
        }
    )


def _is_supported_skill(skill: str, original_skills: set[str], haystack: str) -> bool:
    """A skill is kept only if the resume lists it or mentions every word of it."""
    folded = skill.casefold()
    if folded in original_skills or folded in haystack:
        return True
    words = [word for word in _WORD.findall(folded) if len(word) >= MIN_SKILL_WORD_LENGTH]
    return bool(words) and all(word in haystack for word in words)


def _drop_unsupported_skills(
    skills: Sequence[str], original_skills: Sequence[str], resume_text: str
) -> list[str]:
    haystack = resume_text.casefold()
    listed = {skill.casefold() for skill in original_skills}
    return [skill for skill in skills if _is_supported_skill(skill, listed, haystack)]


def apply_guardrails(
    result: LLMCustomization,
    sections: Sequence[SectionName],
    resume_text: str,
    job_description: str,
) -> CustomizeResponse:
    tailored = _lock_sections(result.original, result.tailored, sections)
    supported = _drop_unsupported_skills(tailored.skills, result.original.skills, resume_text)
    tailored = tailored.model_copy(update={"skills": supported})
    terms = unsupported_terms(job_description, result.suggested_keywords, resume_text)
    tailored = revert_unsupported_claims(result.original, tailored, terms)
    changes = [change for change in result.changes if change.section in sections]
    return CustomizeResponse(
        original=result.original,
        tailored=tailored,
        matched_skills=list(dict.fromkeys(result.matched_skills)),
        suggested_keywords=drop_present_keywords(result.suggested_keywords, resume_text),
        scores=result.scores,
        changes=drop_unsupported_changes(changes, terms),
        sections=list(sections),
    )


@dataclass(frozen=True, slots=True)
class CustomizedUpload:
    file: ValidatedFile
    job_description: str
    response: CustomizeResponse


class ResumeCustomizer:
    def __init__(self, llm: LLMClient, settings: Settings) -> None:
        self._llm = llm
        self._settings = settings

    async def customize_upload(
        self,
        *,
        filename: str,
        content_type: str,
        content: bytes,
        job_description: str,
        sections: Sequence[SectionName] | None,
        confirmed_skills: Sequence[str] | None = None,
    ) -> CustomizedUpload:
        settings = self._settings
        clean_jd = validate_job_description(
            job_description, settings.min_job_description_chars, settings.max_job_description_chars
        )
        selected = resolve_sections(sections)
        confirmed = clean_confirmed_skills(confirmed_skills)
        file = validate_resume_file(filename, content_type, content, settings.max_file_size_bytes)
        resume_text = await run_in_threadpool(extract_resume_text, file)
        response = await self.customize_text(
            resume_text[: settings.max_resume_chars], clean_jd, selected, confirmed
        )
        return CustomizedUpload(file=file, job_description=clean_jd, response=response)

    async def customize_text(
        self,
        resume_text: str,
        job_description: str,
        sections: Sequence[SectionName],
        confirmed_skills: Sequence[str] = (),
    ) -> CustomizeResponse:
        result = await generate_structured(
            self._llm,
            system_prompt=CUSTOMIZE_SYSTEM_PROMPT,
            user_prompt=build_customize_prompt(
                resume_text, job_description, sections, confirmed_skills
            ),
            model=LLMCustomization,
        )
        evidence = "\n".join([resume_text, *confirmed_skills])
        return apply_guardrails(result, sections, evidence, job_description)
