import re
from collections.abc import Sequence

from app.errors import InvalidInputError
from app.schemas.resume import ALL_SECTIONS, SectionName

MAX_CONFIRMED_SKILLS = 20
MAX_CONFIRMED_SKILL_CHARS = 80
_WHITESPACE = re.compile(r"\s+")


def validate_job_description(text: str, min_chars: int, max_chars: int) -> str:
    cleaned = text.strip()
    if not cleaned:
        raise InvalidInputError("Please paste the job description.")
    if len(cleaned) < min_chars:
        raise InvalidInputError(
            f"The job description is too short ({len(cleaned)} characters). "
            f"Paste at least {min_chars} characters so the tailoring is meaningful."
        )
    if len(cleaned) > max_chars:
        raise InvalidInputError(
            f"The job description is too long. Please keep it under {max_chars:,} characters."
        )
    return cleaned


def resolve_sections(requested: Sequence[SectionName] | None) -> list[SectionName]:
    """Default to every section; keep a stable, canonical order without duplicates."""
    if requested is None:
        return list(ALL_SECTIONS)
    selected = [section for section in ALL_SECTIONS if section in requested]
    if not selected:
        raise InvalidInputError("Select at least one section to customize.")
    return selected


def clean_confirmed_skills(skills: Sequence[str] | None) -> list[str]:
    """Skills the user vouches for: trimmed, de-duplicated, bounded in count and length."""
    cleaned: dict[str, str] = {}
    for raw in skills or ():
        skill = _WHITESPACE.sub(" ", raw).strip()
        if not skill:
            continue
        if len(skill) > MAX_CONFIRMED_SKILL_CHARS:
            raise InvalidInputError(
                f"Keep each added skill under {MAX_CONFIRMED_SKILL_CHARS} characters."
            )
        cleaned.setdefault(skill.casefold(), skill)
    if len(cleaned) > MAX_CONFIRMED_SKILLS:
        raise InvalidInputError(f"Add at most {MAX_CONFIRMED_SKILLS} skills at a time.")
    return list(cleaned.values())
