# 001 · Setup y puente con la API — Plan

## Enfoque

Scaffolding completo en dos bloques paralelos: (a) **metodología** — `spec/`, constitución, skills y `AGENTS.md` (espejo del backend); (b) **tooling + puente** — lint/format/test/CI y el `apiClient` con sus interceptores, validado contra `GET /api/health`. Nada de UI: la app sigue renderizando el `App.tsx` minimal hasta 002/003.

## Interfaces externas

- **API del backend** (`GET /api/health`, base `http://localhost:3000` en dev): existe desde la feature back 001 ✅. Forma de respuesta: ver `spec/constitution/api-contract.md` (snapshot) y `src/modules/health/` del back.
- **`.env`**: `VITE_API_URL=http://localhost:3000` en dev; en prod el dominio de la API.
- **CORS**: el back ya acepta `http://localhost:5173` (`CORS_ORIGIN`, default). No tocar nada del back.

## Implementación

### Bloque A — Metodología (docs)

1. `spec/README.md` — estructura, flujo de una feature y relación con el back.
2. `spec/constitution/` — `mission.md`, `tech-stack.md`, `roadmap.md` (features propias + columna Back), `coding-playbook.md`, `api-contract.md` (snapshot con encabezado de procedencia), `engineering-loop.md` (gates adaptados).
3. `spec/features/001-setup/` — esta carpeta (`spec.md`, `plan.md`, `tasks.md`).
4. `.agents/skills/` — copiar las skills del back + `README.md` de políticas.
5. `AGENTS.md` — reescribir: conservar stack/estructura/principios actuales y agregar comandos, flujo SDD, gates y mapeo proceso → skill.

### Bloque B — Tooling

6. `package.json` — scripts: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `preview`, `dev`, `build`, y **corregir `typecheck`** (ver "Decisión" abajo).
7. `.prettierrc.json` — idéntico al back (`semi`, `singleQuote`, `trailingComma: all`, `printWidth: 100`, `tabWidth: 2`, `endOfLine: lf`) + `.prettierignore`.
8. `eslint.config.js` — flat config con la base del back (`@eslint/js` + `typescript-eslint` + `eslint-config-prettier`, `no-explicit-any: error`, `no-console: warn`) **+** `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`.
9. Vitest — bloque `test` en `vite.config.ts` (`environment: 'jsdom'`, `setupFiles: ['tests/setup.ts']`, `include: ['tests/**/*.test.{ts,tsx}']`), `tests/setup.ts` con `import '@testing-library/jest-dom/vitest'`.
10. `tsconfig.app.json` — agregar `"tests"` al `include` (hoy solo cubre `src`: sin esto, el gate `typecheck` no revisa los tests).
11. `.github/workflows/ci.yml` — patrón corepack del back: `pnpm install --frozen-lockfile` → `lint` → `typecheck` → `test` → `build` (sin services).

### Bloque C — Puente HTTP

11. `.env` local + `.env.example` con `VITE_API_URL=http://localhost:3000`.
12. `src/app/core/api/apiError.ts` — `ApiError { statusCode, message, details? }` + función que normaliza cualquier `AxiosError` a `ApiError` (leen el envelope del `api-contract.md`; red de 5xx/genérico → `statusCode` propio + mensaje claro).
13. `src/app/core/api/api.client.ts` — `axios.create({ baseURL: import.meta.env.VITE_API_URL })` con:
    - request interceptor: `Authorization: Bearer <token>` si hay token en `localStorage` (clave `token`; el storage lo pasa a manejar `core/auth` en 002);
    - response interceptor: `error.response` → `ApiError` tipada; sin respuesta (red caída) → `ApiError(0, 'No se pudo conectar con el servidor')`.
14. Tests (sin backend):
    - `tests/unit/api-error.unit.test.ts` — normalizador: 400 con `details`, 404, 409, 5xx, error de red.
    - `tests/unit/api-client.unit.test.ts` — baseURL = `VITE_API_URL`; header `Authorization` presente/ausente según token.
    - `tests/feature/health.feature.test.tsx` — `apiClient.get('/api/health')` con **adapter en memoria** que responde `200 { status: 'ok' }`; y caso de error 503.
15. `README.md` — scripts nuevos, `spec/`, y sección "Cómo levantar back + front".

## Decisiones

- **`typecheck` real, no aparente** — el `tsconfig.json` raíz es "solution style" (`files: []` + references), así que `tsc --noEmit` tal como está hoy **no revisa nada**. Se cambia el script a `tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.node.json`; y `tsconfig.app.json` pasa a incluir `tests/` para que el gate cubra los tests.
- **Alias `@/` resuelto en Vite** — `tsconfig.app.json` ya declara `"@/*" → "src/app/*"` pero `vite.config.ts` no tiene `resolve.alias`, así que un import con `@/` compilaría y fallaría en runtime. Se agrega el alias en `vite.config.ts` (y queda cubierto por vitest, que reusa la config).
- **Adapter en memoria en vez de MSW** — cero dependencias nuevas para el setup; MSW se evalúa en 002 si hace falta simular endpoints más complejos.
- **Token en `localStorage` clave `token`** — decisión de storage tomada acá para no refactorizar en 002; `AuthProvider` será su único consumidor desde 002.
- **`ApiError` con `statusCode: 0` para errores de red** — distingue "back caído" de un 5xx real sin romper el tipo.
- **Snapshot de `api-contract.md`, no referencia cruzada** — el agente del front trabaja autosuficiente; el sync es un gate del loop.
- **Sin proxy de Vite** — CORS ya está resuelto del lado del back (`CORS_ORIGIN` default `http://localhost:5173`); se documenta como plan B en el README.
- **Plugins ESLint React registrados a mano** — se declaran `plugins` + `rules` explícitas (`react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`, `react-refresh/only-export-components`) en vez de depender del formato de configs de cada plugin (varía entre versiones).

## Riesgos

- **Versiones de `typescript-eslint` + React 19** — mitigación: mismas versiones que el back donde aplica y validar con `pnpm lint`.
- **`tsc -b` con configs `tsconfig.app/node`** — mitigación: correr `pnpm typecheck` y `pnpm build` en el gate; los `*.tsbuildinfo` ya están ignorados.
- **Divergencia del snapshot del contrato** — mitigación: gate en `engineering-loop.md` paso 1.b y checklist del playbook review.

## Desvíos de implementación

- **Test de `apiClient`: `toBeNull()` → `toBeUndefined()`**: axios devuelve `undefined` (no `null`) para un header ausente. Corregida la expectativa, no la implementación. Impacto: ninguno.
- **`AxiosHeaderValue` en el tipado del test**: `config.headers.get()` devuelve `AxiosHeaderValue` (unión con `null`), no `string | undefined`. Lo atrapó el gate `typecheck`; se tipó la interface con el tipo real de axios. Impacto: ninguno.
- **CI crea el `.env` (`cp .env.example .env`)**: los tests leen `import.meta.env.VITE_API_URL`; con el `.env` faltante el aserto de baseURL **fallaría** (se agregó además `toBeTruthy()` + `requireBaseUrl()` para que nunca pase vacío). Impacto: validado — run #1 de CI en `main` → `success`.
- **devDeps fuera de la lista del plan**: `@types/node@^24` (necesario para `node:url`/`URL` en `vite.config.ts`, cuyo proyecto usa `lib: ES2023` sin DOM) y `@testing-library/dom` (peer de `@testing-library/react` 16). Impacto: ninguno.
- **`eslint@9.39.5` deprecado**: el registry marca EOL la línea 9 (ya está `eslint@10`). Se mantuvo la versión 9 por **paridad con el backend** (`eslint ^9.37`, misma base de config). Impacto: warnings en instalación; revisar la subida a eslint 10 en ambos repos de forma pareja.
- **`pnpm format` corrido una vez al cierre**: el repo tenía archivos sin formatear (sin `;`, estilo previo al Prettier). Impacto: diff de formato en `src/App.tsx`, `src/main.tsx` y archivos nuevos; sin cambio de comportamiento.

### Pasada de review final (post-implementación)

Veredicto del revisor fresco: **Request changes** → corregido antes de dar por terminada la feature:

- **(Required) `baseURL` podía pasar vacío** → `requireBaseUrl()` falla con mensaje claro si falta `VITE_API_URL` + aserto `toBeTruthy()` en el test (RED → GREEN).
- **(Required) "Hecho" prematuro** → estado y roadmap marcaron _"CI pendiente de primer push"_, cerrado tras el run #1 verde.
- **(Optional) Adapter del singleton sin restaurar** → `afterEach` restaura el adapter original en ambos archivos de test.
- **(Optional) Casos prometidos sin test** → agregados 409 y body no-JSON (HTML de proxy).
- **(Optional) jsdom global al pedo** → `environment: 'node'` por defecto + docblock `@vitest-environment jsdom` solo en los archivos de feature (performance).
- **(Optional) Docs contradictorias** → descripción de `pnpm typecheck` corregida en `AGENTS.md` y `tech-stack.md`.
- **(Nit) Test de app shell en archivo `health*`** → movido a `tests/feature/app-shell.feature.test.tsx`.

**Deferred minors** (aceptados, no bloquean): token en `localStorage` legible por XSS → resolver en 002 (cookie httpOnly o centralizar lectura en `core/auth`); `eslint@9` EOL → bump a eslint 10 en ambos repos en pareja.
