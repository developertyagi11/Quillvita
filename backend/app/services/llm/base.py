"""The provider-agnostic interface the rest of the app depends on."""

from typing import Protocol

from app.errors import LLMProviderError, LLMRateLimitError, LLMTimeoutError

JsonSchema = dict[str, object]

# Failures worth retrying or handing to another provider. Anything else (bad key, unknown
# model, unusable output) is raised to the caller immediately.
TRANSIENT_ERRORS = (LLMRateLimitError, LLMTimeoutError, LLMProviderError)


class LLMClient(Protocol):
    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        """Return raw JSON text that is expected (but not yet verified) to match `schema`."""
        ...
