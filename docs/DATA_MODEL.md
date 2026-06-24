# DATA_MODEL.md — Pixel Drop

## Convención de nombres

| Contexto | Convención | Ejemplo |
|---|---|---|
| JSON y TypeScript | camelCase | `jobId`, `durationSeconds` |
| Python interno | snake_case | `job_id`, `duration_seconds` |
| Rutas HTTP | snake_case entre llaves | `/api/jobs/{job_id}/events` |

---

## Datos de identidad — Firebase Auth Custom Claims

No hay base de datos en el MVP. La identidad del usuario vive exclusivamente en Firebase Authentication.

### Custom claims por usuario

| Claim | Tipo | Descripción |
|---|---|---|
| `role` | `"owner" \| "family"` | Rol del usuario. Incluido en el ID token y en la session cookie. |

**No hay Firestore.** No se persisten trabajos, URLs, archivos, historial, fechas de acceso ni preferencias.

### Inicialización del primer usuario owner

El claim `role: "owner"` se asigna mediante el script `frontend/scripts/bootstrap-owner.mjs` ejecutado una única vez. El script es idempotente y no contiene credenciales. Ver `ARCHITECTURE.md` sección 3 para los detalles.

### Fuente de verdad

| Dato | Dónde vive |
|---|---|
| Identidad (email, uid) | Firebase Authentication |
| Rol | Custom claim en Firebase Auth |
| Estado del usuario | Firebase Auth (campo `disabled`) |
| Estado de trabajos | Memoria del proceso FastAPI |
| Archivos temporales | Sistema de archivos local (`tmp/`) |

---

## Datos en memoria — Backend (FastAPI)

El estado de los trabajos se mantiene en un diccionario en memoria del proceso FastAPI. No se persiste entre reinicios del servidor.

### `Job`

```python
@dataclass
class Job:
    job_id: str                     # UUID v4 (snake_case: Python interno)
    uid: str                        # Firebase UID del usuario
    url: str                        # URL original (validada)
    type: Literal["video", "audio"]
    quality: str                    # "best", "1080p", "720p", "480p", "best_audio", "mp3", "m4a"
    state: JobState                 # Enum
    created_at: datetime
    updated_at: datetime
    progress: float | None          # 0.0 a 1.0, None si indeterminado
    speed_bps: int | None           # bytes/segundo, None si no disponible
    eta_seconds: int | None
    output_path: Path | None        # path al archivo completado
    filename: str | None            # nombre saneado del archivo
    size_bytes: int | None          # tamaño del archivo completado
    error: str | None               # mensaje de error (nunca credenciales)
    expires_at: datetime | None     # calculado al llegar a completed
    process: Any | None             # referencia interna al proceso yt-dlp
```

### `JobState` (Enum)

```python
class JobState(str, Enum):
    QUEUED             = "queued"
    DOWNLOADING_VIDEO  = "downloading_video"
    DOWNLOADING_AUDIO  = "downloading_audio"
    MERGING            = "merging"
    CONVERTING         = "converting"
    COMPLETED          = "completed"
    FAILED             = "failed"
    CANCELLED          = "cancelled"
    EXPIRED            = "expired"
```

`merging` y `converting` son estados distintos internamente. Ambos se muestran al usuario con el texto `PROCESANDO TRANSMISIÓN`.

---

## Datos temporales — Sistema de archivos

```
tmp/
  {job_id}/
    video.{ext}          ← flujo de video (si se descarga separado)
    audio.{ext}          ← flujo de audio
    output.{ext}         ← archivo final (mp4, mp3, m4a)
```

- Cada trabajo tiene su propio directorio `tmp/{job_id}/`.
- El directorio se crea al crear el trabajo y se elimina al completar, cancelar, fallar o expirar.
- Los nombres internos (`video`, `audio`, `output`) son fijos — nunca derivan del input del usuario.
- El nombre del archivo final que se sirve al usuario es el campo `filename` del `Job` (saneado).

---

## Datos en tránsito — API

Los campos JSON usan camelCase. Los campos Python internos usan snake_case.

### Request de análisis

```typescript
interface AnalyzeRequest {
  url: string;
}
```

### Response de análisis

```typescript
interface AnalyzeResponse {
  title: string;
  channel: string;
  durationSeconds: number;
  thumbnailUrl: string;       // URL directa de YouTube; ver limitación en ARCHITECTURE.md
  videoFormats: VideoQuality[];
  audioFormats: AudioFormat[];
}

type VideoQuality = "best" | "1080p" | "720p" | "480p";
type AudioFormat = "best_audio" | "mp3" | "m4a";
```

### Request de creación de trabajo

```typescript
interface CreateJobRequest {
  url: string;
  type: "video" | "audio";
  quality: string;
}
```

### Response de creación de trabajo

```typescript
interface CreateJobResponse {
  jobId: string;
}
```

### Response de estado del trabajo

```typescript
interface JobStatusResponse {
  jobId: string;
  state: JobState;
  progress: number | null;
}
```

### Evento SSE de progreso

Consumido mediante `@microsoft/fetch-event-source` con el token Firebase en la cabecera `Authorization: Bearer <token>`. El token nunca se pasa como query parameter.

```typescript
interface JobProgressEvent {
  state: JobState;
  progress: number | null;        // 0.0 – 1.0
  speedBps: number | null;
  etaSeconds: number | null;
  filename?: string;              // solo en estado completed
  sizeBytes?: number;             // solo en estado completed
  error?: string;                 // solo en estado failed (sin credenciales)
}
```

El servidor emite también comentarios de heartbeat (`": heartbeat"`) cada 15 segundos, que no tienen estructura JSON.

---

## Secretos — nunca en el repositorio

| Secreto | Dónde vive |
|---|---|
| Firebase Admin credentials | Variables de entorno del frontend (server-only) |
| SHA-256 del código familiar | Variable de entorno `FAMILY_ACCESS_CODE_SHA256` del frontend |
| Cookies de YouTube | Archivo en el servidor, path en `YTDLP_COOKIES_FILE` del backend |
| Firebase API keys del cliente | Variables `NEXT_PUBLIC_*` en `frontend/.env.local` (no se commitean) |

El archivo `.gitignore` debe excluir: `backend/secrets/`, `tmp/`, `.env`, `.env.local`, `*_cookies.txt`, `*serviceAccount*.json`.
