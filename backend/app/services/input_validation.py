from collections.abc import Sequence

from app.errors import InvalidInputError
from app.schemas.resume import ALL_SECTIONS, SectionName


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
