from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.services.history.service import HistoryService, job_title_from, storage_key
from tests.factories import JOB_DESCRIPTION, RESUME_LINES, customization_payload, make_docx
from tests.fakes import (
    ALICE,
    BOB,
    FakeLLM,
    InMemoryHistoryRepository,
    InMemoryStorage,
    build_client,
)

DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
DOCX = make_docx(RESUME_LINES)


def _customize(client: TestClient, file_name: str = "Jane Doe CV.docx") -> dict[str, object]:
    response = client.post(
        "/api/customize",
        files={"resume": (file_name, DOCX, "application/octet-stream")},
        data={"job_description": JOB_DESCRIPTION},
    )
    assert response.status_code == 200
    body: dict[str, object] = response.json()
    return body


def test_signed_in_run_saves_file_and_result() -> None:
    repository, storage = InMemoryHistoryRepository(), InMemoryStorage()
    client = build_client(
        FakeLLM([customization_payload()]),
        user=ALICE,
        history=HistoryService(repository, storage),
    )
    body = _customize(client)

    history_id = UUID(str(body["history_id"]))
    entry, _ = repository.entries[history_id]
    assert entry.user_id == ALICE.id
    assert entry.file_key == f"users/{ALICE.id}/{history_id}/Jane-Doe-CV.docx"
    assert entry.job_title.startswith("We are hiring a Senior Backend Engineer")
    assert entry.result.history_id is None
    assert storage.objects[entry.file_key] == (DOCX, DOCX_MIME, "Jane Doe CV.docx")


def test_anonymous_run_is_not_saved() -> None:
    repository, storage = InMemoryHistoryRepository(), InMemoryStorage()
    client = build_client(
        FakeLLM([customization_payload()]), history=HistoryService(repository, storage)
    )
    body = _customize(client)
    assert body["history_id"] is None
    assert not repository.entries
    assert not storage.objects


def test_storage_failure_still_returns_the_result() -> None:
    repository = InMemoryHistoryRepository()
    service = HistoryService(repository, InMemoryStorage(fail_put=True))
    body = _customize(build_client(FakeLLM([customization_payload()]), user=ALICE, history=service))
    assert body["history_id"] is None
    assert body["scores"] is not None
    assert not repository.entries


def test_database_failure_removes_the_uploaded_file() -> None:
    storage = InMemoryStorage()
    service = HistoryService(InMemoryHistoryRepository(fail_insert=True), storage)
    body = _customize(build_client(FakeLLM([customization_payload()]), user=ALICE, history=service))
    assert body["history_id"] is None
    assert not storage.objects


def test_history_requires_sign_in() -> None:
    service = HistoryService(InMemoryHistoryRepository(), InMemoryStorage())
    response = build_client(FakeLLM([]), history=service).get("/api/history")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_history_unavailable_without_database() -> None:
    response = build_client(FakeLLM([]), user=ALICE).get("/api/history")
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "history_unavailable"


def test_owner_can_list_open_download_and_delete() -> None:
    repository, storage = InMemoryHistoryRepository(), InMemoryStorage()
    service = HistoryService(repository, storage)
    client = build_client(FakeLLM([customization_payload()]), user=ALICE, history=service)
    history_id = _customize(client)["history_id"]

    items = client.get("/api/history").json()["items"]
    assert [item["id"] for item in items] == [history_id]
    assert items[0]["file_name"] == "Jane Doe CV.docx"
    assert items[0]["match_score"] == 78

    detail = client.get(f"/api/history/{history_id}").json()
    assert detail["job_description"] == JOB_DESCRIPTION
    assert detail["result"]["history_id"] == history_id

    download = client.get(f"/api/history/{history_id}/file").json()
    assert download["file_name"] == "Jane Doe CV.docx"
    assert download["url"].startswith("https://storage.test/users/")

    assert client.delete(f"/api/history/{history_id}").status_code == 204
    assert client.get("/api/history").json()["items"] == []
    assert not storage.objects


def test_other_users_cannot_see_or_delete_an_entry() -> None:
    repository, storage = InMemoryHistoryRepository(), InMemoryStorage()
    service = HistoryService(repository, storage)
    alice = build_client(FakeLLM([customization_payload()]), user=ALICE, history=service)
    history_id = _customize(alice)["history_id"]

    bob = build_client(FakeLLM([]), user=BOB, history=service)
    assert bob.get("/api/history").json()["items"] == []
    for response in (
        bob.get(f"/api/history/{history_id}"),
        bob.get(f"/api/history/{history_id}/file"),
        bob.delete(f"/api/history/{history_id}"),
    ):
        assert response.status_code == 404
        assert response.json()["error"]["code"] == "not_found"
    assert len(repository.entries) == 1


def test_job_title_uses_first_line_and_truncates() -> None:
    assert (
        job_title_from("\n  Staff Engineer, Payments  \nAbout us...") == "Staff Engineer, Payments"
    )
    assert job_title_from("   ") == "Untitled role"
    long_title = job_title_from("x" * 200)
    assert len(long_title) == 90
    assert long_title.endswith("\u2026")


def test_storage_key_is_scoped_and_safe() -> None:
    entry_id = uuid4()
    key = storage_key(ALICE.id, entry_id, "../../Résumé (final).PDF")
    assert key == f"users/{ALICE.id}/{entry_id}/R-sum-final.pdf"
