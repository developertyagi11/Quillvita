import re
from functools import lru_cache
from typing import Literal

from pydantic import Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BYTES_PER_MB = 1024 * 1024

ProviderName = Literal["gemini", "groq"]

RETIRED_GEMINI_MODELS = re.compile(r"^(models/)?gemini-(1\.|2\.0|2\.5)", re.IGNORECASE)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore", frozen=True
    )

    llm_provider: ProviderName = "gemini"
    gemini_api_key: SecretStr = SecretStr("")
    llm_model: str = ""
    # Free-tier quotas are per model, so a lighter Gemini model still answers once the main
    # model's small daily quota is spent. Set to an empty string to turn it off.
    gemini_fallback_model: str = "gemini-3.5-flash-lite"
    groq_api_key: SecretStr = SecretStr("")
    groq_model: str = ""

    frontend_url: str = "http://localhost:3000"
    max_file_size_mb: int = Field(default=5, gt=0, le=20)

    database_url: SecretStr = SecretStr("")
    neon_auth_base_url: str = ""
    neon_auth_jwks_url: str = ""
    storage_bucket: str = "cv-uploads"
    aws_access_key_id: SecretStr = SecretStr("")
    aws_secret_access_key: SecretStr = SecretStr("")
    aws_endpoint_url_s3: str = ""
    aws_region: str = ""

    min_job_description_chars: int = 100
    max_job_description_chars: int = 20_000
    max_resume_chars: int = 30_000

    @field_validator("llm_model", "gemini_fallback_model")
    @classmethod
    def reject_retired_gemini_models(cls, value: str) -> str:
        model = value.strip()
        if RETIRED_GEMINI_MODELS.match(model):
            raise ValueError(
                f"Gemini model {model!r} belongs to a Gemini 1.x/2.x family that is being shut "
                "down. Use a Gemini 3 Flash model such as gemini-3.8-flash."
            )
        return model

    @field_validator("groq_model")
    @classmethod
    def strip_model(cls, value: str) -> str:
        return value.strip()

    @field_validator("frontend_url", "neon_auth_base_url", "aws_endpoint_url_s3")
    @classmethod
    def strip_trailing_slash(cls, value: str) -> str:
        # Browsers send the Origin header without a trailing slash; CORS matching is exact.
        return value.strip().rstrip("/")

    @property
    def max_file_size_bytes(self) -> int:
        return self.max_file_size_mb * BYTES_PER_MB

    @property
    def auth_enabled(self) -> bool:
        return bool(self.neon_auth_base_url and self.neon_auth_jwks_url)

    @property
    def history_enabled(self) -> bool:
        storage = (
            self.aws_access_key_id.get_secret_value()
            and self.aws_secret_access_key.get_secret_value()
            and self.aws_endpoint_url_s3
            and self.storage_bucket
        )
        return bool(self.auth_enabled and self.database_url.get_secret_value() and storage)


@lru_cache
def get_settings() -> Settings:
    return Settings()
