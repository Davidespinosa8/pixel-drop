from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.models.media import AnalyzeRequest, AnalyzeResponse
from app.services import ytdlp_analyzer
from app.services.ytdlp_analyzer import AnalysisError

router = APIRouter()

_ERROR_STATUS: dict[str, int] = {
    "INVALID_URL": 400,
    "DOMAIN_NOT_ALLOWED": 422,
    "VIDEO_NOT_FOUND": 404,
    "PRIVATE_VIDEO": 403,
    "AUTHENTICATION_REQUIRED": 401,
    "AGE_RESTRICTED": 422,
    "LIVE_NOT_SUPPORTED": 422,
    "PLAYLIST_NOT_SUPPORTED": 422,
    "DURATION_LIMIT_EXCEEDED": 422,
    "SIZE_LIMIT_EXCEEDED": 422,
    "ANALYSIS_TIMEOUT": 504,
    "YTDLP_ERROR": 500,
    "SERVER_CONFIGURATION_ERROR": 500,
}


@router.post("/api/analyze")
async def analyze_endpoint(request: AnalyzeRequest) -> JSONResponse:
    try:
        result: AnalyzeResponse = await ytdlp_analyzer.analyze(request.url)
        return JSONResponse(content=result.model_dump(by_alias=True))
    except AnalysisError as e:
        status = _ERROR_STATUS.get(e.code, 500)
        return JSONResponse(
            status_code=status,
            content={"error": {"code": e.code, "message": e.message}},
        )
    except Exception:
        return JSONResponse(
            status_code=500,
            content={"error": {"code": "YTDLP_ERROR", "message": "Error interno del servidor."}},
        )
