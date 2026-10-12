import json

from app.errors import LLMUnavailableError
from app.services.llm.fallback import BUSY_MESSAGE
from app.services.prompts import CUSTOMIZE_SYSTEM_PROMPT
from tests.factories import (
    JOB_DESCRIPTION,
    RESUME_LINES,
    customization_payload,
    make_docx,
    make_pdf,
    resume_payload,
)
from tests.fakes import FakeLLM, build_client

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"


def test_health() -> None:
    response = build_client(FakeLLM([])).get("/api/health")
    assert response.json() == {"status": "ok"}


def test_customize_happy_path_with_sections() -> None:
    llm = FakeLLM([customization_payload()])
    response = build_client(llm).post(
        "/api/customize",
        files={"resume": ("cv.docx", make_docx(RESUME_LINES), DOCX_MIME)},
        data={"job_description": JOB_DESCRIPTION, "sections": ["skills", "summary"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["sections"] == ["summary", "skills"]
    assert body["scores"]["ats_score"] == 82
    assert llm.requests[0].system == CUSTOMIZE_SYSTEM_PROMPT
    assert 'Locked sections (copy unchanged into "tailored"): experience, projects' in (
        llm.requests[0].user
    )


def test_all_providers_busy_returns_friendly_message_and_retry_after() -> None:
    response = build_client(FakeLLM([LLMUnavailableError(BUSY_MESSAGE)])).post(
        "/api/customize",
        files={"resume": ("cv.docx", make_docx(RESUME_LINES), DOCX_MIME)},
        data={"job_description": JOB_DESCRIPTION},
    )
    assert response.status_code == 503
    assert response.headers["Retry-After"] == "60"
    assert response.json()["error"] == {"code": "llm_busy", "message": BUSY_MESSAGE}


def test_customize_rejects_short_job_description() -> None:
    response = build_client(FakeLLM([])).post(
        "/api/customize",
        files={"resume": ("cv.pdf", make_pdf(RESUME_LINES), "application/pdf")},
        data={"job_description": "  too short  "},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_input"


def test_customize_rejects_wrong_file_type_with_error_body() -> None:
    response = build_client(FakeLLM([])).post(
        "/api/customize",
        files={"resume": ("cv.png", b"\x89PNG\r\n", "image/png")},
        data={"job_description": JOB_DESCRIPTION},
    )
    assert response.status_code == 415
    assert set(response.json()["error"]) == {"code", "message"}


def test_customize_rejects_oversized_upload() -> None:
    response = build_client(FakeLLM([])).post(
        "/api/customize",
        files={"resume": ("cv.pdf", b"%PDF-" + b"0" * 2 * 1024 * 1024, "application/pdf")},
        data={"job_description": JOB_DESCRIPTION},
    )
    assert response.status_code == 413


def test_missing_field_uses_consistent_error_shape() -> None:
    response = build_client(FakeLLM([])).post("/api/customize", data={"job_description": "x"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "invalid_request"


def test_export_formats_and_filename() -> None:
    client = build_client(FakeLLM([]))
    resume = resume_payload("Backend engineer.", ["Python"])
    signatures = {"pdf": b"%PDF-", "docx": b"PK\x03\x04", "txt": b"Jane Doe"}
    for export_format, signature in signatures.items():
        response = client.post("/api/export", json={"resume": resume, "format": export_format})
        assert response.status_code == 200
        assert response.content.startswith(signature)
        disposition = response.headers["content-disposition"]
        assert f'filename="Jane_Doe_Resume_Tailored.{export_format}"' in disposition


def test_export_rejects_unknown_format() -> None:
    resume = resume_payload("Backend engineer.", ["Python"])
    response = build_client(FakeLLM([])).post(
        "/api/export", json={"resume": resume, "format": "rtf"}
    )
    assert response.status_code == 422


def test_cover_letter() -> None:
    letter = {
        "greeting": "Dear Hiring Manager,",
        "paragraphs": ["First paragraph.", "Second paragraph."],
        "closing": "Sincerely,",
    }
    llm = FakeLLM([json.dumps(letter)])
    response = build_client(llm).post(
        "/api/cover-letter",
        json={
            "resume": resume_payload("Backend engineer.", ["Python"]),
            "job_description": JOB_DESCRIPTION,
        },
    )
    assert response.status_code == 200
    assert response.json()["signature"] == "Jane Doe"
