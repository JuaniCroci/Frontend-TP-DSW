# 002 · Core API + Auth — Tareas

## 1. Cliente HTTP

- [x] Crear `src/app/core/api/api.client.ts`
- [x] Configurar `baseURL` con `import.meta.env.VITE_API_URL`
- [x] Añadir request interceptor con Authorization header
- [x] Añadir response interceptor con normalización de errores

## 2. Contexto de auth

- [x] Crear `src/app/core/auth/AuthContext.tsx`
- [x] Definir `AuthUser` y `AuthContextValue`
- [x] Exponer `useAuth()`

## 3. Provider y sesión

- [x] Crear `src/app/core/auth/AuthProvider.tsx`
- [x] Persistir token y usuario en `localStorage`
- [x] Implementar `login(email, password)`
- [x] Implementar `logout()`
- [x] Exponer `isAuthenticated`

## 4. Login UI

- [x] Crear `src/app/features/auth/pages/LoginPage.tsx`
- [x] Formulario con email + password
- [x] Mostrar errores de API
- [x] Manejar loading del submit
- [x] Mostrar la marca Entreno 2.0 en la pantalla de login

## 5. Wiring en la app

- [x] Envolver `App` con `AuthProvider`
- [x] Mostrar `LoginPage` en `App.tsx` como base para validación

## 6. Verificación

- [x] Ejecutar `pnpm lint`
- [x] Ejecutar `pnpm typecheck`
- [x] Ejecutar `pnpm test`
- [ ] Validar login real con backend levantado

## 7. Cierre

- [x] Revisar criterios de aceptación de `spec.md`
- [x] Mostrar el estado final en `roadmap.md` si corresponde

> El smoke manual contra un backend levantado queda pendiente; la suite valida el flujo con respuestas mockeadas.
