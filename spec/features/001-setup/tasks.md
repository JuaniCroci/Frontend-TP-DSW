# 001 · Setup y puente con la API — Tareas

## Bloque A — Metodología

- [x] Crear `spec/README.md` (estructura, flujo, relación con el back)
- [x] Crear `spec/constitution/mission.md`
- [x] Crear `spec/constitution/tech-stack.md`
- [x] Crear `spec/constitution/roadmap.md` (features + columna Back)
- [x] Crear `spec/constitution/coding-playbook.md`
- [x] Crear `spec/constitution/api-contract.md` (snapshot del back con encabezado)
- [x] Crear `spec/constitution/engineering-loop.md` (gates adaptados)
- [x] Crear `spec/features/001-setup/{spec,plan,tasks}.md`
- [x] Copiar skills del back a `.agents/skills/` (11 + README)
- [x] Reescribir `AGENTS.md` (comandos, flujo SDD, gates, mapeo proceso → skill)

## Bloque B — Tooling

- [x] Agregar scripts a `package.json`: `lint`, `lint:fix`, `format`, `format:check`, `test`, `test:watch`, `preview`
- [x] Corregir el script `typecheck` (que hoy no chequeaba nada: solution tsconfig) y sumar `tests/` al `include` de `tsconfig.app.json`
- [x] Agregar `resolve.alias` de `@/*` → `src/app/*` en `vite.config.ts` (ya existía en tsconfig)
- [x] Instalar devDeps: eslint, @eslint/js, typescript-eslint, eslint-config-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, prettier, vitest, @testing-library/react, @testing-library/jest-dom, jsdom (+ @types/node, @testing-library/dom — ver desvíos)
- [x] Crear `.prettierrc.json` + `.prettierignore`
- [x] Crear `eslint.config.js` (base del back + reglas React)
- [x] Configurar Vitest en `vite.config.ts` + `tests/setup.ts`
- [x] Crear `.github/workflows/ci.yml` (lint → typecheck → test → build)
- [x] Verificar `pnpm lint`, `pnpm typecheck`, `pnpm build` y `pnpm test` en verde

## Bloque C — Puente HTTP

- [x] Crear `.env` local y actualizar `.env.example` con `VITE_API_URL=http://localhost:3000`
- [x] Crear `src/app/core/api/apiError.ts` (normalizador al contrato)
- [x] Crear `src/app/core/api/api.client.ts` (baseURL + interceptores)
- [x] Test unit `tests/unit/api-error.unit.test.ts` (8 tests: 6 originales TDD RED→GREEN + 409 y body no-JSON de la review)
- [x] Test unit `tests/unit/api-client.unit.test.ts` (4 tests: baseURL + requireBaseUrl + 2 de auth)
- [x] Test feature: `health.feature.test.tsx` (200 + 503) y `app-shell.feature.test.tsx` (render)
- [x] Smoke manual con el backend arriba (`GET :3000/api/health` → 200 `{ status: "ok", database: "up" }`)
- [x] Actualizar `README.md` (scripts, flujo spec/, conexión back ↔ front)

## Cierre

- [x] Validar contra los criterios de aceptación de `spec.md` (los 16 cumplidos, incluido CI: run #1 verde)
- [x] Mover la feature a "Hecho" en `../../constitution/roadmap.md`
