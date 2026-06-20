# DATA_MODEL.md — Pixel Drop

## Convención de nombres

| Contexto | Convención | Ejemplo |
|---|---|---|
| JSON y TypeScript | camelCase | `jobId`, `durationSeconds` |
| Python interno | snake_case | `job_id`, `duration_seconds` |
| Rutas HTTP | snake_case entre llaves | `/api/jobs/{job_id}/events` |

---

## Datos persistentes — Firestore

### Colección `users`

Documento: `users/{uid}`

| Campo | Tipo | Descripción |
|---|---|---|
| `email` | `string` | Correo del usuario. Solo lectura después del registro. |
| `createdAt` | `Timestamp` | Fecha de creación del documento. |
| `lastLoginAt` | `Timestamp` | Última vez que el usuario inició sesión exitosamente. |
| `status` | `"active" \| "inactive"` | Controla el acceso. El backend rechaza tokens de usuarios `inactive`. |
| `role` | `"owner" \| "family"` | Define el nivel de privilegio. El MVP no diferencia permisos por rol; está preparado para el futuro. |

**No hay otras colecciones.** No se persisten trabajos, URLs, archivos ni historial.

### Inicialización del primer usuario owner

El documento del primer usuario `owner` se crea mediante el script `backend/scripts/init_owner.py` ejecutado una única vez. El script es idempotente y no contiene credenciales. Ver `ARCHITECTURE.md` sección 3 para los detalles.

### Reglas de seguridad de Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if false;   // El frontend no lee Firestore directamente
      allow write: if false;  // Solo el Admin SDK puede escribir
    }
  }
}
```

El frontend no consulta Firestore directamente. Toda la lógica de usuario pasa por el backend.

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
| Firebase service account JSON | Variable de entorno / archivo excluido de git |
| Hash del código familiar | Variable de entorno `FAMILY_CODE_HASH` del backend |
| Cookies de YouTube | Archivo en el servidor, path en `YTDLP_COOKIES_FILE` |
| Firebase API keys del cliente | Variables `NEXT_PUBLIC_*` en `.env.local` (no se commitean) |

El archivo `.gitignore` debe excluir: `backend/secrets/`, `tmp/`, `.env`, `.env.local`, `*_cookies.txt`, `*serviceAccount*.json`.
