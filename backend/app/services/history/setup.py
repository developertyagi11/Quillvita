import asyncio
import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from psycopg_pool import ConnectionPool

from app.core.config import Settings
from app.services.history.repository import PostgresHistoryRepository
from app.services.history.service import HistoryService
from app.services.history.storage import S3FileStorage

logger = logging.getLogger(__name__)

POOL_MIN_SIZE = 1
POOL_MAX_SIZE = 5
POOL_TIMEOUT_SECONDS = 20.0


@asynccontextmanager
async def history_service_lifespan(settings: Settings) -> AsyncIterator[HistoryService | None]:
    if not settings.history_enabled:
        logger.info("History is off: Neon Auth, DATABASE_URL or object storage is not configured")
        yield None
        return
    pool = ConnectionPool(
        settings.database_url.get_secret_value(),
        min_size=POOL_MIN_SIZE,
        max_size=POOL_MAX_SIZE,
        timeout=POOL_TIMEOUT_SECONDS,
        open=False,
        check=ConnectionPool.check_connection,
        # Neon's pooled endpoint runs PgBouncer in transaction mode, so skip server-side
        # prepared statements.
        kwargs={"autocommit": True, "prepare_threshold": None},
    )
    pool.open(wait=False)
    repository = PostgresHistoryRepository(pool)
    try:
        await repository.ensure_schema()
    except Exception as exc:
        # A cold or unreachable database should not stop tailoring; saves are best effort.
        logger.warning("Could not prepare the history table: %s", type(exc).__name__)
    storage = S3FileStorage.create(
        endpoint_url=settings.aws_endpoint_url_s3,
        region=settings.aws_region,
        access_key_id=settings.aws_access_key_id.get_secret_value(),
        secret_access_key=settings.aws_secret_access_key.get_secret_value(),
        bucket=settings.storage_bucket,
    )
    try:
        yield HistoryService(repository, storage)
    finally:
        await asyncio.to_thread(pool.close)
