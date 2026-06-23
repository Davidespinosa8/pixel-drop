from fastapi import FastAPI

app = FastAPI(title="Pixel Drop API")


@app.get("/health")
def health():
    return {"status": "ok", "service": "pixel-drop-api"}
