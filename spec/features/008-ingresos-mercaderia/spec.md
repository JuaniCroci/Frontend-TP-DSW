# 008 · Ingreso de mercadería

## Objetivo

Permitir al administrador registrar ingresos de mercadería de un proveedor y anular los ya
registrados, para que el stock de los productos se mueva siempre a través de la API. Hoy el stock
solo puede fijarse al crear un producto y no existe ninguna UI para moverlo.

## Alcance

- Listado administrativo de ingresos con filtros por estado y rango de fechas.
- Detalle de cada ingreso con sus líneas (producto, cantidad, precio de compra e importe de línea).
- Alta de ingreso con número, proveedor, fecha opcional y líneas dinámicas de producto, cantidad y
  precio de compra.
- Anulación de un ingreso `REGISTRADO` con confirmación explícita y restitución de stock en el
  backend.
- Actualización de las consultas de ingresos y de productos tras cada alta o anulación (el stock
  cambia en el backend).

## Reglas de negocio y límites

- El backend es autoritativo: suma `cantidad` al `stock` de cada producto al crear y la resta al
  anular; el frontend no recalcula stock ni importes y nunca envía `importeTotal`.
- `nroIngreso` es único (`409` si se repite) y no se admiten dos líneas del mismo producto (`400`).
- `cantidad` es un entero >= 1 y `precioUnitario` (precio de compra) es decimal con 1 o 2 dígitos
  mayor a 0.
- Anular solo actúa sobre ingresos `REGISTRADO`; si el stock no alcanza para restituir, el backend
  responde `409` y no se anula. La anulación es irreversible (no existe reactivar).
- `fecha` es opcional en el alta; si no se envía, el backend usa la hora actual.
- El listado no tiene paginación en la API; se presentan todos los resultados.
- Solo usuarios `ADMIN` acceden a los endpoints y a la ruta.
- Los importes se muestran como strings decimales de la API y se formatean con
  `Intl.NumberFormat`; el `precioUnitario` del ingreso es el precio de compra, no el precio de
  venta del producto.

## Contrato utilizado

- `GET /api/ingresos?estado=&desde=&hasta=`
- `GET /api/ingresos/:id`
- `POST /api/ingresos`
- `POST /api/ingresos/:id/anular`

Todas las operaciones requieren rol `ADMIN`. Detalle completo en
[`spec/constitution/api-contract.md`](../../constitution/api-contract.md), sección "Ingresos de
mercadería".

## Criterios de aceptación

- [ ] Un administrador puede listar ingresos y filtrarlos por estado y rango de fechas, con
      estados de carga, error y vacío.
- [ ] Puede abrir el detalle de un ingreso y ver sus líneas con producto, cantidad, precio de
      compra, importe de línea e importe total.
- [ ] Puede registrar un ingreso con número, proveedor, fecha opcional y una o más líneas; la
      validación de formulario espeja el backend (mínimo 1 línea, sin productos repetidos,
      cantidad >= 1, precio > 0).
- [ ] Un `409` de `nroIngreso` duplicado se muestra como error de campo; los demás errores de la
      API se presentan sin simular la operación localmente.
- [ ] Tras un alta exitosa se invalidan las consultas de ingresos y de productos.
- [ ] Puede anular un ingreso `REGISTRADO` con confirmación explícita; un `409` de stock
      insuficiente o de ingreso ya anulado se muestra tal como lo responde el backend.
- [ ] Tras una anulación exitosa se invalidan las consultas de ingresos y de productos.
- [ ] No se ofrecen acciones de anulación sobre ingresos `ANULADO`.
- [ ] La ruta queda protegida por rol y los flujos y errores se cubren con tests.
