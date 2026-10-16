# 008 · Plan de implementación

## Enfoque

1. Sincronizar `spec/constitution/api-contract.md` con la sección de ingresos del backend.
2. Modelar ingresos, líneas, filtros y altas en `src/app/models/Ingreso.ts`.
3. Encapsular consultas y mutaciones en hooks de TanStack Query dentro de `features/admin`.
4. Crear la página administrativa con listado, filtros, detalle y alta.
5. Proteger la ruta, agregar la entrada de navegación y cubrir los flujos con pruebas de interfaz.

## Decisiones

- Número `008`: único hueco libre en el numerado del front (009–012 están reservados en el
  backlog de aprobación).
- El código vive en `src/app/features/admin/` (consistente con productos, descuentos y clientes):
  `pages/AdminIngresosPage.tsx`, `components/IngresoForm.tsx`,
  `components/IngresoDetalleModal.tsx` y `api/ingresosQueries.ts` + `api/ingresosMutations.ts`.
- Filtros del listado (estado, desde, hasta) en estado local, como el resto de las páginas admin;
  la API no pagina y devuelve `{ data, total }`.
- Las líneas del alta son filas dinámicas: select de producto (solo activos, con el stock actual
  como referencia), cantidad entero >= 1 y precio de compra > 0 con hasta 2 decimales; mínimo una
  línea y sin dos filas del mismo producto. Sin auto-relleno de precio: el precio de compra es un
  dato del proveedor, no el precio de venta del producto.
- El select de productos reutiliza `useAdminProductos` con `activo: true` (incluye `stock`); el de
  proveedores reutiliza `useProveedoresActivosProducto`.
- `fecha` es un campo opcional (`input type=date`, default hoy); si se vacía no se envía y el
  backend usa la hora actual.
- El alta y la anulación invalidan `['admin', 'ingresos']` y `['admin', 'productos']` porque el
  backend mueve stock.
- La anulación usa confirmación explícita (patrón de entregar/cancelar pedido) y muestra los `409`
  del backend (stock insuficiente, ya anulado) sin reintentos locales.
- `nroIngreso` lo escribe el administrador; un `409` de duplicado se mapea a error de campo.

## Estado

- [x] Verificar rutas, DTOs, reglas y respuestas del backend (2026-10-16).
- [x] Sincronizar `api-contract.md` con la sección "Ingresos de mercadería" (2026-10-16).
- [ ] Modelar y encapsular consultas/mutaciones.
- [ ] Implementar listado, filtros, detalle y alta.
- [ ] Implementar anulación con confirmación.
- [ ] Añadir navegación, guardia y pruebas.
- [ ] Validar lint, tipos, tests y build.
- [ ] Smoke manual con backend (alta → stock sube → anular → stock vuelve).
