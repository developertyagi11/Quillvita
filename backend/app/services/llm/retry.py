"""Retry transient provider failures with exponential backoff inside a time budget."""

import asyncio
import logging
import random
from collections.abc import Awaitable, Callable

from app.errors import AppError, LLMRateLimitError, LLMTimeoutError
from app.services.llm.base import TRANSIENT_ERRORS, JsonSchema, LLMClient

logger = logging.getLogger(__name__)

MAX_RETRIES = 2
BASE_DELAY_SECONDS = 1.0
MAX_DELAY_SECONDS = 8.0
MAX_RETRY_AFTER_SECONDS = 10.0
MAX_JITTER_SECONDS = 0.5
MIN_ATTEMPT_SECONDS = 5.0

Sleep = Callable[[float], Awaitable[None]]


def backoff_delay(attempt: int, error: AppError) -> float | None:
    """Seconds to wait before retry number `attempt + 1`, or None if waiting cannot help.

    A provider's own retry-after hint wins when it is short; long hints and exhausted daily
    quotas skip straight to the fallback provider instead of stalling the request.
    """
    if isinstance(error, LLMRateLimitError):
        if error.quota_exhausted:
            return None
        if error.retry_after_hint is not None:
            if error.retry_after_hint > MAX_RETRY_AFTER_SECONDS:
                return None
            return error.retry_after_hint + random.uniform(0, MAX_JITTER_SECONDS)
    delay = min(BASE_DELAY_SECONDS * 2.0**attempt, MAX_DELAY_SECONDS)
    return delay + random.uniform(0, MAX_JITTER_SECONDS)


class RetryingClient:
    def __init__(
        self,
        inner: LLMClient,
        *,
        label: str,
        budget_seconds: float,
        max_retries: int = MAX_RETRIES,
        sleep: Sleep = asyncio.sleep,
    ) -> None:
        self._inner = inner
        self._label = label
        self._budget_seconds = budget_seconds
        self._max_retries = max_retries
        self._sleep = sleep

    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        loop = asyncio.get_running_loop()
        deadline = loop.time() + self._budget_seconds
        attempt = 0
        while True:
            try:
                return await asyncio.wait_for(
                    self._inner.generate_json(system, user, schema=schema),
                    timeout=max(deadline - loop.time(), 0.0),
                )
            except TimeoutError as exc:
                error: AppError = LLMTimeoutError("The AI took too long to respond.")
                cause: BaseException = exc
            except TRANSIENT_ERRORS as exc:
                error = exc
                cause = exc

            delay = backoff_delay(attempt, error)
            out_of_time = delay is not None and (
                loop.time() + delay + MIN_ATTEMPT_SECONDS > deadline
            )
            if delay is None or attempt >= self._max_retries or out_of_time:
                raise error from cause
            attempt += 1
            logger.info(
                "%s failed (%s); retry %d/%d in %.1fs",
                self._label,
                error.code,
                attempt,
                self._max_retries,
                delay,
            )
            await self._sleep(delay)
