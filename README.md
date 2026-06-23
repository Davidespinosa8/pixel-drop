# Pixel Drop

Descargador familiar de YouTube con experiencia visual arcade espacial.

## Estructura

```
pixel-drop/
├── frontend/    ← Next.js (App Router, TypeScript, Tailwind)
├── backend/     ← FastAPI (Python, yt-dlp, FFmpeg)
└── docs/        ← Documentación de producto y arquitectura
```

## Requisitos

- Node.js 20+
- Python 3.11+
- yt-dlp en PATH
- FFmpeg en PATH

## Desarrollo

### Frontend

```bash
npm run dev:web
```

### Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Scripts raíz

| Comando | Descripción |
|---|---|
| `npm run dev:web` | Inicia el frontend en `localhost:3000` |
| `npm run lint:web` | Ejecuta ESLint sobre el frontend |
| `npm run build:web` | Compila el frontend para producción |
