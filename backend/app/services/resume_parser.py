import io
import logging
from collections.abc import Iterator

import pdfplumber
from docx import Document
from docx.document import Document as DocxDocument
from docx.table import Table, _Cell
from docx.text.paragraph import Paragraph

from app.errors import NoExtractableTextError, UnreadableFileError
from app.services.file_validation import ResumeFileKind, ValidatedFile
from app.services.text_normalizer import normalize_text

logger = logging.getLogger(__name__)

# Anything shorter than this cannot be a real resume; usually it is a scanned image PDF.
MIN_EXTRACTED_CHARS = 50
TABLE_CELL_SEPARATOR = " | "


def _extract_pdf_text(content: bytes) -> str:
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        pages = [page.extract_text(x_tolerance=1.5, y_tolerance=3) or "" for page in pdf.pages]
    return "\n\n".join(pages)


def _iter_table_lines(table: Table) -> Iterator[str]:
    for row in table.rows:
        cell_texts: list[str] = []
        for cell in row.cells:
            text = "\n".join(_iter_block_lines(cell)).strip()
            # Horizontally merged cells are returned once per grid column.
            if text and (not cell_texts or cell_texts[-1] != text):
                cell_texts.append(text)
        if cell_texts:
            yield TABLE_CELL_SEPARATOR.join(cell_texts)


def _iter_block_lines(container: DocxDocument | _Cell) -> Iterator[str]:
    for block in container.iter_inner_content():
        if isinstance(block, Paragraph):
            yield block.text
        elif isinstance(block, Table):
            yield from _iter_table_lines(block)


def _iter_header_lines(document: DocxDocument) -> Iterator[str]:
    seen: set[str] = set()
    for section in document.sections:
        text = "\n".join(paragraph.text for paragraph in section.header.paragraphs).strip()
        if text and text not in seen:
            seen.add(text)
            yield text


def _extract_docx_text(content: bytes) -> str:
    document = Document(io.BytesIO(content))
    lines = [*_iter_header_lines(document), *_iter_block_lines(document)]
    return "\n".join(lines)


def extract_resume_text(file: ValidatedFile) -> str:
    try:
        raw = (
            _extract_pdf_text(file.content)
            if file.kind is ResumeFileKind.PDF
            else _extract_docx_text(file.content)
        )
    except Exception as exc:
        # Parsers raise a wide variety of low-level errors for corrupt or encrypted files.
        logger.warning("Failed to parse %s resume: %s", file.kind.value, exc)
        raise UnreadableFileError(
            "We couldn't read this file. It may be corrupted or password-protected."
        ) from exc

    text = normalize_text(raw)
    if len(text) < MIN_EXTRACTED_CHARS:
        if file.kind is ResumeFileKind.PDF:
            raise NoExtractableTextError(
                "No selectable text was found in this PDF. It looks like a scanned image. "
                "Please upload a text-based PDF or a DOCX file."
            )
        raise NoExtractableTextError("This document appears to be empty.")
    return text
