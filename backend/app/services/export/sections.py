from dataclasses import dataclass

from app.schemas.resume import ResumeContent
from app.services.export.layout import (
    EntryBlock,
    education_block,
    experience_block,
    project_block,
)


@dataclass(frozen=True, slots=True)
class ResumeSection:
    title: str
    paragraph: str = ""
    inline_list: tuple[str, ...] = ()
    entries: tuple[EntryBlock, ...] = ()


def build_sections(resume: ResumeContent) -> list[ResumeSection]:
    """Return non-empty sections in conventional resume order."""
    candidates = [
        ResumeSection(title="Summary", paragraph=resume.summary),
        ResumeSection(title="Skills", inline_list=tuple(resume.skills)),
        ResumeSection(
            title="Experience", entries=tuple(experience_block(e) for e in resume.experience)
        ),
        ResumeSection(title="Projects", entries=tuple(project_block(p) for p in resume.projects)),
        ResumeSection(
            title="Education", entries=tuple(education_block(e) for e in resume.education)
        ),
    ]
    return [s for s in candidates if s.paragraph or s.inline_list or s.entries]
