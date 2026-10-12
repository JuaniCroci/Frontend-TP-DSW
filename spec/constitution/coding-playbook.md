# Coding Playbook — Entreno 2.0 Frontend

> **Fuente de verdad para la escritura de código.**
> Todo agente que implemente una feature debe leer este archivo junto con `tech-stack.md`, `api-contract.md`, `api-endpoints.md` y el `plan.md` de la feature.
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

## 2. Nomenclatura de identificadores (funciones, variables, hooks)

**Idioma:** identificadores de código en **inglés**; se mantienen en **español** los nombres que vienen del contrato (modelos, campos, enums, query params, queryKeys) — `Producto`, `estado`, `precioUnitario`.
✔ `handleConfirmOrder(pedido: Pedido)` · ✔ `isLoading` · ✗ `handleAgregarPedido` (mezcla dos idiomas en un identificador).

| Qué                     | Patrón                                       | Ejemplo                                                      |
| ----------------------- | -------------------------------------------- | ------------------------------------------------------------ |
| Handler de evento       | `handle<Evento>`                             | `handleSubmit`, `handleRowClick`                             |
| Prop de callback        | `on<Acción>`                                 | `onSubmit`, `onSelect` (input/output property de la cátedra) |
| Booleano                | `is/has/can` + PascalCase                    | `isLoading`, `hasError`, `canEdit`                           |
| Constante               | `SCREAMING_SNAKE_CASE`                       | `API_TIMEOUT_MS`, `ESTADOS_PEDIDO`                           |
| Custom hook             | `use<Nombre>`                                | `useProducts`, `useCart`                                     |
| Query (TanStack)        | `use<Recurso>` / `use<Recurso><Listado>`     | `useProductos`, `useProducto(id)`                            |
| Mutation (TanStack)     | `useCrear<Recurso>` / `use<Action><Recurso>` | `useCrearProducto`, `useConfirmarPedido`                     |
| queryKey                | `[recurso, acción, params]`                  | `['productos', 'listado', filtros]`                          |
| Modelo / interface      | `PascalCase` (español)                       | `Producto`, `Pedido`, `EstadoPedido`                         |
| Tipo de props           | `<Component>Props`                           | `ProductCardProps`                                           |
| Función util            | `verbo<Objeto>` (inglés)                     | `formatMoney`, `parseIsoDate`                                |
| Estilo Tailwind (clase) | `kebab-case` (utility classes)               | `grid-cols-1 md:grid-cols-3`                                 |

Reglas:

- **Nunca** abreviaturas opacas (`d`, `p`, `res`, `data1`); nombres que se leen en una frase.
- Booleanos se leen como pregunta: `if (isLoading)`, `disabled={!canSubmit}`.
- **Un solo idioma por identificador**: no `handleAgregarItem`, no `formatFechaEnPesos`.

---

## 3. Patrón de feature module

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

## 4. Patrón de componente

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
- **Input / output property** (cátedra): la _input_ es la prop (`producto`, `disabled`); la _output_ es el callback (`onSelect`, `onSubmit`). Nunca se muta una prop.
- Sin `console.log`. Sin comentarios salvo que el usuario lo pida.
- Presentación pura: si un componente necesita datos, recibe props o un hook propio del feature.
- Estados de toda lista/pantalla asíncrona: **loading**, **error** y **vacío** (nada de renders en blanco).
- **HTML semántico**: `header`, `nav`, `main`, `section`, `article`, `footer`, `ul/li` para listados; botones reales (`<button>`, no `<div onClick>`); formularios con `label` asociado.
- Accesibilidad mínima: `label`/`aria-*` en formularios, `alt` en imágenes, foco visible, contraste legible.
- **`data-testid`** para tests: `kebab-case` con formato `<feature>-<elemento>` — `producto-card`, `carrito-total`, `login-submit`. Solo donde el test lo necesite; no decorar todo el árbol.

---

## 5. CSS y HTML con Tailwind (mobile-first)

> Requisito de la cátedra: mobile-first y correcta visualización en **3 breakpoints: SM, MD, LG**.

### Reglas de escritura

1. **Mobile-first**: el CSS base (sin prefijo) es el diseño mobile. Los breakpoints **solo** se usan desde `sm:` en adelante — nunca `max-width`/`max-sm:`.
   - `sm` = 640px · `md` = 768px · `lg` = 1024px (defaults de Tailwind). No inventar breakpoints propios sin agregarlos a `@theme`.
2. **Orden de utilidades fijo** en cada `className` (de adentro afuera): `layout` (flex/grid/col-span) → `box` (w/h/gap/p/m) → `typography` (text/font/tracking) → `visual` (bg/border/shadow/rounded) → `interacción` (hover/focus/disabled) → `responsive` (`sm:/md:/lg:`) → `dark:`.
   - Ejemplo: `className="flex w-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 text-sm shadow-sm transition hover:shadow-md md:flex-row"`
3. **Composición de clases variantes**: `cn()` (`clsx` + `tailwind-merge`) cuando una variante cambia clases (`variant`, `size`, estados). Las dependencias se agregan en el plan de la primera feature que lo use (003 · Layout shell).
   ```tsx
   import { cn } from '../../../shared/utils/cn';
   <button
     className={cn('rounded-md px-4 py-2', variant === 'primary' && 'bg-orange-600 text-white')}
   />;
   ```
4. **Clases repetidas → token o componente**, no copy-paste:
   - Repiten en ≥3 lugares **y** es un patrón visual propio (card, botón, badge): extraer a `@layer components` en `src/index.css` con `@apply` y un nombre en `kebab-case` (`card-producto`, `badge-estado`).
   - Son un valor de diseño (color de marca, spacing, font): exponerlo en `@theme` como token (`--color-brand-500`, `--spacing-card`) y usar `bg-brand-500`.
5. **Sin CSS propio fuera de Tailwind** salvo justificación documentada en `plan.md` (animaciones complejas, pseudo-elementos). **Prohibido** `style={{...}}` para estilos visuales (solo `style` para valores dinámicos no expresables, ej. `width: ${pct}%`).
6. **Una utility no hace dos trabajos**: no mezclar `p-4` de layout con `text-orange-600` de marca en la misma regla de `@apply`.

### Tokens de diseño (en `src/index.css`, `@theme`)

Mantener una **paleta acotada** derivada de la referencia (entreno.com.ar): naranja/amarillo de marca para acciones primarias, grises neutros para superficies, `slate/zinc` para texto. Todo color de marca se declara como token; **no** hardcodear `#[hex]` en las clases.

### Responsive checklist (por pantalla)

- [ ] Se ve bien a 360px (mobile), 768px (md), 1024px+ (lg).
- [ ] Sin scroll horizontal no intencional; grids pasan de 1 → 2 → 3 columnas.
- [ ] Tap targets ≥ 44px en mobile (botones, links del header).

---

## 6. Patrón de data fetching (TanStack Query)

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

## 7. Manejo de errores de API

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

## 8. Dinero, fechas y estados

| Concepto         | En el modelo (contrastar con `api-contract.md`) | Para mostrar                         |
| ---------------- | ----------------------------------------------- | ------------------------------------ |
| Dinero           | `string` (`"1500.00"`)                          | `Intl.NumberFormat('es-AR', {...})`  |
| Fecha            | ISO 8601 UTC (`"2026-09-21T21:00:00.000Z"`)     | formateador local, sin tocar el dato |
| Estado de pedido | enum MAYÚSCULAS (`'REALIZADO'`)                 | mapa de etiquetas/color en UI        |
| Listados         | `{ data, total }` (+ `page`/`size`)             | paginar con `total`, no con `length` |

- **Nunca** operar dinero con `number` de JS (sumas, restas, descuentos): eso lo calcula la API.

---

## 9. Auth y guardias

- `AuthProvider` (Context) expone `user`, `token`, `isAuthenticated`, `login()`, `logout()` y envuelve la app en `App.tsx`.
- `ClientRoute` redirige a `/login` si no hay sesión (con `state.from`); `AdminRoute` hace lo propio y redirige a `/` si el rol no es `ADMIN`.
- El token se guarda en `localStorage` y lo adjunta el interceptor de request; **nunca** se lee de `localStorage` fuera de `core/auth` / `core/api`.
- Los modelos de usuario **nunca** incluyen `passwordHash` (el back lo excluye; si aparece, es bug del back, reportar).

---

## 10. Resumen en una línea por regla

1. **Archivos** → tabla de sección 1; nunca inventar nombres propios.
2. **Identificadores** → código en inglés, contrato en español; `handle<Evento>`, `on<Action>`, `is/has/can`, `use<Recurso>`; un solo idioma por nombre.
3. **Estructura** → feature module con `pages/components/hooks/api`; la red vive en `api/`.
4. **Componentes** → un componente por archivo, props tipadas (input) y callbacks `onX` (output), HTML semántico, `data-testid` en kebab-case.
5. **CSS** → Tailwind mobile-first, breakpoints solo `sm:/md:/lg:`, orden de utilidades fijo, `cn()` para variantes, tokens en `@theme`.
6. **Data fetching** → TanStack Query con queryKey canónica; nunca `fetch` en `useEffect`.
7. **Errores** → `ApiError { statusCode, message, details? }` desde el interceptor; estados loading/error/vacío siempre.
8. **Dinero** → `string` en el modelo, `Intl.NumberFormat` para mostrar, nunca aritmética con float.
9. **Fechas** → ISO 8601 UTC en el modelo, formatear solo en presentación.
10. **Modelos** → de `src/app/models/`, consistentes con `api-contract.md` (wrapper `{ data, total }`, estados en MAYÚSCULAS).
11. **Auth** → Context + guards; token vía interceptor; sin `passwordHash`.
12. **Límites** → sin URLs hardcodeadas, sin `console.log`, sin lógica de negocio, sin `.env` en el repo.
