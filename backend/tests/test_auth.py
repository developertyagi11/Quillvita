import time
from uuid import UUID

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
from fastapi.testclient import TestClient

from app.api.deps import get_token_verifier
from app.errors import AuthenticationError
from app.main import create_app
from app.services.auth import TokenVerifier, issuer_from_base_url
from tests.fakes import TEST_SETTINGS

BASE_URL = "https://ep-test.neonauth.example.aws.neon.tech/neondb/auth"
ISSUER = "https://ep-test.neonauth.example.aws.neon.tech"
USER_ID = "860dc360-609f-4b7d-9e70-ec93fe6414d3"
PRIVATE_KEY = Ed25519PrivateKey.generate()


class StaticKeys:
    def __init__(self, private_key: Ed25519PrivateKey) -> None:
        public_jwk = jwt.get_algorithm_by_name("EdDSA").to_jwk(
            private_key.public_key(), as_dict=True
        )
        self._key = jwt.PyJWK.from_dict(public_jwk, algorithm="EdDSA")

    def get_signing_key_from_jwt(self, token: str) -> jwt.PyJWK:
        return self._key


def _token(
    *, issuer: str = ISSUER, expires_in: int = 900, key: Ed25519PrivateKey = PRIVATE_KEY
) -> str:
    now = int(time.time())
    claims = {
        "sub": USER_ID,
        "email": "jane@example.com",
        "iss": issuer,
        "aud": issuer,
        "iat": now,
        "exp": now + expires_in,
    }
    return jwt.encode(claims, key, algorithm="EdDSA")


VERIFIER = TokenVerifier(StaticKeys(PRIVATE_KEY), ISSUER)


def test_issuer_is_the_auth_url_origin() -> None:
    assert issuer_from_base_url(BASE_URL) == ISSUER


async def test_valid_token_returns_user() -> None:
    user = await VERIFIER.verify(_token())
    assert user.id == UUID(USER_ID)
    assert user.email == "jane@example.com"


@pytest.mark.parametrize(
    "token",
    [
        _token(expires_in=-120),
        _token(issuer="https://evil.example.com"),
        _token(key=Ed25519PrivateKey.generate()),
        jwt.encode({"sub": USER_ID, "iss": ISSUER, "aud": ISSUER}, "x" * 32, algorithm="HS256"),
        "not-a-jwt",
    ],
    ids=["expired", "wrong-issuer", "wrong-key", "hmac", "garbage"],
)
async def test_invalid_tokens_are_rejected(token: str) -> None:
    with pytest.raises(AuthenticationError):
        await VERIFIER.verify(token)


def _client() -> TestClient:
    app = create_app(TEST_SETTINGS)
    app.dependency_overrides[get_token_verifier] = lambda: VERIFIER
    return TestClient(app)


def test_bad_bearer_token_returns_401() -> None:
    response = _client().get("/api/history", headers={"Authorization": "Bearer nope"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "unauthorized"


def test_valid_bearer_token_reaches_history() -> None:
    response = _client().get("/api/history", headers={"Authorization": f"Bearer {_token()}"})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "history_unavailable"
