# Roadmap

Orden y estado de las features **del frontend**. Cada entrada apunta a su carpeta en `features/`.

La columna **Back** indica qué feature del backend necesita esa UI:
✅ = implementada en el back · ⏳ = pendiente en el back (no arrancar hasta que esté).

## Hecho ✅

1. **[001 · Setup y puente con la API](../features/001-setup/)** — constitución SDD + skills del back, tooling (ESLint, Prettier, Vitest, CI) y puente HTTP (`apiClient` + interceptores + 15 tests). Smoke: `GET /api/health` → 200. CI: run #1 verde.
2. **[002 · Core API + Auth](../features/002-core-api-auth/)** — sesión persistida, cliente HTTP autenticado, login/logout y pruebas unitarias/de interfaz. Smoke manual con backend local verificado (2026-10-14).
3. **[003 · Layout shell](../features/003-layout-shell/)** — portada adaptable, navegación, estado de sesión y rutas de inicio/login.
4. **[004 · Catálogo](../features/004-catalogo-productos/)** — listado público filtrable y paginado, detalle de producto y estados vacíos/error. El catálogo de desarrollo aún no tiene datos.
5. **[013 · Imágenes de productos](../features/013-imagenes-productos/)** — registro UUID, carga administrativa, metadatos y visualización en catálogo y detalle (front ✅, back ✅).
6. **[006 · Carrito](../features/006-carrito/)** — carrito persistente, edición de cantidades y confirmación de pedido (front ✅, back ✅; sin pagos).
7. **[007 · Pedidos](../features/007-pedidos/)** — historial del cliente, listado filtrado y detalle administrativo, entregar/cancelar (back ✅).

## En orden (regularidad)

| #       | Feature                                                                                                                                   | Back           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| ~~001~~ | ~~[Setup y puente con la API](../features/001-setup/)~~ — ✅                                                                              | 001 ✅         |
| ~~002~~ | ~~[Core API + Auth](../features/002-core-api-auth/)~~ — ✅                                                                                | 002 ✅         |
| ~~003~~ | ~~[Layout shell](../features/003-layout-shell/)~~ — ✅                                                                                    | —              |
| ~~004~~ | ~~[Catálogo](../features/004-catalogo-productos/)~~ — ✅                                                                                  | 007 ✅, 010 ✅ |
| ~~005~~ | ~~[Admin CRUDs](../features/005-admin-cruds/) — acceso, maestros, clientes, productos y descuentos~~ — ✅ (ingresos → fase de aprobación) | 003–008 ✅     |
| ~~006~~ | ~~[Carrito](../features/006-carrito/) — carrito persistente + confirmar pedido (sin pagos)~~ — ✅                                         | 011 ✅         |
| ~~007~~ | ~~[Pedidos](../features/007-pedidos/) — mis pedidos, gestión admin y listado filtrado~~ — ✅                                              | 012 ✅, 013 ✅ |

### Dependencias entre features front

```
Serie obligatoria: 001 → 002 → 003
Paralelo posible:  004 ∥ 005  (ambas dependen de 001–003)
Serie obligatoria: 004 → 006 → 007
```

> **007 · Pedidos**: las rutas de consulta y gestión están disponibles en back 012 y 013.

## Backlog / aprobación 💡

_Features de **aprobación** — se crean sus carpetas al iniciar la fase. Todas esperan sus endpoints en el back._

- **009 · CRUD Tag** — admin de tags + asociación a producto (back ⏳)
- **010 · Favoritos** — el cliente marca productos favoritos (back ⏳)
- **011 · Reseñas** — puntuación 1–5 + comentario (back ⏳)
- **012 · Abonar pedido** — checkout con pasarela (**Stripe o MercadoPago, decidir al iniciarla**; back ⏳)
- **Ingreso de mercadería** — CRUD/movimiento de stock propuesto como adicional para aprobación; la API ya está implementada en el back, falta su UI.

## Backlog / voluntario 🆓

- Seguimiento de pedido para el cliente (timeline desde `HistorialEstado`; back lo tiene en su backlog).
- Cupón de descuento a nivel pedido.
- Notificación de stock bajo (email/alerta).
- Perfil del cliente para editar sus datos personales; no forma parte del alcance mínimo acordado.

## Pendientes / riesgos del equipo (no son features)

- **Orden acordado (2026-10-14)**: deploy de la página **antes** de iniciar la fase de aprobación. La estrategia de deploy (proveedor, dominio, entorno) todavía no está definida.
- **Tailwind 4 confirmado** (2026-10-04): definitivo; solo cambia si el equipo lo decide de nuevo (entonces actualizar la sección "Estilos" de `tech-stack.md`).
- **`api-contract.md` snapshot** — si el back modifica su contrato, sincronizar [`constitution/api-contract.md`](../constitution/api-contract.md) antes de implementar la feature que lo usa.
- **Evidencia ágil**: GitHub Projects (issues/PRs) + minutas de reuniones (README de la cátedra la exige).

> Cada feature nueva se crea como `features/NNN-nombre/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
