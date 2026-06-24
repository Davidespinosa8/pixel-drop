from typing import Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    frontend_origin: str = "http://localhost:3000"
    ytdlp_cookies_file: Optional[str] = None
    analyze_timeout_seconds: int = 30
    max_video_duration_seconds: int = 7200
    max_estimated_file_size_bytes: int = 2_147_483_648


settings = Settings()
