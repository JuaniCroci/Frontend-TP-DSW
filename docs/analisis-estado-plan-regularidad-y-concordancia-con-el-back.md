# Análisis — Estado del plan de regularidad y concordancia con el back

> Fecha del análisis: 2026-10-14 · Repos contrastados: `Frontend-TP-DSW` (front) y `tp-dsw-back00` / [Entreno-2.0-Backend](https://github.com/JuaniCroci/Entreno-2.0-Backend) (back).

## 1. Estado del plan de regularidad (front)

**Roadmap** (`spec/constitution/roadmap.md`): toda la serie 001→007 (+013 imágenes) está marcada ✅ en "Hecho".

**Gates corridos durante el análisis** (verificación de salud):

| Gate             | Resultado                   |
| ---------------- | --------------------------- |
| `pnpm lint`      | ✅ sin errores              |
| `pnpm typecheck` | ✅ sin errores              |
| `pnpm test`      | ✅ 25 archivos, **137/137** |
| `pnpm build`     | ✅ `built in 16.44s`        |

**Backlog de revisión** (`docs/review-backlog.md`): lotes T1–T5 cerrados (2026-10-12), sección "Ingresos" vacía.

**Tareas sin cerrar** (grep de `- [ ]` en toda `spec/features/`):

- **005 · Admin CRUDs** — bloque **F (Ingresos)** completo + bloque **G (Cierre)**: `tasks.md:44-57` (listado/alta/anulación de ingresos, gates, smoke manual, roadmap).
- **002 · Core API+Auth** — `tasks.md:50`: _"Validar login real con backend levantado"_ (smoke manual).

**Inconsistencias de estado detectadas:**

1. `005/spec.md:3` dice _"descuentos e ingresos pendientes"_ → los **descuentos ya están implementados** (bloque E `[x]`). Texto desfasado.
2. El roadmap da 005 por ✅ _"alcance mínimo"_, pero su `tasks.md` sigue abierto por ingresos; y el roadmap al mismo tiempo lista "Ingreso de mercadería" en _Backlog / aprobación_ ("la API ya está implementada en el back, falta su UI"). Hay que definir si 005 cierra sin ingresos o si ingresos entra a la feature.
3. **Regularidad de la cátedra (`proposal.md`)**: CRUD simple ✅ · CRUD dependiente ✅ · listados+detalle ✅ · carrito y entregar/cancelar ✅ — **el alcance mínimo de regularidad está cubierto**; lo que falta es UI de ingresos (aprobación) y smokes manuales.

---

## 2. Concordancia con el back

Contraste de `src/`, `spec/constitution/api-contract.md` y `api-endpoints.md` contra el repo del back (`tp-dsw-back00`, remoto `Entreno-2.0-Backend`).

### 2.1 Endpoints usados vs rutas reales ✅

Todas las llamadas del front apuntan a rutas que existen en el back y usan los filtros correctos:

- **Auth**: `register`, `login`, `logout` ✅ (`/me` y `/refresh` fuera de alcance, documentado en `api-endpoints.md:27`).
- **Productos admin**: `nombre`, `idTipoProducto`, `idMarca`, `idProveedor`, `activo`/`inactivos`, `page`/`size` ✅ (coincide 1:1 con `ProductoController.listAdmin`).
- **Catálogo público**: `precioMin/Max`, `orden`, `dir`, paginación ✅.
- **Maestros**: `includeInactive=true` ✅ (soportado por marcas/tipos/proveedores).
- **Clientes**: `q`, `activo`, `PATCH activar/desactivar` ✅.
- **Carrito**: `GET` con manejo de `404` (`CarritoPage.tsx:15`) ✅, `POST/PUT/DELETE items`, `confirmar` ✅ — `POST /api/carrito` no se usa pero tampoco hace falta (`POST items` crea el carrito si falta).
- **Pedidos**: filtros `desde/hasta/estado/cliente/page/size` ✅, `entregar`/`cancelar` ✅, `mis-pedidos` ✅.
- **Imágenes**: `POST/GET /api/productos/admin/:id/imagenes`, `apiAssetUrl` para `/api/productos/imagenes/:uid` ✅, shape `imagenPrincipal {id: string, url, altText}` ✅.
- **Dinero como `string`** en todos los modelos (`Pedido.ts`, `Carrito.ts`, `Producto.ts`) ✅ · `descuentoAplicado: string | null` ✅ · `passwordHash` ausente ✅ · `429` manejado en `friendlyError.ts:5` ✅.

### 2.2 Divergencias encontradas ⚠️

| #      | Dónde                                | Qué pasa                                                                                                                                                                                                                                                                                                                                                                                                | Severidad            |
| ------ | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **D1** | `spec/constitution/api-contract.md`  | **No es un snapshot idéntico**: front tiene **246 líneas vs 194 del back**. El front agregó localmente las secciones _413_, _Imágenes_, _Descuentos por cantidad_ y _Carrito_ (commits `140ca46`, `20cd02a`); el back **nunca** actualizó su archivo (último cambio: `1ef3bcb`, 2026-09-22). El contenido coincide con el comportamiento real del back, pero se viola la regla "sin ediciones locales". | Required (proceso)   |
| **D2** | `spec/constitution/api-endpoints.md` | **Desactualizado**: no lista los endpoints de imágenes que el back agregó en `958945a` (2026-10-11, `feat: add product image storage`): `GET/POST /api/productos/admin/:id/imagenes` y `GET /api/productos/imagenes/:uid`. Snapshot extraído 2026-10-04.                                                                                                                                                | Required (sync gate) |
| **D3** | Checkout local del back              | `tp-dsw-back00/main` está **1 commit atrás** de `origin/main` (falta `958945a`, imágenes; se hizo `git fetch`). Para correr smoke de imágenes contra el back local hace falta `git pull` allá.                                                                                                                                                                                                          | Nit (entorno)        |
| **D4** | `PedidoDetallePanel.tsx:66`          | Muestra _"Fecha de entrega"_ pero **ningún detalle la trae**: el back explícitamente no expone `fechaEntrega` en `GET /api/pedidos/:id` (spec back 013, `plan.md:48`) ni en `GET /api/mis-pedidos/:id`. El campo siempre renderiza `—`, y en el detalle admin contrasta con la lista admin (`AdminPedidosPage.tsx:254`) que sí la muestra.                                                              | Nit/Required (UI)    |
| **D5** | `api-endpoints.md:33` vs back        | Documenta `GET /api/marcas ?q=` pero `MarcaController.list` solo lee `includeInactive` (el `?q=` existe en la spec del back, no en el código). El front **no** usa `q` → sin impacto funcional.                                                                                                                                                                                                         | Nit (doc)            |
| **D6** | `api-endpoints.md:85-86` vs back     | Marca `GET /api/descuentos(/:id)` como **ADMIN**, pero el back los monta **sin `authenticate`** (público). El front manda token de todos modos → sin impacto.                                                                                                                                                                                                                                           | Nit (doc)            |
| **D7** | `005/spec.md:3` y `tasks.md`         | Estado desfasado (ver punto 1 de la sección 1).                                                                                                                                                                                                                                                                                                                                                         | Nit (docs)           |

### 2.3 Smoke manual

Ningún smoke contra backend real está registrado como hecho (`002/tasks.md:50`, `005/tasks.md:56` pendientes; el roadmap lo reconoce para 002 y 004). La suite de 137 tests pasa con axios mockeado.

---

## 3. Plan propuesto

Antes de tocar nada, el `AGENTS.md` exige registrar hallazgos en `docs/review-backlog.md` → sección "Ingresos". Propuesta, en orden:

1. **Registrar D1–D7 en el backlog** con severidad y lote sugerido (T6).
2. **Sincronizar snapshots** (D2, D5, D6): re-extraer `api-endpoints.md` del back (`git pull` primero en `tp-dsw-back00`) y alinear `api-contract.md` — decidir _hacia dónde_ va la sincronía de D1:
   - **Opción A**: proponerle al back las secciones que el front agregó (imágenes/descuentos/carrito/413) y recién entonces resincronizar desde allá.
   - **Opción B**: dejar el snapshot del front como está y documentar la desviación en el encabezado (dejaría de ser "idéntico sin ediciones").
3. **D4**: quitar el bloque _"Fecha de entrega"_ del `PedidoDetallePanel` (o exponerlo en el back si el equipo lo quiere) + ajustar `Pedido.ts` si hace falta.
4. **Cerrar estado de 005**: definir si ingresos entra a la feature (bloque F) o se mueve a la sección de aprobación del roadmap, y corregir `005/spec.md:3`.
5. **Smokes manuales** con back levantado: login real (002) + admin (005) y, si se quiere, imágenes (requiere D3).
