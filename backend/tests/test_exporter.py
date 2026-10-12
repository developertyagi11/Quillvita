import io

import pdfplumber

from app.schemas.resume import ResumeContent
from app.services.exporter import build_filename, export_resume
from tests.factories import resume_payload


def _resume() -> ResumeContent:
    resume = ResumeContent.model_validate(resume_payload("Ingénieure backend — APIs.", ["Python"]))
    return resume.model_copy(update={"name": "José Núñez"})


def test_filename_is_ascii_and_descriptive() -> None:
    assert build_filename("José Núñez", "docx") == "Jose_Nunez_Resume_Tailored.docx"
    assert build_filename("", "pdf") == "Candidate_Resume_Tailored.pdf"


def test_pdf_supports_unicode_text() -> None:
    exported = export_resume(_resume(), "pdf")
    with pdfplumber.open(io.BytesIO(exported.content)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    assert "José Núñez" in text
    assert "Built REST APIs with FastAPI" in text


def test_txt_contains_sections_in_order() -> None:
    text = export_resume(_resume(), "txt").content.decode("utf-8")
    assert text.index("SUMMARY") < text.index("SKILLS") < text.index("EXPERIENCE")
    assert "- Built REST APIs with FastAPI serving 2M requests per day" in text
