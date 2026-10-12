import pytest

from app.errors import NoExtractableTextError, UnreadableFileError
from app.services.file_validation import ResumeFileKind, ValidatedFile
from app.services.resume_parser import extract_resume_text
from app.services.text_normalizer import normalize_text
from tests.factories import RESUME_LINES, make_docx, make_pdf


def _file(kind: ResumeFileKind, content: bytes) -> ValidatedFile:
    return ValidatedFile(filename=f"resume.{kind.value}", kind=kind, content=content)


def test_extracts_text_from_pdf() -> None:
    text = extract_resume_text(_file(ResumeFileKind.PDF, make_pdf(RESUME_LINES)))
    assert "Jane Doe" in text
    assert "Reduced infrastructure cost by 30%" in text


def test_extracts_docx_paragraphs_and_table_cells() -> None:
    content = make_docx(RESUME_LINES, table_rows=[["Python", "FastAPI"], ["Docker", "AWS"]])
    text = extract_resume_text(_file(ResumeFileKind.DOCX, content))
    assert "Senior Engineer | Acme Corp" in text
    assert "Python | FastAPI" in text
    assert "Docker | AWS" in text


def test_rejects_image_only_pdf() -> None:
    with pytest.raises(NoExtractableTextError, match="scanned"):
        extract_resume_text(_file(ResumeFileKind.PDF, make_pdf([])))


def test_rejects_corrupt_pdf() -> None:
    with pytest.raises(UnreadableFileError):
        extract_resume_text(_file(ResumeFileKind.PDF, b"%PDF-1.7 garbage that is not a pdf"))


def test_normalize_text_collapses_noise() -> None:
    raw = "Jane\u00a0\u00a0Doe\t\r\n\r\n\r\n\r\n\u2022  Built   APIs\x07"
    assert normalize_text(raw) == "Jane Doe\n\n- Built APIs"
