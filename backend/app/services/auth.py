"""Verifies Neon Auth (Managed Better Auth) JWTs sent by the frontend as bearer tokens."""

import logging
from dataclasses import dataclass
from typing import Protocol
from urllib.parse import urlsplit
from uuid import UUID

import jwt
from starlette.concurrency import run_in_threadpool

from app.errors import AuthenticationError

logger = logging.getLogger(__name__)

ALGORITHMS = ["EdDSA"]
JWKS_CACHE_SECONDS = 600
JWKS_TIMEOUT_SECONDS = 10
CLOCK_SKEW_SECONDS = 30
SESSION_EXPIRED_MESSAGE = "Your session has expired. Please sign in again."


@dataclass(frozen=True, slots=True)
class AuthUser:
    id: UUID
    email: str


class SigningKeySource(Protocol):
    def get_signing_key_from_jwt(self, token: str) -> jwt.PyJWK: ...


def issuer_from_base_url(base_url: str) -> str:
    """Neon Auth sets `iss` and `aud` to the origin of the Auth URL, without its path."""
    parts = urlsplit(base_url)
    return f"{parts.scheme}://{parts.netloc}"


class TokenVerifier:
    def __init__(self, keys: SigningKeySource, issuer: str) -> None:
        self._keys = keys
        self._issuer = issuer

    @classmethod
    def from_urls(cls, jwks_url: str, base_url: str) -> "TokenVerifier":
        keys = jwt.PyJWKClient(
            jwks_url, cache_keys=True, lifespan=JWKS_CACHE_SECONDS, timeout=JWKS_TIMEOUT_SECONDS
        )
        return cls(keys, issuer_from_base_url(base_url))

    async def verify(self, token: str) -> AuthUser:
        try:
            # PyJWKClient fetches the key set with blocking I/O on a cache miss.
            signing_key = await run_in_threadpool(self._keys.get_signing_key_from_jwt, token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=ALGORITHMS,
                issuer=self._issuer,
                audience=self._issuer,
                leeway=CLOCK_SKEW_SECONDS,
                options={"require": ["exp", "iss", "aud", "sub"]},
            )
            return AuthUser(id=UUID(str(claims["sub"])), email=str(claims.get("email") or ""))
        except jwt.PyJWKClientConnectionError as exc:
            logger.warning("Could not fetch the Neon Auth key set: %s", type(exc).__name__)
            raise AuthenticationError(SESSION_EXPIRED_MESSAGE) from exc
        except (jwt.PyJWTError, ValueError) as exc:
            raise AuthenticationError(SESSION_EXPIRED_MESSAGE) from exc
