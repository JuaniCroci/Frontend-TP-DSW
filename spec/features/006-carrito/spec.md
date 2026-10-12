# 006 · Carrito y confirmación de pedido

## Objetivo

Permitir que un cliente autenticado arme un carrito persistente desde el catálogo, ajuste sus
cantidades, revise los importes calculados por la API y confirme el pedido.

## Alcance

- Agregar productos desde su detalle; visitantes pueden iniciar sesión y volver al producto.
- Consultar el carrito activo, actualizar cantidad y quitar líneas.
- Mostrar precio unitario, subtotal por línea, total, disponibilidad y errores del backend.
- Confirmar el carrito con una acción explícita y mostrar el pedido resultante.
- En la confirmación, mostrar el total y descuento aplicado devueltos por el servidor.

## Reglas de negocio y límites

- Todas las operaciones de carrito requieren autenticación; la pantalla de compra es solo para
  clientes. La autorización del backend sigue siendo obligatoria.
- La API crea el carrito activo si todavía no existe al llamar `POST /api/carrito`; la operación
  es idempotente.
- Las cantidades son enteros positivos. El backend valida que no superen el stock.
- La UI presenta los importes del carrito devueltos por el servidor y no calcula descuentos ni
  altera stock.
- La confirmación crea un pedido `REALIZADO` y consume stock según el backend. No incluye pagos ni
  se debe presentar como una compra ya abonada.
- Errores de stock, carrito vacío, autorización y conectividad se muestran explícitamente.

## Criterios de aceptación

- [x] Un cliente puede agregar un producto con cantidad válida desde su detalle.
- [x] El carrito activo persiste en el backend y muestra líneas, cantidades e importes de API.
- [x] Se puede modificar cantidad y quitar una línea, conservando errores del servidor.
- [x] La confirmación requiere carrito no vacío, avisa que no procesa pago y presenta el pedido creado.
- [x] Visitantes pueden iniciar sesión desde el detalle y regresar a la ruta de origen.
- [x] Usuarios ADMIN no ven acciones de compra ni acceden a la pantalla del carrito.
- [x] Tests cubren requests, éxito, validación/error y navegación por autenticación.
