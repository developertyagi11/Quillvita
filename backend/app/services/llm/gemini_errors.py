"""Translate Gemini API errors into the app's provider-neutral LLM errors."""

import re

from google.genai import errors as genai_errors

from app.errors import (
    AppError,
    LLMConfigurationError,
    LLMProviderError,
    LLMRateLimitError,
    LLMTimeoutError,
)

RETRY_INFO_TYPE = "type.googleapis.com/google.rpc.RetryInfo"
QUOTA_FAILURE_TYPE = "type.googleapis.com/google.rpc.QuotaFailure"
DAILY_QUOTA_MARKER = "PerDay"
CONFIGURATION_STATUS_CODES = frozenset({400, 401, 403, 404})
HTTP_TOO_MANY_REQUESTS = 429
HTTP_GATEWAY_TIMEOUT = 504

_DURATION = re.compile(r"^\s*(\d+(?:\.\d+)?)s\s*$")


def map_gemini_error(exc: genai_errors.APIError) -> AppError:
    if exc.code == HTTP_TOO_MANY_REQUESTS:
        retry_after, quota_exhausted = parse_rate_limit(exc.details)
        return LLMRateLimitError(
            "Gemini rate limit reached.",
            retry_after_hint=retry_after,
            quota_exhausted=quota_exhausted,
        )
    if exc.code in CONFIGURATION_STATUS_CODES:
        return LLMConfigurationError(
            "The AI service rejected the request. Check GEMINI_API_KEY and LLM_MODEL."
        )
    if exc.code == HTTP_GATEWAY_TIMEOUT:
        return LLMTimeoutError("Gemini timed out.")
    return LLMProviderError("Gemini is temporarily unavailable.")


def parse_rate_limit(response_json: object) -> tuple[float | None, bool]:
    """Return (suggested retry delay in seconds, whether a daily quota is exhausted)."""
    retry_after: float | None = None
    quota_exhausted = False
    for detail in _error_details(response_json):
        kind = detail.get("@type")
        if kind == RETRY_INFO_TYPE:
            retry_after = _parse_duration(detail.get("retryDelay"))
        elif kind == QUOTA_FAILURE_TYPE:
            quota_exhausted = quota_exhausted or _has_daily_violation(detail.get("violations"))
    return retry_after, quota_exhausted


def _error_details(response_json: object) -> list[dict[str, object]]:
    if not isinstance(response_json, dict):
        return []
    error = response_json.get("error")
    if not isinstance(error, dict):
        return []
    details = error.get("details")
    if not isinstance(details, list):
        return []
    return [detail for detail in details if isinstance(detail, dict)]


def _parse_duration(value: object) -> float | None:
    if not isinstance(value, str):
        return None
    match = _DURATION.match(value)
    return float(match.group(1)) if match else None


def _has_daily_violation(violations: object) -> bool:
    if not isinstance(violations, list):
        return False
    return any(
        isinstance(violation, dict) and DAILY_QUOTA_MARKER in str(violation.get("quotaId", ""))
        for violation in violations
    )
