# 002 · Core API + Auth

**Estado:** implementada; falta smoke manual contra el backend local

## Qué hace

Deja preparado el núcleo de autenticación del frontend: cliente HTTP centralizado, manejo de errores normalizado y `AuthProvider` para persistir sesión con JWT y datos del usuario. También cubre el primer flujo real con el backend: login y salida segura de la sesión.

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
- [x] Hay un test unitario del `AuthProvider` y un test de feature del login.
- [x] La UI no hardcodea la URL del backend.

## Fuera de alcance

- Layout shell completo.
- Rutas protegidas y guards completos (se dejarán como parte del mismo feature, pero sin personalizar aún el dashboard).
- CRUDs de clientes / marca / producto.
- Persistencia de sesión en cookies HTTP-only; por defecto usaremos `localStorage` en esta feature.
