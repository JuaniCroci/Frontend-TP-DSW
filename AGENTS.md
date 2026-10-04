# AGENTS.md — Frontend-TP-DSW

Guía principal para agentes que trabajan en este proyecto.

## Proyecto

SPA frontend de **Entreno 2.0** (e-commerce de artículos de gimnasio). **TypeScript + React 19 + Vite 6**.

- Fuente de verdad: [`spec/`](./spec/README.md) (constitución + features 001–008).
- Contrato HTTP: [`spec/constitution/api-contract.md`](./spec/constitution/api-contract.md) — **snapshot** del repo backend; la fuente de verdad vive allá.
- Backend separado: [Backend-TP-DSW](https://github.com/JuaniCroci/Backend-TP-DSW) (Express 5 + MikroORM + MySQL).
- Package manager: **pnpm** (Node ≥ 20, ver `.nvmrc`).

## Comandos

| Comando                             | Qué hace                                      |
| ----------------------------------- | --------------------------------------------- |
| `pnpm dev`                          | Dev server (Vite) en http://localhost:5173    |
| `pnpm build`                        | `tsc -b && vite build`                        |
| `pnpm typecheck`                    | `tsc --noEmit` (tsconfig.app + tsconfig.node) |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                        |
| `pnpm format` / `pnpm format:check` | Prettier                                      |
| `pnpm test`                         | Suite completa (Vitest + Testing Library)     |
| `pnpm test:watch`                   | Vitest en watch mode                          |
| `pnpm preview`                      | Preview del build de producción               |

Verificación mínima tras cambios: `pnpm lint`, `pnpm typecheck` y `pnpm test`.

## Entorno: conexión con el backend

Repositorios **agnósticos**: no se importa código del back, solo HTTP.

1. Backend arriba en `http://localhost:3000` (ver su README; requiere MySQL).
2. `cp .env.example .env` → `VITE_API_URL=http://localhost:3000`.
3. `pnpm dev` en este repo (puerto 5173).
4. Smoke: `curl http://localhost:3000/api/health` → `200`.

- **CORS**: el back acepta `http://localhost:5173` por defecto (`CORS_ORIGIN`). Si en prod cambia el origen del front, se ajusta `CORS_ORIGIN` **del back**.
- **Plan B** (solo si CORS molesta): proxy de Vite (`server.proxy: { '/api': 'http://localhost:3000' }`) — fuera de alcance por ahora.
- La URL **siempre** sale de `import.meta.env.VITE_API_URL`; está prohibido hardcodearla.

## Stack confirmado

| Capa          | Herramienta              | Estado                              |
| ------------- | ------------------------ | ----------------------------------- |
| Framework     | React 19 + TypeScript    | ✅ fijo                             |
| Build         | Vite 6                   | ✅ fijo                             |
| Estilos       | Tailwind CSS 4           | ⚠️ tentativo (pendiente del equipo) |
| Routing       | React Router 7           | ✅ fijo                             |
| Data fetching | TanStack Query 5 + Axios | ✅ fijo                             |
| Formularios   | React Hook Form 7        | ✅ fijo                             |
| State global  | Context + TanStack Query | ✅ decidido (sin librería extra)    |
| Tests         | Vitest + Testing Library | ✅ fijo                             |
| Calidad       | ESLint (flat) + Prettier | ✅ fijo                             |

## Principios

1. **Repositorios agnósticos** — el frontend NO importa ni depende de código del backend. Toda comunicación vía REST API.
2. **URL del backend siempre configurable** — leer de `import.meta.env.VITE_API_URL`. No hardcodear.
3. **Feature-based architecture** — cada funcionalidad se encapsula en `src/app/features/<nombre>/`.
4. **TypeScript estricto** — interfaces en `src/app/models/`, derivadas de `spec/constitution/api-contract.md`.
5. **Sin lógica de negocio** — stock, descuentos, totales y estados los calcula la API; el front solo presenta.

## Flujo de trabajo (SDD)

Mismo sistema que el backend: **spec → plan → tasks → código**, con gates.

```
1. Crear spec/features/NNN-nombre/ con spec.md, plan.md y tasks.md   (antes de tocar código)
2. Seguir spec/constitution/engineering-loop.md:
   carga de contexto → verificar prereqs → ejecutar tasks
3. GATES: pnpm lint → pnpm build → pnpm test → playbook review
4. Marcar la feature en spec/constitution/roadmap.md
5. Reportar desvíos en plan.md si los hubo
```

- Cada feature nueva se **crea primero** en `spec/features/` (naming `NNN-nombre/`), siguiendo `spec/README.md`.
- El orden y las dependencias (incluidas las del back) están en [`spec/constitution/roadmap.md`](./spec/constitution/roadmap.md).
- La constitución manda: si una feature choca con `mission.md` o `tech-stack.md`, se replantea la feature.

## Estructura y convenciones

```
src/
└── app/
    ├── core/api/         → api.client.ts (axios instance) + apiError.ts
    │                       interceptores (Authorization, normalización de errores)
    ├── core/auth/        → AuthContext, AuthProvider, useAuth          (feature 002)
    ├── core/guards/      → ProtectedRoute, AdminRoute                  (feature 002)
    ├── models/           → archivos .ts con interfaces del dominio
    ├── features/<name>/
    │   ├── pages/        → componentes que son rutas (PascalCase)
    │   ├── components/   → subcomponentes del feature (PascalCase)
    │   ├── hooks/        → hooks específicos (use<Nombre>)
    │   └── api/          → queries.ts + mutations.ts (TanStack Query)
    └── shared/
        ├── components/   → Button, Card, Modal, Input, Spinner...
        ├── hooks/        → useMediaQuery, useDebounce...
        └── layout/       → MainLayout, Header, Footer, Sidebar
tests/
├── unit/                 → hooks, utils, normalizadores
└── feature/              → páginas con apiClient mockeado
spec/                     → constitución + features (fuente de verdad)
```

**Naming:**

- Archivos de features: `kebab-case`
- Componentes React: `PascalCase.tsx`
- Hooks: `use<Nombre>.ts`
- Modelos: `PascalCase.ts` (ej: `Producto.ts`)
- Tests: `kebab-case.unit.test.ts` / `kebab-case.feature.test.tsx`

## Feature module pattern

```
features/<name>/
├── pages/
│   └── <Nombre>Page.tsx         → componente que se mapea a una ruta (export default)
├── components/
│   └── <Nombre>Component.tsx    → subcomponentes (named export)
├── hooks/
│   └── use<Nombre>.ts           → lógica extraíble
└── api/
    ├── queries.ts                → hooks useQuery
    └── mutations.ts              → hooks useMutation
```

## API communication

```ts
// src/app/core/api/api.client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});
```

- **Queries:** `features/<name>/api/queries.ts` con `useQuery` y queryKey canónica `[recurso, acción, params]`.
- **Mutations:** `features/<name>/api/mutations.ts` con `useMutation`; invalidar sus queryKeys en el éxito.
- **Errores:** el interceptor normaliza a `ApiError { statusCode, message, details? }` (formato de `api-contract.md`).
- **Tipos** se importan de `src/app/models/`.
- Prohibido `fetch`/`axios` desde `useEffect` de un componente.

## Modelos del dominio

Se definen en `src/app/models/` **feature por feature**, contrastando con `spec/constitution/api-contract.md`. Reglas duras:

- **Dinero → `string`** (`precioUnitario: "1500.00"`); formatear con `Intl.NumberFormat`, nunca aritmética con `number`.
- **Fechas → ISO 8601 UTC** (`string`).
- **Listados → `{ data, total }`** (+ `page`/`size` cuando aplica): el modelo respeta el wrapper.
- **Estados en MAYÚSCULAS** como el back (`'REALIZADO' | 'CANCELADO' | ...`).
- **Nunca** `passwordHash`.

```ts
// src/app/models/Producto.ts (shapes reales del contrato)
export interface ProductoList {
  id: number;
  nombre: string;
  marca: { id: number; nombre: string };
  precioUnitario: string;
  disponible: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioUnitario: string;
  stock: number;
  activo: boolean;
  tipoProducto: { id: number; nombre: string };
  marca: { id: number; nombre: string };
  proveedor: { id: number; razonSocial: string; activo: boolean } | null;
  createdAt: string;
  updatedAt: string;
}
```

```ts
// src/app/models/Pedido.ts
export type EstadoPedido = 'REALIZADO' | 'ABONADO' | 'ENTREGADO' | 'CANCELADO';

export interface PedidoItem {
  id: number;
  producto: { id: number; nombre: string };
  cantidad: number;
  precioUnitario: string;
  subtotal: string;
  descuentoAplicado: string;
}

export interface Pedido {
  id: number;
  fecha: string;
  estado: EstadoPedido;
  importeTotal: string;
  usuario: { id: number; nombre: string; email: string };
  items: PedidoItem[];
}
```

## Skills (Agent Skills)

- Skills de este proyecto: `.agents/skills/<nombre>/SKILL.md`.
- **Precedencia**: las skills complementan pero **nunca modifican las reglas de la cátedra** (`spec/`, `proposal.md`, `AGENTS.md`). Ante cualquier conflicto, **manda la cátedra**.
- **Regla de revisión**: antes de actuar, revisar las skills disponibles y evaluar si alguna es útil. **Obligatorio en tres momentos**: (1) cuando aparece un **error**, (2) al tomar una **decisión** de diseño/implementación, (3) al **implementar algo nuevo**.
- Si una skill aplica: cargarla con la tool `skill` **antes** de continuar y tratar su contenido como instrucción obligatoria. Procedimiento: [.agents/skills/README.md](./.agents/skills/README.md).
- Mapeo proceso → skill instalada:
  - **Flujo incorporado** (se aplican solas):
    - Aparece un error o bug → `systematic-debugging`.
    - Decisión no trivial de diseño/implementación → `brainstorming`.
    - Feature / módulo / refactor multi-archivo → `writing-plans` + `executing-plans`.
    - Antes de dar una tarea por terminada → `verification-before-completion` (correr `pnpm lint` + `pnpm typecheck` + `pnpm test`).
    - Escribir tests o arreglar bugs → `test-driven-development`.
    - Evaluar un cambio → `code-review-and-quality`.
    - Diseñar endpoints o contratos de módulo → `api-and-interface-design`.
    - Auth, input de usuario, secretos → `security-and-hardening`.
    - Búsqueda de skills nuevas → `find-skills`.
  - **Casos específicos** (solo cuando aplica):
    - `requesting-code-review` → pedir review explícita (requiere repo git).
    - `supabase-postgres-best-practices` → no aplica (no hay Postgres acá).

## Alcance funcional (resumen)

Ver [proposal.md](./proposal.md) para detalle completo y [`spec/constitution/roadmap.md`](./spec/constitution/roadmap.md) para el orden.

### Regularidad

- CRUD simple: Cliente, Proveedor, TipoProducto, Marca
- CRUD dependiente: Producto (← TipoProducto + Proveedor + Marca), Descuento (← Producto)
- Listados: productos filtrados (tipo, marca, precio), pedidos filtrados (fecha, estado, cliente)
- CUU: Hacer pedido (carrito), Entregar/cancelar pedido

### Aprobación

- CRUD: Tag
- CRUD dependiente: Favorito (← Producto + Cliente)
- CUU: Abonar pedido, Agregar reseña

## Reglas de código

- **NO agregar comentarios** a menos que el usuario lo pida.
- Seguir el patrón del feature module más similar.
- Un componente por archivo.
- Export default para páginas, export named para el resto.
- Mantener los archivos pequeños; extraer lógica a hooks.
- Estados **loading / error / vacío** en toda pantalla asíncrona.
- Sin `console.log` en código comiteado.
