import pytest

from app.errors import FileTooLargeError, InvalidFileTypeError
from app.services.file_validation import ResumeFileKind, validate_resume_file
from tests.factories import RESUME_LINES, make_docx, make_pdf

MAX_BYTES = 1024 * 1024
PDF_MIME = "application/pdf"
DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def test_accepts_real_pdf() -> None:
    result = validate_resume_file("cv.pdf", PDF_MIME, make_pdf(RESUME_LINES), MAX_BYTES)
    assert result.kind is ResumeFileKind.PDF


def test_accepts_docx_reported_as_octet_stream() -> None:
    content = make_docx(RESUME_LINES)
    result = validate_resume_file("CV.DOCX", "application/octet-stream", content, MAX_BYTES)
    assert result.kind is ResumeFileKind.DOCX


@pytest.mark.parametrize("filename", ["resume.txt", "resume.doc", "resume", "resume.pdf.exe"])
def test_rejects_unsupported_extensions(filename: str) -> None:
    with pytest.raises(InvalidFileTypeError):
        validate_resume_file(filename, PDF_MIME, make_pdf(RESUME_LINES), MAX_BYTES)


def test_rejects_renamed_file_by_signature() -> None:
    with pytest.raises(InvalidFileTypeError, match="does not look like"):
        validate_resume_file("resume.pdf", PDF_MIME, b"plain text pretending", MAX_BYTES)


def test_rejects_zip_that_is_not_docx() -> None:
    with pytest.raises(InvalidFileTypeError):
        validate_resume_file("resume.docx", DOCX_MIME, b"PK\x03\x04not-a-zip", MAX_BYTES)


def test_rejects_mismatched_mime_type() -> None:
    with pytest.raises(InvalidFileTypeError):
        validate_resume_file("resume.pdf", "image/png", make_pdf(RESUME_LINES), MAX_BYTES)


def test_rejects_oversized_file() -> None:
    oversized = b"%PDF-" + b"0" * MAX_BYTES
    with pytest.raises(FileTooLargeError):
        validate_resume_file("resume.pdf", PDF_MIME, oversized, MAX_BYTES)


def test_rejects_empty_file() -> None:
    with pytest.raises(InvalidFileTypeError, match="empty"):
        validate_resume_file("resume.pdf", PDF_MIME, b"", MAX_BYTES)
