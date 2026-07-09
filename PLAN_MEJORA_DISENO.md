# Plan de mejora de diseño — Glassmorphism + Liquid Glass

Basado en auditoría de código + investigación de mejores prácticas 2026.

---

## Prioridad: ALTA — Bugs de renderizado

### 1. `.glass-shimmer` falta `position: relative`
- **Archivo**: `src/app/globals.css` línea 295
- **Problema**: El `::before` usa `position: absolute` pero el padre `.glass-shimmer` no tiene `position: relative`. El pseudo-elemento se escapa del contenedor.
- **Solución**: Agregar `position: relative;` a `.glass-shimmer`.

### 2. Sheet deja hueco del 25% en mobile
- **Archivo**: `src/components/ui/sheet.tsx` línea 56
- **Problema**: `w-3/4` en mobile → el backdrop-filter + liquid-bg en el hueco es costoso y se ve mal.
- **Solución**: Cambiar a `w-full` en mobile (< 640px). Mantener `sm:max-w-sm` en desktop.

### 3. `text-glass/70` es clase Tailwind inválida
- **Archivo**: `src/components/event-form.tsx` línea 84 (y similares)
- **Problema**: `text-glass` no es un token de color registrado en `@theme`. `/70` no funciona.
- **Solución**: Cambiar a `text-foreground/70`.

---

## Prioridad: ALTA — Performance

### 4. Mousemove sin throttle — 60+ re-renders/seg
- **Archivo**: `src/components/liquid-bg.tsx` líneas 21–27
- **Problema**: Cada `mousemove` dispara `setCursor()` → re-renderiza el `LiquidBg` completo (incluyendo hijos).
- **Solución**: Envolver el handler con `requestAnimationFrame` o usar `useThrottleCallback`. Solo actualizar estado si las coordenadas cambiaron significativamente (> 5px).

### 5. `blur(24px)` y `blur(40px)` excesivos en mobile
- **Archivo**: `src/app/globals.css` líneas 222, 237, 399
- **Problema**: Gaussian blur de 24px y 40px es ~3-5x más caro que blur(8px). En móvil causa frame drops.
- **Solución**: Reducir a `blur(12px)` para `.glass`/`.glass-card`, `blur(16px)` para `.glass-strong`, `blur(20px)` para decor. Usar media query `hover: none` para reducir aún más en touch.

### 6. `transition: all` en glass classes
- **Archivo**: `src/app/globals.css` líneas 254, 325, 354
- **Problema**: Fuerza al browser a escuchar cambios en TODAS las propiedades. backdrop-filter con transición es paint-heavy.
- **Solución**: Cambiar a propiedades específicas: `transition: background 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease`.

### 7. SVG filters `#liquid-glass` y `#glass-shine` nunca se usan
- **Archivo**: `src/app/layout.tsx` líneas 55–67
- **Problema**: Definen dos filtros SVG no referenciados en ningún CSS. `#glass-shine` además referencia `in="blurred"` que no existe.
- **Solución**: Eliminar ambos filtros del layout. Si se necesitan en el futuro, se agregan con el componente que los use.

### 8. `--mouse-x` y `--mouse-y` se setean pero nunca se leen
- **Archivo**: `src/components/liquid-bg.tsx` líneas 33–34
- **Problema**: Las CSS custom properties se calculan en cada frame pero no se usan en ninguna regla CSS.
- **Solución**: Eliminar las propiedades inline. El movimiento de orbs ya se maneja vía JS directo.

---

## Prioridad: MEDIA — Mobile UX

### 9. Orbs de liquid-bg se salen de pantalla en mobile
- **Archivo**: `src/components/liquid-bg.tsx` líneas 44–45
- **Problema**: Las posiciones base (ej: `85%`) + offset del mouse pueden empujar orbs fuera del viewport.
- **Solución**: Agregar `overflow-hidden` al contenedor del `LiquidBg`. Reducir el tamaño de orbs en mobile (de 180px a 100px) y limitar offset a la mitad.

### 10. SheetFooter desborda en pantallas < 360px
- **Archivo**: `src/components/event-form.tsx` línea ~255
- **Problema**: 3 botones en `flex-row` en un sheet angosto.
- **Solución**: `flex-col` en mobile, `flex-row` en `sm:`. Botón "Eliminar" siempre a la izquierda, los otros dos abajo.

### 11. Sin `overscroll-behavior: contain` en modales/sheets
- **Archivo**: `src/components/ui/sheet.tsx` + `src/app/globals.css`
- **Problema**: Al hacer scroll en el sheet, el scroll se propaga al fondo.
- **Solución**: Agregar `overscroll-behavior: contain` al `SheetContent` cuando está abierto.

### 12. Animación infinita de `liquid-bg` corre en todas las páginas
- **Archivo**: `src/app/globals.css` líneas 381, 391
- **Problema**: La animación `liquid-drift` corre 24/7 incluso en páginas estáticas (login, register).
- **Solución**: Detener la animación cuando la página no tiene interacción (usar `prefers-reduced-motion` + `prefers-reduced-transparency`). También detenerla en páginas con poco contenido.

---

## Prioridad: MEDIA — Consistencia visual

### 13. `prefers-reduced-motion` no detiene transiciones de `.glass-card`
- **Archivo**: `src/app/globals.css` líneas 447–466
- **Problema**: Las transiciones de hover (backdrop-filter, box-shadow) se siguen ejecutando.
- **Solución**: Agregar `.glass-card, .glass-button, .glass-input { transition: none !important; }` dentro del media query.

### 14. Doble borde en SelectContent con `glass-strong`
- **Archivo**: `src/components/ui/select.tsx` línea 86 + `src/components/event-form.tsx`
- **Problema**: `ring-1` + `border` de `glass-strong` crean doble borde.
- **Solución**: En `SelectContent`, remover `ring-1 ring-foreground/10` cuando se aplica `glass-strong`, o modificar el componente para que no use anillo.

### 15. Inconsistencia hover light vs dark mode
- **Archivo**: `src/app/globals.css` líneas 272–284
- **Problema**: Light mode aumenta `backdrop-filter` en hover (12px→20px). Dark mode solo cambia `box-shadow`.
- **Solución**: Unificar comportamiento: ambos modos aumentan `backdrop-filter: blur(16px)` + `box-shadow` en hover.

---

## Prioridad: BAJA — Limpieza

### 16. Keyframe `morph` no usado
- **Archivo**: `src/app/globals.css` líneas 97–100
- **Problema**: `@keyframes morph` está definido pero ningún componente lo usa.
- **Solución**: Eliminar o comentar hasta que se necesite.

### 17. Patrón repetido de mensajes de error/success
- **Archivo**: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`
- **Problema**: El mismo patrón de clases se repite 5+ veces.
- **Solución**: Extraer a un componente `FormMessage` con variantes `error` y `success`.

### 18. `h-full` en CalendarView wrapper es no-op
- **Archivo**: `src/components/calendar-view.tsx` línea 90
- **Problema**: `h-full` en un div cuyo padre no tiene altura definida.
- **Solución**: Remover o cambiar a `min-h-0` si se necesita para flex.

---

## Orden de implementación recomendado

```
Fase 1 — Bugs + Performance crítico (prioridad ALTA)
├── 1.  position: relative en .glass-shimmer
├── 2.  Sheet w-full en mobile
├── 3.  text-glass/70 → text-foreground/70
├── 4.  Throttle mousemove en liquid-bg
├── 5.  Reducir blur() en mobile
├── 6.  transition: all → propiedades específicas
├── 7.  Eliminar SVG filters no usados
└── 8.  Eliminar --mouse-x / --mouse-y muertos

Fase 2 — Mobile UX (prioridad MEDIA)
├── 9.  overflow-hidden + orbs más pequeños en mobile
├── 10. SheetFooter flex-col en mobile
├── 11. overscroll-behavior: contain
└── 12. Pausar liquid-bg animación en páginas estáticas

Fase 3 — Consistencia + Accesibilidad (prioridad MEDIA)
├── 13. prefers-reduced-motion → detener transiciones
├── 14. Doble borde en SelectContent
└── 15. Unificar hover light/dark

Fase 4 — Limpieza (prioridad BAJA)
├── 16. Eliminar keyframe morph no usado
├── 17. Extraer FormMessage component
└── 18. h-full en calendar-view
```

## Principios de glassmorphism 2026 (referencia)

Basado en investigación web:
- **Blur eficiente**: `blur(10px-16px)` suficiente, >20px solo para decoración. En mobile, reducir 30-50%.
- **Transparencia**: `background: rgba(255, 255, 255, 0.05–0.12)` para light mode, `rgba(0, 0, 0, 0.2–0.4)` para dark.
- **Saturación**: `backdrop-filter: blur(12px) saturate(120%)` da mejor sensación de "cristal" sin costo extra notable.
- **Contraste WCAG**: Siempre verificar que el texto sobre vidrio tenga ratio ≥ 4.5:1. Usar `text-shadow: 0 1px 3px rgba(0,0,0,0.15)` como respaldo.
- **GPU hint**: `will-change: backdrop-filter` usar con moderación, solo en elementos que animan el blur.
- **Móvil**: Máximo 1-2 elementos glass por viewport. En touch, reducir blur a 6-8px o desactivar si `prefers-reduced-transparency`.
- **Fallback**: `@supports (backdrop-filter: blur(1px))` para navegadores antiguos.
