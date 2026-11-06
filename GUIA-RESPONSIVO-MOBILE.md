# Guía de responsivo mobile (para una IA más económica)

Objetivo: que cada página del sitio se vea **centrada, con aire y amigable en móvil** (< 768px), sin romper escritorio.
La página de referencia ya corregida es `RoboticaAlEstiloJalisco/src/app/pages/torneos/torneos.html`. **Ábrela primero y copia sus patrones.**

## Reglas del proyecto que NO se pueden romper
- Solo clases de Tailwind. Sin `style=""` ni CSS nuevo si Tailwind lo resuelve.
- Sin iconos, sin emojis, sin gradientes, sin `rounded-full` en botones (usar `rounded-lg`).
- Peso normal (`font-normal`). **No agregar ni quitar `font-bold` / `font-semibold` existentes**: si ya está, se queda.
- No cambiar colores, textos ni estructura de secciones. Solo espaciado, alineación y orden.
- No ejecutar builds ni comandos de prueba (el dev server recarga solo).

## Qué cambiar (checklist por página)

### 1. Márgenes laterales
Los contenedores usan `px-4 sm:px-6 lg:px-8`. Cambiar a `px-6 lg:px-8`.

### 2. Centrar textos de sección en móvil
| Elemento | Antes | Después |
| --- | --- | --- |
| Columna de texto (izquierda) | `md:col-span-6 reveal-left` | `md:col-span-6 text-center md:text-left reveal-left` |
| Columna de texto (derecha) | `... md:text-right ...` | `... text-center md:text-right ...` |
| Barra de acento (alineada izq.) | `mt-6 h-1.5 w-20 ...` | añadir `mx-auto md:mx-0` |
| Barra de acento (alineada der.) | `... md:ml-auto` | añadir `mx-auto md:mr-0 md:ml-auto` |
| Párrafo con `max-w-xl` / `max-w-2xl` | `max-w-2xl` | `max-w-2xl mx-auto md:mx-0` |
| Contenedor del banner (texto + botones) | `... py-16 sm:py-20` | `... py-20 sm:py-24 text-center md:text-left` |

Si el título está en una cabecera centrada en todas las pantallas (por ejemplo el encabezado del mapa), no tocarlo.

### 3. Botones
- Grupo de botones: `flex flex-wrap gap-4` → `flex flex-wrap justify-center md:justify-start gap-4` (en el banner además `mt-8`).
- Cada botón: añadir `w-full sm:w-auto text-center`.

### 4. Espaciado vertical
- Secciones: `py-24 sm:py-32` → `py-16 sm:py-24 lg:py-32`.
- Mantener `gap-12` entre columnas apiladas. Si hay textos pegados a imágenes, subir a `gap-10` / `space-y-10` mínimo.
- No tocar los `pt-36 pb-32` de las secciones con triángulo (`section-triangle-*`): compensan el recorte.

### 5. Orden de columnas en móvil
Título + descripción primero, imagen/botones después. Se logra con `order-1` en el texto y `order-2 md:order-1` en la imagen (ya está así en torneos).

### 6. Marcos de foto (`photo-frame`)
Ya corregido globalmente en `src/styles.css`: desplazamiento de 0.5rem en móvil y 1rem desde `md`. No tocar.

### 7. Figuras decorativas
Deben tener `pointer-events-none` y estar dentro de una sección con `overflow-hidden`. Si una figura se sale y genera scroll horizontal, achicarla en móvil (`w-24 h-24 md:w-44 md:h-44`).

### 8. Efectos solo de escritorio
Hover con `hover:-translate-y-1 hover:scale-[1.02]` está bien (en táctil no se dispara). El robot y el foco de tarjetas del mapa ya están ocultos en móvil (`hidden md:block`).

## Páginas pendientes (en este orden)
1. `src/app/pages/home/home.html`
2. `src/app/pages/mbot/mbot.html` (cabecera + mapa) y `src/app/pages/octostudio/octostudio.html` (son gemelas: hacer una y replicar)
3. `src/app/pages/documentacion/documentacion.html`
4. `src/app/pages/videos/videos.html`
5. `src/app/app.html` (menú y pie de página: que el menú móvil sea cómodo y el pie quede centrado y apilado)

## Cómo revisar cada página
Probar en 360px, 390px, 768px y 1280px:
- Ningún texto toca el borde de la pantalla.
- Sin scroll horizontal.
- Títulos, barras de acento, párrafos y botones centrados en móvil.
- En 768px o más, la alineación vuelve a como estaba (izquierda/derecha).

## Prompt sugerido para la IA económica
> Lee `GUIA-RESPONSIVO-MOBILE.md` y `RoboticaAlEstiloJalisco/src/app/pages/torneos/torneos.html` como referencia. Aplica el checklist de la guía **solo** a `<ARCHIVO>`. No cambies textos, colores, `font-bold`, estructura ni lógica de TypeScript. No ejecutes builds. Al terminar, lista en una tabla qué clases cambiaste y por qué.

## Errores comunes a evitar
- Centrar en todas las pantallas: siempre usar el par `text-center md:text-left`.
- Olvidar `md:mr-0` cuando se usa `mx-auto` con `md:ml-auto`.
- Poner `w-full` sin `sm:w-auto`: los botones se verían gigantes en tablet.
- Quitar clases `reveal-*`, `apple-zoom` o `data-gsap`: son animaciones y no se tocan.
- Meter valores arbitrarios (`w-[342px]`): usar la escala de Tailwind.
