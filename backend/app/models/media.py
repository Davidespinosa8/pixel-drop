from typing import Optional

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class _CamelModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class AnalyzeRequest(BaseModel):
    url: str


class VideoOption(_CamelModel):
    quality: str
    height: Optional[int] = None
    estimated_size_bytes: Optional[int] = None


class AudioOption(_CamelModel):
    format: str
    estimated_size_bytes: Optional[int] = None


class AnalyzeResponse(_CamelModel):
    title: str
    channel: str
    duration_seconds: int
    thumbnail_url: Optional[str] = None
    video_options: list[VideoOption]
    audio_options: list[AudioOption]
