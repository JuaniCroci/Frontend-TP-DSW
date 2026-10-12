# 002 · Core API + Auth

**Estado:** implementada; falta smoke manual contra el backend local

## Qué hace

Deja preparado el núcleo de autenticación del frontend: cliente HTTP centralizado, manejo de errores normalizado y `AuthProvider` para persistir sesión con JWT y datos del usuario. Incluye login, salida segura de la sesión y registro público de clientes.

## Por qué

La app necesita autenticarse con la API antes de poder crear cualquier flujo protegido. Esta feature es la base sobre la cual salen el layout, rutas protegidas y la lógica de usuarios en el front.

## Endpoints del backend involucrados

- `POST /api/auth/login` — devuelve `{ token, usuario }`
- `GET /api/auth/me` — devuelve el usuario autenticado actual
- `POST /api/auth/register` — alta de usuario nuevo

## Criterios de aceptación

- [x] Existe `src/app/core/api/api.client.ts` con `baseURL = import.meta.env.VITE_API_URL`.
- [x] El interceptor de respuesta normaliza errores del backend a `{ statusCode, message, details? }`.
- [x] Existe un `AuthProvider` con estado de `token` y `user` persistido en `localStorage`.
- [x] Existe `useAuth()` para consumir el contexto de autenticación.
- [x] El flujo `login(email, password)` llama a `POST /api/auth/login` y guarda el token + usuario.
- [x] El flujo `logout()` limpia la sesión local.
- [x] El login muestra error visible si el backend responde 400/401.
- [x] El formulario de login renderiza y maneja las respuestas de la API.
- [x] Una persona puede crear una cuenta `CLIENTE` desde la ruta pública `/registro`; al finalizar se la dirige al login.
- [x] Los errores y validaciones del endpoint de registro se muestran sin perder el formulario.
- [x] La administración no es responsable del alta de cuentas nuevas.
- [x] Hay un test unitario del `AuthProvider` y un test de feature del login.
- [x] La UI no hardcodea la URL del backend.

## Notas de integración (sync 2026-10-12)

Se integró una rama local paralela de esta misma feature con la implementación ya mergeada (la de este documento es la referencia). Lo que quedó de esa rama:

- `core/auth/session.ts` es el **único** módulo que lee/escribe el token (`TOKEN_KEY = 'entreno_token'`, unificado con la clave del merge); `api.client.ts` lo re-exporta y consume `getToken()`.
- Interceptor de `401` en `api.client.ts`: si el request no es de `/api/auth/` y había sesión → `clearSession()` + evento `auth:session-expired`; `AuthProvider` lo escucha y limpia el estado, así los guards redirigen.
- `friendlyErrorMessage` aplicado en `LoginPage` y `RegisterPage` (`429` → copy amigable de rate limit).
- Tests adaptados a esta implementación: guards (`AdminRoute`/`ClientRoute`), login (4 casos) y registro (3 casos).

La alternativa descartada (implementación propia con `status`/`GET /api/auth/me`, `ProtectedRoute` y páginas con RHF) vive en la rama `backup/local-wip`.

## Fuera de alcance

- Layout shell completo.
- Rutas protegidas y guards completos (se dejarán como parte del mismo feature, pero sin personalizar aún el dashboard).
- CRUDs de clientes / marca / producto.
- Persistencia de sesión en cookies HTTP-only; por defecto usaremos `localStorage` en esta feature.
- Verificación de email y recuperación de contraseña.
