# TECH.md — Stack tecnológico

## React 19 + TypeScript 5.8

Core del frontend. React 19 es la versión estable más reciente con mejoras en server components, actions y refs. TypeScript estricto para tener tipado fuerte durante todo el desarrollo.

## Vite 6

Build tool radicalmente más rápido que CRA. HMR instantáneo, tree-shaking nativo, y configuración mínima. Se instaló `@vitejs/plugin-react` para habilitar JSX transform automático.

## Tailwind CSS 4 (tentativo)

CSS utility-first. Se usa `@tailwindcss/vite` como plugin directo de Vite (sin PostCSS ni `tailwind.config`). La versión 4 es mucho más liviana y rápida que la 3. Se marcó tentativo porque el equipo aún no lo confirma.

## React Router 7

Enrutador SPA estándar. Soporta layout routes, loaders, actions, y nested routes. Reemplaza a React Router 6 con una API más declarativa. Se usará para definir layouts anidados (público, admin, cliente) y proteger rutas.

## TanStack Query 5

Data fetching con caché automática. Reemplaza la lógica manual de useEffect + fetch. Provee estados `isLoading`, `isError`, `isSuccess` sin boilerplate. Se combina con Axios como cliente HTTP.

## Axios 1

Cliente HTTP con interceptors. Se usará para: setear automáticamente la `baseURL` desde `VITE_API_URL`, adjuntar tokens JWT en headers vía interceptors, y manejar errores globalmente (401 → redirigir login, 500 → toast, etc.).

## React Hook Form 7

Manejo de formularios performante. Minimiza re-renders, tiene validación integrada (con schema via Zod si se suma después), y maneja campos anidados. Ideal para los forms de CRUD y el carrito.

## esbuild (dependencia interna de Vite)

Bundler ultra rápido escrito en Go. Vite lo usa internamente para transpilar TypeScript y minificar en producción.
