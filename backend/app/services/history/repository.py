import asyncio
from collections.abc import Callable
from dataclasses import dataclass
from typing import Protocol, TypeVar
from uuid import UUID

from psycopg.rows import dict_row
from psycopg.types.json import Jsonb
from psycopg_pool import ConnectionPool

from app.schemas.customize import CustomizeResponse
from app.schemas.history import HistoryDetail, HistorySummary

T = TypeVar("T")

SCHEMA_SQL = """
create table if not exists resume_history (
    id uuid primary key,
    user_id uuid not null references neon_auth."user" (id) on delete cascade,
    created_at timestamptz not null default now(),
    job_title text not null,
    job_description text not null,
    file_name text not null,
    file_key text not null,
    file_content_type text not null,
    file_size_bytes integer not null,
    match_score smallint not null,
    ats_score smallint not null,
    result jsonb not null
);
create index if not exists resume_history_user_created_idx
    on resume_history (user_id, created_at desc);
"""

_SUMMARY_COLUMNS = "id, created_at, job_title, file_name, match_score, ats_score"


@dataclass(frozen=True, slots=True)
class NewHistoryEntry:
    id: UUID
    user_id: UUID
    job_title: str
    job_description: str
    file_name: str
    file_key: str
    file_content_type: str
    file_size_bytes: int
    result: CustomizeResponse


@dataclass(frozen=True, slots=True)
class StoredFile:
    key: str
    file_name: str


class HistoryRepository(Protocol):
    async def insert(self, entry: NewHistoryEntry) -> None: ...

    async def list_for_user(self, user_id: UUID, limit: int) -> list[HistorySummary]: ...

    async def get(self, user_id: UUID, entry_id: UUID) -> HistoryDetail | None: ...

    async def get_file(self, user_id: UUID, entry_id: UUID) -> StoredFile | None: ...

    async def delete(self, user_id: UUID, entry_id: UUID) -> StoredFile | None: ...


class PostgresHistoryRepository:
    """Every query is scoped by `user_id`, so one user can never read another user's rows.

    Uses psycopg's synchronous pool in worker threads: its async mode cannot run on the
    Windows Proactor event loop that uvicorn uses there, and these queries are small.
    """

    def __init__(self, pool: ConnectionPool) -> None:
        self._pool = pool

    async def _run(self, query: Callable[[], T]) -> T:
        return await asyncio.to_thread(query)

    async def ensure_schema(self) -> None:
        def run() -> None:
            with self._pool.connection() as conn:
                conn.execute(SCHEMA_SQL)

        await self._run(run)

    async def insert(self, entry: NewHistoryEntry) -> None:
        result = entry.result.model_dump(mode="json", exclude={"history_id"})
        params = (
            entry.id,
            entry.user_id,
            entry.job_title,
            entry.job_description,
            entry.file_name,
            entry.file_key,
            entry.file_content_type,
            entry.file_size_bytes,
            entry.result.scores.match_score,
            entry.result.scores.ats_score,
            Jsonb(result),
        )

        def run() -> None:
            with self._pool.connection() as conn:
                conn.execute(
                    """
                    insert into resume_history (
                        id, user_id, job_title, job_description, file_name, file_key,
                        file_content_type, file_size_bytes, match_score, ats_score, result
                    ) values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    params,
                )

        await self._run(run)

    async def list_for_user(self, user_id: UUID, limit: int) -> list[HistorySummary]:
        def run() -> list[HistorySummary]:
            with self._pool.connection() as conn, conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"select {_SUMMARY_COLUMNS} from resume_history "
                    "where user_id = %s order by created_at desc limit %s",
                    (user_id, limit),
                )
                return [HistorySummary.model_validate(row) for row in cur.fetchall()]

        return await self._run(run)

    async def get(self, user_id: UUID, entry_id: UUID) -> HistoryDetail | None:
        def run() -> HistoryDetail | None:
            with self._pool.connection() as conn, conn.cursor(row_factory=dict_row) as cur:
                cur.execute(
                    f"select {_SUMMARY_COLUMNS}, job_description, result from resume_history "
                    "where user_id = %s and id = %s",
                    (user_id, entry_id),
                )
                row = cur.fetchone()
            return HistoryDetail.model_validate(row) if row else None

        detail = await self._run(run)
        if detail is None:
            return None
        return detail.model_copy(
            update={"result": detail.result.model_copy(update={"history_id": detail.id})}
        )

    async def get_file(self, user_id: UUID, entry_id: UUID) -> StoredFile | None:
        return await self._file_query(
            "select file_key, file_name from resume_history where user_id = %s and id = %s",
            user_id,
            entry_id,
        )

    async def delete(self, user_id: UUID, entry_id: UUID) -> StoredFile | None:
        return await self._file_query(
            "delete from resume_history where user_id = %s and id = %s "
            "returning file_key, file_name",
            user_id,
            entry_id,
        )

    async def _file_query(self, sql: str, user_id: UUID, entry_id: UUID) -> StoredFile | None:
        def run() -> StoredFile | None:
            with self._pool.connection() as conn:
                row = conn.execute(sql, (user_id, entry_id)).fetchone()
            return StoredFile(key=row[0], file_name=row[1]) if row else None

        return await self._run(run)
