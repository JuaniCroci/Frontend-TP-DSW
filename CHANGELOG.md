# Changelog

> Historial de cambios del frontend **Entreno 2.0** con fecha, autoría y commits.
> Formato inspirado en el `CHANGELOG.md` del backend, con entradas **fechadas** (el front no maneja semver).
> Orden cronológico inverso. Convención: agregar una entrada al cerrar cada feature o lote
> (ver [`docs/gestion/README.md`](docs/gestion/README.md)).
>
> **Autores:** `JuaniCroci` · `CarlosUBruno` (autores reales según `git log` / GitHub).

---

## 2026-10-15 — Lote T8: fallos de prueba manual (admin + home)

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `94e80ca`

### Feature

- **Home / hero**: el botón "Iniciar sesión" del hero queda oculto con sesión iniciada (`HomePage` ahora usa `useAuth()`).
- **Home / hash**: scroll automático a la sección del hash (`useLocation` + `scrollIntoView`) — el link "Categorías" del header ya desplaza la vista a `#categorias`.
- **Home / categorías**: la sección `#categorias` se genera desde `GET /api/tipos-producto` (estados loading/error/vacío); cada tarjeta es un link a `/productos?idTipoProducto=<id>` en lugar de un `<article>` estático.
- **Admin productos**: `ProductoForm` hace `scrollIntoView` + foco al montar (los botones "Editar" y "Crear producto" ahora llevan al formulario, que se renderiza arriba de todo de la página).

### Decisiones clave

- **M4 (producto creado con `stockInicial: 10` quedó sin stock): NO reproducible.** Evidencia: (a) POST aislado con `stockInicial:10` → BD `stock=10`; (b) reproducción E2E del flujo real (form admin → API real → MySQL) → `stock=10`; (c) cero pedidos/ingresos en BD; (d) `update()` del back nunca toca `stock`. Caso documentado en `docs/review-backlog.md` (M4) y pendiente de confirmación con el usuario.

### Tests

- Nuevo `tests/feature/home-page.feature.test.tsx` (8 tests: hero con sesión, scroll-to-hash por carga directa y por clic, tarjetas dinámicas con loading/error/vacío) y +1 test en `admin-productos.feature.test.tsx` (scroll + foco del form al pulsar Editar), todos con RED verificado por mutación.
- Stub global de `scrollIntoView` en `tests/setup.ts` (jsdom no lo implementa).
- Suite **147/147 (26 archivos)**; gates `lint` + `typecheck` + `build` verdes (2026-10-15).

---

## 2026-10-15 — Historial: CHANGELOG y minutas reconstruidos

**Autor:** JuaniCroci (con OpenCode) · **Commits:** por confirmar

### Feature

- `CHANGELOG.md` (nuevo): entradas fechadas por feature/lote con autoría y hashes, derivadas de `git log`, [`docs/review-backlog.md`](docs/review-backlog.md) y [`spec/constitution/roadmap.md`](spec/constitution/roadmap.md).
- `docs/gestion/minutas.md`: entradas desde el cierre de la 001 (2026-10-04) hasta hoy; la del 2026-10-14 se amplía con el bloque de deploy.
- Convención de actualización documentada en `docs/gestion/README.md` y `AGENTS.md`.

### Decisiones clave

- Fuentes por autoría: sesiones de OpenCode (JuaniCroci) para lo suyo; `git log` con autor para las features de CarlosUBruno (sus sesiones no están en esta máquina).

### Tests

- Sin cambios de código: suite **138/138 (25 archivos)** — `pnpm test` verificado 2026-10-15.

---

## 2026-10-14 — Evidencia de gestión + opciones de deploy (issue #1)

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `978ca92` `9d15448` `f1bc4be`

### Feature

- `docs/gestion/README.md` (nuevo): metodología (Scrum liviano + Kanban, mapeo Scrum→TP, Definition of Done) y trackeo en GitHub Projects (issues #1–#11).
- `docs/gestion/minutas.md` (nuevo): plantilla de minutas + primera entrada (2026-10-14).
- `docs/deploy-opciones.md` (nuevo): 4 opciones de deploy comparadas; **Opción 4 — Render (front + API) + Aiven MySQL free ⭐**; tabla comparativa de free tiers (Aiven vs TiDB); procedimiento paso a paso.

### Decisiones clave

- Issue #1 abierto para decidir el proveedor de deploy **en grupo**; issue #2 (evidencia de gestión) cerrado.
- Asteriscos de la Opción 4: SSL obligatorio (cambio env-driven en `db.ts` del back), sleep del API con ping, imágenes siguen necesitando storage externo.

### Gates

- `lint` · `typecheck` · `format:check` · `test` **138/138** · `build` — verdes en la sesión OpenCode del 2026-10-14 (issue #1 comentado con el hash `f1bc4be`).

---

## 2026-10-14 — Lote T7 · Deuda de formato Prettier

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `8386df5` `adfc414` `9ac96d4`

### Feature

- `pnpm format` (repo-wide): deuda preexistente de Prettier (~97 archivos reportados por `format:check`); 15 archivos con cambios reales, el resto era solo fin de línea.

### Decisiones clave

- `format:check` queda como check **opcional**: no se agrega a los gates de `AGENTS.md` sin decisión del equipo.
- Un solo commit mecánico; lote cerrado en el backlog con fecha y hash.

### Gates

- `lint` · `typecheck` · `test` · `build` verdes tras el formateo; `format:check` en verde.

---

## 2026-10-14 — Lote T6 · Concordancia con el back (D1–D7)

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `770f20b` `769d254` `27825bf` `7da2cc2` `fae9f33` `2aa99a1` `d382437`

### Feature

- `docs/analisis-estado-plan-regularidad-y-concordancia-con-el-back.md` (nuevo): análisis con las divergencias **D1–D7** entre el plan de regularidad y el back.
- **D1**: `api-contract.md` completado en el back (imágenes, descuentos, carrito, 413) y resincronizado como snapshot idéntico en el front (back `d636d58`, front `769d254`).
- **D2/D5/D6**: `api-endpoints.md` re-extraído (rutas de imágenes, `includeInactive` en marcas, `GET` de descuentos públicos).
- **D4**: fuera el bloque "Fecha de entrega" del detalle de pedido — la API no lo expone; se conserva en el listado admin.
- **D7**: feature 005 cerrada (bloques A–E); ingresos de mercadería extraídos como feature de la fase de aprobación.
- Smokes manuales contra backend local: login admin/cliente, autorización, CRUD admin e imágenes end-to-end (registrados en los `tasks.md` de 002 y 005).

### Comportamiento

- `PedidoDetallePanel.tsx` ya no renderiza "Fecha de entrega" (siempre quedaba en `—`).
- Roadmap actualizado con el **orden acordado: deploy antes de iniciar la fase de aprobación**.

### Tests

- `tests/feature/pedidos.feature.test.tsx`: +21 líneas (D4 con TDD: RED → fix → **138/138 GREEN**).

### Gates

- `lint` · `typecheck` · `test` · `build` verdes (criterios de cierre de T6).

---

## 2026-10-13 — Lotes T4 y T5 + docs de enlaces del backend

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `aada99e` `c0bf0f7` `8644df6` `902f8f0` `f0610e7` `b73c207` `44b2b12` `ec5501e` `17912da`

### Feature

- **Lote T4 (cobertura y salud de tests)**: tests del flujo carrito desde el detalle (`producto-detalle.feature.test.tsx` +199), de `AdminHomePage` (+56), fusión de archivos gemelos `login`/`registro`, decisión de **restauración de sesión sin hidratar** fijada con test, higiens (listeners, test tautológico de health, matchers frágiles).
- **Lote T5-2 (estados loading)**: 4 tests nuevos (catálogo, detalle, carrito, admin-productos) con helper `hang()` — los estados ya estaban unificados; faltaba probarlos.
- **Lote T5-1 (logout real)**: `AuthProvider.logout()` async y best-effort contra `POST /api/auth/logout` + 2 tests en `auth-provider.unit.test.tsx`.
- **Docs**: enlaces del backend corregidos en `AGENTS.md`, `README.md`, `spec/` tras el renombre (`Entreno-2.0-Backend` / `Backend-TP-DSW-viejo`).

### Decisiones clave

- **Corrección de verificación**: el "logout bloqueado en backend" estaba mal — se había verificado contra `Backend-TP-DSW`, un prototipo viejo sin módulo auth; el back real (`tp-dsw-back00`) ya tenía `POST /api/auth/logout` (`f0610e7`, cierre anotado en `b73c207`).

### Tests

- `producto-detalle.feature.test.tsx` (+199), `admin-home.feature.test.tsx` (+56), `auth-provider.unit.test.tsx` (+63), `login-page`/`register-page` consolidados, `api-401.unit.test.ts` (+15).

---

## 2026-10-13 — Feature 007 · Pedidos

**Autor:** CarlosUBruno · **Commits:** `9aed091`

### Feature

- `src/app/features/orders/`: `MisPedidosPage.tsx` (historial del cliente), `AdminPedidosPage.tsx` (listado filtrado admin), `PedidoDetallePanel.tsx`, `api/queries.ts` + `api/mutations.ts`.
- `src/app/models/Pedido.ts`: `PedidoList`, `PedidoDetalle`, `EstadoPedido` y relacionados.
- Rutas `/mis-pedidos` (cliente) y panel de pedidos en el admin (`adminSections.ts`); link en el `Header`.
- Spec de la feature: `spec/features/007-pedidos/{spec,plan,tasks}.md`.

### Tests

- `tests/feature/pedidos.feature.test.tsx` (nuevo, +223 líneas) + ajuste de `admin-home.feature.test.tsx`.

---

## 2026-10-12 — Sync con el compañero + backlog de revisión + lotes T1–T3

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `be1c50b` `d2eec3f` `0489c5a` `5173e73` `fb0ffb2` `1e8d321` `d2de79f` `977b8b7` `4f46edc`

### Feature

- **Reconciliación de la 002**: WIP local commiteado (`be1c50b`) y `pull --rebase` sobre los 7 commits de CarlosUBruno; 10 conflictos resueltos entre las dos implementaciones paralelas de 002; se elimina `ProtectedRoute` local y los tests se adaptan (`d2eec3f`).
- **`docs/review-backlog.md` (nuevo)**: análisis multi-eje con 4 revisiones en paralelo (admin · catálogo/imágenes/carrito · shell/auth · modelos+tests) — veredicto 0 críticos · ~20 required (`0489c5a`).
- **Lote T1 (bugs de correctividad, P0)**: 11 fixes — `useDebounce`, `apiAssetUrl` con path, storage corrupto del auth, campos opcionales editables, reactivar descuento sin perder campos, `state.from` en `AdminRoute`, descuento `"0.00"`, reset del detalle al navegar, borrado del botón demo de fotos (`5173e73`).
- **Lote T2 (reglas de la cátedra)**: `cn()` con `clsx` + `tailwind-merge`, paleta unificada, named exports, handlers `handle<Evento>`, auth tipada, docs desfasadas (`1e8d321`).
- **Lote T3 (refactors)**: descomposición de páginas admin (872/576/415/387 líneas → form + modales), helpers únicos (`getApiMessage`, `formatMoney`), modelos unificados en `RespuestaLista<T>`, componentes shared (`AdminModal` con Escape/focus trap, `AdminBanner`, `EstadoBadge`), `adminSections.ts`, code splitting del subárbol `/admin` (`977b8b7`).

### Decisiones clave

- Backlog con **prioridad sobre trabajo nuevo**; los hallazgos nuevos pasan por "Ingresos" antes de arreglarse.
- Convenciones resueltas con el equipo: queryKeys en **español**; `data-testid` solo donde el test lo necesita; handlers `handle<Evento>` (excepción `handleFormSubmit` en RHF).
- Split **T4/T5** acordado: tests puros al T4, mejoras de UI al T5.
- Restauración de sesión **sin hidratar** desde el backend (decisión fijada con test en T4).

### Tests

- `use-debounce.unit.test.ts` (+60), `catalogo.feature.test.tsx` (+88), `admin-modal.feature.test.tsx` (+109), helpers `axios-adapter.ts`/`session.ts` nuevos, `cn.unit.test.ts`, `friendly-error.unit.test.ts`.

---

## 2026-10-12 — Feature 006 · Carrito y gestión de descuentos

**Autor:** CarlosUBruno · **Commits:** `20cd02a`

### Feature

- `src/app/features/cart/`: `CarritoPage.tsx`, `api/queries.ts` + `api/mutations.ts`, guard `ClientRoute`.
- `src/app/features/admin/pages/AdminDescuentosPage.tsx` (+576) + `descuentosQueries`/`descuentosMutations` + modelo `AdminDescuento`.
- `src/app/models/Carrito.ts`; detalle de producto con cantidad y aviso de carrito.
- Spec: `spec/features/006-carrito/{spec,plan,tasks}.md`; sección de descuentos/carrito agregada al `api-contract.md` (+35).

### Tests

- `admin-descuentos.feature.test.tsx` (nuevo, +284), `carrito.feature.test.tsx` (nuevo, +225), `app-shell.feature.test.tsx` (+86), ajustes en `catalogo`.

---

## 2026-10-11 — Features 013 (imágenes), 005 (productos) y registro público

**Autor:** CarlosUBruno · **Commits:** `140ca46` `8d91abe` `d9779e3`

### Feature

- **013 · Imágenes de productos** (`140ca46`): `ProductoImagenesPanel.tsx` (upload con metadatos, historial, `esPrincipal`), `ProductoImagen.tsx` en catálogo/detalle, `apiAssetUrl()` en `api.client.ts`, asset de referencia; spec `013-imagenes-productos`.
- **005 · Gestión admin de productos** (`8d91abe`): `AdminProductosPage.tsx` (+859) con ABM, `productosQueries`/`productosMutations`, modelo `AdminProducto`.
- **Registro público de clientes** (`d9779e3`): `RegisterPage.tsx` (+172) y ajustes de `AdminClientesPage`/`Header`.

### Tests

- `admin-productos.feature.test.tsx` (+373 y +66), `registro.feature.test.tsx` (nuevo, +145), `admin-clientes.feature.test.tsx` (+27), `catalogo` (+12).

---

## 2026-10-10 — Feature 005 · Gestión administrativa de clientes

**Autor:** CarlosUBruno · **Commits:** `3fa506e`

### Feature

- `AdminClientesPage.tsx` (+457): listado con filtros `q`/`activo`/`inactivos`, alta/edición/baja.
- `admin/api/clientesQueries.ts` + `clientesMutations.ts`, modelo `AdminCliente`, link en `AdminHomePage`.

### Tests

- `admin-clientes.feature.test.tsx` (nuevo, +242).

---

## 2026-10-09 — Features 003/004/005 · Layout shell, catálogo y panel de administración

**Autor:** CarlosUBruno · **Commits:** `900f95c`

### Feature

- **003 · Layout shell**: `MainLayout`/`Header`/`Footer`, `AdminLayout` con sub-nav, guard `AdminRoute`, fallback `*` → `/`.
- **004 · Catálogo**: `CatalogoPage.tsx` (+301) con filtros y paginación en la URL, `ProductoDetallePage.tsx`, `products/api/queries.ts`.
- **005 · Panel admin**: `AdminHomePage`, `AdminMasterPage.tsx` (+387) para los maestros (tipo/marca/proveedor), `AdminCatalogoPages`, `admin/api/{queries,mutations}`.
- Modelos `Producto`/`AdminCatalogo`; specs de 003/004/005.

### Tests

- `admin-catalogo.feature.test.tsx` (nuevo, +362), `catalogo.feature.test.tsx` (+210), `app-shell.feature.test.tsx` (+94), `auth-provider.unit.test.tsx` (+70), `login.feature.test.tsx` (+59).

---

## 2026-10-06 — Feature 002 · Core API + Auth

**Autor:** CarlosUBruno · **Commits:** `8381a12`

### Feature

- `src/app/core/auth/`: `AuthContext.tsx` + `AuthProvider.tsx` (sesión en `localStorage`), `features/auth/pages/LoginPage.tsx`.
- Spec `spec/features/002-core-api-auth/{spec,plan,tasks}.md`.

### Tests

- Ajuste de `app-shell.feature.test.tsx`; los tests de sesión/login/registro/guards llegaron después: con el WIP reconciliado (2026-10-12, `be1c50b`/`d2eec3f`) y los lotes T1–T4.

---

## 2026-10-04 — Feature 001 · Setup, constitución SDD y puente con la API

**Autor:** JuaniCroci (con OpenCode) · **Commits:** `0fa39b3` `ee5c9b7`

### Feature

- Constitución SDD: `spec/constitution/*` (mission, tech-stack, roadmap, coding-playbook, engineering-loop, api-contract, api-endpoints) + `spec/features/001-setup/`.
- Tooling: ESLint flat, Prettier, Vitest, CI (`.github/workflows/ci.yml`), scripts de `package.json`, `.env.example`.
- Puente HTTP: `src/app/core/api/api.client.ts` + `apiError.ts` e interceptores; skills de proceso en `.agents/skills/`.
- Documentación: `AGENTS.md`, `README.md`, `proposal.md`.

### Tests

- `api-client.unit.test.ts` (+60), `api-error.unit.test.ts` (+82), `health.feature.test.tsx`, `app-shell.feature.test.tsx`.

### Gates

- **CI: run #1 verde** (`ee5c9b7`) — cierre total de la feature.

---

## 2026-06-30 — Scaffold del proyecto

**Autor:** JuaniCroci · **Commits:** `a42bab6` `906d120` `ff3c0dc`

### Feature

- Scaffolding Vite + React 19 + TypeScript con pnpm (`.nvmrc`), estructura `src/app/` con carpetas feature vacías (`AGENTS.md` original), `README`, `TECH.md`, lockfile y configuración de TS/Vite.
