import re
import unicodedata
from collections.abc import Callable
from dataclasses import dataclass

from app.schemas.export import ExportFormat
from app.schemas.resume import ResumeContent
from app.services.export.docx_export import build_docx
from app.services.export.pdf_export import build_pdf
from app.services.export.text_export import build_txt

DEFAULT_FILE_STEM = "Candidate"
FILENAME_SUFFIX = "Resume_Tailored"
_UNSAFE_FILENAME_CHARS = re.compile(r"[^A-Za-z0-9]+")

_BUILDERS: dict[ExportFormat, Callable[[ResumeContent], bytes]] = {
    "pdf": build_pdf,
    "docx": build_docx,
    "txt": build_txt,
}

MEDIA_TYPES: dict[ExportFormat, str] = {
    "pdf": "application/pdf",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "txt": "text/plain; charset=utf-8",
}


@dataclass(frozen=True, slots=True)
class ExportedFile:
    content: bytes
    media_type: str
    filename: str


def build_filename(name: str, export_format: ExportFormat) -> str:
    # Strip accents first so "José Núñez" becomes "Jose_Nunez" rather than "Jos_N_ez".
    ascii_name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")
    stem = _UNSAFE_FILENAME_CHARS.sub("_", ascii_name).strip("_") or DEFAULT_FILE_STEM
    return f"{stem}_{FILENAME_SUFFIX}.{export_format}"


def export_resume(resume: ResumeContent, export_format: ExportFormat) -> ExportedFile:
    return ExportedFile(
        content=_BUILDERS[export_format](resume),
        media_type=MEDIA_TYPES[export_format],
        filename=build_filename(resume.name, export_format),
    )
