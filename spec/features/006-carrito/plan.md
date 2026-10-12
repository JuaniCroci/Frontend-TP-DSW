# 006 · Carrito y confirmación — Plan

## Contrato verificado

- `GET /api/carrito`: devuelve el carrito activo o `404` cuando todavía no hay uno.
- `POST /api/carrito`: crea el carrito activo si falta; si ya existe, devuelve el mismo.
- `POST /api/carrito/items`: agrega cantidad a la línea existente del producto o crea una; devuelve
  la vista completa con subtotal y total.
- `PUT /api/carrito/items/:id`: cambia la cantidad de la línea y devuelve la vista completa.
- `DELETE /api/carrito/items/:id`: quita una línea y responde `204`.
- `POST /api/carrito/confirmar`: crea un pedido `REALIZADO`; valida stock, aplica descuentos del
  backend, descuenta stock y responde el detalle del pedido.
- Los errores incluyen `statusCode` y `message`; stock insuficiente usa `409`, carrito vacío `400`.

## Implementación

- Mantener modelos, consultas y mutaciones aislados bajo `features/cart`.
- Usar los importes de la respuesta de carrito; después de mutaciones actualizar/invalidate la
  consulta del carrito y el catálogo cuyo stock pudo cambiar.
- Proteger `/carrito` con un guard para clientes y ofrecer la navegación solo a clientes.
- Agregar al carrito desde el detalle de producto; visitante recibe enlace a login con destino de
  retorno, y login redirige al destino interno una vez autenticado.
- La confirmación usa respuesta real del backend y distingue pedido `REALIZADO` de pagos futuros.

## Validación

- Tests de interfaz con adaptador HTTP mockeado para crear, modificar, quitar, confirmar, errores y
  retorno de login.
- Lint, build y suite frontend completa.
- Ejecutar pruebas existentes de carrito y confirmación en backend para validar compatibilidad.
