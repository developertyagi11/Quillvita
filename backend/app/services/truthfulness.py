"""Code-level truthfulness checks that hold no matter which LLM produced the output.

Named terms from the job description (tools, products, platforms, seniority words) and the
model's own "missing keyword" list must not appear in the tailored resume unless the original
resume already mentions them. Neither may vague magnitudes ("millions") that round a real
figure. Offending sections are reverted to the original wording.
"""

import logging
import re
from collections.abc import Iterable, Sequence

from app.schemas.customize import ChangeEntry, SuggestedKeyword
from app.schemas.resume import ResumeContent

logger = logging.getLogger(__name__)

_SENTENCE_BREAK = re.compile(r"(?<=[.!?:;])\s+|\n+")
_WORD = re.compile(r"[A-Za-z][A-Za-z0-9+#]*(?:[.\-][A-Za-z0-9+#]+)*")
_VAGUE_MAGNITUDES = frozenset({"hundreds", "thousands", "millions", "billions"})


def _named_terms(job_description: str) -> set[str]:
    """Capitalized words that do not start a sentence: product, tool and title names."""
    terms: set[str] = set()
    for sentence in _SENTENCE_BREAK.split(job_description):
        terms.update(word.casefold() for word in _WORD.findall(sentence)[1:] if word[0].isupper())
    return terms


def _mentions(text: str, term: str) -> bool:
    return re.search(rf"(?<![a-z0-9]){re.escape(term)}(?![a-z0-9])", text.casefold()) is not None


def unsupported_terms(
    job_description: str, keywords: Sequence[SuggestedKeyword], resume_text: str
) -> set[str]:
    candidates = (
        _named_terms(job_description) | {k.keyword.casefold() for k in keywords} | _VAGUE_MAGNITUDES
    )
    return {term for term in candidates if term and not _mentions(resume_text, term)}


def _is_unsafe(texts: Iterable[str], terms: set[str]) -> bool:
    return any(_mentions(text, term) for text in texts for term in terms)


def revert_unsupported_claims(
    original: ResumeContent, tailored: ResumeContent, terms: set[str]
) -> ResumeContent:
    if not terms:
        return tailored
    summary = original.summary if _is_unsafe([tailored.summary], terms) else tailored.summary
    originals_by_role = {(job.title, job.company): job for job in original.experience}
    experience = [
        originals_by_role.get((job.title, job.company), job.model_copy(update={"bullets": []}))
        if _is_unsafe(job.bullets, terms)
        else job
        for job in tailored.experience
    ]
    originals_by_name = {project.name: project for project in original.projects}
    projects = [
        originals_by_name.get(
            project.name, project.model_copy(update={"description": "", "bullets": []})
        )
        if _is_unsafe([project.description, *project.bullets], terms)
        else project
        for project in tailored.projects
    ]
    reverted = (
        (summary != tailored.summary)
        + sum(new is not old for new, old in zip(experience, tailored.experience, strict=True))
        + sum(new is not old for new, old in zip(projects, tailored.projects, strict=True))
    )
    if reverted:
        logger.warning("Reverted %d section(s) that claimed skills not in the resume", reverted)
    return tailored.model_copy(
        update={"summary": summary, "experience": experience, "projects": projects}
    )


def drop_unsupported_changes(changes: Sequence[ChangeEntry], terms: set[str]) -> list[ChangeEntry]:
    return [change for change in changes if not _is_unsafe([change.after], terms)]
