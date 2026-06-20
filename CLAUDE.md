# Reglas permanentes del proyecto

## Forma de trabajo

* Trabajar una fase por vez.
* No agregar funcionalidades que no estén documentadas o solicitadas.
* Antes de modificar archivos, indicar brevemente el objetivo y los archivos involucrados.
* Al finalizar una fase, informar archivos creados o modificados y verificaciones realizadas.
* No repetir controles innecesarios después de cada cambio pequeño.
* No realizar commits, push ni crear pull requests sin autorización.
* Mantener respuestas concisas y orientadas a la tarea actual.
* No instalar dependencias sin explicar primero por qué son necesarias.

## Calidad de código

* Utilizar TypeScript estricto.
* No utilizar `any` salvo justificación excepcional.
* Crear componentes pequeños y con responsabilidades claras.
* Evitar lógica duplicada.
* Validar entradas externas.
* Separar interfaz, dominio, servicios e infraestructura.
* No ocultar errores de TypeScript, ESLint o compilación.

## Arquitectura base

* Frontend: Next.js App Router, React, TypeScript y Tailwind CSS.
* Backend de descarga: Python, FastAPI, yt-dlp y FFmpeg.
* El motor de descarga no debe ejecutarse dentro de Vercel.
* Firebase se utiliza solamente para autenticación y datos mínimos del usuario.
* No utilizar Firebase Storage para almacenar videos en el MVP.
* Los archivos descargados deben ser temporales.

## Seguridad

* Nunca exponer cookies, tokens, claves o credenciales.
* Nunca guardar secretos en el repositorio.
* Nunca concatenar entradas del usuario dentro de comandos shell.
* El backend debe controlar todas las opciones de yt-dlp.
* Aceptar únicamente dominios expresamente autorizados.
* No implementar evasión de DRM, paywalls ni accesos no autorizados.
* Las cookies autorizadas deben permanecer exclusivamente en el servidor.

## Diseño

* La experiencia visual será arcade espacial de 8 y 16 bits.
* No copiar personajes, marcas, sprites ni interfaces de videojuegos existentes.
* No utilizar bibliotecas genéricas de iconos.
* Los iconos deberán ser SVG pixel art propios.
* Mantener accesibilidad, legibilidad y diseño mobile-first.

## Fuente de verdad

* Los documentos ubicados en `docs/` definen el producto y la arquitectura.
* Ante una contradicción, detener la implementación y señalarla.
