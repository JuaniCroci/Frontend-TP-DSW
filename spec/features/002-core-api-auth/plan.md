# 002 · Core API + Auth — Plan

## Enfoque

Implementar primero la capa de autenticación del frontend sin mezclar todavía gran parte de UI. El objetivo es dejar la app capaz de autenticarse con el backend, mantener la sesión y probar el flujo principal de login.

## Interfaces externas

- **Backend**: `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Formato de respuesta**:
  - login: `{ token: string, usuario: { id, nombre, email, rol } }`
  - errores: `{ statusCode, message, details? }`
- **Storage**: `localStorage` con claves `entreno_token` y `entreno_user`

## Implementación

### 1. Cliente HTTP centralizado

Crear `src/app/core/api/api.client.ts` con:

- `axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000' })`
- request interceptor para `Authorization: Bearer <token>` cuando exista `entreno_token`
- response interceptor para transformar errores a un `ApiError` normalizado

### 2. Contexto de autenticación

Crear `src/app/core/auth/AuthContext.tsx` con tipo `AuthUser` y `AuthContext`.

- `login(email, password)` usando `apiClient.post('/api/auth/login', ...)`
- `logout()` limpia token y usuario
- `isAuthenticated` derivado de `Boolean(token && user)`

### 3. Provider de sesión

Crear `src/app/core/auth/AuthProvider.tsx`.

- leer `localStorage` al montar
- persistir cambios de sesión
- exponer `user`, `token`, `login`, `logout`

### 4. Formulario de login

Crear `src/app/features/auth/pages/LoginPage.tsx` con:

- email / password
- manejo de loading
- manejo de error
- submit real contra `/api/auth/login`

### 5. Wiring de app

Actualizar `src/App.tsx` para envolver la app con `AuthProvider` y renderizar `LoginPage` momentáneamente mientras se prueba la feature.

### 6. Validación

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Riesgos

- Token no presente o inválido.
- Formato de error devuelto por el API no coincide con el esperado.
- `VITE_API_URL` vacío en local si el `.env` no está cargado.

## Desvíos de implementación

- Si el backend devuelve errores con shape distinto en algunos endpoints, se normaliza en el interceptor; no se hardcodea en los componentes.
- Se usa `localStorage` por decisión de feature y compatibilidad inmediata con el stack actual.
