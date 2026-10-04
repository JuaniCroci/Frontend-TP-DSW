# 001 · Setup y puente con la API

**Estado:** implementada (único criterio abierto: CI, validable recién en el primer push)

## Qué hace

Deja el frontend ejecutable de cero y **conectado al backend**: estructura SDD completa (`spec/` con constitución, features y engineering-loop), tooling de calidad (ESLint, Prettier, Vitest + Testing Library), CI en GitHub Actions, y el puente HTTP mínimo (`.env` con `VITE_API_URL`, instancia de Axios con baseURL e interceptores, y tests contra `GET /api/health`).

## Por qué

Es la base sobre la que se apoyan las 7 features siguientes: sin tooling no existen los gates del loop (`lint`/`build`/`test`), y sin puente no hay por dónde hablar con la API. Además instaura en este repo el **mismo sistema de trabajo del backend** (spec → plan → tasks → gates), que es el objetivo de esta etapa.

## Criterios de aceptación

- [x] `pnpm install` instala dependencias de runtime, desarrollo y test sin pasos manuales extra.
- [x] `pnpm dev` arranca Vite en `http://localhost:5173` y la app renderiza.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm build` y `pnpm test` pasan sin errores.
- [x] Existe `spec/` con `constitution/` completo (mission, tech-stack, roadmap, coding-playbook, api-contract snapshot, engineering-loop) y `features/001-setup/` con `spec.md`, `plan.md` y `tasks.md`.
- [x] `.agents/skills/` contiene las skills del backend copiadas (con sus `SKILL.md` válidos).
- [x] `AGENTS.md` documenta el flujo SDD, la tabla de comandos, los gates y el mapeo proceso → skill.
- [x] `.env.example` documenta `VITE_API_URL`; `.env` está en `.gitignore` y no se commitea.
- [x] `src/app/core/api/api.client.ts` usa `baseURL = import.meta.env.VITE_API_URL`; **ningún archivo** hardcodea la URL del back.
- [x] Interceptor de **request** adjunta `Authorization: Bearer <token>` cuando hay token guardado.
- [x] Interceptor de **respuesta** normaliza los errores del back a `ApiError { statusCode, message, details? }` (formato de `api-contract.md`).
- [x] `pnpm test` pasa **sin backend corriendo** (los tests de red usan un adapter en memoria; corrieron con el back apagado).
- [x] Hay al menos: 1 test unit del normalizador de errores, 1 test del `apiClient` (baseURL + header de auth) y 1 test de feature que resuelva `GET /api/health` mockeado. _(8 + 4 + 3 = 15 tests)_
- [x] Smoke manual: con el backend arriba y `.env` apuntando a `http://localhost:3000`, `GET /api/health` responde `200`. _(`{"status":"ok","database":"up"}`)_
- [ ] CI en `.github/workflows/` corre `lint → typecheck → test → build` en push/PR a `main`. **Pendiente: se valida con el primer push.**
- [x] `README.md` actualizado: scripts nuevos, flujo `spec/` y sección de conexión back ↔ front.

## Fuera de alcance

- AuthContext, guards, login/registro, almacenamiento del token — feature **002**.
- Modelos de dominio completos (`src/app/models/`) — se crean feature por feature desde **002**.
- Router, layout, páginas — feature **003**.
- Librerías de UI / state global más allá de las decisiones de `tech-stack.md`.
- Deploy (Containerfile/nginx) — backlog de aprobación.
