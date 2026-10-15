# Minutas de avances y reuniones de coordinación

> Enunciado §4: _minutas de avances o reuniones de coordinación del equipo_.
> Plantilla al final. Agregar una entrada por evento, en orden cronológico inverso.

---

## 2026-10-15 · Avance: reconstrucción del historial (changelog + minutas)

**Formato:** asíncrono.
**Participantes:** JuaniCroci (con OpenCode).

### Realizado

- **`CHANGELOG.md` (nuevo, raíz del repo)**: entradas fechadas con autoría y hashes, derivadas de `git log`, `docs/review-backlog.md` y `spec/constitution/roadmap.md` — 14 entradas desde el scaffold (2026-06-30) hasta hoy.
- **Minutas completadas**: entradas desde el cierre de la 001 (2026-10-04) hasta hoy; la del 14/10 ampliada con el bloque de deploy.
- **Autoría relevada**: 36 commits de JuaniCroci y 8 de CarlosUBruno (GitHub API + `git shortlog`); la parte de Carlos se documentó solo con `git log` (no tiene sesiones de OpenCode en esta máquina).
- Convención de actualización del changelog documentada en `docs/gestion/README.md` y `AGENTS.md`.
- Verificación: `pnpm lint` + `pnpm typecheck` + `pnpm format:check` + `pnpm test` → **138/138 (25 archivos)**.

### Acuerdos

1. Sin acuerdos nuevos de equipo; queda el pedido de completar los nombres de participantes.

### Pendientes para la próxima

- Commitear este cambio (changelog + minutas + convención) cuando el equipo lo avale.
- Completar los nombres de participantes de todas las entradas.

---

## 2026-10-14 · Avance: cierre de la concordancia con el back + evidencia de gestión

**Formato:** reunión de coordinación (equipo) + trabajo asíncrono.
**Participantes:** JuaniCroci (análisis, lotes y documentación). Completar el resto del equipo.

### Realizado

- **Análisis de estado** del plan de regularidad vs. backend: `docs/analisis-estado-plan-regularidad-y-concordancia-con-el-back.md` (divergencias D1–D7).
- **Lote T6 (concordancia)** cerrado y mergeado:
  - D1: `api-contract.md` del back completado (imágenes, descuentos, carrito, 413) y resincronizado como snapshot idéntico en el front.
  - D2/D5/D6: catálogo `api-endpoints.md` re-extraído (rutas de imágenes, `includeInactive` en marcas, descuentos `GET` públicos).
  - D4: fuera el bloque "Fecha de entrega" del detalle de pedido (la API no lo expone); se conserva en el listado admin.
  - D7: feature 005 cerrada (bloques A–E); ingresos de mercadería extraídos al backlog de aprobación.
  - Smokes manuales contra backend local (Podman + `pnpm dev`): login admin/cliente, autorización, CRUD admin e imágenes end-to-end.
- **Lote T7**: deuda de formato Prettier del repo resuelta (`pnpm format` + gates verdes).
- **Evidencia de gestión**: board de GitHub Projects, issues con AC y esta estructura de minutas.
- Entorno: MySQL del TP renombrado a `entreno-2-mysql` (se distingue del del backend viejo); ambos repos actualizados en GitHub.
- **Opciones de deploy** documentadas en `docs/deploy-opciones.md` (Opción 4 — Render front + API + Aiven MySQL free ⭐, comparativa de free tiers); gates verdes (138/138) e issue #1 comentado para decidir en grupo (`9d15448` `f1bc4be`, posteriores a esta minuta).

### Acuerdos

1. **Orden**: deploy de la página **antes** de iniciar la fase de aprobación (Tag, Favoritos, Reseñas, Abonar pedido, Ingreso de mercadería — issues #7–#11, sin arrancar).
2. El **deploy** es la próxima tarea en curso (issue #1): definir proveedor, `VITE_API_URL` y CORS.
3. Los hallazgos nuevos pasan primero por la sección "Ingresos" del `docs/review-backlog.md` (regla del equipo).

### Pendientes para la próxima

- Definir la estrategia de deploy en grupo (issue #1: Opción 4 Render+Aiven ⭐ vs Opción 2 Railway vs Opción 3 Oracle VM) y ejecutarla.
- Completar nombres de participantes en esta minuta si hace falta.

---

## 2026-10-13 · Avance: lotes T4/T5 de revisión + feature 007 pedidos

**Formato:** asíncrono.
**Participantes:** JuaniCroci (lotes de revisión, con OpenCode) · CarlosUBruno (feature 007).

### Realizado

- **Lote T4 (cobertura y salud de tests)** cerrado: tests del flujo carrito desde el detalle, de `AdminHomePage`, fusión de archivos gemelos login/registro, decisión de restauración de sesión sin hidratar fijada con test, higiens (`aada99e`, cierre `c0bf0f7`).
- **Lote T5-2**: 4 tests de estados loading (catálogo, detalle, carrito, admin-productos) (`8644df6`, cierre `902f8f0`).
- **Lote T5-1**: logout real contra `POST /api/auth/logout`; corrección de la verificación previa — se había chequeado contra el prototipo viejo `Backend-TP-DSW`, el back real ya tenía el endpoint (`f0610e7`, cierre `b73c207`).
- **Docs**: enlaces del backend corregidos tras el renombre (`Entreno-2.0-Backend` / `Backend-TP-DSW-viejo`) en `AGENTS.md`, `README.md` y `spec/` (`44b2b12` `ec5501e` `17912da`).
- **CarlosUBruno**: feature **007 · Pedidos** — mis pedidos, listado filtrado y detalle admin, panel de detalle (`9aed091`, 21:44).

### Acuerdos

1. Sin acuerdos nuevos: los lotes siguen el `docs/review-backlog.md` (gates verdes + cierre con fecha y hash).

### Pendientes para la próxima

- Arrancar el lote T6: concordancia con el back (divergencias D1–D7).

---

## 2026-10-12 · Avance: sync con el compañero, reviews en paralelo y lotes T1–T3

**Formato:** asíncrono.
**Participantes:** JuaniCroci (reviews, backlog y lotes, con OpenCode) · CarlosUBruno (features mergeadas).

### Realizado

- **Pull de 7 commits de CarlosUBruno** (002, 003/004/005, registro, 013, 006) y **reconciliación del WIP local de la 002**: rebase resolviendo los conflictos entre las dos implementaciones paralelas; `ProtectedRoute` local eliminado y tests adaptados (`be1c50b` `d2eec3f`).
- **4 revisiones en paralelo** (admin · catálogo/imágenes/carrito · shell/auth · modelos+tests) contrastadas contra la constitución → `docs/review-backlog.md` con veredicto 0 críticos / ~20 required (`0489c5a`).
- **Lote T1**: 11 bugs de correctividad P0 (`5173e73`, cierre `fb0ffb2`).
- **Lote T2**: reglas de la cátedra — `cn()`, paleta unificada, named exports, handlers, auth tipada (`1e8d321`, cierre `d2de79f`).
- **Lote T3**: refactors — descomposición de páginas admin, helpers únicos, modelos unificados, componentes shared, code splitting (`977b8b7`, cierre `4f46edc`).
- **CarlosUBruno**: feature **006 · Carrito y descuentos** (`20cd02a`, 15:31).

### Acuerdos

1. El backlog `docs/review-backlog.md` tiene prioridad sobre trabajo nuevo; los hallazgos nuevos se registran en "Ingresos" antes de arreglarlos.
2. Convenciones del lote T2: queryKeys en **español**; `data-testid` solo donde el test lo necesita; handlers `handle<Evento>` (excepción `handleFormSubmit` en React Hook Form).
3. Split T4/T5: tests puros → lote T4; mejoras de UI → lote T5.
4. La sesión del cliente se restaura **sin hidratar** contra el backend (decisión fijada con test).

### Pendientes para la próxima

- Cerrar los lotes T4 y T5 con gates verdes.

---

## 2026-10-11 · Avance: imágenes de productos, productos admin y registro público

**Formato:** asíncrono.
**Participantes:** CarlosUBruno (fuente: `git log`; sin sesión de OpenCode).

### Realizado

- **013 · Imágenes de productos**: panel admin de upload con metadatos, historial y foto principal; visualización en catálogo y detalle (`140ca46`, 16:54).
- **005 · Gestión admin de productos**: ABM completo con filtros (`8d91abe`, 14:49).
- **Registro público de clientes**: `RegisterPage` y ajustes del admin de clientes (`d9779e3`, 14:49).

### Acuerdos

1. Sin acuerdos nuevos registrados.

### Pendientes para la próxima

- Carrito y descuentos (feature 006).

---

## 2026-10-10 · Avance: gestión administrativa de clientes

**Formato:** asíncrono.
**Participantes:** CarlosUBruno (fuente: `git log`; sin sesión de OpenCode).

### Realizado

- **005 · Clientes admin**: listado con filtros de texto y estado, alta, edición y baja (`3fa506e`, 20:10); tests `admin-clientes.feature.test.tsx`.

### Acuerdos

1. Sin acuerdos nuevos registrados.

### Pendientes para la próxima

- Productos admin y registro de clientes.

---

## 2026-10-09 · Avance: layout shell, catálogo y panel de administración

**Formato:** asíncrono.
**Participantes:** CarlosUBruno (fuente: `git log`; sin sesión de OpenCode).

### Realizado

- **003 · Layout shell**: layouts, header con estado de sesión y guard de admin (`900f95c`, 22:59).
- **004 · Catálogo**: listado público con filtros y paginación en la URL + detalle de producto.
- **005 · Panel de administración**: home admin y maestros (tipo, marca, proveedor).
- Specs de 003/004/005 creadas y primer lote grande de tests de interfaz.

### Acuerdos

1. Sin acuerdos nuevos registrados.

### Pendientes para la próxima

- ABM de clientes y productos.

---

## 2026-10-06 · Avance: core API + auth

**Formato:** asíncrono.
**Participantes:** CarlosUBruno (fuente: `git log`; sin sesión de OpenCode).

### Realizado

- **002 · Core API + Auth**: `AuthContext`/`AuthProvider` con sesión persistida y `LoginPage` (`8381a12`, 23:15) + spec de la feature.

### Acuerdos

1. Sin acuerdos nuevos registrados.

### Pendientes para la próxima

- Layout shell y catálogo (003/004).

---

## 2026-10-04 · Avance: feature 001 (setup) y primera sesión de diagnóstico

**Formato:** asíncrono.
**Participantes:** JuaniCroci (con OpenCode).

### Realizado

- **001 · Setup**: constitución SDD, tooling (ESLint, Prettier, Vitest, CI) y puente HTTP (`apiClient` + `apiError`); **CI verde en el run #1** (`0fa39b3` `ee5c9b7`).
- Primera sesión de OpenCode: diagnóstico del repo, del enunciado y del estado del back (roadmap 001–013 hecho); avance **local** de la 002 sin commitear, que se reconcilia recién el 12/10.

### Acuerdos

1. **Tailwind 4** como estilos definitivos (confirmado 2026-10-04; anotado en `spec/constitution/roadmap.md`).

### Pendientes para la próxima

- Crear specs de las features 002–008 y arrancar 002 (core API + auth).

---

## Plantilla

```markdown
## AAAA-MM-DD · [Avance | Reunión de coordinación] · [tema corto]

**Formato:** presencial / videollamada / asíncrono.
**Participantes:** ...

### Realizado

-

### Acuerdos

1.

### Pendientes para la próxima

-
```
