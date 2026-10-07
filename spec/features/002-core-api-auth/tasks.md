# 002 · Core API + Auth — Tareas

## 1. Cliente HTTP

- [ ] Crear `src/app/core/api/api.client.ts`
- [ ] Configurar `baseURL` con `import.meta.env.VITE_API_URL`
- [ ] Añadir request interceptor con Authorization header
- [ ] Añadir response interceptor con normalización de errores

## 2. Contexto de auth

- [ ] Crear `src/app/core/auth/AuthContext.tsx`
- [ ] Definir `AuthUser` y `AuthContextValue`
- [ ] Exponer `useAuth()`

## 3. Provider y sesión

- [ ] Crear `src/app/core/auth/AuthProvider.tsx`
- [ ] Persistir token y usuario en `localStorage`
- [ ] Implementar `login(email, password)`
- [ ] Implementar `logout()`
- [ ] Exponer `isAuthenticated`

## 4. Login UI

- [ ] Crear `src/app/features/auth/pages/LoginPage.tsx`
- [ ] Formulario con email + password
- [ ] Mostrar errores de API
- [ ] Manejar loading del submit

## 5. Wiring en la app

- [ ] Envuelve `App` con `AuthProvider`
- [ ] Mostrar `LoginPage` en `App.tsx` como base para validación

## 6. Verificación

- [ ] Ejecutar `pnpm lint`
- [ ] Ejecutar `pnpm typecheck`
- [ ] Ejecutar `pnpm test`
- [ ] Validar login real con backend levantado

## 7. Cierre

- [ ] Revisar criterios de aceptación de `spec.md`
- [ ] Mostrar el estado final en `roadmap.md` si corresponde
