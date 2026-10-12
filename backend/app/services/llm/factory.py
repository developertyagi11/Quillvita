"""Build the configured provider chain: primary first, the other provider as fallback."""

import logging

from app.core.config import ProviderName, Settings
from app.errors import LLMConfigurationError
from app.services.llm.base import LLMClient
from app.services.llm.fallback import FallbackClient, Provider
from app.services.llm.gemini_client import GeminiClient
from app.services.llm.groq_client import GroqClient
from app.services.llm.retry import RetryingClient

logger = logging.getLogger(__name__)

# Each provider may spend up to this multiple of its per-attempt timeout across retries, so a
# slow primary still leaves time for the fallback.
RETRY_BUDGET_MULTIPLIER = 2.0

PROVIDER_ORDER: dict[ProviderName, tuple[ProviderName, ProviderName]] = {
    "gemini": ("gemini", "groq"),
    "groq": ("groq", "gemini"),
}


def build_provider(name: ProviderName, settings: Settings) -> Provider | None:
    """Return the provider wrapped in retries, or None when its key or model is missing."""
    if name == "gemini":
        api_key, model = settings.gemini_api_key.get_secret_value(), settings.llm_model
        if not api_key or not model:
            return None
        client: LLMClient = GeminiClient(api_key, model)
        timeout = GeminiClient.TIMEOUT_SECONDS
    else:
        api_key, model = settings.groq_api_key.get_secret_value(), settings.groq_model
        if not api_key or not model:
            return None
        client = GroqClient(api_key, model)
        timeout = GroqClient.TIMEOUT_SECONDS
    retrying = RetryingClient(client, label=name, budget_seconds=timeout * RETRY_BUDGET_MULTIPLIER)
    return Provider(name=name, model=model, client=retrying)


def create_llm_client(settings: Settings) -> FallbackClient:
    candidates = (build_provider(name, settings) for name in PROVIDER_ORDER[settings.llm_provider])
    providers = [provider for provider in candidates if provider is not None]
    if not providers:
        raise LLMConfigurationError(
            "The AI service is not configured. Set GEMINI_API_KEY and LLM_MODEL "
            "(or GROQ_API_KEY and GROQ_MODEL) on the server."
        )
    if providers[0].name != settings.llm_provider:
        logger.warning(
            "LLM_PROVIDER=%s is not configured; using %s instead",
            settings.llm_provider,
            providers[0].name,
        )
    logger.info(
        "LLM providers in order: %s",
        ", ".join(f"{provider.name} ({provider.model})" for provider in providers),
    )
    return FallbackClient(providers)
