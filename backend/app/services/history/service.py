import logging
import re
from pathlib import PurePath
from uuid import UUID, uuid4

from app.errors import NotFoundError
from app.schemas.cover_letter import CoverLetterResponse
from app.schemas.customize import CustomizeResponse
from app.schemas.history import FileDownload, HistoryDetail, HistorySummary
from app.services.auth import AuthUser
from app.services.file_validation import ValidatedFile
from app.services.history.repository import HistoryRepository, NewHistoryEntry
from app.services.history.storage import FileStorage

logger = logging.getLogger(__name__)

HISTORY_PAGE_SIZE = 50
MAX_JOB_TITLE_CHARS = 90
MAX_FILE_NAME_CHARS = 120
_UNSAFE_KEY_CHARACTERS = re.compile(r"[^A-Za-z0-9._-]+")
NOT_FOUND_MESSAGE = "That saved resume no longer exists."


def job_title_from(job_description: str) -> str:
    """The first line of a posting is almost always the role title."""
    first_line = next((line.strip() for line in job_description.splitlines() if line.strip()), "")
    if len(first_line) <= MAX_JOB_TITLE_CHARS:
        return first_line or "Untitled role"
    return first_line[: MAX_JOB_TITLE_CHARS - 1].rstrip() + "\u2026"


def storage_key(user_id: UUID, entry_id: UUID, file_name: str) -> str:
    path = PurePath(file_name)
    stem = _UNSAFE_KEY_CHARACTERS.sub("-", path.stem).strip("-")[:60] or "resume"
    return f"users/{user_id}/{entry_id}/{stem}{path.suffix.lower()}"


class HistoryService:
    def __init__(self, repository: HistoryRepository, storage: FileStorage) -> None:
        self._repository = repository
        self._storage = storage

    async def save(
        self, user: AuthUser, file: ValidatedFile, job_description: str, result: CustomizeResponse
    ) -> UUID | None:
        """Best effort: a storage or database failure must not cost the user their result."""
        entry_id = uuid4()
        file_name = PurePath(file.filename).name[:MAX_FILE_NAME_CHARS] or "resume"
        key = storage_key(user.id, entry_id, file_name)
        try:
            await self._storage.put(
                key, file.content, content_type=file.content_type, file_name=file_name
            )
        except Exception as exc:
            logger.warning("Could not store the resume file: %s", type(exc).__name__)
            return None
        entry = NewHistoryEntry(
            id=entry_id,
            user_id=user.id,
            job_title=job_title_from(job_description),
            job_description=job_description,
            file_name=file_name,
            file_key=key,
            file_content_type=file.content_type,
            file_size_bytes=len(file.content),
            result=result,
        )
        try:
            await self._repository.insert(entry)
        except Exception as exc:
            logger.warning("Could not save the history entry: %s", type(exc).__name__)
            await self._delete_file_quietly(key)
            return None
        logger.info("Saved history entry %s", entry_id)
        return entry_id

    async def list(self, user: AuthUser) -> list[HistorySummary]:
        return await self._repository.list_for_user(user.id, HISTORY_PAGE_SIZE)

    async def get(self, user: AuthUser, entry_id: UUID) -> HistoryDetail:
        detail = await self._repository.get(user.id, entry_id)
        if detail is None:
            raise NotFoundError(NOT_FOUND_MESSAGE)
        return detail

    async def save_cover_letter(
        self, user: AuthUser, entry_id: UUID, letter: CoverLetterResponse
    ) -> None:
        """Best effort: the user already has the letter on screen if saving fails."""
        try:
            saved = await self._repository.save_cover_letter(user.id, entry_id, letter)
        except Exception as exc:
            logger.warning("Could not save the cover letter: %s", type(exc).__name__)
            return
        if saved:
            logger.info("Saved cover letter for history entry %s", entry_id)

    async def file_download(self, user: AuthUser, entry_id: UUID) -> FileDownload:
        stored = await self._repository.get_file(user.id, entry_id)
        if stored is None:
            raise NotFoundError(NOT_FOUND_MESSAGE)
        url = await self._storage.download_url(stored.key)
        return FileDownload(url=url, file_name=stored.file_name)

    async def delete(self, user: AuthUser, entry_id: UUID) -> None:
        stored = await self._repository.delete(user.id, entry_id)
        if stored is None:
            raise NotFoundError(NOT_FOUND_MESSAGE)
        await self._delete_file_quietly(stored.key)

    async def _delete_file_quietly(self, key: str) -> None:
        try:
            await self._storage.delete(key)
        except Exception as exc:
            logger.warning("Could not delete a stored resume file: %s", type(exc).__name__)
