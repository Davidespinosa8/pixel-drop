# Project Brief: descargador arcade privado

## Objetivo

Crear una aplicación web privada y gratuita para uso familiar que permita analizar y descargar contenido audiovisual de YouTube mediante yt-dlp.

La aplicación solo debe utilizarse con contenido propio, autorizado, de dominio público o cuya descarga esté permitida.

## Propuesta de valor

Ofrecer una interfaz visual sencilla e inmersiva que transforme el proceso de descarga en una misión arcade espacial, ocultando la complejidad técnica de yt-dlp y FFmpeg.

## Usuario

* Propietario de la aplicación.
* Familiares autorizados.
* No será una plataforma pública durante el MVP.

## Acceso

El usuario debe:

1. Ingresar su correo electrónico.
2. Ingresar un código familiar inicial.
3. Ser validado por el servidor.
4. Mantener posteriormente una sesión mediante Firebase Authentication.

El código familiar nunca debe almacenarse en texto plano en Firestore.

## Flujo principal

1. El usuario inicia sesión.
2. Pega una URL de YouTube.
3. Presiona “Escanear señal”.
4. La aplicación obtiene metadatos sin descargar el archivo completo.
5. Muestra miniatura, título, canal, duración y formatos disponibles.
6. El usuario selecciona video o audio.
7. Elige una calidad disponible.
8. Presiona “Iniciar misión”.
9. La aplicación muestra el progreso.
10. yt-dlp descarga el contenido.
11. FFmpeg une o convierte las pistas cuando sea necesario.
12. El usuario obtiene el archivo final.
13. El archivo temporal se elimina automáticamente.

## Opciones del MVP

### Video

* Mejor calidad disponible.
* 1080p cuando exista.
* 720p cuando exista.
* 480p cuando exista.
* Archivo final MP4.
* Fusión de video y audio con FFmpeg.

### Audio

* Mejor audio disponible.
* MP3.
* M4A.

El usuario no podrá escribir parámetros personalizados de yt-dlp.

## Restricciones iniciales

Aceptar únicamente:

* youtube.com
* [www.youtube.com](http://www.youtube.com)
* m.youtube.com
* youtu.be

No incluir todavía:

* Playlists completas.
* Canales completos.
* Descargas masivas.
* Historial permanente.
* Pagos.
* Publicidad.
* Edición de video.
* Aplicación móvil.
* Extensión de navegador.
* Soporte abierto para cualquier sitio.
* Carga de cookies desde el navegador.

## Videos restringidos por edad

Los videos restringidos solo podrán procesarse cuando el propietario haya configurado cookies válidas y autorizadas en el servidor.

Las cookies:

* No se cargan desde el frontend.
* No se guardan en Firestore.
* No se envían al navegador.
* No se incluyen en logs.
* Permanecen como secreto del backend.

## Experiencia visual

La aplicación debe sentirse como un videojuego arcade espacial de 8 y 16 bits.

Lenguaje temático:

* URL: señal o transmisión.
* Analizar: escanear señal.
* Descargar: iniciar misión.
* Progreso: energía de descarga.
* Finalización: misión completada.
* Error: interferencia detectada.
* Cancelación: misión abortada.

Los mensajes temáticos siempre deben estar acompañados de una explicación clara.

## Diseño

* Fondo espacial oscuro.
* Estrellas animadas discretamente.
* Marcos y tarjetas pixelados.
* Sombras duras.
* Botones arcade.
* Barra de progreso segmentada.
* Tipografía pixel para títulos y botones.
* Tipografía legible para párrafos y formularios.
* Iconos SVG pixel art originales.
* Diseño mobile-first.
* Compatibilidad con `prefers-reduced-motion`.
* Navegación por teclado y foco visible.

## Paleta inicial

* Fondo: `#070817`
* Panel: `#11132B`
* Cian: `#45F3FF`
* Magenta: `#FF3CAC`
* Violeta: `#8B5CF6`
* Amarillo: `#FFE66D`
* Verde: `#59F17F`
* Rojo: `#FF4D6D`
* Texto: `#EAF6FF`

## Arquitectura

### Frontend

* Next.js con App Router.
* React.
* TypeScript estricto.
* Tailwind CSS.
* Zod.
* React Hook Form.
* Firebase Authentication.
* Firestore mínimo.
* Deploy futuro en Vercel.

### Backend

* Python.
* FastAPI.
* API de Python de yt-dlp.
* FFmpeg y ffprobe.
* Almacenamiento temporal local.
* Server-Sent Events para progreso.
* Docker en una fase posterior.

## Datos persistentes

Firestore solo debe almacenar:

```text
users/{uid}
- email
- createdAt
- lastLoginAt
- status
- role
```

Roles:

* owner
* family

No almacenar:

* Videos.
* Archivos.
* URLs descargadas.
* Historial.
* Cookies.
* Tokens.
* Código familiar en texto plano.

## Estados de un trabajo

* queued
* analyzing
* downloading_video
* downloading_audio
* merging
* converting
* completed
* failed
* cancelled
* expired

## Seguridad

* Lista permitida de dominios.
* Validación estricta de URL.
* Protección contra SSRF.
* Opciones de yt-dlp controladas por el backend.
* Sin comandos shell construidos con texto del usuario.
* Nombres de archivo saneados.
* Directorio temporal por trabajo.
* Verificación del token de Firebase.
* Rate limiting.
* Límites de tamaño, duración y trabajos simultáneos.
* Limpieza automática de archivos.
* Logs sin información sensible.

## Primera etapa

Antes de programar se deben producir:

1. Definición del producto.
2. Flujo del usuario.
3. Sistema de diseño.
4. Especificación de pantallas.
5. Arquitectura.
6. Modelo de datos.
7. Plan de implementación.

No implementar código durante esta etapa.
