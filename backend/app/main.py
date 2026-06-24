from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.analyze import router as analyze_router
from app.core.config import settings
from app.services.ytdlp_analyzer import shutdown_executor


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    yield
    shutdown_executor()


app = FastAPI(title="Pixel Drop API", lifespan=lifespan)

# allow_credentials=False is correct for bearer tokens sent via Authorization header
# (credentials: "include" is only needed for cookies, not headers).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

app.include_router(analyze_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "pixel-drop-api"}
