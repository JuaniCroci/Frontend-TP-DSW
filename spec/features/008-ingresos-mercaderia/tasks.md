# 008 · Tareas

- [x] Contrastar el alcance con el contrato vigente del backend y sincronizar
      `spec/constitution/api-contract.md` (sección "Ingresos de mercadería") (2026-10-16).
- [ ] Modelar ingreso, líneas, filtros y alta en `src/app/models/Ingreso.ts`.
- [ ] Implementar consultas de listado y detalle de ingresos.
- [ ] Implementar mutaciones de alta y anulación invalidando ingresos y productos.
- [ ] Implementar formulario de alta con líneas dinámicas y validación espejo del backend.
- [ ] Implementar página administrativa con filtros, listado, detalle modal y estados
      loading/error/vacío.
- [ ] Implementar anulación con confirmación y manejo de `409` de stock insuficiente.
- [ ] Agregar ruta `/admin/ingresos` protegida y entrada de navegación en el panel admin.
- [ ] Cubrir alta, validaciones, filtros, detalle, anulación y errores con tests de interfaz.
- [ ] Ejecutar lint, typecheck, tests y build; actualizar roadmap y CHANGELOG.
- [ ] Smoke manual: crear ingreso → stock sube → anular → stock vuelve al valor inicial.
