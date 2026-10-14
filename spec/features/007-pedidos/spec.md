# 007 · Consulta y gestión de pedidos

## Objetivo

Completar el flujo de pedidos después de la confirmación del carrito: el cliente consulta sus
pedidos y su detalle, mientras que el administrador busca pedidos, consulta los datos completos y
marca como entregados o cancela los que todavía están realizados.

## Alcance

- Historial de pedidos del cliente autenticado, con acceso a su detalle.
- Listado administrativo paginado y filtrable por fecha de realización, estado y cliente.
- Detalle administrativo con datos del cliente y líneas del pedido.
- Acciones administrativas para entregar o cancelar pedidos en estado `REALIZADO`.
- Actualización de los datos de consulta tras una transición confirmada por la API.

## Reglas de negocio y límites

- Los pedidos y sus estados son autoritativos del backend; el frontend no recalcula importes ni
  modifica stock.
- El backend limita los pedidos de cliente a los del usuario autenticado; el frontend solo presenta
  los recursos devueltos por esos endpoints.
- Solo los usuarios `ADMIN` pueden listar todos los pedidos y realizar acciones de gestión.
- Solo se ofrecen acciones para pedidos `REALIZADO`; la API valida la transición y puede rechazarla.
- Cancelar puede restituir stock en el backend. La interfaz confirma la acción y muestra errores
  del servidor sin simular la operación localmente.
- Los importes se muestran desde strings decimales de la API.
- Esta feature no implementa pagos ni la transición a `ABONADO`.

## Contrato utilizado

- `GET /api/mis-pedidos`
- `GET /api/mis-pedidos/:id`
- `GET /api/pedidos?desde=&hasta=&estado=&cliente=&page=&size=`
- `GET /api/pedidos/:id`
- `POST /api/pedidos/:id/entregar`
- `POST /api/pedidos/:id/cancelar`

Las operaciones administrativas requieren rol `ADMIN`; las consultas de cliente requieren sesión y
el backend restringe los resultados al titular.

## Criterios de aceptación

- [x] Un cliente autenticado puede consultar sus pedidos y abrir el detalle de cada uno.
- [x] El detalle de cliente muestra los productos, cantidades, precios unitarios, subtotales, estado
      e importe total.
- [x] Un administrador puede listar pedidos con filtros por fechas, estado y nombre/email del
      cliente, con paginación.
- [x] El detalle administrativo también muestra nombre, email, teléfono y dirección del cliente.
- [x] Un administrador puede entregar o cancelar un pedido `REALIZADO` con confirmación explícita.
- [x] Tras una acción, la interfaz refleja la respuesta de la API y sus errores.
- [x] No se ofrecen acciones de gestión para pedidos en otros estados.
- [x] Las rutas quedan protegidas según el rol y se cubren los flujos y errores con tests.
