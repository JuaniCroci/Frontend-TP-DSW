# 007 · Plan de implementación

## Enfoque

1. Modelar las respuestas de listado y detalle del contrato vigente.
2. Encapsular consultas y transiciones en hooks de TanStack Query.
3. Crear páginas separadas para el historial del cliente y la gestión administrativa.
4. Proteger cada ruta por rol e integrar enlaces en la navegación existente.
5. Cubrir filtros, detalle, transiciones, autorización y errores con pruebas de interfaz.

## Decisiones

- Usar `GET /api/mis-pedidos` y `/api/mis-pedidos/:id` para que la autorización de pertenencia
  permanezca en el backend.
- El listado administrativo usa filtros soportados por el backend y paginación de 20 elementos.
- Actualizar/invalidatear queries tras entregar o cancelar; no mutar stock ni estado localmente.
- Mantener la vista de pagos fuera de esta feature.

## Estado

- [x] Verificar rutas, DTOs y respuestas del backend.
- [x] Implementar modelos y capa de consultas/mutaciones.
- [x] Implementar historial y detalle del cliente.
- [x] Implementar listado filtrado, detalle y acciones administrativas.
- [x] Añadir navegación, guardias y pruebas.
- [x] Validar lint, tipos, tests y build.
