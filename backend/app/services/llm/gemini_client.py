"""Gemini (Google AI Studio) implementation of `LLMClient` via the `google-genai` SDK."""

import httpx
from google import genai
from google.genai import errors as genai_errors
from google.genai import types

from app.errors import LLMInvalidOutputError, LLMProviderError, LLMTimeoutError
from app.services.llm.base import JsonSchema
from app.services.llm.gemini_errors import map_gemini_error

MILLISECONDS_PER_SECOND = 1000


class GeminiClient:
    # Gemini 3 ignores temperature/top_p/top_k; output is steered by the JSON schema and the
    # thinking level instead. `low` keeps latency down for a writing task like this one.
    TIMEOUT_SECONDS = 45.0
    THINKING_LEVEL = types.ThinkingLevel.LOW

    def __init__(self, api_key: str, model: str) -> None:
        self._model = model
        self._client = genai.Client(
            api_key=api_key,
            http_options=types.HttpOptions(
                timeout=int(self.TIMEOUT_SECONDS * MILLISECONDS_PER_SECOND),
                # Retries are handled uniformly by RetryingClient, not by the SDK.
                retry_options=types.HttpRetryOptions(attempts=1),
            ),
        )

    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        config = types.GenerateContentConfig(
            system_instruction=system,
            response_mime_type="application/json",
            response_json_schema=schema,
            thinking_config=types.ThinkingConfig(thinking_level=self.THINKING_LEVEL),
        )
        try:
            response = await self._client.aio.models.generate_content(
                model=self._model, contents=user, config=config
            )
        except genai_errors.APIError as exc:
            raise map_gemini_error(exc) from exc
        except (TimeoutError, httpx.TimeoutException) as exc:
            raise LLMTimeoutError("Gemini timed out.") from exc
        except httpx.HTTPError as exc:
            raise LLMProviderError("Could not reach Gemini.") from exc

        text = response.text
        if not text:
            raise LLMInvalidOutputError(
                "The AI returned an empty response. Please try again or adjust your input."
            )
        return text
