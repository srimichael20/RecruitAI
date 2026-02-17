from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # AI
    gemini_api_key: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/perfectly.db"

    # File storage
    upload_dir: str = "./data/intake_raw"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # App
    app_env: str = "development"

    @property
    def cors_origin_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    @property
    def is_dev(self) -> bool:
        return self.app_env == "development"

    @property
    def has_gemini(self) -> bool:
        return bool(self.gemini_api_key)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
