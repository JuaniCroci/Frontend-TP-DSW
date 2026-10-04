# Tech stack y convenciones — Frontend

## Tecnologías

- **Lenguaje:** TypeScript estricto (`strict: true`)
- **Framework:** React 19 (SPA cliente)
- **Build / dev server:** Vite 6 (+ `@vitejs/plugin-react`)
- **Estilos:** Tailwind CSS 4 (`@tailwindcss/vite`) — **tentativo**, confirmar con el equipo
- **Routing:** React Router 7 (layout routes, rutas anidadas y protegidas)
- **Data fetching / server state:** TanStack Query 5 + Axios 1
- **Formularios:** React Hook Form 7
- **State global:** **Context** (auth, UI) + **TanStack Query** (server state). Sin librería global (Zustand/Redux) hasta que aparezca una necesidad real que Context + Query no resuelva.
- **Tests:** Vitest + `@testing-library/react` + `jsdom`
- **Calidad:** ESLint (flat config) + Prettier — misma base y estilo que el backend
- **Despliegue:** `Containerfile` multi-stage + nginx (fase de aprobación; ver backlog)

## Estructura de carpetas

```
src/
└── app/
    ├── core/
    │   ├── api/          → api.client.ts (instancia axios), normalizador de errores API
    │   ├── auth/         → AuthContext, AuthProvider, useAuth
    │   └── guards/       → ProtectedRoute, AdminRoute
    ├── models/           → interfaces del dominio (derivadas de api-contract.md)
    ├── features/<name>/
    │   ├── pages/        → componentes que son rutas (PascalCase)
    │   ├── components/   → subcomponentes del feature (PascalCase)
    │   ├── hooks/        → hooks específicos (use<Nombre>)
    │   └── api/          → queries.ts + mutations.ts (TanStack Query)
    └── shared/
        ├── components/   → Button, Card, Modal, Input, Spinner...
        ├── hooks/        → useDebounce, useMediaQuery...
        └── layout/       → MainLayout, Header, Footer, Sidebar
tests/
├── unit/                 → hooks, utils, normalizadores (sin UI)
└── feature/              → páginas/componentes con apiClient mockeado
```

## Comandos

- `pnpm dev` — dev server de Vite (http://localhost:5173)
- `pnpm build` — `tsc -b && vite build`
- `pnpm typecheck` — `tsc --noEmit` sobre `tsconfig.app.json` (src + tests) y `tsconfig.node.json` (vite.config.ts)
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:check` — Prettier
- `pnpm test` — suite completa; `pnpm test:watch` para watch mode

## Decisiones cerradas

- **Dinero → `string`** en los modelos (`precioUnitario: "1500.00"`), igual que el contrato. Se parsea solo para mostrar (`Intl.NumberFormat('es-AR')`), nunca se calcula con float de JS.
- **Fechas → ISO 8601 UTC** en los modelos; se formatean solo para mostrar.
- **Estados de dominio en MAYÚSCULAS** como los emite el back (`'REALIZADO' | 'CANCELADO' | ...`).
- **Wrappers de listado** — toda respuesta de listado llega `{ data, total }` (y `page`/`size` cuando aplica). El modelo de respuesta respeta eso; no se aplanar en el modelo.
- **Errores de API** — forma `{ statusCode, message, details? }`. El interceptor de Axios la normaliza a una `ApiError` tipada que las páginas consumen.
- **Auth** — token JWT en `localStorage`; el interceptor de request adjunta `Authorization: Bearer <token>` cuando existe. 401 → limpiar sesión y redirigir a login.

## Variables de entorno (`.env.example`)

| Variable       | Ejemplo                 | Uso                               |
| -------------- | ----------------------- | --------------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | baseURL de Axios hacia el backend |

> En producción apunta al dominio desplegado de la API. El back debe habilitar `CORS_ORIGIN` para el origen del front.

## Límites duros

- **Nunca** importar código, tipos ni dependencias del backend: repos agnósticos.
- **Nunca** hardcodear la URL de la API (siempre `import.meta.env.VITE_API_URL`).
- **Nunca** subir `.env` ni secretos al repo (solo `.env.example` sin valores reales).
- **Nunca** `console.log` de debug en código comiteado.
- **Nunca** lógica de negocio autoritativa en el front (totales, stock, aplicar descuentos, transiciones de estado): eso lo resuelve la API.
- **Nunca** hacer `fetch`/`axios` desde `useEffect` de un componente: data fetching solo vía TanStack Query (`features/<name>/api/`).
- No agregar dependencias nuevas sin que el plan de la feature lo justifique.
- No implementar features fuera del `roadmap.md` sin crear antes su carpeta en `features/`.
