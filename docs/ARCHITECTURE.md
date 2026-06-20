# ARCHITECTURE.md — Pixel Drop

## Visión general

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE (Navegador)                                             │
│  Next.js App Router — React — TypeScript — Tailwind             │
│  Firebase Auth SDK (cliente)                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
                           │ Firebase ID Token en cabecera
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND (Python — FastAPI)                                      │
│  Verifica token Firebase Admin SDK                              │
│  Controla yt-dlp y FFmpeg                                       │
│  Sirve archivos temporales                                      │
│  Emite Server-Sent Events                                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐  ┌──────────────┐  ┌────────────────┐
   │  Firebase   │  │  yt-dlp      │  │  Sistema de    │
   │  Auth Admin │  │  FFmpeg      │  │  archivos local│
   │  Firestore  │  │  (proceso    │  │  (tmp/ por job)│
   │  (mínimo)   │  │  interno)    │  │                │
   └────────────┘  └──────────────┘  └────────────────┘
```

**El backend no corre en Vercel.** Se despliega en un servidor propio (VPS o máquina local) con acceso a yt-dlp, FFmpeg y sistema de archivos.

---

## 1. Frontend — Next.js

### Estructura de rutas (App Router)

```
app/
  layout.tsx               ← Layout raíz con providers
  page.tsx                 ← Redirige según sesión
  login/
    page.tsx               ← Pantalla de login
  (protected)/
    layout.tsx             ← Guard de autenticación
    page.tsx               ← Panel principal
```

### Responsabilidades

- Renderizar la UI arcade.
- Gestionar sesión Firebase en el cliente.
- Validar la URL en el lado del cliente antes de enviar.
- Realizar llamadas al backend con el ID token de Firebase.
- Consumir SSE con `@microsoft/fetch-event-source` para actualizar el progreso.
- No ejecutar lógica de negocio de descarga.

### Comunicación con el backend

Todas las llamadas incluyen la cabecera:

```
Authorization: Bearer <Firebase ID Token>
```

El token se obtiene con `getIdToken()` antes de cada llamada. En la conexión SSE, `@microsoft/fetch-event-source` permite enviar esta cabecera directamente, a diferencia de la API nativa `EventSource`. El token nunca se pasa como query parameter, en rutas ni en mensajes SSE.

Si el token expira durante una conexión SSE, el frontend detecta el `401` y reabre la conexión con token renovado.

### Variables de entorno del frontend (Next.js)

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_BACKEND_URL          # URL base del backend FastAPI
```

Solo se exponen variables prefijadas `NEXT_PUBLIC_`. Ninguna credencial privada va al cliente.

---

## 2. Backend — FastAPI

### Estructura de módulos

```
backend/
  main.py                  ← FastAPI app, routers
  config.py                ← Settings (Pydantic BaseSettings)
  auth.py                  ← Verificación token Firebase Admin
  routers/
    analyze.py             ← POST /api/analyze
    jobs.py                ← POST /api/jobs
                              GET  /api/jobs/{job_id}
                              GET  /api/jobs/{job_id}/events
                              POST /api/jobs/{job_id}/cancel
                              GET  /api/jobs/{job_id}/download
  services/
    ytdlp_service.py       ← Wrapper de la API Python de yt-dlp
    ffmpeg_service.py      ← Invocación controlada de FFmpeg
    job_service.py         ← Ciclo de vida de un trabajo
    cleanup_service.py     ← TTL y limpieza de archivos
  models/
    job.py                 ← Dataclasses / Pydantic models de estado
  utils/
    url_validator.py       ← Lista blanca de dominios, anti-SSRF
    filename_sanitizer.py  ← Saneamiento de nombres de archivo
  scripts/
    init_owner.py          ← Script de inicialización del primer usuario (ver sección 3)
  tmp/                     ← Archivos temporales (gitignored)
```

### API propuesta

#### `POST /api/analyze`

Operación previa e independiente a la creación de un trabajo. Obtiene metadatos del video sin descargarlo. No crea ningún `Job` ni utiliza `JobState`.

**Request:**
```json
{ "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX" }
```

**Response 200:**
```json
{
  "title": "Título del video",
  "channel": "Canal",
  "durationSeconds": 742,
  "thumbnailUrl": "https://...",
  "videoFormats": ["best", "1080p", "720p", "480p"],
  "audioFormats": ["best_audio", "mp3", "m4a"]
}
```

**Limitación conocida:** `thumbnailUrl` apunta directamente a los servidores de YouTube. El navegador del usuario realizará una solicitud externa al renderizar la miniatura. No se crea proxy de imágenes en el MVP.

**Errors:** 400 (URL inválida), 401 (sin token), 404 (video no encontrado), 422 (dominio no permitido), 429 (rate limit).

---

#### `POST /api/jobs`

Crea y encola un trabajo de descarga.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=XXXXXXXXXXX",
  "type": "video",
  "quality": "1080p"
}
```

**Response 201:**
```json
{ "jobId": "uuid-v4" }
```

---

#### `GET /api/jobs/{job_id}`

Devuelve el estado actual del trabajo. Usado por el frontend para verificar el trabajo antes de declarar una conexión perdida.

**Response 200:**
```json
{
  "jobId": "uuid-v4",
  "state": "downloading_video",
  "progress": 0.45
}
```

**Response 404:** el trabajo no existe (fue cancelado, falló, expiró, o el backend fue reiniciado).

---

#### `GET /api/jobs/{job_id}/events`

SSE. El frontend usa `@microsoft/fetch-event-source` para incluir el token Firebase en la cabecera `Authorization`. El token nunca va en la URL.

**Eventos emitidos:**
```
data: {"state": "queued"}
data: {"state": "downloading_video", "progress": 0.45, "speedBps": 2400000, "etaSeconds": 45}
data: {"state": "merging", "progress": null}
data: {"state": "completed", "filename": "titulo.mp4", "sizeBytes": 245000000}
data: {"state": "failed", "error": "Video is private"}
: heartbeat
```

El servidor emite un comentario de heartbeat (`": heartbeat"`) cada 15 segundos para mantener la conexión activa. El heartbeat no modifica el estado del trabajo.

La conexión SSE se cierra al emitir `completed`, `failed` o `cancelled`.

---

#### `POST /api/jobs/{job_id}/cancel`

Detiene el proceso yt-dlp, elimina archivos temporales y transiciona a `cancelled`.

**Response 200:** `{ "status": "cancelled" }`

---

#### `GET /api/jobs/{job_id}/download`

Sirve el archivo con `Content-Disposition: attachment`. El archivo se elimina tras servirse exitosamente.

**Response:** archivo binario con cabeceras adecuadas.

---

### Autenticación en el backend

1. El middleware lee la cabecera `Authorization: Bearer <token>`.
2. Verifica el token con Firebase Admin SDK (`auth.verify_id_token()`).
3. Extrae el `uid` del token.
4. Consulta Firestore para verificar que el usuario existe y tiene `status: active`.
5. Inyecta el usuario verificado en el contexto del request.
6. Si falla: responde `401`.

```python
# auth.py (pseudocódigo)
async def get_current_user(token: str = Depends(bearer_scheme)):
    decoded = firebase_admin.auth.verify_id_token(token)
    user_doc = firestore_client.collection("users").document(decoded["uid"]).get()
    if not user_doc.exists or user_doc.get("status") != "active":
        raise HTTPException(401)
    return decoded
```

---

### Máquina de estados del trabajo

```
queued
  → downloading_video  (tipo video: descarga flujo de video)
  → downloading_audio  (solo audio: descarga directa)

downloading_video
  → downloading_audio  (video descargado, inicia descarga de audio)

downloading_audio
  → merging            (cuando video y audio son flujos separados que requieren fusión)
  → converting         (cuando se necesita re-encodear el formato)
  → completed          (audio directo sin conversión ni fusión)

merging    → completed
converting → completed
completed  → expired   (TTL alcanzado)

Desde cualquier estado activo (queued, downloading_*, merging, converting):
  → cancelled          (solicitud del usuario)
  → failed             (excepción no recuperable)
```

El estado `queued` normalmente dura muy poco antes de transicionar a `downloading_*`. El estado se mantiene en memoria (diccionario en el proceso FastAPI). No se persiste en Firestore.

---

### Seguridad

#### Validación de URL

```python
ALLOWED_DOMAINS = {
    "youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"
}

def validate_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in ("https",):   # solo HTTPS
        return False
    host = parsed.hostname or ""
    if host not in ALLOWED_DOMAINS:
        return False
    # Anti-SSRF: rechazar IPs privadas
    ip = socket.gethostbyname(host)
    if ipaddress.ip_address(ip).is_private:
        return False
    return True
```

#### yt-dlp

- Se invoca usando la **API Python de yt-dlp**, no como subproceso shell.
- El backend construye el diccionario de opciones. El usuario no puede inyectar opciones.
- Las cookies se leen desde un archivo en el servidor, nunca desde el request.
- El directorio de descarga es `tmp/{job_id}/` — ruta nunca derivada del input del usuario.

#### Saneamiento de nombres de archivo

```python
import re

def sanitize_filename(name: str) -> str:
    name = re.sub(r'[^\w\s\-.]', '', name)
    name = re.sub(r'\s+', '_', name.strip())
    return name[:200]  # límite de longitud
```

#### Rate limiting

- Implementado con `slowapi` (wrapper de `limits` para FastAPI).
- Por defecto: 10 requests/minuto por IP en endpoints de análisis y creación de jobs.
- 1 trabajo simultáneo por usuario (validado en `job_service.py`).

#### Límites de recursos

| Parámetro | Variable de entorno | Valor por defecto |
|---|---|---|
| Duración máxima del video | `MAX_VIDEO_DURATION_SECONDS` | 7200 (2 horas) |
| Tamaño máximo estimado del archivo | `MAX_FILE_SIZE_BYTES` | 2147483648 (2 GB) |
| Timeout máximo del proceso yt-dlp | `YTDLP_TIMEOUT_SECONDS` | 3600 (1 hora) |
| Trabajos simultáneos por usuario | `MAX_CONCURRENT_JOBS_PER_USER` | 1 |
| TTL del archivo completado | `FILE_TTL_MINUTES` | 15 minutos |

El tamaño es una estimación previa basada en los metadatos de yt-dlp. El backend controla el tamaño real durante el proceso cuando sea técnicamente posible.

---

### Limpieza de archivos

- **Post-descarga:** al servir exitosamente el archivo (`/download`), se elimina `tmp/{job_id}/` inmediatamente.
- **TTL:** un background task de FastAPI (`asyncio`) revisa los trabajos `completed` y los expira al cumplir el TTL.
- **Cancelled/Failed:** los archivos temporales se eliminan al transicionar a estos estados.
- **Al reiniciar el servidor:** en el startup se limpia `tmp/` completo (archivos huérfanos).

---

### Resiliencia de la conexión SSE

El backend emite un heartbeat SSE cada 15 segundos mientras el trabajo está activo:

```
: heartbeat
```

Si el frontend no recibe ningún evento durante 30–45 segundos, considera la conexión interrumpida y:
1. Intenta reconectar automáticamente (back-off exponencial, máx. 3 intentos).
2. Antes de declarar el trabajo perdido, consulta `GET /api/jobs/{job_id}`.
3. Si el trabajo no existe (backend reiniciado), muestra el mensaje de conexión perdida.

---

### Manejo de cookies para videos restringidos

Las cookies se almacenan en un archivo Netscape en el servidor (ej. `/secrets/youtube_cookies.txt`). El path se configura via variable de entorno `YTDLP_COOKIES_FILE`. Si la variable no está definida, el backend opera sin cookies. Nunca se expone ni se loguea el contenido.

---

### Variables de entorno del backend

```
FIREBASE_SERVICE_ACCOUNT_PATH    # Path al JSON de cuenta de servicio
FAMILY_CODE_HASH                 # Hash bcrypt del código familiar
YTDLP_COOKIES_FILE               # Opcional. Path al archivo de cookies
TMP_DIR                          # Directorio temporal (default: ./tmp)
FILE_TTL_MINUTES                 # TTL archivos completados (default: 15)
MAX_VIDEO_DURATION_SECONDS       # (default: 7200)
MAX_FILE_SIZE_BYTES              # (default: 2147483648)
YTDLP_TIMEOUT_SECONDS            # (default: 3600)
MAX_CONCURRENT_JOBS_PER_USER     # (default: 1)
RATE_LIMIT_PER_MINUTE            # (default: 10)
ALLOWED_ORIGINS                  # CORS origins (default: localhost:3000)
```

---

## 3. Firebase

### Authentication

- Firebase Auth gestiona las sesiones del cliente.
- El backend solo consume el Admin SDK para **verificar tokens**. No crea usuarios directamente desde el cliente.
- El flujo de login usa un custom token generado por el backend tras validar el código familiar.

### Código familiar

- El código familiar se hashea con bcrypt en el momento de la configuración inicial.
- El hash se almacena en la variable de entorno `FAMILY_CODE_HASH`, no en Firestore.
- Nunca se almacena el código en texto plano.
- La comparación es: `bcrypt.checkpw(input_code, stored_hash)`.

### Firestore

Solo se lee/escribe en `users/{uid}`:

```
users/{uid}
  email: string
  createdAt: Timestamp
  lastLoginAt: Timestamp
  status: "active" | "inactive"
  role: "owner" | "family"
```

No se almacena historial, URLs, archivos ni cookies.

### Primer usuario owner

El primer usuario propietario se crea mediante el script `backend/scripts/init_owner.py`, ejecutado una sola vez antes del primer uso de la aplicación. El script:

1. Recibe el correo del propietario desde una variable de entorno o argumento seguro (nunca hardcodeado).
2. Crea o localiza el usuario en Firebase Authentication.
3. Crea o actualiza `users/{uid}` en Firestore.
4. Asigna `role: "owner"`, `status: "active"`, `createdAt`, `lastLoginAt`.
5. Es idempotente: puede ejecutarse más de una vez sin efectos secundarios.
6. No contiene contraseñas, códigos ni credenciales dentro del repositorio.

El script no se implementa durante la documentación. Se implementa en la Fase 1 del plan.

---

## 4. Desarrollo local

### Prerequisitos

- Node.js 20+
- Python 3.11+
- yt-dlp instalado en PATH
- FFmpeg instalado en PATH
- Cuenta de Firebase con proyecto configurado

### Estructura de repositorio

```
pixel-drop/
  frontend/               ← Next.js app
  backend/                ← FastAPI app
  docs/                   ← Documentación del proyecto
  .gitignore
  CLAUDE.md
```

### Inicio local

```bash
# Terminal 1 — Backend
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev  # http://localhost:3000
```

### CORS en desarrollo

El backend permite `http://localhost:3000` como origen. En producción se reemplaza por el dominio de Vercel.

---

## 5. Riesgos

| Riesgo | Impacto | Mitigación |
|---|---|---|
| yt-dlp desactualizado | API de YouTube cambia, descargas fallan | Dependencia sin pin de versión mayor en `requirements.txt`, actualizar frecuentemente |
| Archivo temporal no eliminado | Consumo de disco acumulado | Startup cleanup + TTL background task |
| Token Firebase expirado durante SSE | Progreso se pierde | `fetch-event-source` detecta el 401 y reabre con token renovado |
| Reinicio del backend con job activo | Frontend queda sin eventos | Heartbeat + timeout en cliente + fallback a `GET /api/jobs/{job_id}` |
| Un trabajo cuelga indefinidamente | Recurso bloqueado | `YTDLP_TIMEOUT_SECONDS` configurable |
| Nombre de archivo con path traversal | Seguridad | Sanitizer estricto + ruta siempre bajo `tmp/{job_id}/` |
| Rate limit eludido cambiando IP | Abuso | Límite por IP + límite por usuario (uid) |
