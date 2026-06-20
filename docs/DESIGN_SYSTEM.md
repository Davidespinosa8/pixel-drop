# DESIGN_SYSTEM.md — Pixel Drop

## Concepto visual

Arcade espacial de 8 y 16 bits. La interfaz evoca terminales de nave espacial retro: fondos oscuros profundos, destellos de neón, marcos pixelados, tipografía monoespaciada para datos técnicos y botones con sensación táctil de arcade. No copia sprites, personajes ni interfaces de ningún videojuego existente.

---

## Paleta de colores

| Token | Hex | Uso |
|---|---|---|
| `color-bg` | `#070817` | Fondo global de página |
| `color-panel` | `#11132B` | Tarjetas, paneles, modales |
| `color-panel-border` | `#1E2247` | Borde de paneles |
| `color-cyan` | `#45F3FF` | Acción primaria, énfasis, progreso |
| `color-magenta` | `#FF3CAC` | Alertas, cancelación, peligro |
| `color-violet` | `#8B5CF6` | Acento secundario, estados intermedios |
| `color-yellow` | `#FFE66D` | Advertencias, cuenta regresiva |
| `color-green` | `#59F17F` | Éxito, completado |
| `color-red` | `#FF4D6D` | Error crítico |
| `color-text` | `#EAF6FF` | Texto principal |
| `color-text-muted` | `#6B7DB3` | Texto secundario, placeholders |
| `color-text-disabled` | `#2E3560` | Texto deshabilitado |

### Uso semántico

| Estado | Color principal |
|---|---|
| Primario / interactivo | cyan |
| Éxito / completado | green |
| Error / fallo | red / magenta |
| Advertencia / expiración | yellow |
| Cancelación | magenta |
| Progreso activo | cyan → violet (gradiente) |
| Deshabilitado | text-disabled |

---

## Tipografía

### Fuentes

| Rol | Fuente | Fallback |
|---|---|---|
| Títulos, botones, labels de estado | `Press Start 2P` | monospace |
| Cuerpo, formularios, descripciones | `Inter` | system-ui, sans-serif |
| Datos técnicos (duración, tamaño) | `JetBrains Mono` | monospace |

Las tres fuentes se integran mediante `next/font/google` con `display: "swap"`. Next.js las descarga en tiempo de compilación y las sirve desde el propio servidor — no se realizan solicitudes a Google Fonts en tiempo de ejecución.

### Escala tipográfica

| Token | Fuente | Tamaño | Peso | Uso |
|---|---|---|---|---|
| `text-title` | Press Start 2P | 20px | 400 | Título de página, nombre de app |
| `text-heading` | Press Start 2P | 14px | 400 | Subtítulos de sección |
| `text-label` | Press Start 2P | 10px | 400 | Labels de botón, estado |
| `text-body` | Inter | 16px | 400 | Texto de párrafo |
| `text-body-sm` | Inter | 14px | 400 | Texto secundario, ayuda |
| `text-mono` | JetBrains Mono | 13px | 400 | Metadatos técnicos, duración, bytes |
| `text-error` | Inter | 14px | 500 | Mensajes de error |

**Interlineado:** 1.6 para cuerpo, 1.4 para mono.  
**Mínimo legible:** 10px (solo Press Start 2P en labels cortos). En mobile, `text-title` escala a 16px.

---

## Espaciado

Sistema de 4px base.

| Token | Valor | Uso |
|---|---|---|
| `space-1` | 4px | Gap mínimo entre elementos inline |
| `space-2` | 8px | Padding interno de chips, badges |
| `space-3` | 12px | Padding interno de inputs |
| `space-4` | 16px | Padding de tarjetas mobile |
| `space-6` | 24px | Padding de tarjetas desktop, separación de secciones |
| `space-8` | 32px | Margen entre bloques principales |
| `space-12` | 48px | Espacio vertical de página |

---

## Bordes y sombras

| Token | Valor | Uso |
|---|---|---|
| `border-pixel` | `2px solid` | Bordes de paneles y botones (estilo pixel) |
| `border-radius-none` | `0px` | Tarjetas, botones principales (estilo arcade) |
| `border-radius-sm` | `2px` | Elementos internos donde se necesita algo de suavizado |
| `shadow-hard-cyan` | `4px 4px 0px #45F3FF` | Botón primario |
| `shadow-hard-magenta` | `4px 4px 0px #FF3CAC` | Botón de cancelar |
| `shadow-hard-panel` | `4px 4px 0px #1E2247` | Paneles y tarjetas |
| `shadow-glow-cyan` | `0 0 12px rgba(69,243,255,0.4)` | Input activo, barra de progreso |

---

## Componentes

### Button

Tres variantes: `primary`, `danger`, `ghost`.

```
PRIMARIO:
┌──────────────────────┐
│  [ INICIAR MISIÓN ]  │  ← Press Start 2P 10px, uppercase
└──────────────────────┘
  ████ (sombra dura cyan abajo/derecha)

HOVER: sombra se reduce, botón se desplaza 2px abajo/derecha.
ACTIVE: sin sombra, botón en posición prensada.
DISABLED: borde y texto en color-text-disabled, sin sombra.
FOCUS: outline cyan 2px offset 2px.
```

| Variante | Fondo | Borde | Texto | Sombra |
|---|---|---|---|---|
| primary | `#45F3FF` (10% opacidad) | cyan | cyan | shadow-hard-cyan |
| danger | `#FF3CAC` (10% opacidad) | magenta | magenta | shadow-hard-magenta |
| ghost | transparente | color-panel-border | text-muted | ninguna |

### Input

```
┌──────────────────────────────────────────────┐
│ https://youtube.com/watch?v=...              │
└──────────────────────────────────────────────┘
  Borde: 2px solid color-panel-border
  Focus: borde cambia a cyan + shadow-glow-cyan
  Error: borde cambia a red
```

- Fondo: `color-panel`
- Texto: `text-body` Inter
- Placeholder: `text-muted`
- Sin border-radius (pixel-art look)

### Card (Panel de tarjeta)

```
┌─────────────────────────────────────────────────┐
│ ╔═══════════════════════════════════════════╗   │
│ ║  [miniatura]   TÍTULO DEL VIDEO           ║   │
│ ║                Canal · 12:34              ║   │
│ ╚═══════════════════════════════════════════╝   │
│  [Video ▼]  [Audio ▼]                           │
└─────────────────────────────────────────────────┘
  Borde: 2px solid color-panel-border
  Sombra: shadow-hard-panel
  Fondo: color-panel
```

### Progress Bar

Barra segmentada estilo arcade: N segmentos horizontales con gap de 2px.

```
[████████████████░░░░░░░░░░░░░░░]  67%
 ↑ segmentos activos (cyan→violet)   ↑ texto mono
```

- 20 segmentos fijos en desktop, 12 en mobile.
- Cada segmento activo tiene sombra-glow-cyan.
- El porcentaje se muestra numéricamente junto a la barra (accesibilidad).
- `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

### Modal de confirmación

```
┌────────────────────────────────┐
│  ⚠ ABORTAR MISIÓN              │
│                                │
│  ¿Deseas cancelar la descarga? │
│  Los archivos serán eliminados. │
│                                │
│  [CONTINUAR]    [CANCELAR]     │
└────────────────────────────────┘
  Overlay: color-bg 80% opacidad
  Borde: magenta 2px
  Focus trap activo mientras está abierto
```

### Badge de estado

```
[ DESCARGANDO VIDEO ]   ← Press Start 2P 8px
```

Borde 2px sólido del color del estado, fondo 10% opacidad, sin border-radius.

| Estado | Color | Origen |
|---|---|---|
| `scanning` (análisis de URL en curso) | cyan | Estado de UI — no emitido por el backend |
| `queued` | violet | JobState |
| `downloading_*` | cyan | JobState |
| `merging` | violet | JobState |
| `converting` | violet | JobState |
| `completed` | green | JobState |
| `failed` | red | JobState |
| `cancelled` | magenta | JobState |
| `expired` | yellow | JobState |

**Nota:** El estado `scanning` (ESCANEANDO SEÑAL) es exclusivo de la interfaz durante la llamada a `POST /api/analyze`, antes de que exista un trabajo. Los estados `merging` y `converting` son internamente distintos en el backend; ambos muestran el texto `PROCESANDO TRANSMISIÓN` en la UI.

### Countdown (expiración)

```
EXPIRA EN  02:34
```

`text-mono` amarillo. A ≤2 minutos: parpadeo lento (1s ciclo). Respeta `prefers-reduced-motion` (no parpadea, solo cambia a rojo).

### Error message

```
┌─────────────────────────────────────────────┐
│ [!] INTERFERENCIA DETECTADA                 │
│     El video no es accesible desde este     │
│     servidor.                               │
│                         [NUEVA MISIÓN]      │
└─────────────────────────────────────────────┘
  Borde: red 2px
  Icono: SVG pixel-art propio
```

---

## Iconografía

Todos los iconos son SVG pixel-art originales en cuadrícula de 16×16 o 24×24 px.

| Nombre | Descripción | Uso |
|---|---|---|
| `icon-scan` | Radar/onda | Botón Escanear señal |
| `icon-rocket` | Cohete pixelado | Botón Iniciar misión |
| `icon-abort` | X con estilo pixel | Botón Abortar misión |
| `icon-download` | Flecha abajo con segmento | Botón Descargar |
| `icon-warning` | Triángulo con ! pixel | Advertencias |
| `icon-error` | Símbolo de estática | Errores |
| `icon-success` | Estrella/check pixel | Completado |
| `icon-logout` | Puerta/portal pixel | Cerrar sesión |
| `icon-video` | Pantalla pixel | Tipo video |
| `icon-audio` | Onda de sonido pixel | Tipo audio |

Los iconos no usan librerías de iconos externas (Heroicons, Lucide, etc.). Son componentes React que devuelven SVG inline.

---

## Animaciones

| Animación | Descripción | Duración | Trigger |
|---|---|---|---|
| `stars-drift` | Estrellas de fondo se desplazan lentamente (CSS) | ∞ | Siempre |
| `scanline` | Línea horizontal barre el panel de análisis | 1.5s | Durante el análisis de URL (estado de UI `scanning`) |
| `progress-pulse` | Segmentos activos pulsan levemente | 0.8s | Durante descarga |
| `badge-blink` | Badge de estado parpadea | 1s | `downloading_*`, `merging` |
| `countdown-blink` | Countdown parpadea | 1s | ≤2 min restantes |
| `button-press` | Botón se desplaza 2px y sombra desaparece | 100ms | `:active` |
| `card-fade-in` | Tarjeta de resultado aparece con fade + slide | 250ms | Al completar análisis |

**Todas las animaciones se desactivan con `prefers-reduced-motion: reduce`.**  
La única excepción aceptable es un fundido de opacidad de 150ms que no implica movimiento.

---

## Accesibilidad

- Ratio de contraste mínimo: 4.5:1 para texto normal, 3:1 para texto grande.
- Cyan `#45F3FF` sobre fondo `#070817`: ratio ~13:1 ✓
- Verde `#59F17F` sobre fondo `#070817`: ratio ~10:1 ✓
- Foco visible en todos los elementos interactivos: `outline: 2px solid #45F3FF; outline-offset: 2px`.
- No se elimina el outline en ningún contexto.
- Todos los inputs tienen `<label>` asociado.
- Los iconos decorativos tienen `aria-hidden="true"`.
- Los iconos funcionales tienen `aria-label` o texto adyacente visible.
- `role="progressbar"` con atributos ARIA en la barra de progreso.
- Modales tienen `role="dialog"`, `aria-modal="true"`, `aria-labelledby` y focus trap.
- Los mensajes de error se anuncian con `aria-live="polite"` o `aria-live="assertive"`.
- Orden de tabulación lógico sin usar `tabindex` positivos.

---

## Responsive

Breakpoints (Tailwind):

| Nombre | Ancho | Descripción |
|---|---|---|
| `default` | 0–639px | Mobile (diseño base) |
| `sm` | 640px+ | Tablet pequeña |
| `md` | 768px+ | Tablet / laptop pequeña |
| `lg` | 1024px+ | Desktop |

### Ajustes por breakpoint

| Elemento | Mobile | Desktop |
|---|---|---|
| Layout | Columna única, padding 16px | Centrado max-width 640px |
| `text-title` | 16px | 20px |
| Segmentos barra de progreso | 12 | 20 |
| Botones | Ancho completo | Ancho automático |
| Card miniatura | 64×36px | 120×68px |
| Modal | Ocupa 90% del ancho | max-width 400px |
