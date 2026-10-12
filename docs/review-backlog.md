# Backlog de revisión — prioridad sobre trabajo nuevo

> **Origen**: análisis multi-eje de las features 002–013 mergeadas (2026-10-12) — 4 revisiones en paralelo (admin · catálogo/imágenes/carrito · shell/auth · modelos+tests) contrastadas contra `spec/constitution/api-contract.md`, `coding-playbook.md` y `AGENTS.md`.
> **Veredicto del análisis**: 0 Críticos · ~20 Required · resto Nits/Optional. Fondos sólidos (dinero `string`, `{data,total}`, guards, tests de comportamiento); deuda concreta y arreglable.

## Regla de prioridad

1. **Todo agente lee este archivo antes de arrancar cualquier tarea.** Los ítems `[ ]` pendientes tienen **prioridad sobre trabajo nuevo** (features, mejoras propias), salvo indicación explícita en contrario del usuario.
2. Al ejecutar un lote completo: gates verdes (`pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build`), commitear y marcar `[x]` con fecha y hash.
3. **Hallazgos nuevos** detectados en cualquier momento se agregan en "Ingresos" con severidad **antes** de arreglarlos por cuenta propia.

## Estado

| Lote   | Alcance                                  | Prioridad | Estado                             |
| ------ | ---------------------------------------- | --------- | ---------------------------------- |
| **T1** | Bugs de correctividad + fuera de alcance | P0        | ✅ cerrado (2026-10-12, `5173e73`) |
| **T2** | Reglas de la cátedra (playbook)          | P1        | ✅ cerrado (2026-10-12, `1e8d321`) |
| **T3** | Refactors y duplicación                  | P2        | ⬜ pendiente                       |
| **T4** | Cobertura y salud de tests               | P2        | ⬜ pendiente                       |

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

- [ ] **1.** Descomponer páginas grandes: `AdminProductosPage.tsx` (872) → `ProductoForm.tsx` + `ProductoDetalleModal.tsx` + `ProductoFiltersForm.tsx` (~300 restantes); `AdminDescuentosPage.tsx` (576) → `AplicacionesDescuentoModal.tsx`; `AdminClientesPage.tsx` (415) → `ClienteForm` + `ClienteDetalleModal`; `AdminMasterPage.tsx` (387) → form + modal.
- [ ] **2.** Duplicación copy-paste: `getApiMessage` **×5 con 3 nombres** (`AdminProductosPage:49`, `AdminMasterPage:36`, `AdminClientesPage:16`, `AdminDescuentosPage:34`, `ProductoImagenesPanel:25`) → un helper único (recomendado: delegar en `friendlyErrorMessage`). `formatPrice` **×4** → `shared/utils/formatMoney.ts`.
- [ ] **3.** Bloques de UI repetidos en 4 páginas (banner éxito/error, badge de estado, esqueleto de tabla, modal) → `shared/components/`: `BadgeEstado`, `AdminBanner`, `AdminModal` (con Escape + focus trap, ver 6) + clases `@layer components` del playbook §5.4.
- [ ] **4.** Modelos duplicados (playbook §3 "nunca se redefine un interface"): `Marca`/`TipoProducto` en `Producto.ts` **y** `AdminCatalogo.ts`; `ImagenPrincipalProducto` en `Producto.ts` **y** `AdminProducto.ts`; `DescuentoVigente ≡ AdminDescuento`; **6 variantes** del wrapper `{data,total}` → un `RespuestaLista<T>` único y un archivo por tipo. _Antes de la feature 007 (pedidos), que agregaría la séptima_.
- [ ] **5.** `tests/`: helper compartido del adapter axios (`response()`/`requestBody()`/`saveSession()` copy-pasteados en **13 archivos**) → `tests/helpers/axios-adapter.ts` + `tests/helpers/session.ts`.
- [ ] **6.** Modales con `aria-modal` sin Escape/focus trap/foco inicial: `ProductoImagenesPanel:100`, `AdminProductosPage:770`, `AdminMasterPage:325`, `AdminDescuentosPage:401` → resolver con el `AdminModal` compartido del punto 3.
- [ ] **7.** Duplicación/semántica: secciones admin duplicadas (`AdminLayout.tsx:3-11` vs `AdminHomePage.tsx:3-34`) → `features/admin/adminSections.ts`. Landmark `<main>` inconsistente (solo 2 páginas admin lo usan) → `AdminLayout` envuelve `<Outlet/>` en `<main>` y las páginas usan `<section>`.
- [ ] **8.** Menores agrupados: invalidaciones redundantes (`productosMutations.ts:71-78`); `img` sin `loading="lazy"`/`decoding` (`ProductoImagen.tsx:29`, historial de `ProductoImagenesPanel`); historial sin fallback `onError`; placeholder `aria-hidden` sin label (`ProductoImagen.tsx:17-24`); `formatSize` siempre en KiB (`ProductoImagenesPanel:21`); `key={searchParams.toString()}` opaco + foco perdido en `CatalogoPage:95`; `?` vacío en links (`CatalogoPage:248`); acoplamiento `products ↔ cart` (`ProductoDetallePage:4`); `spec/013/spec.md` con criterios `[ ]` marcado "implementada".
- [ ] **9.** Performance/bundle (opcional, alto impacto): `App.tsx` sin code splitting → `lazy()` del subárbol `/admin` (aprovecha el `Spinner` existente) y de login/registro. Bundle actual: 453 kB.

---

## Lote T4 · Cobertura y salud de tests [P2]

- [ ] **1.** **`POST /api/carrito/items` desde el detalle** — el flujo principal de 006, prometido en `spec/features/006-carrito/plan.md:27` y marcado `[x]`, **no tiene ningún test** (ni body `{idProducto,cantidad}`, ni éxito, ni error 409 de stock).
- [ ] **2.** **`AdminHomePage`**: cero tests (solo se prueba como destino de guard).
- [ ] **3.** **Decisión + test de restauración de sesión**: el `AuthProvider` actual restaura solo de `localStorage` (no llama `GET /api/auth/me`, que el contrato sí ofrece). Decidir: implementar hidratación con `/me` (y test del 401 al restaurar) o documentar que es intencional.
- [ ] **4.** `tests/setup.ts` — agregar `afterEach(() => cleanup())` global: `login.feature.test.tsx` y `auth-provider.unit.test.tsx` renderizan **sin cleanup** (config sin `globals: true`) → bomba de tiempo.
- [ ] **5.** `tests/feature/catalogo.feature.test.tsx:116-119` — hardcodea `http://localhost:3000/...` → comparar contra `` `${apiClient.defaults.baseURL}` `` o `apiAssetUrl()`.
- [ ] **6.** Consolidar archivos gemelos: `login.feature` ⊂ `login-page.feature` y `registro.feature` ≈ `register-page.feature` (4 archivos para refactorizar 1 pantalla) → unificar y absorber los casos únicos (loading; flujo e2e con AuthProvider).
- [ ] **7.** Huecos medios: logout real (`POST /api/auth/logout`), 404 en `ProductoDetallePage`, rama de error del listado en admin (503 + Reintentar), paginación clickeable en admin-productos, edición de tipo/proveedor en catálogo admin, carrito vacío → 400, estados loading (solo login los tiene), `from: '//evil.com'` en login, storage corrupto en AuthProvider (comparte con T1-4).
- [ ] **8.** Higiens menores: listeners de `auth:session-expired` sin remover en `api-401.unit.test.ts`; test casi tautológico de `health.feature.test.tsx:11-23`; `app-shell` renderiza sin adapter (flakiness futuro si `HomePage` se vuelve dinámico); matcher frágil `getByText(content => ...)` en `catalogo.feature.test.tsx:114`; `getAllByLabelText('Marca')[0]` por labels duplicados (`admin-productos:176`).

---

## Ingresos (hallazgos nuevos)

> Agregar acá con fecha, `archivo:línea`, severidad (Critical/Required/Nit) y lote sugerido. Nada se arregla sin pasar primero por esta lista.

_(vacío)_

## Cierre de lotes

| Lote | Cerrado    | Commit    |
| ---- | ---------- | --------- |
| T1   | 2026-10-12 | `5173e73` |
| T2   | 2026-10-12 | `1e8d321` |
| T3   | —          | —         |
| T4   | —          | —         |
