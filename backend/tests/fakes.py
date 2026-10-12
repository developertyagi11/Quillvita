from collections.abc import Sequence
from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from fastapi.testclient import TestClient
from pydantic import SecretStr

from app.api.deps import get_history_service, get_llm_client, get_optional_user
from app.core.config import Settings, get_settings
from app.main import create_app
from app.schemas.cover_letter import CoverLetterResponse
from app.schemas.history import HistoryDetail, HistorySummary
from app.services.auth import AuthUser
from app.services.history.repository import NewHistoryEntry, StoredFile
from app.services.history.service import HistoryService
from app.services.llm.base import JsonSchema

TEST_SETTINGS = Settings(
    _env_file=None,
    gemini_api_key=SecretStr("test-key"),
    llm_model="test-model",
    frontend_url="http://localhost:3000",
    max_file_size_mb=1,
)


@dataclass(frozen=True, slots=True)
class RecordedRequest:
    system: str
    user: str
    schema: JsonSchema


class FakeLLM:
    """Returns (or raises) queued responses in order and records every request it receives."""

    def __init__(self, responses: Sequence[str | Exception]) -> None:
        self._responses = list(responses)
        self.requests: list[RecordedRequest] = []

    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        self.requests.append(RecordedRequest(system, user, schema))
        response = self._responses.pop(0)
        if isinstance(response, Exception):
            raise response
        return response


class InMemoryStorage:
    def __init__(self, *, fail_put: bool = False) -> None:
        self.objects: dict[str, tuple[bytes, str, str]] = {}
        self._fail_put = fail_put

    async def put(self, key: str, content: bytes, *, content_type: str, file_name: str) -> None:
        if self._fail_put:
            raise ConnectionError("storage unreachable")
        self.objects[key] = (content, content_type, file_name)

    async def download_url(self, key: str) -> str:
        return f"https://storage.test/{key}?signature=abc"

    async def delete(self, key: str) -> None:
        self.objects.pop(key, None)


class InMemoryHistoryRepository:
    def __init__(self, *, fail_insert: bool = False) -> None:
        self.entries: dict[UUID, tuple[NewHistoryEntry, datetime]] = {}
        self.cover_letters: dict[UUID, CoverLetterResponse] = {}
        self._fail_insert = fail_insert

    async def insert(self, entry: NewHistoryEntry) -> None:
        if self._fail_insert:
            raise ConnectionError("database unreachable")
        self.entries[entry.id] = (entry, datetime.now(UTC))

    def _owned(self, user_id: UUID, entry_id: UUID) -> tuple[NewHistoryEntry, datetime] | None:
        found = self.entries.get(entry_id)
        return found if found and found[0].user_id == user_id else None

    @staticmethod
    def _summary(entry: NewHistoryEntry, created_at: datetime) -> HistorySummary:
        return HistorySummary(
            id=entry.id,
            created_at=created_at,
            job_title=entry.job_title,
            file_name=entry.file_name,
            match_score=entry.result.scores.match_score,
            ats_score=entry.result.scores.ats_score,
        )

    async def list_for_user(self, user_id: UUID, limit: int) -> list[HistorySummary]:
        owned = [found for found in self.entries.values() if found[0].user_id == user_id]
        owned.sort(key=lambda found: found[1], reverse=True)
        return [self._summary(entry, created_at) for entry, created_at in owned[:limit]]

    async def get(self, user_id: UUID, entry_id: UUID) -> HistoryDetail | None:
        found = self._owned(user_id, entry_id)
        if found is None:
            return None
        entry, created_at = found
        return HistoryDetail(
            **self._summary(entry, created_at).model_dump(),
            job_description=entry.job_description,
            result=entry.result.model_copy(update={"history_id": entry.id}),
            cover_letter=self.cover_letters.get(entry.id),
        )

    async def save_cover_letter(
        self, user_id: UUID, entry_id: UUID, letter: CoverLetterResponse
    ) -> bool:
        if self._owned(user_id, entry_id) is None:
            return False
        self.cover_letters[entry_id] = letter
        return True

    async def get_file(self, user_id: UUID, entry_id: UUID) -> StoredFile | None:
        found = self._owned(user_id, entry_id)
        return StoredFile(found[0].file_key, found[0].file_name) if found else None

    async def delete(self, user_id: UUID, entry_id: UUID) -> StoredFile | None:
        stored = await self.get_file(user_id, entry_id)
        if stored is not None:
            del self.entries[entry_id]
        return stored


ALICE = AuthUser(id=UUID("11111111-1111-4111-8111-111111111111"), email="alice@example.com")
BOB = AuthUser(id=UUID("22222222-2222-4222-8222-222222222222"), email="bob@example.com")


def build_client(
    llm: FakeLLM,
    *,
    user: AuthUser | None = None,
    history: HistoryService | None = None,
) -> TestClient:
    app = create_app(TEST_SETTINGS)
    app.dependency_overrides[get_settings] = lambda: TEST_SETTINGS
    app.dependency_overrides[get_llm_client] = lambda: llm
    app.dependency_overrides[get_optional_user] = lambda: user
    app.dependency_overrides[get_history_service] = lambda: history
    return TestClient(app)
