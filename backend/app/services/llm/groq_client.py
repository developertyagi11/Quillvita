"""Groq implementation of `LLMClient` via the official `groq` SDK."""

from typing import Literal

import groq
from groq import AsyncGroq
from groq.types.chat import ChatCompletionMessageParam
from groq.types.chat.completion_create_params import ResponseFormatResponseFormatJsonSchema

from app.errors import (
    AppError,
    LLMConfigurationError,
    LLMInvalidOutputError,
    LLMProviderError,
    LLMRateLimitError,
    LLMTimeoutError,
)
from app.services.json_schema import to_strict_schema
from app.services.llm.base import JsonSchema

HTTP_PAYLOAD_TOO_LARGE = 413
DAILY_LIMIT_MARKER = "per day"
JSON_VALIDATE_FAILED = "json_validate_failed"


class GroqClient:
    TIMEOUT_SECONDS = 30.0
    TEMPERATURE = 0.3
    # GPT-OSS models reason before answering; `low` saves tokens against Groq's free TPM cap.
    REASONING_MODEL_PREFIX = "openai/gpt-oss"
    REASONING_EFFORT: Literal["low"] = "low"

    def __init__(self, api_key: str, model: str) -> None:
        self._model = model
        # Retries are handled uniformly by RetryingClient, not by the SDK.
        self._client = AsyncGroq(api_key=api_key, timeout=self.TIMEOUT_SECONDS, max_retries=0)

    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ]
        response_format: ResponseFormatResponseFormatJsonSchema = {
            "type": "json_schema",
            "json_schema": {"name": "response", "strict": True, "schema": to_strict_schema(schema)},
        }
        reasons = self._model.startswith(self.REASONING_MODEL_PREFIX)
        try:
            completion = await self._client.chat.completions.create(
                model=self._model,
                messages=messages,
                temperature=self.TEMPERATURE,
                response_format=response_format,
                reasoning_effort=self.REASONING_EFFORT if reasons else groq.omit,
            )
        except groq.BadRequestError as exc:
            failed_generation = _failed_generation(exc.body)
            if failed_generation is not None:
                # Hand the non-conforming JSON to the caller's validation and repair step.
                return failed_generation
            raise LLMConfigurationError(
                "The AI service rejected the request. Check GROQ_MODEL supports structured output."
            ) from exc
        except groq.APIStatusError as exc:
            raise map_groq_status_error(exc) from exc
        except groq.APITimeoutError as exc:
            raise LLMTimeoutError("Groq timed out.") from exc
        except groq.APIConnectionError as exc:
            raise LLMProviderError("Could not reach Groq.") from exc

        content = completion.choices[0].message.content if completion.choices else None
        if not content:
            raise LLMInvalidOutputError(
                "The AI returned an empty response. Please try again or adjust your input."
            )
        return content


def map_groq_status_error(exc: groq.APIStatusError) -> AppError:
    if isinstance(exc, groq.RateLimitError) or exc.status_code == HTTP_PAYLOAD_TOO_LARGE:
        # 413 means the request alone exceeds the per-minute token cap, so waiting won't help.
        return LLMRateLimitError(
            "Groq rate limit reached.",
            retry_after_hint=_retry_after(exc),
            quota_exhausted=(
                exc.status_code == HTTP_PAYLOAD_TOO_LARGE or DAILY_LIMIT_MARKER in exc.message
            ),
        )
    if isinstance(exc, groq.InternalServerError):
        return LLMProviderError("Groq is temporarily unavailable.")
    return LLMConfigurationError(
        "The AI service rejected the request. Check GROQ_API_KEY and GROQ_MODEL."
    )


def _retry_after(exc: groq.APIStatusError) -> float | None:
    try:
        return float(exc.response.headers.get("retry-after", ""))
    except ValueError:
        return None


def _failed_generation(body: object) -> str | None:
    error = body.get("error") if isinstance(body, dict) else None
    if not isinstance(error, dict) or error.get("code") != JSON_VALIDATE_FAILED:
        return None
    generation = error.get("failed_generation")
    return generation if isinstance(generation, str) and generation else None
