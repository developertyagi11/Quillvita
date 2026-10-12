from app.schemas.resume import ResumeContent
from app.services.export.layout import EntryBlock, contact_line, join_present
from app.services.export.sections import build_sections

BULLET = "-"


def _entry_lines(entry: EntryBlock) -> list[str]:
    lines = [join_present([entry.heading, entry.subheading])]
    if entry.meta:
        lines.append(entry.meta)
    lines.extend(f"{BULLET} {line}" for line in entry.lines)
    return lines


def render_plain_text(resume: ResumeContent) -> str:
    lines: list[str] = [resume.name]
    contact = contact_line(resume.contact)
    if contact:
        lines.append(contact)

    for section in build_sections(resume):
        lines.extend(["", section.title.upper()])
        if section.paragraph:
            lines.append(section.paragraph)
        if section.inline_list:
            lines.append(", ".join(section.inline_list))
        for index, entry in enumerate(section.entries):
            if index > 0:
                lines.append("")
            lines.extend(_entry_lines(entry))
    return "\n".join(lines).strip() + "\n"


def build_txt(resume: ResumeContent) -> bytes:
    return render_plain_text(resume).encode("utf-8")
