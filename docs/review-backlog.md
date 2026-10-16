# Backlog de revisión — prioridad sobre trabajo nuevo

> **Origen**: análisis multi-eje de las features 002–013 mergeadas (2026-10-12) — 4 revisiones en paralelo (admin · catálogo/imágenes/carrito · shell/auth · modelos+tests) contrastadas contra `spec/constitution/api-contract.md`, `coding-playbook.md` y `AGENTS.md`.
> **Veredicto del análisis**: 0 Críticos · ~20 Required · resto Nits/Optional. Fondos sólidos (dinero `string`, `{data,total}`, guards, tests de comportamiento); deuda concreta y arreglable.

## Regla de prioridad

1. **Todo agente lee este archivo antes de arrancar cualquier tarea.** Los ítems `[ ]` pendientes tienen **prioridad sobre trabajo nuevo** (features, mejoras propias), salvo indicación explícita en contrario del usuario.
2. Al ejecutar un lote completo: gates verdes (`pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`), commitear y marcar `[x]` con fecha y hash.
3. **Hallazgos nuevos** detectados en cualquier momento se agregan en "Ingresos" con severidad **antes** de arreglarlos por cuenta propia.

## Estado

| Lote   | Alcance                                  | Prioridad | Estado                                       |
| ------ | ---------------------------------------- | --------- | -------------------------------------------- |
| **T1** | Bugs de correctividad + fuera de alcance | P0        | ✅ cerrado (2026-10-12, `5173e73`)           |
| **T2** | Reglas de la cátedra (playbook)          | P1        | ✅ cerrado (2026-10-12, `1e8d321`)           |
| **T3** | Refactors y duplicación                  | P2        | ✅ cerrado (2026-10-12)                      |
| **T4** | Cobertura y salud de tests               | P2        | ✅ cerrado (2026-10-12, `aada99e`)           |
| **T5** | Mejoras de UI y comportamiento (ex T4-7) | P2        | ✅ cerrado (T5-1 `f0610e7` + T5-2 `8644df6`) |
| **T6** | Concordancia con el back (D1–D7)         | P1        | ✅ cerrado (2026-10-14)                      |
| **T7** | Deuda de formato Prettier (repo-wide)    | P2        | ✅ cerrado (2026-10-14)                      |
| **T8** | Fallos de prueba manual (admin + home)   | P1        | ✅ cerrado (2026-10-15) `94e80ca`           |

---

## Lote T1 · Bugs de correctividad [P0]

- [x] **1.** `src/app/features/products/pages/CatalogoPage.tsx:227-233` — Página fuera de rango (`?page=99` o `total` que se achica): muestra "Todavía no hay productos" (mensaje falso) y **esconde la paginación** (sin "Anterior" el usuario queda pátinado). Bifurcar `total === 0` (vacío real + CTA "Limpiar filtros") vs `total > 0 && data.length === 0` (fuera de rango + "Ir a la página 1"); renderizar el `<nav>` siempre que `total > 0`.
- [x] **2.** `src/app/features/products/pages/CatalogoPage.tsx:241` — "Página X de Y" usa el `page` pedido, no el del wrapper `{data,total,page,size}` → muestra "Página 99 de 2" si el back clampa. Usar `productos.data?.page ?? filters.page`.
- [x] **3.** `src/app/core/api/api.client.ts:20-22` — `apiAssetUrl` con `new URL(path, baseURL)` **no concatena como axios**: con `VITE_API_URL` con path (`/api`) pierde el path en silencio → imágenes rotas. Cambiar a `apiClient.getUri({ url: path })` + tests unitarios en `tests/unit/api-client.unit.test.ts` (base con/sin path, ruta relativa/absoluta).
- [x] **4.** `src/app/core/auth/AuthProvider.tsx:10-13` — `JSON.parse(entreno_user)` sin `try/catch` ni validación de shape → storage corrupto = **pantalla blanca en el mount**. Extraer `readStoredUser()` con guard (`id: number`, `nombre/email: string`, `rol` válido); si falla → `removeItem` + `null`. Test de storage corrupto.
- [x] **5.** `src/app/features/admin/components/AdminMasterPage.tsx:82-85` — `cleanedData` filtra todo `''` → **imposible limpiar un campo opcional** en edición (teléfono/descripción). Enviar `null` explícito para campos que pasaron de valor a vacío. Test: "limpiar teléfono de proveedor".
- [x] **6.** `src/app/features/admin/pages/AdminDescuentosPage.tsx:122-135` — "Activar" manda `PUT {activo}` solo: si el back es full-replace, **reactivar borra los campos** (`api-contract.md:194-196`). Enviar el payload completo desde la fila (seguro en ambos casos) + **test de reactivación** (hoy no existe).
- [x] **7.** `src/app/features/admin/pages/AdminClientesPage.tsx:21,253-261` — `q` dispara **un request por tecla** contra `/api/clientes`. Crear `src/app/shared/hooks/useDebounce.ts` (AGENTS.md ya lo presume) y debounced. Test con fake timers.
- [x] **8.** `src/app/core/guards/AdminRoute.tsx:7` — Redirige a `/login` **sin `state.from`** → el ADMIN pierde el deep-link tras re-login (ClientRoute sí lo guarda). Mismo patrón: `state={{ from: location.pathname }}`.
- [x] **9.** `src/app/features/cart/pages/CarritoPage.tsx:105-109` — `descuentoAplicado` truthiness: `"0.00"` imprime "(0.00% de descuento)". No pintar si es `null` o `"0.00"` (comparación de string, sin aritmética). Test ambos casos.
- [x] **10.** `src/app/features/products/pages/ProductoDetallePage.tsx:23-25` — `cantidad`/`cartNotice`/`cartError` sobreviven al navegar detalle→detalle (cantidad/aviso del producto anterior). Resetear al cambiar `productoId`.
- [x] **11.** `src/app/features/admin/components/ProductoImagenesPanel.tsx:84-94,160-166` — **Fuera de alcance**: botón "Usar foto de referencia de creatina" con `fetch()` crudo (única red fuera de `api/`), hardcodeado a un producto, ausente de `spec/013`. Borrar botón + `selectReferencePhoto` + el bloque canónizado en `tests/feature/admin-productos.feature.test.tsx:375-398` (conservar el test del upload por `input[type=file]`).

---

## Lote T2 · Reglas de la cátedra [P1]

- [x] **1.** `cn()` inexistente (playbook §5.3 lo exige desde 003): agregar `clsx` + `tailwind-merge`, crear `src/app/shared/utils/cn.ts` y migrar variantes con template literals (`AdminLayout.tsx:23-28`, `HomePage.tsx:102`, `CatalogoPage.tsx:265-271`, `ProductoDetallePage.tsx:76-84`). Si el equipo decide no usarlo → documentar la desvío en `plan.md` de 003.
- [x] **2.** Paleta partida: `@theme` declara `brand-*` (naranja) pero todo el shell/admin usa `lime-*`. **Decidir la marca** (migrar `lime` → `brand` o exponer acentos como tokens) y **borrar CSS muerto** de `src/index.css`: `.label-campo`, `.input-campo`, `.mensaje-error` (0 usos) + tokens/componentes sin uso.
- [x] **3.** `export default` en componentes (solo páginas lo usan): `products/components/ProductoImagen.tsx:11`, `admin/components/ProductoImagenesPanel.tsx:29` → named export + ajustar imports.
- [x] **4.** Breakpoints fuera de regla (`solo sm:/md:/lg:`): `CatalogoPage.tsx:244` (`xl:grid-cols-4`), `admin/pages/AdminHomePage.tsx:46` (`xl:grid-cols-3`) → `lg:`.
- [x] **5.** `admin/pages/AdminCatalogoPages.tsx` — 3 páginas en un archivo con named export → una por archivo con `export default` (ajustar `App.tsx:14-18`). Ídem `ProductoImagenesPanel` usa default export (inverso del caso 3).
- [x] **6.** **Código muerto** (grep verificado): `features/auth/api/mutations.ts` (`useRegister`), `models/Auth.ts` (`RegisterInput`, `AuthResponse`), `shared/utils/fieldErrors.ts` (`detailsToFieldErrors`), `shared/components/Spinner.tsx`, clases del caso 2. La mayoría se salva usándolos: `RegisterPage.tsx:51` debe llamar `useRegister()` (hoy hace `apiClient.post` directo, fuera del patrón `api/`), tipar la respuesta como `AuthResponse`, mapear `details` con `detailsToFieldErrors` y borrar el `DatosRegistro` local.
- [x] **7.** Docs desfasadas por el sync: `AGENTS.md` (structure `core/auth` y §9: `ProtectedRoute` → `ClientRoute`/`AdminRoute`; provider en `App.tsx`, no `main.tsx`), `spec/constitution/tech-stack.md:25`, `spec/constitution/coding-playbook.md:205-206`.
- [x] **8.** **Decisión de convention** (anotar el resultado acá): (a) queryKeys con acción en inglés (`'list'`) vs playbook (`'listado'`); (b) `data-testid`: 0 usos en `src/` vs playbook §4 — ¿alinear el texto ("solo donde el test lo necesite") o agregar testids; (c) handlers `applyFilters`/`submit` vs `handle<Evento>`.
- [x] **9.** Casting en el punto de la sesión: `AuthProvider.tsx:37-38` (`response.data.token as string`) → `apiClient.post<AuthResponse>` + validación de shape. Ídem `location.state as` en `LoginPage.tsx:11,25` → un solo tipo `LoginState`.
- [x] **10.** `AdminRoute` sin `from` ya está en T1-8; acá queda el test `login-page` de open-redirect (`from: '//evil.com'` → cae en `/`, guard ya escrito pero sin cubrir).

**Decisiones de convención (T2-8, resueltas 2026-10-12 con el equipo):**

- **(a) queryKeys → español.** Se migró el código a `'listado'`/`'detalle'` (5 factories de keys) para cumplir el playbook §1 (línea 30, que incluye queryKeys en los nombres del contrato) sin tocar la spec.
- **(b) `data-testid` → sin cambios.** El texto del playbook §4 ya es el correcto ("solo donde el test lo necesite; no decorar todo el árbol") y los tests usan queries accesibles por roles/labels. No se agregan testids de forma rutinaria.
- **(c) handlers → `handle<Evento>`.** Se renombró el código existente. Excepción documentada: en formularios con React Hook Form el submit local se llama `handleFormSubmit` (no `handleSubmit`, que es nombre reservado de RHF); los helpers puros (`fieldError`, `buildPayload`, `buildQueryParams`, `formatPrice`...) **no** llevan prefijo `handle` porque no son handlers.

---

## Lote T3 · Refactors y duplicación [P2]

- [x] **1.** Descomponer páginas grandes: `AdminProductosPage.tsx` (872) → `ProductoForm.tsx` + `ProductoDetalleModal.tsx` + `ProductoFiltersForm.tsx` (~300 restantes); `AdminDescuentosPage.tsx` (576) → `AplicacionesDescuentoModal.tsx`; `AdminClientesPage.tsx` (415) → `ClienteForm` + `ClienteDetalleModal`; `AdminMasterPage.tsx` (387) → form + modal.
- [x] **2.** Duplicación copy-paste: `getApiMessage` **×5 con 3 nombres** (`AdminProductosPage:49`, `AdminMasterPage:36`, `AdminClientesPage:16`, `AdminDescuentosPage:34`, `ProductoImagenesPanel:25`) → un helper único (recomendado: delegar en `friendlyErrorMessage`). `formatPrice` **×4** → `shared/utils/formatMoney.ts`.
- [x] **3.** Bloques de UI repetidos en 4 páginas (banner éxito/error, badge de estado, esqueleto de tabla, modal) → `shared/components/`: `BadgeEstado`, `AdminBanner`, `AdminModal` (con Escape + focus trap, ver 6) + clases `@layer components` del playbook §5.4.
- [x] **4.** Modelos duplicados (playbook §3 "nunca se redefine un interface"): `Marca`/`TipoProducto` en `Producto.ts` **y** `AdminCatalogo.ts`; `ImagenPrincipalProducto` en `Producto.ts` **y** `AdminProducto.ts`; `DescuentoVigente ≡ AdminDescuento`; **6 variantes** del wrapper `{data,total}` → un `RespuestaLista<T>` único y un archivo por tipo. _Antes de la feature 007 (pedidos), que agregaría la séptima_.
- [x] **5.** `tests/`: helper compartido del adapter axios (`response()`/`requestBody()`/`saveSession()` copy-pasteados en **13 archivos**) → `tests/helpers/axios-adapter.ts` + `tests/helpers/session.ts`.
- [x] **6.** Modales con `aria-modal` sin Escape/focus trap/foco inicial: `ProductoImagenesPanel:100`, `AdminProductosPage:770`, `AdminMasterPage:325`, `AdminDescuentosPage:401` → resolver con el `AdminModal` compartido del punto 3.
- [x] **7.** Duplicación/semántica: secciones admin duplicadas (`AdminLayout.tsx:3-11` vs `AdminHomePage.tsx:3-34`) → `features/admin/adminSections.ts`. Landmark `<main>` inconsistente (solo 2 páginas admin lo usan) → `AdminLayout` envuelve `<Outlet/>` en `<main>` y las páginas usan `<section>`.
- [x] **8.** Menores agrupados: invalidaciones redundantes (`productosMutations.ts:71-78`); `img` sin `loading="lazy"`/`decoding` (`ProductoImagen.tsx:29`, historial de `ProductoImagenesPanel`); historial sin fallback `onError`; placeholder `aria-hidden` sin label (`ProductoImagen.tsx:17-24`); `formatSize` siempre en KiB (`ProductoImagenesPanel:21`); `key={searchParams.toString()}` opaco + foco perdido en `CatalogoPage:95`; `?` vacío en links (`CatalogoPage:248`); acoplamiento `products ↔ cart` (`ProductoDetallePage:4`); `spec/013/spec.md` con criterios `[ ]` marcado "implementada".
- [x] **9.** Performance/bundle (opcional, alto impacto): `App.tsx` sin code splitting → `lazy()` del subárbol `/admin` (aprovecha el `Spinner` existente) y de login/registro. Bundle actual: 453 kB.

---

## Lote T4 · Cobertura y salud de tests [P2]

- [x] **1.** **`POST /api/carrito/items` desde el detalle** — el flujo principal de 006, prometido en `spec/features/006-carrito/plan.md:27` y marcado `[x]`, **no tenía ningún test** → `tests/feature/producto-detalle.feature.test.tsx` (body `{idProducto,cantidad}`, cantidad por defecto 1, éxito + link "Ver carrito", error 409 de stock). Verificado por mutación.
- [x] **2.** **`AdminHomePage`**: cero tests (solo se prueba como destino de guard) → `tests/feature/admin-home.feature.test.tsx` (encabezado, hrefs de las 6 secciones sin autorreferencia, contenido de tarjetas). Verificado por mutación.
- [x] **3.** **Decisión + test de restauración de sesión** — **resuelto 2026-10-12: se mantiene SIN hidratar (correcto, no un descuido)**. Motivos: (a) el backend es la autoridad — el token se revalida en cada request y el interceptor 401 ya cierra la sesión vencida (`api-401.unit.test.ts`); (b) `GET /api/auth/me` quedó fuera a propósito en la feature 002 (la alternativa con `/me` estaba en `backup/local-wip`, rama eliminada el 2026-10-12 tras revisión, ver `spec/features/002-core-api-auth/spec.md:44`). Riesgo residual solo cosmético: nombre/rol viejos si cambian sin re-login (un ADMIN degradado vería la UI admin pero sus requests fallarían 403 — sin fuga de datos). Test `auth-provider.unit.test.tsx` "restaura la sesión guardada sin consultar al backend" fija el comportamiento: si alguien agrega hidratación, el test obliga a actualizar la decisión.
- [x] **4.** `tests/setup.ts` — `afterEach(() => cleanup())` global con guard `typeof document !== 'undefined'` (5 archivos corren en environment `node` sin DOM; las llamadas manuales a `cleanup()` quedan redundantes y se eliminan al tocar cada archivo).
- [x] **5.** `tests/feature/catalogo.feature.test.tsx` — hardcodeo `http://localhost:3000/...` → `apiAssetUrl()` (deriva del baseURL); matcher frágil del precio → regex exacto `/\$\s*12\.500,00/` (tolera el NBSP de `Intl`).
- [x] **6.** Consolidar archivos gemelos: `login.feature` ⊂ `login-page.feature` y `registro.feature` ≈ `register-page.feature` → 4 archivos → 2 (`git rm` de los borrados). Absorbidos: estado "Ingresando..." con promise colgada y el e2e de registro (body con `telefono`, request único); los 2 tests descartados eran duplicados exactos. 13 tests en 4 archivos → 11 en 2.
- [x] **7.** Huecos medios — **split acordado con el equipo (2026-10-12)**: los tests puros entraron a T4, las mejoras de UI son el **lote T5**:
  - ✅ Tests agregados (verificados por mutación 6/6): 404 en `ProductoDetallePage`; rama de error del listado admin (503 + `Reintentar`); paginación `Anterior`/`Siguiente` en admin-productos (pide la página al backend + estados de botones); edición de tipo/proveedor al editar un producto (envía `idTipoProducto`/`idProveedor`); confirmación de carrito fallando con 400 → mensaje del servidor.
  - ✅ Ya cubiertos antes: `from: '//evil.com'` (`login-page.feature.test.tsx:168`) y storage corrupto en AuthProvider (T1-4 + tests existentes).
  - → **T5**: logout real, estados loading (ver lote T5 más abajo).
- [x] **8.** Higiens: listeners de `auth:session-expired` removidos en `afterEach` de `api-401.unit.test.ts` (`trackSessionExpired()`); test tautológico de `health.feature.test.tsx` borrado (conservado el 503, que sí prueba `toApiError`); `app-shell` con adapter default que lanza `Request inesperado` (sin red real si `HomePage` se vuelve dinámico); matcher frágil `getByText(content => ...)` → regex; `getAllByLabelText('Marca')[0]` → `aria-label` en ambos `<form>` (fix de a11y: landmarks con nombre) + helper `formProducto()` con `within()`.

---

## Lote T5 · Mejoras de UI y comportamiento (ex T4-7) [P2]

> Split acordado al cerrar T4: acá vive solo lo que **falta implementar** (no es cobertura de tests).

- [x] **1.** **Logout real** — **cerrado 2026-10-12**. ⚠️ **Corrección de la verificación previa** (la nota de "bloqueado en backend" estaba mal): se había verificado contra **`Backend-TP-DSW`, que es un prototipo viejo sin módulo auth** — el back real es **`tp-dsw-back00` (`Entreno-2.0-Backend`)** y **ya tenía** `POST /api/auth/logout` (`src/modules/auth/auth.routes.ts:23`: `authenticate` → revoca los refresh tokens del usuario → `204`); `api-endpoints.md` §002 también lo documentaba (junto a `/api/auth/refresh`). Implementación: `AuthProvider.logout()` ahora es async y best-effort — `await apiClient.post('/api/auth/logout').catch(...)` y **siempre** limpia la sesión local (el interceptor de `api.client.ts` ya excluye `/api/auth/` del manejo de 401, así que un token vencido no dispara "sesión expirada"). Tests: 2 nuevos en `auth-provider.unit.test.tsx` (invoca el endpoint y limpia; se limpia aunque falle) con RED por mutación (M1 quitar el POST → 2 fallas; M2 quitar el catch → 1 falla + unhandled rejection); adaptación de `app-shell.feature.test.tsx` (logout async → `findByRole`). Commit `f0610e7`.
- [x] **2.** **Estados loading** — auditado 2026-10-12: **ya estaban unificados** en todas las pantallas asíncronas (`role="status"` + "Cargando X…" en catálogo, detalle, carrito, los 6 listados admin y todos los modales) y todos los botones primarios tienen pending (`disabled` + texto: "Ingresando…", "Creando cuenta…", "Guardando…", "Confirmando pedido…", "Agregando…") — el "solo login los tiene" del análisis original ya no aplicaba. Faltaba testeo → 4 tests nuevos (catálogo, detalle, carrito, admin-productos) con helper `hang()`; RED verificado por mutación (6/6: los 4 nuevos por `Unable to find role="status"` + 2 colaterales existentes). Commit `8644df6`.

---

## Ingresos (hallazgos nuevos)

> Agregar acá con fecha, `archivo:línea`, severidad (Critical/Required/Nit) y lote sugerido. Nada se arregla sin pasar primero por esta lista.

### Lote T6 · Concordancia con el back (ingresado 2026-10-14, análisis completo en [`analisis-estado-plan-regularidad-y-concordancia-con-el-back.md`](./analisis-estado-plan-regularidad-y-concordancia-con-el-back.md))

- [x] **D1 · Required (proceso)** — `spec/constitution/api-contract.md` **no es un snapshot idéntico**: front 246 líneas vs back 194. El front agregó localmente las secciones `413`, _Imágenes_, _Descuentos por cantidad_ y _Carrito_ (commits `140ca46`, `20cd02a`); el back nunca las agregó a su archivo. **Resolución decidida (A)**: sumar esas secciones al `api-contract.md` del repo back, commitear allá y resincronizar el snapshot del front. ✅ 2026-10-14 (back `d636d58`, front `769d254`).
- [x] **D2 · Required (sync gate)** — `spec/constitution/api-endpoints.md` desactualizado: no lista los endpoints de imágenes agregados en el back en `958945a` (2026-10-11): `GET /api/productos/imagenes/:uid`, `GET/POST /api/productos/admin/:id/imagenes`. Snapshot extraído 2026-10-04. ✅ 2026-10-14 (`769d254`).
- [x] **D3 · Nit (entorno)** — `tp-dsw-back00/main` está 1 commit atrás de `origin/main` (falta `958945a`, imágenes). Requiere `git pull` allá antes del smoke de imágenes. ✅ 2026-10-14 (`git pull --ff-only`).
- [x] **D4 · Required (UI)** — `src/app/features/orders/components/PedidoDetallePanel.tsx:66` muestra _"Fecha de entrega"_ pero el back **no expone** `fechaEntrega` en `GET /api/pedidos/:id` ni `GET /api/mis-pedidos/:id` (omisión deliberada en su spec 013, `plan.md:48`) → el campo siempre renderiza `—`, y contrasta con la lista admin (`AdminPedidosPage.tsx:254`) que sí la trae. **Resolución decidida (A)**: quitar el bloque del panel en el front (la cátedra la exige en el listado, no en el detalle); conservar `fechaEntrega` en `PedidoResumen` para la lista. ✅ 2026-10-14 (`27825bf`, TDD: test RED → fix → 138/138 GREEN).
- [x] **D5 · Nit (doc back)** — `api-endpoints.md:33` documenta `GET /api/marcas ?q=` pero `MarcaController.list` solo lee `includeInactive` (el `?q=` está en la spec 003 del back, no en su código). El front no usa `q`. **Resolución decidida (A)**: corregir la spec del back y re-extraer el catálogo. ✅ 2026-10-14 (back `d636d58`, front `769d254`).
- [x] **D6 · Nit (doc back)** — `api-endpoints.md:85-86` marca `GET /api/descuentos(/:id)` como ADMIN, pero el back los monta **sin `authenticate`** (público). El front manda token igual. **Resolución decidida (A)**: corregir la spec del back y re-extraer el catálogo. ✅ 2026-10-14 (back `d636d58`, front `769d254`).
- [x] **D7 · Nit (docs)** — `spec/features/005-admin-cruds/spec.md:3` dice "descuentos e ingresos pendientes" pero los descuentos están implementados (bloque E `[x]`); `tasks.md` tiene bloques F (ingresos) y G (cierre) sin marcar. **Resolución decidida (A)**: cerrar 005 con los bloques A–E, extraer ingresos a su propia feature (fase de aprobación, carpetas al iniciar la fase) y corregir spec/roadmap. ✅ 2026-10-14 (`7da2cc2`).

**Criterios de cierre del lote T6:**

- [x] `git pull` en `tp-dsw-back00` (D3) + fixes de docs allá (D1, D5, D6) commiteados. (commit local `d636d58`, sin pushear)
- [x] Resync de `api-contract.md` + `api-endpoints.md` del front desde el back (D1, D2, D5, D6).
- [x] D4: fix de UI + tests.
- [x] D7: 005 cerrado (spec, tasks, roadmap).
- [x] Gates verdes (`pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`) y commits en la rama.
- [x] Smokes manuales (002 login, 005 admin) registrados en cada `tasks.md` (2026-10-14; smoke de imágenes también: upload → 201, bytes idénticos, `imagenPrincipal` en listado público).

### Lote T7 · Deuda de formato Prettier (ingresado 2026-10-14)

- [x] **F1 · Nit (salud de repo)** — `pnpm format:check` falla en ~97 archivos (detectado al correr los gates del T6): deuda **preexistente** de Prettier, no introducida por los lotes previos (los archivos tocados en T6 se formatearon aparte). **Resolución**: correr `pnpm format` (`prettier --write .`) de una vez, gates completos y un solo commit mecánico. `format:check` queda como check opcional — **no** se agrega a los gates de `AGENTS.md` sin decisión del equipo. ✅ 2026-10-14 (`adfc414`: 15 archivos con cambios reales; el resto era solo fin de línea).

**Criterios de cierre del lote T7:**

- [x] `pnpm format` ejecutado y `pnpm format:check` en verde.
- [x] Gates verdes (`pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`) tras el formateo.
- [x] Commit mecánico único y lote marcado cerrado con fecha y hash.

### Lote T8 · Fallos de prueba manual (ingresado 2026-10-15)

> Origen: primera prueba manual del usuario en `localhost:5173` logueado como ADMIN (seed admin). Reporte de 5 fallos.

- [x] **M1 · Required (UI)** — `src/app/features/home/pages/HomePage.tsx:52-57` — El botón "Iniciar sesión" del hero de la home aparece **también con sesión iniciada** (el `Header` sí alterna con `useAuth()`, el hero no). *Resolución*: ocultar el botón cuando `isAuthenticated`.
- [x] **M2 · Required (UI)** — `src/app/shared/layout/Header.tsx:21` — El link "Categorías" apunta a `/#categorias` pero la app **no implementa scroll-to-hash**: el navegador no se desplaza a la sección y el usuario ve "muestra el inicio". *Resolución*: efecto de scroll al hash en `HomePage` (`useLocation` + `scrollIntoView`).
- [x] **M3 · Required (UX)** — `src/app/features/admin/pages/AdminProductosPage.tsx:194` — El botón "Editar" (y "Crear producto") **parece no funcionar**: el `ProductoForm` se renderiza arriba de todo de la página (antes de filtros y tabla), fuera de pantalla si el usuario está scrolleado en el listado; no hay scroll ni foco hacia él. *Resolución*: al montar el form, `scrollIntoView` + foco.
- [x] **M4 · Required (a investigar)** — Producto creado con `stockInicial: 10` vía formulario admin quedó **sin stock**. **Investigado 2026-10-15: NO reproducible.** Evidencia: (a) POST aislado `stockInicial:10` → BD cruda `stock=10`; (b) **reproducción E2E** del flujo real (form admin completo → API real → back → MySQL) creó producto con `stock=10`; (c) cero pedidos/ingresos en BD que pudieran consumir stock (`producto.stock -=` solo existe en esos flujos); (d) `update()` del back nunca toca `stock`; (e) el producto afectado (`id=2 "Creatina Prueba"`, 2026-10-15 21:35Z) tiene `stock=0` desde su creación en BD cruda. *Conclusión*: la cadena front→back actual es correcta; queda como caso no reproducible (posible error de carga del usuario o evento transitorio). *Pendiente*: confirmar con el usuario si se reproduce con el back arriba.
- [x] **M5 · Required (UI)** — `src/app/features/home/pages/HomePage.tsx:96-114` — Las tres tarjetas de la sección `#categorias` tienen animación hover (simulan ser clickeables) pero son `<article>` estáticos que no navegan a ningún lado. *Resolución*: tarjetas dinámicas desde `GET /api/tipos-producto`, cada una linkeando a `/productos?idTipoProducto=<id>` (el catálogo ya soporta el filtro por URL), con estados loading/error/vacío.

**Criterios de cierre del lote T8:**

- [x] Tests nuevos con RED verificado por mutación para M1, M2, M3 y M5. (`tests/feature/home-page.feature.test.tsx` 8 tests; `admin-productos.feature.test.tsx` +1)
- [x] M4 investigado y resuelto (fix o hallazgo documentado — resolución: no reproducible, evidencia E2E).
- [x] Gates verdes (`pnpm lint` → `pnpm typecheck` → `pnpm test` 147/147 → `pnpm build`) — 2026-10-15.
- [x] Commits en la rama y lote marcado cerrado con fecha y hash (`94e80ca`).

## Cierre de lotes

| Lote | Cerrado    | Commit                             |
| ---- | ---------- | ---------------------------------- |
| T1   | 2026-10-12 | `5173e73`                          |
| T2   | 2026-10-12 | `1e8d321`                          |
| T3   | 2026-10-12 | `977b8b7`                          |
| T4   | 2026-10-12 | `aada99e`                          |
| T5   | 2026-10-12 | `8644df6` + `f0610e7`              |
| T6   | 2026-10-14 | `770f20b`…`2aa99a1` (merge a main) |
| T7   | 2026-10-14 | `adfc414` + `8386df5`              |
