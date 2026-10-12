import json

import httpx
import pytest
from google import genai
from google.genai import errors as genai_errors
from google.genai import types
from groq import AsyncGroq

from app.errors import (
    LLMConfigurationError,
    LLMProviderError,
    LLMRateLimitError,
    LLMTimeoutError,
)
from app.schemas.customize import ScoreReport
from app.services.json_schema import to_llm_schema
from app.services.llm.gemini_client import GeminiClient
from app.services.llm.gemini_errors import map_gemini_error
from app.services.llm.groq_client import GroqClient

SCHEMA = to_llm_schema(ScoreReport.model_json_schema())
VALID_JSON = '{"ok": true}'


def gemini_429(retry_delay: str, quota_id: str) -> dict[str, object]:
    return {
        "error": {
            "code": 429,
            "message": "Resource exhausted.",
            "status": "RESOURCE_EXHAUSTED",
            "details": [
                {
                    "@type": "type.googleapis.com/google.rpc.QuotaFailure",
                    "violations": [{"quotaId": quota_id}],
                },
                {"@type": "type.googleapis.com/google.rpc.RetryInfo", "retryDelay": retry_delay},
            ],
        }
    }


def test_gemini_errors_map_to_neutral_errors() -> None:
    per_minute = map_gemini_error(genai_errors.ClientError(429, gemini_429("7s", "PerMinute")))
    assert isinstance(per_minute, LLMRateLimitError)
    assert per_minute.retry_after_hint == pytest.approx(7.0)
    assert not per_minute.quota_exhausted

    daily = map_gemini_error(genai_errors.ClientError(429, gemini_429("60s", "RequestsPerDay")))
    assert isinstance(daily, LLMRateLimitError)
    assert daily.quota_exhausted

    unavailable = {"error": {"code": 503, "message": "busy", "status": "UNAVAILABLE"}}
    denied = {"error": {"code": 403, "message": "no", "status": "PERMISSION_DENIED"}}
    assert isinstance(
        map_gemini_error(genai_errors.ServerError(503, unavailable)), LLMProviderError
    )
    assert isinstance(map_gemini_error(genai_errors.ServerError(504, unavailable)), LLMTimeoutError)
    assert isinstance(
        map_gemini_error(genai_errors.ClientError(403, denied)), LLMConfigurationError
    )


async def test_gemini_request_uses_schema_and_thinking_level_without_temperature() -> None:
    captured: list[dict[str, object]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        captured.append(json.loads(request.content))
        parts = [{"text": VALID_JSON}]
        return httpx.Response(200, json={"candidates": [{"content": {"parts": parts}}]})

    client = GeminiClient("key", "gemini-3.8-flash")
    client._client = genai.Client(
        api_key="key",
        http_options=types.HttpOptions(
            async_client_args={"transport": httpx.MockTransport(handler)}
        ),
    )

    assert await client.generate_json("system", "user", schema=SCHEMA) == VALID_JSON
    config = captured[0]["generationConfig"]
    assert isinstance(config, dict)
    assert config["responseMimeType"] == "application/json"
    assert config["responseJsonSchema"] == SCHEMA
    assert "temperature" not in config


def groq_client(handler: httpx.MockTransport) -> GroqClient:
    client = GroqClient("key", "openai/gpt-oss-120b")
    client._client = AsyncGroq(
        api_key="key", max_retries=0, http_client=httpx.AsyncClient(transport=handler)
    )
    return client


async def test_groq_request_uses_strict_schema_and_low_reasoning() -> None:
    captured: list[dict[str, object]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        captured.append(json.loads(request.content))
        message = {"role": "assistant", "content": VALID_JSON}
        choice = {"index": 0, "message": message, "finish_reason": "stop"}
        body = {"id": "1", "object": "chat.completion", "created": 0, "model": "m"}
        return httpx.Response(200, json={**body, "choices": [choice]})

    client = groq_client(httpx.MockTransport(handler))
    assert await client.generate_json("system", "user", schema=SCHEMA) == VALID_JSON

    payload = captured[0]
    assert payload["temperature"] == GroqClient.TEMPERATURE
    assert payload["reasoning_effort"] == "low"
    response_format = payload["response_format"]
    assert isinstance(response_format, dict)
    json_schema = response_format["json_schema"]
    assert json_schema["strict"] is True
    assert json_schema["schema"]["additionalProperties"] is False


@pytest.mark.parametrize(
    ("status", "body", "headers", "expected"),
    [
        (429, {"error": {"message": "tokens per minute"}}, {"retry-after": "4"}, LLMRateLimitError),
        (413, {"error": {"message": "Request too large"}}, {}, LLMRateLimitError),
        (503, {"error": {"message": "over capacity"}}, {}, LLMProviderError),
        (401, {"error": {"message": "invalid key"}}, {}, LLMConfigurationError),
    ],
)
async def test_groq_errors_map_to_neutral_errors(
    status: int, body: dict[str, object], headers: dict[str, str], expected: type[Exception]
) -> None:
    transport = httpx.MockTransport(lambda _: httpx.Response(status, json=body, headers=headers))
    with pytest.raises(expected) as caught:
        await groq_client(transport).generate_json("s", "u", schema=SCHEMA)
    if status == 429:
        assert isinstance(caught.value, LLMRateLimitError)
        assert caught.value.retry_after_hint == pytest.approx(4.0)
        assert not caught.value.quota_exhausted


async def test_groq_schema_failures_are_returned_for_repair() -> None:
    failed = '{"match_score": "high"}'
    body = {"error": {"code": "json_validate_failed", "failed_generation": failed}}
    transport = httpx.MockTransport(lambda _: httpx.Response(400, json=body))
    assert await groq_client(transport).generate_json("s", "u", schema=SCHEMA) == failed
