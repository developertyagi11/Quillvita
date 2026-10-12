"""Try providers in order, moving on only when one fails with a transient error."""

import logging
import time
from collections.abc import Sequence
from dataclasses import dataclass

from app.core.config import ProviderName
from app.errors import AppError, LLMRateLimitError, LLMUnavailableError
from app.services.llm.base import TRANSIENT_ERRORS, JsonSchema, LLMClient

logger = logging.getLogger(__name__)

BUSY_MESSAGE = "The AI service is busy right now. Please try again in a minute."
QUOTA_MESSAGE = (
    "The AI service has used up its free quota for now. Please try again in a few hours."
)


@dataclass(frozen=True, slots=True)
class Provider:
    name: ProviderName
    model: str
    client: LLMClient


class FallbackClient:
    def __init__(self, providers: Sequence[Provider]) -> None:
        if not providers:
            raise ValueError("FallbackClient needs at least one provider")
        self.providers = tuple(providers)

    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        last_error: AppError | None = None
        all_out_of_quota = True
        for provider in self.providers:
            if last_error is not None:
                logger.warning("Falling back to %s (%s)", provider.name, provider.model)
            started = time.monotonic()
            try:
                result = await provider.client.generate_json(system, user, schema=schema)
            except TRANSIENT_ERRORS as exc:
                logger.warning(
                    "LLM provider %s (%s) failed after retries: %s",
                    provider.name,
                    provider.model,
                    exc.code,
                )
                last_error = exc
                all_out_of_quota &= isinstance(exc, LLMRateLimitError) and exc.quota_exhausted
                continue
            logger.info(
                "LLM request handled by %s (%s) in %.1fs",
                provider.name,
                provider.model,
                time.monotonic() - started,
            )
            return result
        message = QUOTA_MESSAGE if all_out_of_quota else BUSY_MESSAGE
        raise LLMUnavailableError(message) from last_error
