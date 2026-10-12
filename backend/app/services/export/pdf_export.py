from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

from app.schemas.resume import ResumeContent
from app.services.export.layout import EntryBlock, contact_line
from app.services.export.sections import ResumeSection, build_sections

FONT_DIR = Path(__file__).resolve().parents[2] / "assets" / "fonts"
FONT_FAMILY = "NotoSans"
FONT_FILES = {"": "NotoSans-Regular.ttf", "B": "NotoSans-Bold.ttf", "I": "NotoSans-Italic.ttf"}

PAGE_MARGIN_MM = 16
MM_PER_POINT = 25.4 / 72
LINE_LEADING = 1.4
BULLET_INDENT_MM = 4
BULLET_GAP_MM = 3
NAME_SIZE_PT = 18
HEADING_SIZE_PT = 11
BODY_SIZE_PT = 10
META_SIZE_PT = 9
SECTION_GAP_MM = 4
ENTRY_GAP_MM = 2
RULE_GAP_MM = 1.5

INK = (20, 22, 26)
MUTED = (85, 91, 102)
ACCENT = (62, 71, 168)
BULLET = "\u2022"


def _line_height(size_pt: float) -> float:
    return size_pt * MM_PER_POINT * LINE_LEADING


class _ResumePDF(FPDF):
    def write_line(
        self, text: str, size: float, style: str = "", color: tuple[int, int, int] = INK
    ) -> None:
        self.set_font(FONT_FAMILY, style, size)
        self.set_text_color(*color)
        self.multi_cell(0, _line_height(size), text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def write_bullet(self, text: str) -> None:
        line_height = _line_height(BODY_SIZE_PT)
        self.set_font(FONT_FAMILY, "", BODY_SIZE_PT)
        self.set_text_color(*INK)
        self.set_x(self.l_margin + BULLET_INDENT_MM)
        self.cell(BULLET_GAP_MM, line_height, BULLET)
        self.multi_cell(0, line_height, text, new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def write_section_heading(self, title: str) -> None:
        self.ln(SECTION_GAP_MM)
        self.write_line(title.upper(), HEADING_SIZE_PT, "B", ACCENT)
        self.set_draw_color(*ACCENT)
        self.line(self.l_margin, self.get_y(), self.w - self.r_margin, self.get_y())
        self.ln(RULE_GAP_MM)


def _create_document() -> _ResumePDF:
    pdf = _ResumePDF(format="A4", unit="mm")
    pdf.set_margins(PAGE_MARGIN_MM, PAGE_MARGIN_MM, PAGE_MARGIN_MM)
    pdf.set_auto_page_break(auto=True, margin=PAGE_MARGIN_MM)
    for style, filename in FONT_FILES.items():
        pdf.add_font(FONT_FAMILY, style, str(FONT_DIR / filename))
    pdf.add_page()
    return pdf


def _write_entry(pdf: _ResumePDF, entry: EntryBlock) -> None:
    pdf.ln(ENTRY_GAP_MM)
    heading = f"{entry.heading}  |  {entry.subheading}" if entry.subheading else entry.heading
    pdf.write_line(heading, BODY_SIZE_PT, "B")
    if entry.meta:
        pdf.write_line(entry.meta, META_SIZE_PT, "I", MUTED)
    for line in entry.lines:
        pdf.write_bullet(line)


def _write_section(pdf: _ResumePDF, section: ResumeSection) -> None:
    pdf.write_section_heading(section.title)
    if section.paragraph:
        pdf.write_line(section.paragraph, BODY_SIZE_PT)
    if section.inline_list:
        pdf.write_line(", ".join(section.inline_list), BODY_SIZE_PT)
    for entry in section.entries:
        _write_entry(pdf, entry)


def build_pdf(resume: ResumeContent) -> bytes:
    pdf = _create_document()
    pdf.write_line(resume.name, NAME_SIZE_PT, "B")
    contact = contact_line(resume.contact)
    if contact:
        pdf.write_line(contact, META_SIZE_PT, color=MUTED)
    for section in build_sections(resume):
        _write_section(pdf, section)
    return bytes(pdf.output())
