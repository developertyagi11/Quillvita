from app.core.config import Settings
from app.schemas.cover_letter import CoverLetterResponse, CoverLetterTone, LLMCoverLetter
from app.schemas.resume import ResumeContent
from app.services.export.text_export import render_plain_text
from app.services.input_validation import validate_job_description
from app.services.llm.base import LLMClient
from app.services.prompts import COVER_LETTER_SYSTEM_PROMPT, build_cover_letter_prompt
from app.services.structured_output import generate_structured


class CoverLetterGenerator:
    def __init__(self, llm: LLMClient, settings: Settings) -> None:
        self._llm = llm
        self._settings = settings

    async def generate(
        self, resume: ResumeContent, job_description: str, tone: CoverLetterTone
    ) -> CoverLetterResponse:
        clean_jd = validate_job_description(
            job_description,
            self._settings.min_job_description_chars,
            self._settings.max_job_description_chars,
        )
        letter = await generate_structured(
            self._llm,
            system_prompt=COVER_LETTER_SYSTEM_PROMPT,
            user_prompt=build_cover_letter_prompt(render_plain_text(resume), clean_jd, tone),
            model=LLMCoverLetter,
        )
        return CoverLetterResponse(
            greeting=letter.greeting,
            paragraphs=letter.paragraphs,
            closing=letter.closing,
            signature=resume.name,
        )
