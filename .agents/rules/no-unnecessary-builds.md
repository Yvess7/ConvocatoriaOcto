---
trigger: always_on
---

# Regla: No ejecutar builds ni comandos de validación tras editar código

- **No ejecutar builds (`yarn build`, `pnpm build`,`ng build`, `npm run build`, etc.) tras realizar cambios en el código.**
- El editor guarda automáticamente (autosave) y el dev server activo (`yarn start`) recompila y actualiza en caliente (hot reload).
- No ejecutar comandos de prueba, lsof, verificación ni terminal salvo que el usuario lo pida explícitamente.
