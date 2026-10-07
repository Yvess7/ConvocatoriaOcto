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

## 2. Tipografía Gareth y restricción estricta de Bold
- **Fuente obligatoria**: La tipografía de la interfaz debe ser **Gareth**.
- **Restricción de peso Bold**:
  - **Por defecto, NO usar negritas (bold)** en textos, etiquetas, subtítulos o elementos visuales.
  - El peso tipográfico predeterminado siempre debe ser regular / normal (`font-normal`).
  - **Única excepción**: Solo se permite aplicar negrita (`font-bold`, `font-semibold`, `<b>`, `<strong>`, etc.) cuando el usuario o un requerimiento de diseño lo solicite de manera explícita.
