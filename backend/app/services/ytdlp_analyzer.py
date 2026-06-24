import asyncio
import functools
import ipaddress
import os
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
from urllib.parse import urlparse

import yt_dlp
from yt_dlp.utils import DownloadError, ExtractorError

from app.core.config import settings
from app.models.media import AnalyzeResponse, AudioOption, VideoOption

ALLOWED_DOMAINS: frozenset[str] = frozenset([
    "youtube.com",
    "www.youtube.com",
    "m.youtube.com",
    "youtu.be",
])

# Max 2 concurrent yt-dlp threads. When asyncio.wait_for times out, the
# semaphore slot is released immediately but the underlying thread continues
# running until yt-dlp finishes (bounded by socket_timeout=15 s). Python
# cannot safely interrupt a running thread. New requests will queue in the
# executor until a slot is free.
_MAX_CONCURRENT = 2
_executor = ThreadPoolExecutor(max_workers=_MAX_CONCURRENT, thread_name_prefix="ytdlp")
_semaphore = asyncio.Semaphore(_MAX_CONCURRENT)


def shutdown_executor() -> None:
    _executor.shutdown(wait=False)


class AnalysisError(Exception):
    def __init__(self, code: str, message: str) -> None:
        self.code = code
        self.message = message
        super().__init__(message)


def _validate_url(url: str) -> None:
    if not url or not url.strip():
        raise AnalysisError("INVALID_URL", "La URL no puede estar vacía.")

    try:
        parsed = urlparse(url)
    except Exception:
        raise AnalysisError("INVALID_URL", "URL malformada.")

    if parsed.scheme != "https":
        raise AnalysisError("INVALID_URL", "Solo se aceptan URLs con protocolo HTTPS.")

    host = parsed.hostname
    if not host:
        raise AnalysisError("INVALID_URL", "La URL no contiene un host válido.")

    if parsed.username or parsed.password:
        raise AnalysisError("INVALID_URL", "La URL no puede contener credenciales.")

    if parsed.port is not None and parsed.port not in (80, 443):
        raise AnalysisError("INVALID_URL", "Puerto no permitido en la URL.")

    # Reject raw IP addresses in hostname
    try:
        ipaddress.ip_address(host)
        raise AnalysisError("INVALID_URL", "Las direcciones IP no están permitidas como host.")
    except ValueError:
        pass  # Not an IP, expected for domain names

    if host not in ALLOWED_DOMAINS:
        raise AnalysisError(
            "DOMAIN_NOT_ALLOWED",
            "Dominio no autorizado. Solo se aceptan URLs de YouTube.",
        )


class _SilentLogger:
    def debug(self, msg: str) -> None:
        pass

    def info(self, msg: str) -> None:
        pass

    def warning(self, msg: str) -> None:
        pass

    def error(self, msg: str) -> None:
        pass


def _extract_info_sync(url: str) -> dict:
    """Blocking yt-dlp call. Must run in a thread pool, not the event loop."""
    ydl_opts: dict = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "noplaylist": True,
        "no_color": True,
        "socket_timeout": 15,
        "noprogress": True,
        "logger": _SilentLogger(),
    }

    if settings.ytdlp_cookies_file:
        ydl_opts["cookiefile"] = settings.ytdlp_cookies_file

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False)  # type: ignore[return-value]


def _map_ytdlp_error(e: DownloadError) -> AnalysisError:
    msg = str(e).lower()
    if "private video" in msg or "this video is private" in msg:
        return AnalysisError("PRIVATE_VIDEO", "El video es privado y no es accesible.")
    if "sign in" in msg or "log in" in msg:
        return AnalysisError("AUTHENTICATION_REQUIRED", "El video requiere autenticación.")
    if "age" in msg and ("verif" in msg or "restrict" in msg or "confirm" in msg):
        return AnalysisError("AGE_RESTRICTED", "El video tiene restricción de edad.")
    if "live event" in msg or "is live" in msg or "live stream" in msg:
        return AnalysisError("LIVE_NOT_SUPPORTED", "Las transmisiones en vivo no están soportadas.")
    if (
        "not available" in msg
        or "no longer available" in msg
        or "been removed" in msg
        or "video unavailable" in msg
    ):
        return AnalysisError("VIDEO_NOT_FOUND", "El video no existe o fue eliminado.")
    return AnalysisError("YTDLP_ERROR", "Error al analizar el video.")


def _get_best_thumbnail(
    thumbnails: Optional[list],
    fallback: Optional[str],
) -> Optional[str]:
    if thumbnails:
        valid = [t for t in thumbnails if isinstance(t, dict) and t.get("url")]
        if valid:
            return max(
                valid,
                key=lambda t: (t.get("height") or 0) + (t.get("width") or 0),
            )["url"]
    return fallback


def _estimate_size(formats: list, max_height: Optional[int]) -> Optional[int]:
    """Estimate combined video+audio file size for a given max height (None = best)."""
    video_fmts = [
        f for f in formats
        if isinstance(f, dict)
        and f.get("vcodec") not in (None, "none")
        and f.get("height") is not None
    ]
    audio_fmts = [
        f for f in formats
        if isinstance(f, dict)
        and f.get("vcodec") in (None, "none")
        and f.get("acodec") not in (None, "none")
    ]

    candidate_video = (
        [f for f in video_fmts if (f.get("height") or 0) <= max_height]
        if max_height is not None
        else video_fmts
    )

    if not candidate_video:
        return None

    best_video = max(
        candidate_video,
        key=lambda f: ((f.get("height") or 0), (f.get("tbr") or 0)),
    )
    video_size = best_video.get("filesize") or best_video.get("filesize_approx")

    audio_size = None
    if audio_fmts:
        best_audio = max(audio_fmts, key=lambda f: f.get("tbr") or 0)
        audio_size = best_audio.get("filesize") or best_audio.get("filesize_approx")

    if video_size is None and audio_size is None:
        return None
    return (video_size or 0) + (audio_size or 0)


def _detect_video_options(formats: list) -> list[VideoOption]:
    video_fmts = [
        f for f in formats
        if isinstance(f, dict)
        and f.get("vcodec") not in (None, "none")
        and f.get("height") is not None
    ]

    if not video_fmts:
        return []

    available_heights = {f.get("height") or 0 for f in video_fmts}
    options: list[VideoOption] = [
        VideoOption(quality="best", height=None, estimated_size_bytes=_estimate_size(formats, None))
    ]

    for label, target in [("1080p", 1080), ("720p", 720), ("480p", 480)]:
        if any(h >= target for h in available_heights):
            options.append(
                VideoOption(
                    quality=label,
                    height=target,
                    estimated_size_bytes=_estimate_size(formats, target),
                )
            )

    return options


def _detect_audio_options(formats: list) -> list[AudioOption]:
    audio_fmts = [
        f for f in formats
        if isinstance(f, dict)
        and f.get("vcodec") in (None, "none")
        and f.get("acodec") not in (None, "none")
    ]

    options: list[AudioOption] = []
    best_audio_size: Optional[int] = None

    if audio_fmts:
        best_audio = max(audio_fmts, key=lambda f: f.get("tbr") or 0)
        best_audio_size = best_audio.get("filesize") or best_audio.get("filesize_approx")

    # m4a only if available as audio-only format
    m4a_fmts = [f for f in audio_fmts if f.get("ext") == "m4a"]
    if m4a_fmts:
        best_m4a = max(m4a_fmts, key=lambda f: f.get("tbr") or 0)
        m4a_size = best_m4a.get("filesize") or best_m4a.get("filesize_approx")
        options.append(AudioOption(format="m4a", estimated_size_bytes=m4a_size))

    # mp3 always offered (as future conversion option)
    options.append(AudioOption(format="mp3", estimated_size_bytes=best_audio_size))

    return options


async def analyze(url: str) -> AnalyzeResponse:
    _validate_url(url)

    if settings.ytdlp_cookies_file and not os.path.isfile(settings.ytdlp_cookies_file):
        raise AnalysisError(
            "SERVER_CONFIGURATION_ERROR",
            "Archivo de cookies configurado pero no encontrado en el servidor.",
        )

    loop = asyncio.get_running_loop()
    async with _semaphore:
        try:
            info: dict = await asyncio.wait_for(
                loop.run_in_executor(_executor, functools.partial(_extract_info_sync, url)),
                timeout=float(settings.analyze_timeout_seconds),
            )
        except asyncio.TimeoutError:
            raise AnalysisError("ANALYSIS_TIMEOUT", "El análisis tardó demasiado. Intenta de nuevo.")
        except DownloadError as e:
            raise _map_ytdlp_error(e)
        except ExtractorError:
            raise AnalysisError("YTDLP_ERROR", "Error al extraer metadatos del video.")
        except Exception:
            raise AnalysisError("YTDLP_ERROR", "Error interno al analizar el video.")

    if info.get("_type") == "playlist":
        raise AnalysisError(
            "PLAYLIST_NOT_SUPPORTED",
            "Las playlists no están soportadas. Pega la URL de un video individual.",
        )

    live_status = info.get("live_status")
    if info.get("is_live") or live_status in ("is_live", "is_upcoming"):
        raise AnalysisError("LIVE_NOT_SUPPORTED", "Las transmisiones en vivo no están soportadas.")

    duration = info.get("duration") or 0
    if duration > settings.max_video_duration_seconds:
        hours = settings.max_video_duration_seconds // 3600
        raise AnalysisError(
            "DURATION_LIMIT_EXCEEDED",
            f"El video supera la duración máxima permitida de {hours} horas.",
        )

    formats = info.get("formats") or []
    title = info.get("title") or "Sin título"
    channel = info.get("channel") or info.get("uploader") or "Desconocido"
    thumbnail_url = _get_best_thumbnail(info.get("thumbnails"), info.get("thumbnail"))

    video_options = _detect_video_options(formats)
    audio_options = _detect_audio_options(formats)

    if video_options:
        best_size = video_options[0].estimated_size_bytes
        if best_size is not None and best_size > settings.max_estimated_file_size_bytes:
            max_gb = settings.max_estimated_file_size_bytes / 1_073_741_824
            raise AnalysisError(
                "SIZE_LIMIT_EXCEEDED",
                f"El archivo estimado supera el tamaño máximo permitido de {max_gb:.0f} GB.",
            )

    return AnalyzeResponse(
        title=title,
        channel=channel,
        duration_seconds=int(duration),
        thumbnail_url=thumbnail_url,
        video_options=video_options,
        audio_options=audio_options,
    )
