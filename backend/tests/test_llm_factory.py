import pytest
from pydantic import SecretStr, ValidationError

from app.core.config import ProviderName, Settings
from app.errors import LLMConfigurationError
from app.schemas.customize import LLMCustomization
from app.services.json_schema import to_llm_schema, to_strict_schema
from app.services.llm.factory import create_llm_client


def settings(
    provider: ProviderName = "gemini", *, gemini: bool = True, groq: bool = True
) -> Settings:
    return Settings(
        _env_file=None,
        llm_provider=provider,
        gemini_api_key=SecretStr("g-key" if gemini else ""),
        llm_model="gemini-3.8-flash",
        groq_api_key=SecretStr("q-key" if groq else ""),
        groq_model="openai/gpt-oss-120b",
    )


@pytest.mark.parametrize(
    ("config", "expected"),
    [
        (settings("gemini"), ("gemini", "groq")),
        (settings("groq"), ("groq", "gemini")),
        (settings("gemini", groq=False), ("gemini",)),
        (settings("groq", groq=False), ("gemini",)),
    ],
)
def test_factory_orders_primary_then_configured_fallback(
    config: Settings, expected: tuple[str, ...]
) -> None:
    chain = create_llm_client(config)
    assert tuple(provider.name for provider in chain.providers) == expected


def test_factory_requires_at_least_one_provider() -> None:
    with pytest.raises(LLMConfigurationError):
        create_llm_client(settings(gemini=False, groq=False))


@pytest.mark.parametrize("model", ["gemini-2.5-flash", "gemini-2.0-flash", "models/gemini-1.5-pro"])
def test_settings_reject_retired_gemini_models(model: str) -> None:
    with pytest.raises(ValidationError, match="Gemini 3 Flash"):
        Settings(_env_file=None, llm_model=model)


def test_strict_schema_inlines_refs_and_closes_every_object() -> None:
    strict = to_strict_schema(to_llm_schema(LLMCustomization.model_json_schema()))

    def walk(node: object) -> None:
        if isinstance(node, dict):
            assert "$ref" not in node
            assert "$defs" not in node
            if node.get("type") == "object":
                assert node["additionalProperties"] is False
                assert set(node["required"]) == set(node["properties"])
            for child in node.values():
                walk(child)
        elif isinstance(node, list):
            for child in node:
                walk(child)

    walk(strict)
    properties = strict["properties"]
    assert isinstance(properties, dict)
    assert properties["tailored"]["properties"]["experience"]["items"]["type"] == "object"
