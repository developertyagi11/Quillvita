import io
import zipfile
from dataclasses import dataclass
from enum import StrEnum
from pathlib import PurePath

from app.core.config import BYTES_PER_MB
from app.errors import FileTooLargeError, InvalidFileTypeError

PDF_SIGNATURE = b"%PDF-"
ZIP_SIGNATURE = b"PK\x03\x04"
DOCX_MAIN_PART = "word/document.xml"
GENERIC_MIME_TYPES = frozenset({"", "application/octet-stream"})


class ResumeFileKind(StrEnum):
    PDF = "pdf"
    DOCX = "docx"


_EXTENSION_TO_KIND: dict[str, ResumeFileKind] = {
    ".pdf": ResumeFileKind.PDF,
    ".docx": ResumeFileKind.DOCX,
}

_ALLOWED_MIME_TYPES: dict[ResumeFileKind, frozenset[str]] = {
    ResumeFileKind.PDF: frozenset({"application/pdf", "application/x-pdf"}),
    ResumeFileKind.DOCX: frozenset(
        {"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
    ),
}

UNSUPPORTED_TYPE_MESSAGE = "Only PDF and DOCX resumes are supported."


@dataclass(frozen=True, slots=True)
class ValidatedFile:
    filename: str
    kind: ResumeFileKind
    content: bytes

    @property
    def content_type(self) -> str:
        return _CANONICAL_MIME_TYPES[self.kind]


_CANONICAL_MIME_TYPES: dict[ResumeFileKind, str] = {
    ResumeFileKind.PDF: "application/pdf",
    ResumeFileKind.DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


def _kind_from_filename(filename: str) -> ResumeFileKind:
    kind = _EXTENSION_TO_KIND.get(PurePath(filename).suffix.lower())
    if kind is None:
        raise InvalidFileTypeError(UNSUPPORTED_TYPE_MESSAGE)
    return kind


def _check_mime_type(kind: ResumeFileKind, content_type: str) -> None:
    # Some browsers and operating systems report DOCX (and occasionally PDF) as a generic
    # binary type; the signature check below is the authoritative test in that case.
    normalized = content_type.split(";", 1)[0].strip().lower()
    if normalized in GENERIC_MIME_TYPES or normalized in _ALLOWED_MIME_TYPES[kind]:
        return
    raise InvalidFileTypeError(
        f"The file extension says {kind.value.upper()}, but the browser reported "
        f"'{normalized}'. {UNSUPPORTED_TYPE_MESSAGE}"
    )


def _is_docx_archive(content: bytes) -> bool:
    if not content.startswith(ZIP_SIGNATURE):
        return False
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as archive:
            return DOCX_MAIN_PART in archive.namelist()
    except zipfile.BadZipFile:
        return False


def _check_signature(kind: ResumeFileKind, content: bytes) -> None:
    matches = (
        content.startswith(PDF_SIGNATURE)
        if kind is ResumeFileKind.PDF
        else _is_docx_archive(content)
    )
    if not matches:
        raise InvalidFileTypeError(
            f"This file does not look like a real {kind.value.upper()} document. "
            "It may be corrupted or renamed from another format."
        )


def validate_resume_file(
    filename: str, content_type: str, content: bytes, max_size_bytes: int
) -> ValidatedFile:
    kind = _kind_from_filename(filename)
    if len(content) == 0:
        raise InvalidFileTypeError("The uploaded file is empty.")
    if len(content) > max_size_bytes:
        raise FileTooLargeError(
            f"The resume must be {max_size_bytes // BYTES_PER_MB} MB or smaller."
        )
    _check_mime_type(kind, content_type)
    _check_signature(kind, content)
    return ValidatedFile(filename=filename, kind=kind, content=content)
