import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.schemas.errors import ErrorBody, ErrorResponse

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base class for errors that are safe to show to the end user."""

    status_code: int = status.HTTP_400_BAD_REQUEST
    code: str = "bad_request"
    retry_after_seconds: int | None = None

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class InvalidFileTypeError(AppError):
    status_code = status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
    code = "invalid_file_type"


class FileTooLargeError(AppError):
    status_code = status.HTTP_413_CONTENT_TOO_LARGE
    code = "file_too_large"


class UnreadableFileError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "unreadable_file"


class NoExtractableTextError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "no_extractable_text"


class InvalidInputError(AppError):
    status_code = status.HTTP_422_UNPROCESSABLE_CONTENT
    code = "invalid_input"


class AuthenticationError(AppError):
    status_code = status.HTTP_401_UNAUTHORIZED
    code = "unauthorized"


class HistoryUnavailableError(AppError):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    code = "history_unavailable"


class NotFoundError(AppError):
    status_code = status.HTTP_404_NOT_FOUND
    code = "not_found"


class LLMConfigurationError(AppError):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    code = "llm_not_configured"


class LLMTimeoutError(AppError):
    status_code = status.HTTP_504_GATEWAY_TIMEOUT
    code = "llm_timeout"


class LLMRateLimitError(AppError):
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    code = "llm_rate_limited"

    def __init__(
        self, message: str, *, retry_after_hint: float | None = None, quota_exhausted: bool = False
    ) -> None:
        super().__init__(message)
        self.retry_after_hint = retry_after_hint
        self.quota_exhausted = quota_exhausted


class LLMUnavailableError(AppError):
    """Every configured provider failed with a transient error (rate limit, timeout, 5xx)."""

    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    code = "llm_busy"
    retry_after_seconds = 60


class LLMProviderError(AppError):
    status_code = status.HTTP_502_BAD_GATEWAY
    code = "llm_provider_error"


class LLMInvalidOutputError(AppError):
    status_code = status.HTTP_502_BAD_GATEWAY
    code = "llm_invalid_output"


def _error_response(
    status_code: int, code: str, message: str, headers: dict[str, str] | None = None
) -> JSONResponse:
    body = ErrorResponse(error=ErrorBody(code=code, message=message))
    return JSONResponse(status_code=status_code, content=body.model_dump(), headers=headers)


async def _handle_app_error(request: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, AppError):
        return await _handle_unexpected_error(request, exc)
    headers = None
    if exc.retry_after_seconds is not None:
        headers = {"Retry-After": str(exc.retry_after_seconds)}
    return _error_response(exc.status_code, exc.code, exc.message, headers)


async def _handle_validation_error(_: Request, exc: Exception) -> JSONResponse:
    message = "The request is missing required fields or contains invalid values."
    if isinstance(exc, RequestValidationError) and exc.errors():
        first = exc.errors()[0]
        location = ".".join(str(part) for part in first.get("loc", ()) if part != "body")
        detail = str(first.get("msg", "Invalid value"))
        message = f"{location}: {detail}" if location else detail
    return _error_response(status.HTTP_422_UNPROCESSABLE_CONTENT, "invalid_request", message)


async def _handle_unexpected_error(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled error", exc_info=exc)
    return _error_response(
        status.HTTP_500_INTERNAL_SERVER_ERROR,
        "internal_error",
        "Something went wrong on our side. Please try again.",
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, _handle_app_error)
    app.add_exception_handler(RequestValidationError, _handle_validation_error)
    app.add_exception_handler(Exception, _handle_unexpected_error)
