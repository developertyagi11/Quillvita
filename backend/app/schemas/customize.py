from uuid import UUID

from pydantic import Field

from app.schemas.resume import BaseSchema, ChangeSection, ResumeContent, SectionName

SCORE_MIN = 0
SCORE_MAX = 100


class SuggestedKeyword(BaseSchema):
    keyword: str
    reason: str


class ChangeEntry(BaseSchema):
    section: ChangeSection
    before: str
    after: str
    reason: str


class ScoreReport(BaseSchema):
    match_score: int = Field(ge=SCORE_MIN, le=SCORE_MAX)
    match_justification: str
    ats_score: int = Field(ge=SCORE_MIN, le=SCORE_MAX)
    ats_tips: list[str] = Field(min_length=1, max_length=5)


class LLMCustomization(BaseSchema):
    """Exact shape the model must return. Validated before anything reaches the client."""

    original: ResumeContent
    tailored: ResumeContent
    matched_skills: list[str]
    suggested_keywords: list[SuggestedKeyword]
    scores: ScoreReport
    changes: list[ChangeEntry]


class CustomizeResponse(BaseSchema):
    original: ResumeContent
    tailored: ResumeContent
    matched_skills: list[str]
    suggested_keywords: list[SuggestedKeyword]
    scores: ScoreReport
    changes: list[ChangeEntry]
    sections: list[SectionName]
    history_id: UUID | None = Field(
        default=None, description="Set when the run was saved to the signed-in user's history."
    )
