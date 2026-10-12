"""Format-independent helpers shared by every resume exporter."""

from dataclasses import dataclass

from app.schemas.resume import ContactInfo, EducationEntry, ExperienceEntry, ProjectEntry

FIELD_SEPARATOR = " | "


@dataclass(frozen=True, slots=True)
class EntryBlock:
    """One experience, education or project item reduced to printable parts."""

    heading: str
    subheading: str
    meta: str
    lines: tuple[str, ...]


def join_present(parts: list[str], separator: str = FIELD_SEPARATOR) -> str:
    return separator.join(part for part in parts if part)


def date_range(start: str, end: str) -> str:
    if start and end:
        return f"{start} - {end}"
    return start or end


def contact_line(contact: ContactInfo) -> str:
    return join_present([contact.email, contact.phone, contact.location, *contact.links])


def experience_block(entry: ExperienceEntry) -> EntryBlock:
    return EntryBlock(
        heading=entry.title,
        subheading=entry.company,
        meta=join_present([entry.location, date_range(entry.start_date, entry.end_date)]),
        lines=tuple(entry.bullets),
    )


def education_block(entry: EducationEntry) -> EntryBlock:
    return EntryBlock(
        heading=entry.degree,
        subheading=entry.institution,
        meta=join_present([entry.location, date_range(entry.start_date, entry.end_date)]),
        lines=tuple(entry.details),
    )


def project_block(entry: ProjectEntry) -> EntryBlock:
    lines = [entry.description] if entry.description else []
    lines.extend(entry.bullets)
    return EntryBlock(
        heading=entry.name,
        subheading=", ".join(entry.technologies),
        meta=entry.link,
        lines=tuple(lines),
    )
