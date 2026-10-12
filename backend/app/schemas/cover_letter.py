from typing import Literal
from uuid import UUID

from pydantic import Field

from app.schemas.resume import BaseSchema, ResumeContent

CoverLetterTone = Literal["professional", "enthusiastic", "concise"]


class CoverLetterRequest(BaseSchema):
    resume: ResumeContent
    job_description: str = Field(max_length=20_000)
    tone: CoverLetterTone = "professional"
    history_id: UUID | None = Field(
        default=None, description="Saved run to attach the letter to, for a signed-in user."
    )


class LLMCoverLetter(BaseSchema):
    """Exact shape the model must return for a cover letter."""

    greeting: str
    paragraphs: list[str] = Field(min_length=2, max_length=6)
    closing: str


class CoverLetterResponse(BaseSchema):
    greeting: str
    paragraphs: list[str]
    closing: str
    signature: str
