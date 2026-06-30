# AGENTS.md — Frontend-TP-DSW

Instrucciones para asistentes de IA que trabajen sobre este repositorio.

## Stack confirmado

| Capa            | Herramienta               | Estado     |
| --------------- | ------------------------- | ---------- |
| Framework       | React 19 + TypeScript     | ✅ fijo    |
| Build           | Vite 6                    | ✅ fijo    |
| Estilos         | Tailwind CSS 4            | ⚠️ tentativo |
| Routing         | React Router 7            | ✅ fijo    |
| Data fetching   | TanStack Query 5 + Axios  | ✅ fijo    |
| Formularios     | React Hook Form 7         | ✅ fijo    |
| State global    | _por definir_             | ❌ pendiente |

## Principios

1. **Repositorios agnósticos** — el frontend NO debe importar ni depender de código del backend. Toda comunicación vía REST API.
2. **URL del backend siempre configurable** — leer de `import.meta.env.VITE_API_URL`. No hardcodear.
3. **Feature-based architecture** — cada funcionalidad se encapsula en `src/app/features/<nombre>/`.
4. **TypeScript estricto** — definir interfaces en `src/app/models/`.

## Estructura y convenciones

```
src/
└── app/
    ├── core/api/         → api.client.ts (axios instance)
    │                      → interceptors (token, error handling)
    ├── core/auth/        → AuthContext, AuthProvider, useAuth
    ├── core/guards/      → ProtectedRoute, AdminRoute
    ├── models/           → archivos .ts con interfaces del dominio
    ├── features/<name>/
    │   ├── pages/        → componentes que son rutas (PascalCase)
    │   ├── components/   → subcomponentes del feature (PascalCase)
    │   ├── hooks/        → hooks específicos (use<Nombre>)
    │   └── api/          → queries + mutations de TanStack Query
    └── shared/
        ├── components/   → Button, Card, Modal, Input, Spinner...
        ├── hooks/        → useMediaQuery, useDebounce...
        └── layout/       → MainLayout, Header, Footer, Sidebar
```

**Naming:**
- Archivos de features: `kebab-case`
- Componentes React: `PascalCase.tsx`
- Hooks: `use<Nombre>.ts`
- Modelos: `PascalCase.ts` (ej: `Producto.ts`)

## Feature module pattern

Cada feature module sigue esta estructura:

```
features/<name>/
├── pages/
│   └── <Nombre>Page.tsx         → componente que se mapea a una ruta
├── components/
│   └── <Nombre>Component.tsx    → subcomponentes
├── hooks/
│   └── use<Nombre>.ts           → lógica extraíble
└── api/
    ├── queries.ts                → useQuery hooks
    └── mutations.ts              → useMutation hooks
```

### Ejemplo de ruta (React Router v7 layout routes)

```tsx
// src/app/features/products/pages/ProductsPage.tsx
import { useProducts } from '../hooks/useProducts'

export default function ProductsPage() {
  const { data, isLoading } = useProducts()
  // ...
}
```

## API communication

```ts
// src/app/core/api/api.client.ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})
```

- **Queries:** se definen en `features/<name>/api/queries.ts` usando `useQuery` de TanStack Query.
- **Mutations:** se definen en `features/<name>/api/mutations.ts` usando `useMutation`.
- **Tipos de request/response** se importan de `src/app/models/`.

## Modelos del dominio (basados en proposal.md)

```ts
// src/app/models/Cliente.ts
export interface Cliente {
  id: number
  nombre: string
  direccion: string
  telefono: string
  email: string
}

// src/app/models/Producto.ts
export interface Producto {
  id: number
  nombre: string
  marca: Marca
  tipoProducto: TipoProducto
  precio: number
  stock: number
  disponible: boolean
}

// src/app/models/Pedido.ts
export interface Pedido {
  id: number
  cliente: Cliente
  fechaRealizado: string
  fechaEntrega?: string
  estado: 'realizado' | 'cancelado' | 'abonado' | 'entregado'
  importeTotal: number
  items: DetallePedido[]
}

export interface DetallePedido {
  producto: Producto
  cantidad: number
  precioUnitario: number
  subtotal: number
}

export interface Proveedor {
  id: number
  nombre: string
}

export interface TipoProducto {
  id: number
  nombre: string
}

export interface Marca {
  id: number
  nombre: string
}

export interface Descuento {
  id: number
  producto: Producto
  porcentaje: number
  fechaInicio: string
  fechaFin: string
}

export interface Tag {
  id: number
  nombre: string
}

export interface Favorito {
  id: number
  cliente: Cliente
  producto: Producto
}

export interface Resena {
  id: number
  cliente: Cliente
  producto: Producto
  puntuacion: number
  comentario: string
  fecha: string
}
```

## Alcance funcional (resumen)

Ver [proposal.md](./proposal.md) para detalle completo.

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
