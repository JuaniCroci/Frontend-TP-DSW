# Frontend-TP-DSW — Entreno2.0

Frontend del proyecto **Entreno2.0**, plataforma de e-commerce de suplementos y artículos de gimnasio. Inspirado en [entreno.com.ar](https://entreno.com.ar/).

## Stack

| Herramienta     | Versión |
| --------------- | ------- |
| React           | 19      |
| TypeScript      | 5.8     |
| Vite            | 6       |
| Tailwind CSS    | 4       |
| React Router    | 7       |
| TanStack Query  | 5       |
| Axios           | 1       |
| React Hook Form | 7       |

> **State management:** Context (auth/UI) + TanStack Query (server state) — decidido en [`spec/constitution/tech-stack.md`](./spec/constitution/tech-stack.md).

## Requisitos

- Node >= 20 (el repo tiene `.nvmrc`, ejecutar `nvm use` si usás nvm)
- pnpm (o npm)

## Instalación

```bash
git clone <repo-url>
cd Frontend-TP-DSW
nvm use              # opcional, usa la versión de Node del .nvmrc
pnpm install
cp .env.example .env  # editar VITE_API_URL con la URL del backend
pnpm dev             # arranca el dev server
```

## Scripts

| Comando                             | Descripción                                 |
| ----------------------------------- | ------------------------------------------- |
| `pnpm dev`                          | Inicia servidor de desarrollo (puerto 5173) |
| `pnpm build`                        | Compila para producción (`tsc -b` + Vite)   |
| `pnpm preview`                      | Previsualiza build producción               |
| `pnpm typecheck`                    | Verificación de tipos estática              |
| `pnpm lint` / `pnpm lint:fix`       | ESLint                                      |
| `pnpm format` / `pnpm format:check` | Prettier                                    |
| `pnpm test` / `pnpm test:watch`     | Suite de tests (Vitest + Testing Library)   |

> **Gates de cada feature:** `pnpm lint` → `pnpm build` → `pnpm test` → playbook review. Ver [`spec/constitution/engineering-loop.md`](./spec/constitution/engineering-loop.md).

## Desarrollo dirigido por especificación

Igual que el backend, todo el trabajo sigue **spec → plan → tasks → código**:

```
spec/
├── constitution/   # mission, tech-stack, roadmap, coding-playbook, api-contract, engineering-loop
└── features/NNN-*/ # spec.md + plan.md + tasks.md de cada feature
```

1. Antes de tocar código: crear la carpeta de la feature en `spec/features/` (o revisarla si ya existe).
2. Seguir [`spec/constitution/engineering-loop.md`](./spec/constitution/engineering-loop.md).
3. Pasar los gates y marcar la feature en [`spec/constitution/roadmap.md`](./spec/constitution/roadmap.md).

Guía para agentes de IA: [`AGENTS.md`](./AGENTS.md) · Skills: [`.agents/skills/`](./.agents/skills/README.md).

## Estructura

```
src/
└── app/
    ├── core/           # Servicios globales (API client, auth, guards)
    │   ├── api/        #   instancia de axios, interceptors
    │   ├── auth/       #   contexto/provider de autenticación
    │   └── guards/     #   protección de rutas
    ├── models/         # Interfaces TypeScript del dominio
    ├── features/       # Módulos por funcionalidad
    │   ├── auth/       #   login / registro
    │   ├── products/   #   catálogo, detalle, filtros
    │   ├── cart/       #   carrito de compras
    │   ├── orders/     #   checkout, historial, seguimiento
    │   ├── admin/      #   CRUDs de administración
    │   ├── reviews/    #   reseñas de productos
    │   └── profile/    #   perfil del cliente
    └── shared/         # Componentes reutilizables
        ├── components/ #   UI (Button, Card, Modal, Navbar, Footer...)
        ├── hooks/      #   hooks genéricos
        └── layout/     #   layout base (Header, Footer, Sidebar)

tests/
├── unit/             # hooks, utils, normalizadores
└── feature/          # páginas/flujos con apiClient mockeado

spec/                 # constitución + features (fuente de verdad del alcance)
```

## Arquitectura

- **Repositorios agnósticos:** frontend y backend son repos independientes. Toda comunicación vía REST API.
- **Feature-based:** cada funcionalidad vive en su propio módulo dentro de `features/`.
- **Data fetching:** TanStack Query + Axios, con URL configurable vía `VITE_API_URL`.
- **Containerizado:** `Containerfile` multi-stage para build + nginx.

## Cómo funciona un repositorio con Front y Back separados

Este proyecto es **solo el frontend**. El backend vive en un repositorio independiente:

- **Frontend:** este repo (React + Vite, puerto 5173)
- **Backend:** https://github.com/JuaniCroci/Backend-TP-DSW (puerto 3000/8000)

### Comunicación

```
┌─────────────────┐     HTTP/REST      ┌─────────────────┐
│  Frontend       │ ◄────────────────► │  Backend (API)  │
│  React + Vite   │                    │  Node/Express   │
│  :5173          │                    │  :3000          │
└─────────────────┘                    └─────────────────┘
```

- El frontend **nunca importa código del backend** — solo hace peticiones HTTP (Axios + TanStack Query).
- La URL del backend se configura en `.env`:
  ```env
  VITE_API_URL=http://localhost:3000   # desarrollo
  # VITE_API_URL=https://api.midominio.com  # producción
  ```

### En desarrollo local

1. Clonar ambos repositorios
2. Levantar el backend (ver su README)
3. En este repo: `cp .env.example .env` y ajustar `VITE_API_URL`
4. `pnpm dev` en cada terminal

### CORS

El backend debe permitir requests desde `http://localhost:5173` (origen del frontend en dev).

## Alcance

Ver [proposal.md](./proposal.md) para detalle completo de funcionalidades.

## Licencia

Proyecto académico — DSW 2026.
