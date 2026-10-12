> ⚠️ **SNAPSHOT** — catálogo de endpoints del repo **backend** (`tp-dsw-back00/spec/features/*/spec.md`), extraído el 2026-10-04.
> **Fuente de verdad = el backend.** Si el back agrega o cambia un endpoint, sincronizar este archivo (gate en `engineering-loop.md`).
> Los **shapes** de request/response viven en [`api-contract.md`](./api-contract.md); este archivo solo lista rutas, métodos, filtros y permisos.

# Catálogo de endpoints — Entreno 2.0 Backend

**Convenciones:** prefijo `/api` · listados → `{ data, total }` (+ `page`/`size` cuando aplica) · dinero `string` · errores `{ statusCode, message, details? }` · **ADMIN** = token con `rol: ADMIN`, **CLIENTE** = token con `rol: CLIENTE`, **público** = sin token.

## 001 · Health

| Método | Ruta          | Auth    | Notas                                             |
| ------ | ------------- | ------- | ------------------------------------------------- |
| GET    | `/api/health` | público | `{ status, database }`; `503` si la DB está caída |

## 002 · Auth

| Método | Ruta                 | Auth          | Body / Notas                                                                                                                 |
| ------ | -------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/auth/register` | público       | `{ nombre, email, password (≥8), telefono?, direccion? }` → `201` con `UsuarioPublic`; nace `CLIENTE`; `409` si email existe |
| POST   | `/api/auth/login`    | público       | `{ email, password }` → `200` `{ token, refreshToken, usuario }`; `401` "Credenciales inválidas"                             |
| GET    | `/api/auth/me`       | ADMIN/CLIENTE | `UsuarioPublic` del token                                                                                                    |
| POST   | `/api/auth/logout`   | ADMIN/CLIENTE | revoca los refresh tokens del usuario; `204` sin body                                                                        |
| POST   | `/api/auth/refresh`  | público       | `{ refreshToken }` → `200` `{ token, refreshToken, usuario }`; `401` si inválido                                             |

> **Rate limit**: `register` y `login` limitan a **5 requests / 15 min por IP** (fuera de test) → la UI debe manejar `429` con mensaje amigable.
> `UsuarioPublic`: `{ id, nombre, email, telefono, direccion, rol: 'ADMIN' | 'CLIENTE', activo, createdAt, updatedAt }` — nunca `passwordHash`.
> **Front 002**: usa `token` + `me` + `logout`; `refreshToken`/`refresh` queda fuera de regularidad (decisión en `features/002-core-api-auth/plan.md`).

## 003 · Marcas

| Método | Ruta              | Auth    | Notas                     |
| ------ | ----------------- | ------- | ------------------------- |
| GET    | `/api/marcas`     | público | `?q=` (nombre parcial)    |
| GET    | `/api/marcas/:id` | público |                           |
| POST   | `/api/marcas`     | ADMIN   | `409` si nombre duplicado |
| PUT    | `/api/marcas/:id` | ADMIN   |                           |
| DELETE | `/api/marcas/:id` | ADMIN   | baja lógica (`204`)       |

## 004 · Tipos de producto

| Método | Ruta                      | Auth    | Notas               |
| ------ | ------------------------- | ------- | ------------------- |
| GET    | `/api/tipos-producto`     | público |                     |
| GET    | `/api/tipos-producto/:id` | público |                     |
| POST   | `/api/tipos-producto`     | ADMIN   |                     |
| PUT    | `/api/tipos-producto/:id` | ADMIN   |                     |
| DELETE | `/api/tipos-producto/:id` | ADMIN   | baja lógica (`204`) |

## 005 · Proveedores

| Método | Ruta                   | Auth    | Notas               |
| ------ | ---------------------- | ------- | ------------------- |
| GET    | `/api/proveedores`     | público |                     |
| GET    | `/api/proveedores/:id` | público |                     |
| POST   | `/api/proveedores`     | ADMIN   |                     |
| PUT    | `/api/proveedores/:id` | ADMIN   |                     |
| DELETE | `/api/proveedores/:id` | ADMIN   | baja lógica (`204`) |

## 006 · Clientes (usuarios CLIENTE)

| Método | Ruta                           | Auth  | Notas                                                          |
| ------ | ------------------------------ | ----- | -------------------------------------------------------------- |
| GET    | `/api/clientes`                | ADMIN | `?q=` (nombre/email), `?activo=`                               |
| GET    | `/api/clientes/:id`            | ADMIN | sin `passwordHash`                                             |
| POST   | `/api/clientes`                | ADMIN | alta manual `{ nombre, email, password, teléfono, dirección }` |
| PUT    | `/api/clientes/:id`            | ADMIN | password solo si viene en el body                              |
| PATCH  | `/api/clientes/:id/activar`    | ADMIN | toggle `activo`                                                |
| PATCH  | `/api/clientes/:id/desactivar` | ADMIN | toggle `activo`                                                |

## 007 · Productos (admin)

| Método | Ruta                       | Auth    | Notas                                               |
| ------ | -------------------------- | ------- | --------------------------------------------------- |
| GET    | `/api/productos/admin`     | ADMIN   | incluye inactivos con `?inactivos=true`; `?nombre=` |
| GET    | `/api/productos/admin/:id` | ADMIN   | detalle completo (proveedor completo)               |
| POST   | `/api/productos`           | ADMIN   | alta                                                |
| PUT    | `/api/productos/admin/:id` | ADMIN   | edición                                             |
| DELETE | `/api/productos/admin/:id` | ADMIN   | baja lógica (`204`)                                 |
| GET    | `/api/productos/:id`       | público | solo `activo=true`; `404` si inactivo               |

## 008 · Descuentos

| Método | Ruta                                             | Auth  | Notas                                                 |
| ------ | ------------------------------------------------ | ----- | ----------------------------------------------------- |
| GET    | `/api/descuentos`                                | ADMIN |                                                       |
| GET    | `/api/descuentos/:id`                            | ADMIN | detalle con aplicaciones (producto + rango de fechas) |
| POST   | `/api/descuentos`                                | ADMIN | `{ descripcion, cantidadMinima, porcentaje, activo }` |
| PUT    | `/api/descuentos/:id`                            | ADMIN |                                                       |
| DELETE | `/api/descuentos/:id`                            | ADMIN | baja lógica (`204`)                                   |
| POST   | `/api/descuentos/:id/aplicaciones`               | ADMIN | `{ idProducto, fechaDesde, fechaHasta }`              |
| DELETE | `/api/descuentos/:id/aplicaciones/:aplicacionId` | ADMIN | quita una aplicación                                  |

## 009 · Ingresos de mercadería

| Método | Ruta                       | Auth  | Notas                                                                                     |
| ------ | -------------------------- | ----- | ----------------------------------------------------------------------------------------- |
| GET    | `/api/ingresos`            | ADMIN | `?estado=REGISTRADO\|ANULADO`, `?desde=`, `?hasta=`                                       |
| GET    | `/api/ingresos/:id`        | ADMIN | detalle con líneas                                                                        |
| POST   | `/api/ingresos`            | ADMIN | `{ nroIngreso, idProveedor, fecha?, lineas: [{ idProducto, cantidad, precioUnitario }] }` |
| POST   | `/api/ingresos/:id/anular` | ADMIN | acción de negocio; restituye stock; `200` con el ingreso actualizado                      |

## 010 · Catálogo público de productos

| Método | Ruta                 | Auth    | Notas                                                                                                                              |
| ------ | -------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/productos`     | público | `?idTipoProducto=`, `?idMarca=`, `?precioMin=`, `?precioMax=` (AND), `?orden=nombre\|precio`, `?dir=asc\|desc`, `?page=`, `?size=` |
| GET    | `/api/productos/:id` | público | detalle completo + descuentos vigentes                                                                                             |

> Item del listado: `id`, `nombre`, `marca`, `precioUnitario`, `disponible` (`stock > 0`).

## 011 · Carrito y pedido (CLIENTE)

| Método | Ruta                     | Auth          | Notas                                                                    |
| ------ | ------------------------ | ------------- | ------------------------------------------------------------------------ |
| POST   | `/api/carrito`           | ADMIN/CLIENTE | idempotente: `201` si creó, `200` si ya existía activo                   |
| GET    | `/api/carrito`           | ADMIN/CLIENTE | **`404` si no hay carrito activo** (nunca crea)                          |
| POST   | `/api/carrito/items`     | ADMIN/CLIENTE | `{ idProducto, cantidad }` agrega/incrementa (crea carrito si no existe) |
| PUT    | `/api/carrito/items/:id` | ADMIN/CLIENTE | cambia cantidad                                                          |
| DELETE | `/api/carrito/items/:id` | ADMIN/CLIENTE | quita línea (`204`)                                                      |
| POST   | `/api/carrito/confirmar` | ADMIN/CLIENTE | transaccional; devuelve el pedido creado (`200`); `400` si vacío         |

> **Post-confirmar:** el carrito queda `CONCLUIDO`; hasta el próximo `POST /api/carrito`, `GET /api/carrito` responde `404`.
> Shape del carrito: `{ id, estado, items: [{ id, producto: { id, nombre, precioUnitario }, cantidad, subtotal }], total }` (subtotales **sin** descuentos; se aplican al confirmar).

## 012 · Gestión de pedido (ADMIN)

| Método | Ruta                         | Auth  | Notas                                               |
| ------ | ---------------------------- | ----- | --------------------------------------------------- |
| POST   | `/api/pedidos/:id/entregar`  | ADMIN | `REALIZADO → ENTREGADO` (fase 1)                    |
| POST   | `/api/pedidos/:id/cancelar`  | ADMIN | `REALIZADO → CANCELADO` (fase 1) restituyendo stock |
| GET    | `/api/pedidos/:id/historial` | ADMIN | timeline de estados                                 |

## 013 · Listado de pedidos

| Método | Ruta                   | Auth          | Notas                                                                                                                                                                            |
| ------ | ---------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/pedidos`         | ADMIN         | `?desde=`, `?hasta=` (fecha de realizado, inclusivos), `?estado=REALIZADO\|ABONADO\|ENTREGADO\|CANCELADO`, `?idCliente=`, `?cliente=` (nombre/email parcial), `?page=`, `?size=` |
| GET    | `/api/pedidos/:id`     | ADMIN         | detalle: cliente completo + items + estado + importeTotal                                                                                                                        |
| GET    | `/api/mis-pedidos`     | ADMIN/CLIENTE | solo los propios; item: `id`, `fecha`, `estado`, `importeTotal`, `fechaEntrega` (o `null`)                                                                                       |
| GET    | `/api/mis-pedidos/:id` | ADMIN/CLIENTE | detalle propio; `404` si es de otro usuario                                                                                                                                      |

> `fechaEntrega` se deriva del `HistorialEstado` (cambio a `ENTREGADO`); `null` si aún no se entregó.

## Estados de pedido

`REALIZADO` → `ABONADO` (fase 2, con pago) → `ENTREGADO` · `CANCELADO` (desde `REALIZADO`; desde `ABONADO` en fase 2)

## Notas para el frontend

1. **`GET` nunca crea**: `GET /api/carrito` responde `404` sin carrito activo; para crear/usar hay que hacer `POST /api/carrito`.
2. **Filtros inválidos → `400`** (`precioMin > precioMax`, `desde > hasta`, `estado` desconocido): mostrar el `message` de `ApiError`.
3. **IDs de filtro** (`idMarca`, `idTipoProducto`, `idCliente`) se envían como query params; los listados que los ofrecen (marcas, tipos, clientes) se piden con `GET` previo.
4. Las features de **aprobación** (Tag, Favorito, Reseña, Abonar pedido) y el **voluntario** todavía no existen en el back.
