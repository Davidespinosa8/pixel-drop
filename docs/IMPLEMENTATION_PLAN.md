# IMPLEMENTATION_PLAN.md — Pixel Drop

## Principios de implementación

- Una fase a la vez. No avanzar a la siguiente sin validar la actual.
- Cada fase tiene archivos esperados, criterios de aceptación y verificaciones.
- No instalar dependencias sin explicar por qué son necesarias.
- No implementar funcionalidades fuera del alcance de la fase.

---

## Fase 0 — Scaffolding y configuración base

**Objetivo:** Tener los proyectos frontend y backend inicializados, con dependencias mínimas instaladas y la estructura de directorios definida.

### Archivos esperados

```
frontend/
  package.json
  tsconfig.json
  next.config.ts
  tailwind.config.ts
  postcss.config.mjs
  .env.local.example
  app/
    layout.tsx
    page.tsx

backend/
  requirements.txt
  main.py
  config.py
  .env.example
  tmp/            (gitignored)
```

### Dependencias frontend

| Paquete | Justificación |
|---|---|
| `next` | Framework |
| `react`, `react-dom` | UI |
| `typescript` | Tipado estricto |
| `tailwindcss` | Estilos |
| `firebase` | Auth cliente |
| `zod` | Validación de esquemas y respuestas de API en boundaries externos |
| `react-hook-form` | Formularios |
| `@microsoft/fetch-event-source` | SSE con soporte de cabeceras personalizadas (token Firebase en `Authorization`) — **aprobado, se instala en Fase 4** |

### Dependencias backend

| Paquete | Justificación |
|---|---|
| `fastapi` | Framework HTTP |
| `uvicorn` | Servidor ASGI |
| `yt-dlp` | Motor de descarga |
| `firebase-admin` | Verificación de tokens |
| `python-dotenv` | Variables de entorno |
| `slowapi` | Rate limiting |
| `bcrypt` | Hash del código familiar |
| `pydantic-settings` | Configuración tipada |

### Criterios de aceptación

- `npm run dev` levanta el frontend en `localhost:3000` sin errores.
- `uvicorn main:app --reload` levanta el backend en `localhost:8000` sin errores.
- `GET /` del backend devuelve `{"status": "ok"}`.
- TypeScript sin errores de compilación en el frontend.
- Los archivos `.env.local.example` y `.env.example` incluyen todas las variables necesarias, incluyendo `YTDLP_TIMEOUT_SECONDS`, `MAX_VIDEO_DURATION_SECONDS` y `MAX_FILE_SIZE_BYTES` con sus valores por defecto.

### Verificaciones

```bash
# Frontend
npm run build    # sin errores

# Backend
python -m py_compile main.py config.py
```

---

## Fase 1 — Autenticación completa

**Objetivo:** Implementar el flujo de login con correo + código familiar + Firebase Auth. El usuario puede iniciar y cerrar sesión. Rutas protegidas redirigen a `/login` si no hay sesión.

### Prerequisito: inicialización del primer usuario owner

Antes de ejecutar esta fase, debe existir al menos un usuario `owner` en Firestore. Se crea con el script `backend/scripts/init_owner.py` (a implementar en esta misma fase). El script requiere:
- La variable de entorno `FIREBASE_SERVICE_ACCOUNT_PATH` configurada.
- El correo del propietario como argumento o variable de entorno.
- No contiene contraseñas ni códigos en el código fuente.

### Archivos esperados

```
frontend/
  app/
    login/page.tsx
    (protected)/layout.tsx     ← Guard de autenticación
    (protected)/page.tsx       ← Panel vacío con logout
  lib/
    firebase.ts                ← Inicialización Firebase cliente
    auth.ts                    ← signIn, signOut, getIdToken helpers
  components/
    ui/Input.tsx
    ui/Button.tsx
    auth/LoginForm.tsx

backend/
  auth.py                      ← verify_id_token, get_current_user
  routers/auth.py              ← POST /api/auth/verify-code
  scripts/init_owner.py        ← Script idempotente de inicialización del owner
  main.py                      ← actualizado con router de auth
```

### Criterios de aceptación

1. Usuario con correo habilitado y código correcto puede hacer login.
2. Código incorrecto muestra error sin revelar si el correo existe.
3. Después del login, redirige a `/`.
4. Sin sesión, `/` redirige a `/login`.
5. Botón de logout cierra sesión y redirige a `/login`.
6. El código familiar nunca aparece en logs ni en Firestore.
7. Token expirado en el backend devuelve 401.

### Verificaciones

```bash
# Manual: login correcto → redirige al panel
# Manual: login incorrecto → mensaje de error, formulario no se limpia el email
# Manual: acceder a / sin sesión → redirige a /login
# Backend: curl -X POST /api/auth/verify-code con código incorrecto → 401
```

---

## Fase 2 — Análisis de URL

**Objetivo:** El usuario autenticado puede pegar una URL de YouTube, presionar "Escanear señal" y ver los metadatos del video (título, canal, duración, miniatura, formatos disponibles).

### Archivos esperados

```
frontend/
  components/
    main/UrlInput.tsx
    main/VideoCard.tsx
  hooks/
    useAnalyze.ts              ← llamada a POST /api/analyze
  lib/
    api.ts                     ← cliente HTTP con token

backend/
  routers/analyze.py           ← POST /api/analyze
  services/ytdlp_service.py    ← fetch_metadata()
  utils/url_validator.py       ← validate_url()
  utils/filename_sanitizer.py
  main.py                      ← actualizado
```

### Criterios de aceptación

1. URL de dominio no permitido: error inline antes de enviar al backend.
2. URL inválida (sin video): mensaje de error temático.
3. URL válida: tarjeta con título, canal, duración y miniatura.
4. El backend no descarga el video completo para obtener metadatos.
5. Timeout de análisis: si yt-dlp tarda más de 10 segundos, error con mensaje claro.
6. La llamada al backend incluye el token Firebase. Sin token: 401.

### Verificaciones

```bash
# Manual: pegar URL de youtube.com → tarjeta de metadatos
# Manual: pegar URL de vimeo.com → error de dominio no autorizado
# Backend: POST /api/analyze sin cabecera Authorization → 401
# Backend: POST /api/analyze con URL privada → 404 con mensaje
```

---

## Fase 3 — Selección de formato e inicio de descarga

**Objetivo:** El usuario puede seleccionar tipo (video/audio) y calidad, presionar "Iniciar misión" y el backend crea el trabajo y comienza la descarga.

### Archivos esperados

```
frontend/
  components/
    main/TypeSelector.tsx
    main/QualitySelector.tsx
  hooks/
    useCreateJob.ts            ← POST /api/jobs

backend/
  routers/jobs.py              ← POST /api/jobs
  services/job_service.py      ← create_job(), run_job()
  models/job.py                ← Job dataclass, JobState enum
  main.py                      ← actualizado
```

### Criterios de aceptación

1. Solo se muestran las calidades que el análisis confirmó disponibles.
2. El botón "Iniciar misión" se deshabilita hasta que hay tipo y calidad seleccionados.
3. `POST /api/jobs` devuelve un `{ "jobId": "..." }` en menos de 500ms.
4. El trabajo se crea en estado `queued` y transiciona directamente a `downloading_video` o `downloading_audio` sin pasar por ningún estado intermedio adicional.
5. Un segundo intento de crear trabajo mientras hay uno activo devuelve 409.

---

## Fase 4 — Progreso en tiempo real (SSE)

**Objetivo:** El frontend consume los eventos SSE del trabajo usando `@microsoft/fetch-event-source` y actualiza la barra de progreso, el badge de estado y los datos t��cnicos (velocidad, ETA). Se instala la dependencia en esta fase.

### Archivos esperados

```
frontend/
  components/
    main/ProgressBar.tsx
    main/StatusBadge.tsx
    main/ProgressDetails.tsx
  hooks/
    useJobEvents.ts            ← consumidor de SSE con fetch-event-source

backend/
  routers/jobs.py              ← GET /api/jobs/{job_id}/events (SSE)
                                  GET /api/jobs/{job_id} (estado para resilencia)
  services/job_service.py      ← actualizado con callbacks de progreso y heartbeat
```

### Criterios de aceptación

1. La barra de progreso se actualiza en tiempo real al menos cada 2 segundos.
2. El badge de estado refleja el estado actual del trabajo.
3. Los estados `merging` y `converting` muestran el mismo badge `PROCESANDO TRANSMISIÓN`.
4. Al completarse, el estado cambia a `completed` y aparece el botón de descarga.
5. Al fallar, el estado cambia a `failed` con mensaje de error.
6. La conexión SSE se cierra automáticamente al completar o fallar.
7. El token Firebase va en la cabecera `Authorization`, nunca en la URL ni como query parameter.
8. Si el token expira durante la SSE, el frontend reabre la conexión con token renovado.
9. El servidor emite un heartbeat cada 15 segundos.
10. Si no se recibe ningún evento durante 30–45 segundos, el frontend consulta `GET /api/jobs/{job_id}`. Si el trabajo no existe, muestra el mensaje `CONEXIÓN PERDIDA`.

---

## Fase 5 — Cancelación y descarga de archivo

**Objetivo:** El usuario puede cancelar una descarga en curso y descargar el archivo completado.

### Archivos esperados

```
frontend/
  components/
    main/CancelButton.tsx
    ui/Modal.tsx
    main/DownloadSection.tsx
    main/Countdown.tsx

backend/
  routers/jobs.py              ← POST /api/jobs/{id}/cancel
                                  GET  /api/jobs/{id}/download
  services/cleanup_service.py  ← delete_job_files()
```

### Criterios de aceptación

1. Presionar "Abortar misión" abre el modal de confirmación.
2. Al confirmar: descarga se detiene, archivos temporales se eliminan, badge cambia a `cancelled`.
3. Al cancelar el modal: descarga continúa sin interrupción.
4. `GET /api/jobs/{id}/download` sirve el archivo con `Content-Disposition: attachment`.
5. Tras servir el archivo, el directorio `tmp/{job_id}/` se elimina.
6. El countdown muestra tiempo restante. Al llegar a 0: botón de descarga deshabilitado.

---

## Fase 6 — Limpieza automática y TTL

**Objetivo:** Los archivos temporales se eliminan automáticamente por TTL y al reiniciar el servidor.

### Archivos esperados

```
backend/
  services/cleanup_service.py  ← TTL background task, startup cleanup
  main.py                      ← startup event registrado
```

### Criterios de aceptación

1. Al iniciar el servidor, `tmp/` se limpia completamente.
2. Los trabajos `completed` que superan el TTL transicionan a `expired`.
3. Los archivos de trabajos `expired` se eliminan del disco.
4. El background task corre cada 60 segundos.

---

## Fase 7 — Diseño arcade completo

**Objetivo:** Aplicar el sistema de diseño arcade espacial: fuentes, colores, animaciones, íconos SVG, barra segmentada y responsive.

### Archivos esperados

```
frontend/
  app/globals.css              ← variables CSS, animaciones base
  components/
    icons/                     ← SVGs pixel art (scan, rocket, abort, download, etc.)
    ui/                        ← Button, Input, Card, Modal actualizados con estilos
  lib/fonts.ts                 ← Definición de fuentes con next/font/google (Press Start 2P, Inter, JetBrains Mono, display: "swap")
```

### Criterios de aceptación

1. La interfaz usa la paleta de colores definida en `DESIGN_SYSTEM.md`.
2. Las tres fuentes se cargan via `next/font/google` con `display: "swap"`. No hay solicitudes a Google Fonts en tiempo de ejecución.
3. Los botones tienen sombra dura y efecto de presión al hacer clic.
4. La barra de progreso es segmentada (20 desktop / 12 mobile).
5. Con `prefers-reduced-motion: reduce`, todas las animaciones están deshabilitadas.
6. Todos los elementos interactivos tienen foco visible.
7. Sin scroll horizontal en viewport 375px.
8. `npm run build` sin errores de TypeScript ni ESLint.

---

## Fase 8 — Hardening y preparación para despliegue

**Objetivo:** Revisar seguridad, completar manejo de errores edge-case, añadir rate limiting, y preparar la configuración de producción.

### Tareas

- Verificar que ninguna credencial aparece en logs.
- Revisar que el saneador de nombres de archivo cubre casos edge.
- Verificar headers de seguridad HTTP en el backend.
- Revisar que CORS solo permite los orígenes configurados.
- Verificar que el timeout de yt-dlp funciona correctamente.
- Preparar `Dockerfile` para el backend.
- Documentar el proceso de despliegue.

### Criterios de aceptación

1. `bandit -r backend/` sin issues críticos.
2. Ninguna variable de entorno secreta aparece en logs de desarrollo.
3. Todos los errores del backend devuelven estructuras consistentes (nunca stack traces al cliente).
4. El Dockerfile construye y el backend levanta correctamente en el contenedor.

---

## Orden de prioridad

| Fase | Prioridad | Dependencias |
|---|---|---|
| 0 — Scaffolding | Crítica | Ninguna |
| 1 — Autenticación | Crítica | Fase 0 |
| 2 — Análisis URL | Crítica | Fase 1 |
| 3 — Creación de trabajo | Crítica | Fase 2 |
| 4 — Progreso SSE | Crítica | Fase 3 |
| 5 — Cancelación y descarga | Crítica | Fase 4 |
| 6 — TTL y limpieza | Alta | Fase 5 |
| 7 — Diseño arcade | Alta | Fase 5 (puede solaparse) |
| 8 — Hardening | Media | Fase 7 |
