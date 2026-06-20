# SCREENS.md — Pixel Drop

## Pantallas del MVP

1. Login (`/login`)
2. Panel principal — vacío (`/`)
3. Panel principal — análisis en curso
4. Panel principal — resultado del análisis
5. Panel principal — descarga en progreso
6. Panel principal — completado
7. Panel principal — error
8. Modal de confirmación de cancelación

---

## Pantalla 1: Login

### Objetivo
Autenticar al usuario con correo y código familiar antes de acceder a la aplicación.

### Jerarquía
1. Logo / nombre de la app (branding).
2. Formulario de acceso.
3. Mensaje de error (condicional).

### Contenido
- Nombre de la app: **PIXEL DROP**
- Subtítulo temático: `IDENTIFÍCATE, AGENTE`
- Campo: Correo electrónico
- Campo: Código familiar (tipo password)
- Botón: `[ ACCEDER ]`
- Texto legal mínimo: `Uso privado y familiar`

### Componentes
- `<Input>` email con `autocomplete="email"`
- `<Input>` password con `autocomplete="current-password"` y toggle de visibilidad
- `<Button variant="primary">` ancho completo
- `<ErrorMessage>` con `aria-live="assertive"`

### Interacciones
- Submit con Enter o clic en el botón.
- Mientras se envía: botón deshabilitado con texto `VERIFICANDO...`.
- Error de credenciales: muestra mensaje, limpia el campo de código, no el correo.
- Error de red: mensaje genérico de interferencia.

### Estados
| Estado | Descripción |
|---|---|
| Idle | Formulario vacío, botón deshabilitado hasta que ambos campos tengan valor |
| Loading | Botón con texto `VERIFICANDO...` y spinner pixel |
| Error | Banner de error rojo visible, formulario reactivo |
| Redirect | Fade a panel principal |

### Wireframe textual — Mobile (375px)

```
┌────────────────────────────────────────┐
│                                        │
│         ╔══════════════════╗           │
│         ║  PIXEL  DROP     ║           │
│         ╚══════════════════╝           │
│      IDENTIFÍCATE, AGENTE              │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ correo@ejemplo.com               │  │
│  └──────────────────────────────────┘  │
│  ┌──────────────────────────────────┐  │
│  │ ••••••••••••           [👁]      │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │         [ ACCEDER ]              │  │
│  └──────────────────────────────────┘  │
│                                        │
│         uso privado y familiar         │
└────────────────────────────────────────┘
```

### Wireframe textual — Desktop

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│            ╔══════════════════════════╗              │
│            ║      PIXEL  DROP         ║              │
│            ╚══════════════════════════╝              │
│          IDENTIFÍCATE, AGENTE                        │
│                                                      │
│        ┌──────────────────────────────────┐          │
│        │ correo@ejemplo.com               │          │
│        └──────────────────────────────────┘          │
│        ┌──────────────────────────────────┐          │
│        │ ••••••••••••           [👁]      │          │
│        └──────────────────────────────────┘          │
│                                                      │
│        ┌──────────────────────────────────┐          │
│        │         [ ACCEDER ]              │          │
│        └──────────────────────────────────┘          │
│                uso privado y familiar                │
└──────────────────────────────────────────────────────┘
```

---

## Pantalla 2: Panel principal — vacío

### Objetivo
Punto de entrada para iniciar una nueva misión. Estado de reposo.

### Jerarquía
1. Header con nombre de app y botón de logout.
2. Campo de URL principal.
3. Botón de escaneo.
4. Texto de ayuda.

### Contenido
- Header: `PIXEL DROP` + `[SALIR]`
- Label del campo: `SEÑAL DE TRANSMISIÓN`
- Placeholder: `https://youtube.com/watch?v=...`
- Botón: `[ ESCANEAR SEÑAL ]`
- Ayuda: `Pega una URL de YouTube para comenzar`

### Componentes
- `<Header>` con logo y `<Button variant="ghost">` logout
- `<Input>` URL con validación de dominio en tiempo real
- `<Button variant="primary">` deshabilitado hasta URL válida
- Texto de ayuda `text-body-sm`

### Interacciones
- Al pegar URL: validación inmediata de dominio (inline, no modal).
- URL inválida: borde rojo + mensaje debajo del campo. Botón permanece deshabilitado.
- URL válida: borde cyan + botón habilitado.
- Submit con Enter o clic.

### Estados
| Estado | Descripción |
|---|---|
| Empty | Campo vacío, botón deshabilitado |
| Invalid URL | Borde rojo, mensaje de error inline, botón deshabilitado |
| Valid URL | Borde cyan, botón habilitado |

### Wireframe textual — Mobile

```
┌────────────────────────────────────────┐
│  PIXEL DROP                  [SALIR]   │
├────────────────────────────────────────┤
│                                        │
│  SEÑAL DE TRANSMISIÓN                  │
│  ┌──────────────────────────────────┐  │
│  │ https://youtube.com/watch?v=...  │  │
│  └──────────────────────────────────┘  │
│  Pega una URL de YouTube para comenzar │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │      [ ESCANEAR SEÑAL ]          │  │
│  └──────────────────────────────────┘  │
│                                        │
│         · · · (estrellas) · · ·        │
└────────────────────────────────────────┘
```

### Wireframe textual — Desktop

```
┌──────────────────────────────────────────────────────┐
│  PIXEL DROP                              [SALIR]     │
├──────────────────────────────────────────────────────┤
│                                                      │
│              SEÑAL DE TRANSMISIÓN                    │
│     ┌────────────────────────────────────────┐       │
│     │ https://youtube.com/watch?v=...         │       │
│     └────────────────────────────────────────┘       │
│       Pega una URL de YouTube para comenzar          │
│                                                      │
│          ┌──────────────────────────┐                │
│          │    [ ESCANEAR SEÑAL ]    │                │
│          └──────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## Pantalla 3: Panel principal — análisis en curso

### Objetivo
Mostrar que el análisis de la URL está procesándose.

### Jerarquía
1. Header.
2. Campo de URL (deshabilitado con URL actual).
3. Área de análisis animada.
4. Botón deshabilitado.

### Contenido
- Badge: `[ ESCANEANDO SEÑAL ]` (cyan)
- Animación de scanline sobre un área rectangular.
- Texto: `Obteniendo metadatos del video...`

### Componentes
- Campo URL en estado disabled con URL ingresada
- `<StatusBadge state="scanning">` — estado de UI exclusivo, no corresponde a ningún `JobState`
- Área animada con scanline (CSS animation)
- `<Button>` deshabilitado

### Interacciones
- No hay interacción del usuario durante el análisis.
- Si hay error de red, se puede reintentar.

### Estados
- Solo un estado de interfaz activo: `scanning` (análisis de URL en curso). Este estado existe únicamente en el frontend mientras se espera la respuesta de `POST /api/analyze`. No existe como `JobState` en el backend.

### Wireframe textual — Mobile

```
┌────────────────────────────────────────┐
│  PIXEL DROP                  [SALIR]   │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────────────────────────────┐  │
│  │ youtube.com/watch?v=XXXXX  [---] │  │  ← deshabilitado
│  └──────────────────────────────────┘  │
│                                        │
│  ╔══════════════════════════════════╗  │
│  ║  [ ESCANEANDO SEÑAL ]            ║  │
│  ║  ────────────────────────────    ║  │  ← scanline animada
│  ║  Obteniendo metadatos...         ║  │
│  ╚══════════════════════════════════╝  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │      [ ESCANEAR SEÑAL ... ]      │  │  ← deshabilitado
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## Pantalla 4: Panel principal — resultado del análisis

### Objetivo
Mostrar metadatos del video y permitir seleccionar tipo y calidad antes de descargar.

### Jerarquía
1. Header.
2. Campo URL con botón para nueva búsqueda.
3. Tarjeta de metadatos del video.
4. Selector de tipo (video / audio).
5. Selector de calidad (según tipo).
6. Botón de inicio de misión.

### Contenido
- Miniatura del video.
- Título (truncado a 2 líneas).
- Canal y duración.
- Tabs o toggle: `VIDEO` / `AUDIO`.
- Opciones de video: `MEJOR CALIDAD` · `1080P` · `720P` · `480P` (solo las disponibles).
- Opciones de audio: `MEJOR AUDIO` · `MP3` · `M4A`.
- Botón: `[ INICIAR MISIÓN ]`

### Componentes
- `<VideoCard>` con miniatura, título, canal, duración
- `<TypeSelector>` toggle VIDEO / AUDIO
- `<QualitySelector>` lista de opciones disponibles
- `<Button variant="primary">` Iniciar misión

### Interacciones
- Al cambiar entre VIDEO / AUDIO, cambia la lista de calidades.
- La primera opción disponible está preseleccionada.
- El botón se habilita cuando hay un tipo y calidad seleccionados.
- Clic en botón X / "Nueva señal" regresa al estado vacío.

### Estados
| Estado | Descripción |
|---|---|
| Showing — no selection | Tipo y calidad por elegir, botón deshabilitado |
| Showing — selected | Tipo y calidad elegidos, botón habilitado |

### Wireframe textual — Mobile

```
┌────────────────────────────────────────┐
│  PIXEL DROP                  [SALIR]   │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ youtube.com/watch?v=XXXXX    [✕] │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ╔══════════════════════════════════╗  │
│  ║ [img]  TÍTULO DEL VIDEO          ║  │
│  ║        Canal Ejemplo · 12:34     ║  │
│  ╚══════════════════════════════════╝  │
│                                        │
│  ┌─────────────┐  ┌─────────────────┐  │
│  │   VIDEO     │  │     AUDIO       │  │
│  └─────────────┘  └─────────────────┘  │
│                                        │
│  ● MEJOR CALIDAD                       │
│  ○ 1080P                               │
│  ○ 720P                                │
│  ○ 480P                                │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │        [ INICIAR MISIÓN ]        │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

### Wireframe textual — Desktop

```
┌──────────────────────────────────────────────────────┐
│  PIXEL DROP                              [SALIR]     │
├──────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐    │
│  │ youtube.com/watch?v=XXXXX               [✕]  │    │
│  └──────────────────────────────────────────────┘    │
│                                                      │
│  ╔────────────────────────────────────────────────╗  │
│  ║ [miniatura 120×68]  TÍTULO DEL VIDEO (2 líneas)║  │
│  ║                     Canal Ejemplo · 12:34      ║  │
│  ╚────────────────────────────────────────────────╝  │
│                                                      │
│  [ VIDEO ]  [ AUDIO ]                                │
│                                                      │
│  ● MEJOR CALIDAD   ○ 1080P   ○ 720P   ○ 480P        │
│                                                      │
│              ┌──────────────────────┐                │
│              │  [ INICIAR MISIÓN ]  │                │
│              └──────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## Pantalla 5: Panel principal — descarga en progreso

### Objetivo
Comunicar el estado y avance de la descarga en tiempo real.

### Jerarquía
1. Header.
2. Resumen del video (compacto).
3. Badge de estado actual.
4. Barra de progreso segmentada.
5. Porcentaje y velocidad (cuando disponibles).
6. Botón de cancelar.

### Contenido
- Título corto del video (1 línea).
- Badge del estado actual: `DESCARGANDO VIDEO`, `FUSIONANDO`, etc.
- Barra de progreso (20 segmentos desktop / 12 mobile).
- `67%  ·  2.3 MB/s  ·  00:45 restante` (cuando disponible).
- Botón: `[ ABORTAR MISIÓN ]`

### Componentes
- `<StatusBadge>` dinámico
- `<ProgressBar>` con `aria-valuenow`
- `<ProgressDetails>` porcentaje + velocidad (texto mono)
- `<Button variant="danger">` Abortar misión

### Interacciones
- La barra y los datos se actualizan vía SSE sin recargar la página.
- El botón de cancelar abre el modal de confirmación.

### Estados
| Estado activo (JobState) | Badge visible | Barra |
|---|---|---|
| `queued` | EN COLA DE MISIONES | 0% |
| `downloading_video` | DESCARGANDO VIDEO | % de video |
| `downloading_audio` | DESCARGANDO AUDIO | % de audio |
| `merging` | PROCESANDO TRANSMISIÓN | indeterminado (pulsante) |
| `converting` | PROCESANDO TRANSMISIÓN | indeterminado (pulsante) |

`merging` y `converting` son estados distintos en el backend. Ambos muestran el mismo texto en la UI. El frontend puede ignorar la diferencia y renderizar el mismo badge para ambos.

### Wireframe textual — Mobile

```
┌────────────────────────────────────────┐
│  PIXEL DROP                  [SALIR]   │
├────────────────────────────────────────┤
│                                        │
│  TÍTULO DEL VIDEO (truncado)           │
│                                        │
│  [ DESCARGANDO VIDEO ]                 │
│                                        │
│  [████████████░░░░░░░░░░]  60%         │
│  2.3 MB/s  ·  00:45 restante           │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │       [ ABORTAR MISIÓN ]         │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## Pantalla 6: Panel principal — completado

### Objetivo
Confirmar el éxito y ofrecer el archivo para descarga antes de que expire.

### Jerarquía
1. Header.
2. Badge de éxito.
3. Resumen del archivo.
4. Contador de expiración.
5. Botón de descarga.
6. Botón de nueva misión.

### Contenido
- Badge: `[ MISIÓN COMPLETADA ]` (verde).
- Nombre del archivo y tamaño.
- `EXPIRA EN 14:23` (countdown).
- Botón: `[ DESCARGAR ARCHIVO ]` (primario).
- Botón: `[ NUEVA MISIÓN ]` (ghost).

### Componentes
- `<StatusBadge state="completed">`
- `<FileInfo>` nombre + tamaño en formato mono
- `<Countdown>` con aviso visual al llegar a 2 min
- `<Button variant="primary">` Descargar
- `<Button variant="ghost">` Nueva misión

### Interacciones
- Clic en Descargar: petición GET con token, el navegador descarga el archivo.
- Clic en Nueva misión: vuelve al estado vacío, limpia el trabajo actual.
- Al expirar el countdown: botón de descarga se deshabilita, badge cambia a `SEÑAL EXPIRADA`.

### Wireframe textual — Mobile

```
┌────────────────────────────────────────┐
│  PIXEL DROP                  [SALIR]   │
├────────────────────────────────────────┤
│                                        │
│  [ MISIÓN COMPLETADA ]                 │
│                                        │
│  titulo-del-video.mp4  ·  234 MB       │
│                                        │
│  EXPIRA EN  14:23                      │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │      [ DESCARGAR ARCHIVO ]       │  │
│  └──────────────────────────────────┘  │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │        [ NUEVA MISIÓN ]          │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## Pantalla 7: Panel principal — error

### Objetivo
Comunicar el fallo de forma clara, con descripción técnica y acción disponible.

### Jerarquía
1. Header.
2. Ícono y badge de error.
3. Título temático.
4. Descripción técnica legible.
5. Acción disponible.

### Contenido
- Ícono de error (`icon-error` SVG pixel-art).
- Badge: `[ INTERFERENCIA DETECTADA ]` (rojo).
- Descripción: mensaje específico del error (ej. "El video es privado y no es accesible").
- Botón: `[ NUEVA MISIÓN ]` o `[ REINTENTAR ]` según el tipo de error.

### Componentes
- `<ErrorMessage>` con ícono, título, descripción
- `<Button>` para acción de recuperación
- `aria-live="assertive"` en el contenedor de error

### Estados

| Variante | Badge | Descripción |
|---|---|---|
| Fallo en análisis | INTERFERENCIA DETECTADA | No se pudieron obtener metadatos del video |
| Fallo en descarga | INTERFERENCIA DETECTADA | yt-dlp o FFmpeg fallaron durante la descarga |
| Señal expirada | SEÑAL EXPIRADA | El archivo ya no está disponible en el servidor |
| Conexión perdida | CONEXIÓN PERDIDA | El backend se reinició mientras había un trabajo activo |

**Variante: Conexión perdida**

Mensaje: `La misión fue interrumpida porque el motor de descarga se reinició. Inicia nuevamente la descarga.`  
Botón disponible: `[ NUEVA MISIÓN ]`  
Esta variante se muestra cuando el frontend no recibe eventos SSE durante 30–45 segundos y al consultar `GET /api/jobs/{job_id}` el trabajo ya no existe.

### Wireframe textual — Mobile

```
┌────────────────────────────────────────┐
│  PIXEL DROP                  [SALIR]   │
├────────────────────────────────────────┤
│                                        │
│  [icon-error]                          │
│  [ INTERFERENCIA DETECTADA ]           │
│                                        │
│  El video no es accesible desde        │
│  este servidor. Puede ser privado      │
│  o estar geobloqueado.                 │
│                                        │
│  ┌──────────────────────────────────┐  │
│  │        [ NUEVA MISIÓN ]          │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## Pantalla 8: Modal de confirmación de cancelación

### Objetivo
Prevenir cancelaciones accidentales solicitando confirmación explícita.

### Jerarquía
1. Overlay oscuro sobre el panel principal.
2. Modal centrado con título, descripción y dos botones.

### Contenido
- Título: `ABORTAR MISIÓN`
- Descripción: `¿Deseas cancelar la descarga? Los archivos temporales serán eliminados.`
- Botón primario (cancel the cancel): `[ CONTINUAR MISIÓN ]`
- Botón danger (confirm cancel): `[ ABORTAR ]`

### Componentes
- `<Modal role="dialog" aria-modal="true">`
- Focus trap activo: Tab cicla entre los dos botones.
- Escape cierra el modal sin cancelar la descarga.

### Interacciones
- `[ CONTINUAR MISIÓN ]`: cierra modal, la descarga continúa.
- `[ ABORTAR ]`: envía cancelación al backend, cierra modal.
- Click en overlay: cierra modal sin cancelar (mismo que Escape).

### Wireframe textual

```
┌──────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← overlay
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░  ╔═══════════════════════════════════════════╗  ░│
│  ░░  ║  ABORTAR MISIÓN                            ║  ░│
│  ░░  ║                                            ║  ░│
│  ░░  ║  ¿Deseas cancelar la descarga?             ║  ░│
│  ░░  ║  Los archivos serán eliminados.            ║  ░│
│  ░░  ║                                            ║  ░│
│  ░░  ║  [ CONTINUAR MISIÓN ]   [ ABORTAR ]        ║  ░│
│  ░░  ╚═══════════════════════════════════════════╝  ░│
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
└──────────────────────────────────────────────────────┘
```

---

## Resumen de componentes reutilizables

| Componente | Pantallas donde aparece |
|---|---|
| `<Header>` | 2, 3, 4, 5, 6, 7 |
| `<Input>` URL | 2, 3, 4 |
| `<Button>` | Todas |
| `<StatusBadge>` | 3, 5, 6, 7 |
| `<VideoCard>` | 4 |
| `<TypeSelector>` | 4 |
| `<QualitySelector>` | 4 |
| `<ProgressBar>` | 5 |
| `<Countdown>` | 6 |
| `<ErrorMessage>` | 7, inline en 2 y 3 |
| `<Modal>` | 8 |
