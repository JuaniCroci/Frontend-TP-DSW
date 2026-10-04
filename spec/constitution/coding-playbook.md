# Coding Playbook — Entreno 2.0 Frontend

> **Fuente de verdad para la escritura de código.**
> Todo agente que implemente una feature debe leer este archivo junto con `tech-stack.md`, `api-contract.md` y el `plan.md` de la feature.
> Si un caso no está cubierto acá, aplicar el principio más cercano y documentar la desviación en el `plan.md` de la feature.

---

## 1. Nomenclatura de archivos

| Qué                  | Patrón                        | Ejemplo                              |
| -------------------- | ----------------------------- | ------------------------------------ |
| Página (ruta)        | `PascalCase.tsx`              | `ProductsPage.tsx`                   |
| Componente           | `PascalCase.tsx`              | `ProductCard.tsx`                    |
| Hook                 | `use<PascalCase>.ts`          | `useProducts.ts`                     |
| Queries (TanStack)   | `queries.ts`                  | `features/products/api/queries.ts`   |
| Mutations (TanStack) | `mutations.ts`                | `features/products/api/mutations.ts` |
| Modelo de dominio    | `PascalCase.ts`               | `models/Producto.ts`                 |
| Utilidades           | `camelCase.ts`                | `core/api/apiError.ts`               |
| Test unitario        | `kebab-case.unit.test.ts`     | `api-error.unit.test.ts`             |
| Test de feature/UI   | `kebab-case.feature.test.tsx` | `products-page.feature.test.tsx`     |

- Archivos de features (no componentes): **kebab-case**.
- Un componente por archivo. `export default` solo en **páginas**; el resto exporta named.

---

## 2. Patrón de feature module

```
features/<name>/
├── pages/         → componentes que se mapean a una ruta
├── components/    → subcomponentes del feature
├── hooks/         → lógica extraíble (use<Nombre>)
└── api/
    ├── queries.ts    → hooks useQuery
    └── mutations.ts  → hooks useMutation
```

Reglas:

- Una página no hace fetch directo: llama a los hooks de `../api/`.
- Los hooks de `api/` son la **única** puerta a la red para ese feature.
- Los modelos se importan de `src/app/models/` (nunca se redefine un interface local con otro shape).

---

## 3. Patrón de componente

```tsx
// features/products/components/ProductCard.tsx
import type { ProductoList } from '../../../models/Producto';

interface ProductCardProps {
  producto: ProductoList;
}

export function ProductCard({ producto }: ProductCardProps) {
  return <article>{/* ... */}</article>;
}
```

### Reglas

- **Function components con tipado explícito de props** (interface `XProps`).
- Sin `console.log`. Sin comentarios salvo que el usuario lo pida.
- Presentación pura: si un componente necesita datos, recibe props o un hook propio del feature.
- Estados de toda lista/pantalla asíncrona: **loading**, **error** y **vacío** (nada de renders en blanco).
- Accesibilidad mínima: `label`/`aria-*` en formularios, `alt` en imágenes, botones reales (`<button>`, no `<div onClick>`).

---

## 4. Patrón de data fetching (TanStack Query)

```ts
// features/products/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../core/api/api.client';
import type { ListadoProducto } from '../../../models/Producto';

export function useProductos(filtros: FiltrosProducto) {
  return useQuery({
    queryKey: ['productos', 'listado', filtros],
    queryFn: async (): Promise<ListadoProducto> => {
      const { data } = await apiClient.get('/api/productos', { params: filtros });
      return data;
    },
  });
}
```

### Reglas

1. **queryKey canónica**: `[recurso, acción, parámetros]` — siempre el mismo orden; es lo que permite invalidar después de una mutation.
2. **Nunca** `fetch`/`axios` dentro de `useEffect` de un componente.
3. **Mutations invalidan sus keys**: `queryClient.invalidateQueries({ queryKey: ['productos'] })` después del éxito.
4. `enabled` para queries condicionales (no usar `if` antes del hook).
5. El interceptor de Axios adjunta el token y normaliza errores: los hooks solo leen `error`.

---

## 5. Manejo de errores de API

```ts
// core/api/apiError.ts — forma que devuelve el interceptor
export interface ApiErrorDetails {
  field: string;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;
  details?: ApiErrorDetails[];
}
```

- El back responde **siempre** `{ statusCode, message }` (y `details[]` en validaciones 400). Ver `api-contract.md`.
- En forms: mapear `details[].field` a errores de React Hook Form.
- En listas/páginas: bloque de error con mensaje de `error.message` + botón reintentar.
- `401` → interceptor limpia sesión y redirige a `/login`. `403` → pantalla "no autorizado" (guard ya debió evitarlo).

---

## 6. Dinero, fechas y estados

| Concepto         | En el modelo (contrastar con `api-contract.md`) | Para mostrar                         |
| ---------------- | ----------------------------------------------- | ------------------------------------ |
| Dinero           | `string` (`"1500.00"`)                          | `Intl.NumberFormat('es-AR', {...})`  |
| Fecha            | ISO 8601 UTC (`"2026-09-21T21:00:00.000Z"`)     | formateador local, sin tocar el dato |
| Estado de pedido | enum MAYÚSCULAS (`'REALIZADO'`)                 | mapa de etiquetas/color en UI        |
| Listados         | `{ data, total }` (+ `page`/`size`)             | paginar con `total`, no con `length` |

- **Nunca** operar dinero con `number` de JS (sumas, restas, descuentos): eso lo calcula la API.

---

## 7. Auth y guardias

- `AuthProvider` (Context) expone `user`, `token`, `login()`, `logout()` y envuelve la app en `main.tsx`.
- `ProtectedRoute` redirige a `/login` si no hay sesión; `AdminRoute` redirige a `/` si el rol no es `ADMIN`.
- El token se guarda en `localStorage` y lo adjunta el interceptor de request; **nunca** se lee de `localStorage` fuera de `core/auth` / `core/api`.
- Los modelos de usuario **nunca** incluyen `passwordHash` (el back lo excluye; si aparece, es bug del back, reportar).

---

## 8. Resumen en una línea por regla

1. **Archivos** → tabla de sección 1; nunca inventar nombres propios.
2. **Estructura** → feature module con `pages/components/hooks/api`; la red vive en `api/`.
3. **Componentes** → un componente por archivo, props tipadas, `export default` solo en páginas.
4. **Data fetching** → TanStack Query con queryKey canónica; nunca `fetch` en `useEffect`.
5. **Errores** → `ApiError { statusCode, message, details? }` desde el interceptor; estados loading/error/vacío siempre.
6. **Dinero** → `string` en el modelo, `Intl.NumberFormat` para mostrar, nunca aritmética con float.
7. **Fechas** → ISO 8601 UTC en el modelo, formatear solo en presentación.
8. **Modelos** → de `src/app/models/`, consistentes con `api-contract.md` (wrapper `{ data, total }`, estados en MAYÚSCULAS).
9. **Auth** → Context + guards; token vía interceptor; sin `passwordHash`.
10. **Límites** → sin URLs hardcodeadas, sin `console.log`, sin lógica de negocio, sin `.env` en el repo.
