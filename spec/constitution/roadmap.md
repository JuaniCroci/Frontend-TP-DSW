# Roadmap

Orden y estado de las features **del frontend**. Cada entrada apunta a su carpeta en `features/`.

La columna **Back** indica qué feature del backend necesita esa UI:
✅ = implementada en el back · ⏳ = pendiente en el back (no arrancar hasta que esté).

## Hecho ✅

1. **[001 · Setup y puente con la API](../features/001-setup/)** — constitución SDD + skills del back, tooling (ESLint, Prettier, Vitest, CI) y puente HTTP (`apiClient` + interceptores + 15 tests). Smoke: `GET /api/health` → 200. **⚠ CI pendiente de primer push verde** (único criterio abierto).

## En orden (regularidad)

| #       | Feature                                                                                                       | Back               |
| ------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| ~~001~~ | ~~[Setup y puente con la API](../features/001-setup/)~~ — ✅                                                  | 001 ✅             |
| 002     | [Core API + Auth](../features/002-core-api-auth/) — client, interceptors, AuthContext, guards, login/registro | 002 ✅             |
| 003     | [Layout shell](../features/003-layout-shell/) — router, MainLayout, header, home                              | —                  |
| 004     | [Catálogo](../features/004-catalogo-productos/) — listado con filtros + detalle                               | 007 ✅, 010 ✅     |
| 005     | [Admin CRUDs](../features/005-admin-cruds/) — marca, tipo, proveedor, cliente, producto, descuento, ingreso   | 003–009 ✅         |
| 006     | [Carrito](../features/006-carrito/) — carrito persistente + confirmar pedido                                  | 011 ✅             |
| 007     | [Pedidos](../features/007-pedidos/) — mis pedidos, gestión admin, listado filtrado                            | 012 ✅, **013 ⏳** |
| 008     | [Perfil](../features/008-perfil/) — datos del cliente                                                         | 002 ✅             |

### Dependencias entre features front

```
Serie obligatoria: 001 → 002 → 003
Paralelo posible:  004 ∥ 005  (ambas dependen de 001–003)
Serie obligatoria: 004 → 006 → 007
008 puede ir en paralelo con 006/007
```

> **007 · Pedidos**: `mis pedidos` y `gestión admin` se habilitan con back 012 ✅; el `listado filtrado` de admin depende de back **013 ⏳**. Si 013 sigue pendiente al llegar a 007, implementar lo que 012 habilita y dejar el listado de 013 en su propia tarea dentro de `tasks.md` (marcada como bloqueada), sin cerrar la feature.

## Backlog / aprobación 💡

_Features de **aprobación** — se crean sus carpetas al iniciar la fase. Todas esperan sus endpoints en el back._

- **009 · CRUD Tag** — admin de tags + asociación a producto (back ⏳)
- **010 · Favoritos** — el cliente marca productos favoritos (back ⏳)
- **011 · Reseñas** — puntuación 1–5 + comentario (back ⏳)
- **012 · Abonar pedido** — checkout con pasarela (**Stripe o MercadoPago, decidir al iniciarla**; back ⏳)

## Backlog / voluntario 🆓

- Seguimiento de pedido para el cliente (timeline desde `HistorialEstado`; back lo tiene en su backlog).
- Cupón de descuento a nivel pedido.
- Notificación de stock bajo (email/alerta).

## Pendientes / riesgos del equipo (no son features)

- **Tailwind 4 tentativo** — confirmar con el equipo; si cambia, es solo la sección "Estilos" de `tech-stack.md`.
- **`api-contract.md` snapshot** — si el back modifica su contrato, sincronizar [`constitution/api-contract.md`](../constitution/api-contract.md) antes de implementar la feature que lo usa.
- **Evidencia ágil**: GitHub Projects (issues/PRs) + minutas de reuniones (README de la cátedra la exige).

> Cada feature nueva se crea como `features/NNN-nombre/` con `spec.md`, `plan.md` y `tasks.md` antes de tocar código.
