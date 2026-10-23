---
trigger: always_on
description: Reglas obligatorias de Tailwind CSS y tipografía Gareth para el proyecto.
---

# Regla: Uso obligatorio de Tailwind CSS y Tipografía Gareth

## 1. Uso estricto de Tailwind CSS
- **Uso obligatorio de Tailwind CSS**: Todo el maquetado, maquetas visuales, espaciado, colores, layout y diseño de interfaz debe construirse utilizando clases utilitarias de Tailwind CSS.
- **Evitar estilos inline y CSS ad-hoc**: No utilizar estilos en línea (`style="..."`) ni escribir reglas CSS redundantes en componentes si pueden resolverse con clases utilitarias estándar de Tailwind.
- **Buenas prácticas de Tailwind**:
  - Utilizar diseño responsivo siguiendo la convención mobile-first (`sm:`, `md:`, `lg:`, etc.).
  - Estructurar interfaces mediante Flexbox y Grid nativos de Tailwind.
  - Mantener coherencia visual en espaciado, bordes y colores.
  - Usar siempre la escala de medidas de Tailwind (`p-4`, `gap-6`, `text-lg`, `w-1/2`, etc.); evitar valores arbitrarios (`w-[123px]`) salvo que sea imprescindible.
  - Todo componente debe ser responsivo (mobile-first), verificando que se vea bien en móvil, tablet y escritorio.

## 2. Tipografía Gareth / Garet y restricción estricta de Bold
- **Fuente obligatoria**: La tipografía de la interfaz debe ser **Garet** (archivos `Garet-Book` y `Garet-Heavy` en `public/fonts/garet/`).
- **Restricción de peso Bold**:
  - **Por defecto, NO usar negritas (bold)** en textos, etiquetas, subtítulos o elementos visuales. Se debe usar siempre el peso regular (`Garet-Book` / `font-normal`).
  - El peso tipográfico predeterminado siempre debe ser regular / normal (`font-normal`).
  - **Única excepción**: Solo se permite aplicar negrita (`font-bold`, `font-semibold`, `<b>`, `<strong>`, que carga `Garet-Heavy`) cuando el usuario o un requerimiento de diseño lo solicite de manera explícita.

## 3. Paleta de colores (Landing de Convocatoria de Robótica)
- **Colores de marca**:
  - Naranja: `#f6842b` (`brand-orange`)
  - Rojo: `#e81a4f` (`brand-red`)
  - Rojo oscuro (para hover en botones/elementos rojos): `#b8143d` (`brand-red-dark`)
  - Blanco: `#ffffff`
- **Sin gradientes**: Usar colores sólidos; evitar gradientes salvo petición explícita.
- **Color de texto por defecto**: `#3A3A3A`.
- **Texto sobre fondos naranja o rojo**: siempre blanco.
- **Estilo de botones y esquinas redondeadas**:
  - No usar bordes redondeados excesivos que parezcan píldoras o círculos (`rounded-full`).
  - Usar formas más cuadradas con esquinas ligeramente redondeadas (`rounded-md` o `rounded-lg`).
  - En hover de elementos/botones rojos, oscurecer al rojo más oscuro (`hover:bg-brand-red-dark`), sin pasar a naranja.
- Definir los colores como tokens de Tailwind (p. ej. `orange`, `red`, `brand-red-dark`, `ink`) y usarlos mediante clases (`bg-brand-orange`, `bg-brand-red`, `hover:bg-brand-red-dark`, `text-ink`) en lugar de valores hexadecimales sueltos.

## 4. Restricción estricta de iconos y emojis
- **No usar iconos ni emojis**: No agregar iconos (SVG, librerías como Material Symbols o Lucide) ni emojis en textos, botones, navegación, encabezados o tarjetas, a menos que el usuario lo solicite de manera explícita.
- La interfaz debe priorizar la limpieza visual tipográfica y de color sin elementos iconográficos decorativos innecesarios.

## 5. Composición visual, textos libres, banners rectangulares y figuras variadas
- **Banners estrictamente rectangulares y sin figuras geométricas**: El banner principal de cada página debe mantener su forma rectangular limpia, sin cortes diagonales (`skew`), ondas ni deformaciones en sus bordes, **sin figuras geométricas decorativas sobre el banner**, e incluir siempre el título principal (`h1`) y descripción principal de la vista.
- **Sección blanca siempre debajo del banner**: La primera sección inmediatamente debajo del banner de cada vista debe tener fondo blanco (`bg-white`).
- **Textos libres (evitar diseño encajonado)**: No encerrar los textos y botones de cada sección dentro de cajas o tarjetas cuadradas innecesarias. Dejar que los párrafos, títulos y destaques editoriales (`border-l-2` / `border-l-4`) respiren libremente sobre el lienzo de color de la sección.
- **Alternancia Izquierda/Derecha sin colisión de textos**:
  - Alternar la posición del título y el contenido entre secciones consecutivas (`Izquierda/Derecha` y `Derecha/Izquierda`).
  - Usar grillas equilibradas (`md:grid-cols-12` con `md:col-span-6` + `md:col-span-6` y `gap-12 lg:gap-20`) y tamaños de encabezado simétricos (`text-4xl sm:text-5xl lg:text-6xl`) para que palabras largas como `Documentación` o `Convocatoria` nunca invadan ni se encimen sobre la columna contigua.
- **Variedad de figuras geométricas en movimiento**: En los fondos dinámicos, utilizar figuras geométricas variadas más allá de simples cuadrados (`shape-hexagon`, `shape-triangle`, `shape-diamond`, `shape-octagon`, `shape-parallelogram`, `shape-cross`, `bg-tech-dots`), animadas únicamente con propiedades aceleradas por GPU (`transform` y `opacity`).

