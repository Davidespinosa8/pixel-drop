"""
Tests for POST /api/analyze.
All tests mock _extract_info_sync — no real YouTube network access.
"""
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from yt_dlp.utils import DownloadError

from app.main import app

client = TestClient(app)

_VALID_URL = "https://www.youtube.com/watch?v=TEST123"

_MOCK_INFO = {
    "id": "TEST123",
    "title": "Test Video",
    "channel": "Test Channel",
    "duration": 120,
    "thumbnail": "https://i.ytimg.com/vi/TEST123/hqdefault.jpg",
    "thumbnails": [
        {"url": "https://i.ytimg.com/vi/TEST123/hqdefault.jpg", "height": 360, "width": 480},
        {"url": "https://i.ytimg.com/vi/TEST123/maxresdefault.jpg", "height": 720, "width": 1280},
    ],
    "formats": [
        {
            "format_id": "137",
            "ext": "mp4",
            "vcodec": "avc1.64002a",
            "acodec": "none",
            "height": 1080,
            "width": 1920,
            "filesize": 100_000_000,
            "tbr": 5000,
        },
        {
            "format_id": "248",
            "ext": "webm",
            "vcodec": "vp9",
            "acodec": "none",
            "height": 720,
            "width": 1280,
            "filesize": 60_000_000,
            "tbr": 3000,
        },
        {
            "format_id": "251",
            "ext": "webm",
            "vcodec": "none",
            "acodec": "opus",
            "filesize": 5_000_000,
            "tbr": 160,
        },
        {
            "format_id": "140",
            "ext": "m4a",
            "vcodec": "none",
            "acodec": "mp4a.40.2",
            "filesize": 4_000_000,
            "tbr": 128,
        },
    ],
}


# ── URL validation ────────────────────────────────────────────────────────────

def test_empty_url():
    res = client.post("/api/analyze", json={"url": ""})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


def test_malformed_url():
    res = client.post("/api/analyze", json={"url": "not-a-url"})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


def test_http_protocol_rejected():
    res = client.post("/api/analyze", json={"url": "http://youtube.com/watch?v=TEST"})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


def test_url_with_credentials_rejected():
    res = client.post("/api/analyze", json={"url": "https://user:pass@youtube.com/watch?v=TEST"})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


def test_ip_address_rejected():
    res = client.post("/api/analyze", json={"url": "https://1.2.3.4/watch?v=TEST"})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


def test_forbidden_domain():
    res = client.post("/api/analyze", json={"url": "https://vimeo.com/123456"})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "DOMAIN_NOT_ALLOWED"


def test_subdomain_attack_rejected():
    res = client.post("/api/analyze", json={"url": "https://youtube.com.evil.com/watch?v=TEST"})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "DOMAIN_NOT_ALLOWED"


def test_unexpected_port_rejected():
    res = client.post("/api/analyze", json={"url": "https://youtube.com:8443/watch?v=TEST"})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "INVALID_URL"


# ── yt-dlp error mapping ──────────────────────────────────────────────────────

def test_video_not_found():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.side_effect = DownloadError("Video unavailable")
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 404
    assert res.json()["error"]["code"] == "VIDEO_NOT_FOUND"


def test_private_video():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.side_effect = DownloadError("Private video")
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "PRIVATE_VIDEO"


def test_age_restricted():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.side_effect = DownloadError("age verification required")
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "AGE_RESTRICTED"


# ── Content type limits ───────────────────────────────────────────────────────

def test_playlist_rejected():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = {"_type": "playlist", "entries": []}
        res = client.post("/api/analyze", json={"url": "https://www.youtube.com/playlist?list=TEST"})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "PLAYLIST_NOT_SUPPORTED"


def test_live_stream_rejected():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = {**_MOCK_INFO, "is_live": True}
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "LIVE_NOT_SUPPORTED"


def test_duration_limit_exceeded():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = {**_MOCK_INFO, "duration": 99999}
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "DURATION_LIMIT_EXCEEDED"


# ── Successful analysis ───────────────────────────────────────────────────────

def test_successful_analysis():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": _VALID_URL})

    assert res.status_code == 200
    data = res.json()

    assert data["title"] == "Test Video"
    assert data["channel"] == "Test Channel"
    assert data["durationSeconds"] == 120
    assert "i.ytimg.com" in (data["thumbnailUrl"] or "")

    qualities = [v["quality"] for v in data["videoOptions"]]
    assert "best" in qualities
    assert "1080p" in qualities
    assert "720p" in qualities
    assert "480p" in qualities  # 720 >= 480, so 480p option is included

    formats = [a["format"] for a in data["audioOptions"]]
    assert "m4a" in formats
    assert "mp3" in formats


def test_estimated_sizes_present():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": _VALID_URL})

    assert res.status_code == 200
    data = res.json()
    best = next(v for v in data["videoOptions"] if v["quality"] == "best")
    assert best["estimatedSizeBytes"] is not None
    assert best["estimatedSizeBytes"] > 0


def test_no_cookies_by_default():
    """Analysis without cookies configured must not fail on startup."""
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 200


def test_youtu_be_url_accepted():
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": "https://youtu.be/TEST123"})
    assert res.status_code == 200


def test_camel_case_response_shape():
    """Response keys must be camelCase as per API contract."""
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    data = res.json()
    assert "durationSeconds" in data
    assert "thumbnailUrl" in data
    assert "sourceUrl" not in data
    assert "videoOptions" in data
    assert "audioOptions" in data
    assert "estimatedSizeBytes" in data["videoOptions"][0]


# ── Audit: security and data integrity ───────────────────────────────────────

def test_no_stream_urls_in_response():
    """Response must not expose direct stream URLs or format IDs from yt-dlp."""
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    data = res.json()
    response_str = str(data)
    # format_id values from mock must not appear
    assert "137" not in response_str
    assert "248" not in response_str
    assert "251" not in response_str
    assert "140" not in response_str
    # No field named 'url' or 'streamUrl' in top-level response
    assert "streamUrl" not in data
    assert "url" not in data


def test_no_duplicate_video_qualities():
    """Each quality label must appear at most once in videoOptions."""
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = _MOCK_INFO
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    qualities = [v["quality"] for v in res.json()["videoOptions"]]
    assert len(qualities) == len(set(qualities))


def test_null_size_when_no_filesize():
    """estimatedSizeBytes must be null when yt-dlp provides no size information."""
    info_no_size = {
        **_MOCK_INFO,
        "formats": [
            {
                "format_id": "137",
                "ext": "mp4",
                "vcodec": "avc1.64002a",
                "acodec": "none",
                "height": 1080,
                "width": 1920,
                "tbr": 5000,
                # filesize and filesize_approx intentionally absent
            },
        ],
    }
    with patch("app.services.ytdlp_analyzer._extract_info_sync") as mock:
        mock.return_value = info_no_size
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    data = res.json()
    assert res.status_code == 200
    best = next(v for v in data["videoOptions"] if v["quality"] == "best")
    assert best["estimatedSizeBytes"] is None


def test_nonexistent_cookies_file_returns_config_error():
    """When YTDLP_COOKIES_FILE points to a file that does not exist, return SERVER_CONFIGURATION_ERROR."""
    with patch("app.services.ytdlp_analyzer.settings") as mock_settings:
        mock_settings.ytdlp_cookies_file = "/tmp/nonexistent_cookies_file_xyz.txt"
        mock_settings.analyze_timeout_seconds = 30
        mock_settings.max_video_duration_seconds = 7200
        mock_settings.max_estimated_file_size_bytes = 2_147_483_648
        res = client.post("/api/analyze", json={"url": _VALID_URL})
    assert res.status_code == 500
    assert res.json()["error"]["code"] == "SERVER_CONFIGURATION_ERROR"
