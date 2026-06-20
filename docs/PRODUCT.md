# PRODUCT.md — Pixel Drop

## Problema

Descargar contenido audiovisual de YouTube de forma legal y autorizada requiere usar herramientas de línea de comandos complejas (yt-dlp, FFmpeg) que resultan inaccesibles para usuarios no técnicos del entorno familiar. No existe una interfaz sencilla, privada y segura orientada al uso doméstico.

## Público objetivo

| Segmento | Descripción |
|---|---|
| Propietario | Usuario técnico que instala y administra la app. Rol `owner`. |
| Familia | Usuarios no técnicos autorizados por el propietario. Rol `family`. |

La aplicación **no es pública**. El acceso requiere validación explícita. El MVP no contempla registro libre.

## Propuesta de valor

Transformar la descarga técnica de contenido audiovisual en una misión arcade espacial: la complejidad de yt-dlp y FFmpeg desaparece detrás de una interfaz visual inmersiva, clara y segura.

## Alcance del MVP

### Incluido

- Autenticación con correo + código familiar + Firebase Auth.
- Análisis de URL de YouTube (metadatos sin descarga completa).
- Descarga de video en MP4 (mejor calidad, 1080p, 720p, 480p).
- Descarga de audio en MP3 o M4A.
- Fusión de pistas de video y audio con FFmpeg cuando sea necesario.
- Progreso en tiempo real vía Server-Sent Events.
- Cancelación de descarga en curso.
- Entrega del archivo al usuario y limpieza automática posterior.
- Soporte de videos restringidos por edad mediante cookies configuradas en el servidor.
- Dominio permitido: `youtube.com`, `www.youtube.com`, `m.youtube.com`, `youtu.be`.

### Fuera de alcance

- Playlists completas, canales completos, descargas masivas.
- Historial de descargas persistente.
- Edición de video.
- Aplicación móvil nativa o extensión de navegador.
- Cualquier dominio fuera de YouTube.
- Carga de cookies desde el frontend.
- Registro público / pagos / publicidad.
- Parámetros personalizados de yt-dlp ingresados por el usuario.
- Proxy de miniaturas (las imágenes se sirven directamente desde YouTube).

## Límites del MVP

Los siguientes valores son los predeterminados y configurables mediante variables de entorno del backend:

| Límite | Variable de entorno | Valor por defecto |
|---|---|---|
| Duración máxima del video | `MAX_VIDEO_DURATION_SECONDS` | 7200 (2 horas) |
| Tamaño máximo estimado del archivo | `MAX_FILE_SIZE_BYTES` | 2147483648 (2 GB) |
| Timeout máximo del proceso yt-dlp | `YTDLP_TIMEOUT_SECONDS` | 3600 (1 hora) |
| TTL del archivo completado | `FILE_TTL_MINUTES` | 15 minutos |
| Trabajos simultáneos por usuario | `MAX_CONCURRENT_JOBS_PER_USER` | 1 |

El tamaño es una **estimación previa** basada en los metadatos que yt-dlp puede proporcionar antes de la descarga. El backend también controla el tamaño real durante el proceso cuando sea técnicamente posible.

### Limitación conocida: miniaturas externas

La miniatura del video se obtiene de la URL devuelta por yt-dlp y se renderiza directamente en el navegador del usuario. Esto implica una solicitud externa hacia los servidores de YouTube en el momento de mostrar la tarjeta de metadatos. No se crea un proxy de imágenes ni se almacenan miniaturas en el MVP. Esta limitación es aceptada y conocida.

## Casos de uso

### CU-01: Iniciar sesión

**Actor:** Propietario o familiar  
**Precondición:** El usuario tiene correo habilitado y conoce el código familiar.  
**Flujo:**
1. Ingresa correo y código familiar.
2. El servidor valida el código (comparando hash) y emite token Firebase.
3. El cliente almacena la sesión.  

**Postcondición:** Usuario autenticado, redirigido al panel principal.

---

### CU-02: Analizar URL

**Actor:** Usuario autenticado  
**Precondición:** URL válida de YouTube.  
**Flujo:**
1. Pega URL en el campo de entrada.
2. Presiona "Escanear señal".
3. Backend obtiene metadatos (título, canal, duración, miniatura, formatos).
4. Frontend muestra la tarjeta de resultado.  

**Postcondición:** Tarjeta con opciones de descarga visible.

---

### CU-03: Iniciar descarga

**Actor:** Usuario autenticado  
**Precondición:** Análisis completado (CU-02).  
**Flujo:**
1. Selecciona tipo (video/audio) y calidad.
2. Presiona "Iniciar misión".
3. Backend crea trabajo, inicia descarga, emite eventos de progreso.
4. Frontend muestra barra de progreso con estado temático.
5. Al completarse, el frontend muestra enlace de descarga.  

**Postcondición:** Archivo disponible para descarga directa.

---

### CU-04: Cancelar descarga

**Actor:** Usuario autenticado  
**Precondición:** Descarga en curso.  
**Flujo:**
1. Presiona "Abortar misión".
2. Backend detiene el proceso yt-dlp y elimina archivos temporales.
3. Frontend muestra estado "Misión abortada".  

---

### CU-05: Descargar archivo

**Actor:** Usuario autenticado  
**Precondición:** Estado `completed`.  
**Flujo:**
1. Presiona el botón de descarga.
2. El servidor sirve el archivo con cabeceras adecuadas.
3. Tras la entrega (o expiración), el archivo se elimina del servidor.  

---

### CU-06: Expiración de archivo

**Actor:** Sistema  
**Precondición:** Trabajo en estado `completed` con tiempo de expiración alcanzado.  
**Flujo:**
1. El servidor elimina el archivo temporal.
2. Si el usuario intenta descargar, recibe error de expiración.  

## Funcionalidades por componente

### Frontend

| ID | Funcionalidad |
|---|---|
| F-01 | Pantalla de login con correo + código |
| F-02 | Campo URL con validación de dominio |
| F-03 | Llamada de análisis y tarjeta de resultado |
| F-04 | Selector de tipo y calidad |
| F-05 | Barra de progreso con SSE |
| F-06 | Botón de cancelar |
| F-07 | Enlace de descarga al completarse |
| F-08 | Manejo de errores con mensajes temáticos |
| F-09 | Indicador de expiración |

### Backend

| ID | Funcionalidad |
|---|---|
| B-01 | Endpoint de validación de código familiar |
| B-02 | Verificación de token Firebase en cada request |
| B-03 | Validación y sanitización de URL |
| B-04 | Extracción de metadatos con yt-dlp |
| B-05 | Descarga controlada con yt-dlp |
| B-06 | Fusión/conversión con FFmpeg |
| B-07 | Server-Sent Events de progreso |
| B-08 | Endpoint de cancelación |
| B-09 | Servicio de archivo y limpieza post-descarga |
| B-10 | Limpieza automática por expiración (TTL) |
| B-11 | Rate limiting y límites de recursos |

## Criterios de aceptación globales

1. Un usuario con correo habilitado puede autenticarse en menos de 10 segundos (conexión normal).
2. El análisis de una URL válida retorna metadatos en menos de 5 segundos (sin descarga del video).
3. El progreso de descarga se actualiza al menos cada 2 segundos via SSE.
4. Un archivo completado está disponible para descarga inmediata y expira automáticamente (TTL configurable, por defecto 15 minutos).
5. Al cancelar, los archivos temporales se eliminan en menos de 3 segundos.
6. URLs fuera de la lista permitida son rechazadas antes de llegar a yt-dlp.
7. Ninguna credencial, cookie o token aparece en logs ni en respuestas al cliente.
8. La interfaz es usable en viewport de 375px (iPhone SE) sin scroll horizontal.
9. La navegación completa es posible solo con teclado.
10. Con `prefers-reduced-motion: reduce` todas las animaciones están deshabilitadas.
