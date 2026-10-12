import asyncio
from dataclasses import dataclass, field

import pytest

from app.errors import (
    LLMConfigurationError,
    LLMProviderError,
    LLMRateLimitError,
    LLMTimeoutError,
    LLMUnavailableError,
)
from app.services.llm.base import JsonSchema
from app.services.llm.fallback import BUSY_MESSAGE, FallbackClient, Provider
from app.services.llm.retry import RetryingClient
from tests.fakes import FakeLLM

SECRET_RESUME_TEXT = "Jane Doe, 12 Secret Street"


@dataclass
class RecordingSleep:
    delays: list[float] = field(default_factory=list)

    async def __call__(self, seconds: float) -> None:
        self.delays.append(seconds)


class HangingLLM:
    async def generate_json(self, system: str, user: str, *, schema: JsonSchema) -> str:
        await asyncio.sleep(60)
        return "{}"


def retrying(llm: FakeLLM, sleep: RecordingSleep) -> RetryingClient:
    return RetryingClient(llm, label="test", budget_seconds=60, sleep=sleep)


async def test_retries_transient_errors_with_exponential_backoff() -> None:
    llm = FakeLLM([LLMProviderError("503"), LLMTimeoutError("slow"), "{}"])
    sleep = RecordingSleep()

    assert await retrying(llm, sleep).generate_json("s", "u", schema={}) == "{}"
    assert len(llm.requests) == 3
    assert 1.0 <= sleep.delays[0] <= 1.5
    assert 2.0 <= sleep.delays[1] <= 2.5


async def test_gives_up_after_two_retries() -> None:
    llm = FakeLLM([LLMProviderError("503") for _ in range(4)])
    with pytest.raises(LLMProviderError):
        await retrying(llm, RecordingSleep()).generate_json("s", "u", schema={})
    assert len(llm.requests) == 3


async def test_honors_short_retry_after_hint() -> None:
    sleep = RecordingSleep()
    llm = FakeLLM([LLMRateLimitError("429", retry_after_hint=3.0), "{}"])

    await retrying(llm, sleep).generate_json("s", "u", schema={})
    assert 3.0 <= sleep.delays[0] <= 3.5


@pytest.mark.parametrize(
    "error",
    [
        LLMRateLimitError("daily", quota_exhausted=True),
        LLMRateLimitError("long wait", retry_after_hint=45.0),
    ],
)
async def test_skips_retries_when_waiting_cannot_help(error: LLMRateLimitError) -> None:
    llm = FakeLLM([error, "{}"])
    with pytest.raises(LLMRateLimitError):
        await retrying(llm, RecordingSleep()).generate_json("s", "u", schema={})
    assert len(llm.requests) == 1


async def test_does_not_retry_configuration_errors() -> None:
    llm = FakeLLM([LLMConfigurationError("bad key"), "{}"])
    with pytest.raises(LLMConfigurationError):
        await retrying(llm, RecordingSleep()).generate_json("s", "u", schema={})
    assert len(llm.requests) == 1


async def test_budget_turns_a_hung_provider_into_a_timeout() -> None:
    client = RetryingClient(HangingLLM(), label="test", budget_seconds=0.05)
    with pytest.raises(LLMTimeoutError):
        await client.generate_json("s", "u", schema={})


async def test_falls_back_and_logs_the_provider_without_prompt_text(
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level("INFO")
    primary = FakeLLM([LLMRateLimitError("429")])
    backup = FakeLLM(['{"ok": true}'])
    chain = FallbackClient(
        [Provider("gemini", "gemini-test", primary), Provider("groq", "groq-test", backup)]
    )

    result = await chain.generate_json("system", SECRET_RESUME_TEXT, schema={})

    assert result == '{"ok": true}'
    assert backup.requests[0].user == SECRET_RESUME_TEXT
    assert "handled by groq (groq-test)" in caplog.text
    assert SECRET_RESUME_TEXT not in caplog.text


async def test_both_providers_failing_returns_busy_error() -> None:
    chain = FallbackClient(
        [
            Provider("gemini", "a", FakeLLM([LLMTimeoutError("slow")])),
            Provider("groq", "b", FakeLLM([LLMProviderError("500")])),
        ]
    )
    with pytest.raises(LLMUnavailableError) as caught:
        await chain.generate_json("s", "u", schema={})
    assert caught.value.message == BUSY_MESSAGE


async def test_non_transient_errors_do_not_fall_back() -> None:
    backup = FakeLLM(["{}"])
    chain = FallbackClient(
        [
            Provider("gemini", "a", FakeLLM([LLMConfigurationError("bad key")])),
            Provider("groq", "b", backup),
        ]
    )
    with pytest.raises(LLMConfigurationError):
        await chain.generate_json("s", "u", schema={})
    assert backup.requests == []
