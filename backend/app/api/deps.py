from functools import lru_cache
from typing import Annotated

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings
from app.errors import AuthenticationError, HistoryUnavailableError
from app.services.auth import AuthUser, TokenVerifier
from app.services.cover_letter import CoverLetterGenerator
from app.services.customizer import ResumeCustomizer
from app.services.history.service import HistoryService
from app.services.llm.base import LLMClient
from app.services.llm.factory import create_llm_client

SettingsDep = Annotated[Settings, Depends(get_settings)]


@lru_cache(maxsize=4)
def _shared_llm_client(settings: Settings) -> LLMClient:
    # SDK clients hold connection pools, so build them once per configuration.
    return create_llm_client(settings)


def get_llm_client(settings: SettingsDep) -> LLMClient:
    return _shared_llm_client(settings)


LLMClientDep = Annotated[LLMClient, Depends(get_llm_client)]


def get_customizer(llm: LLMClientDep, settings: SettingsDep) -> ResumeCustomizer:
    return ResumeCustomizer(llm, settings)


def get_cover_letter_generator(llm: LLMClientDep, settings: SettingsDep) -> CoverLetterGenerator:
    return CoverLetterGenerator(llm, settings)


CustomizerDep = Annotated[ResumeCustomizer, Depends(get_customizer)]
CoverLetterGeneratorDep = Annotated[CoverLetterGenerator, Depends(get_cover_letter_generator)]


@lru_cache(maxsize=4)
def _shared_token_verifier(jwks_url: str, base_url: str) -> TokenVerifier:
    # The verifier caches the Neon Auth key set, so keep one per configuration.
    return TokenVerifier.from_urls(jwks_url, base_url)


def get_token_verifier(settings: SettingsDep) -> TokenVerifier | None:
    if not settings.auth_enabled:
        return None
    return _shared_token_verifier(settings.neon_auth_jwks_url, settings.neon_auth_base_url)


_bearer = HTTPBearer(auto_error=False, description="Neon Auth JWT from /api/auth/token")


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    verifier: Annotated[TokenVerifier | None, Depends(get_token_verifier)],
) -> AuthUser | None:
    if credentials is None or verifier is None:
        return None
    return await verifier.verify(credentials.credentials)


OptionalUserDep = Annotated[AuthUser | None, Depends(get_optional_user)]


def get_current_user(user: OptionalUserDep) -> AuthUser:
    if user is None:
        raise AuthenticationError("Please sign in to see your saved resumes.")
    return user


CurrentUserDep = Annotated[AuthUser, Depends(get_current_user)]


def get_history_service(request: Request) -> HistoryService | None:
    service: HistoryService | None = getattr(request.app.state, "history_service", None)
    return service


OptionalHistoryDep = Annotated[HistoryService | None, Depends(get_history_service)]


def require_history_service(service: OptionalHistoryDep) -> HistoryService:
    if service is None:
        raise HistoryUnavailableError("Saved resumes are not available on this server right now.")
    return service


HistoryServiceDep = Annotated[HistoryService, Depends(require_history_service)]
