# Frontend-TP-DSW — Entreno2.0

Frontend del proyecto **Entreno2.0**, plataforma de e-commerce de suplementos y artículos de gimnasio. Inspirado en [entreno.com.ar](https://entreno.com.ar/).

## Stack

| Herramienta       | Versión |
| ----------------- | ------- |
| React             | 19      |
| TypeScript        | 5.8     |
| Vite              | 6       |
| Tailwind CSS      | 4       |
| React Router      | 7       |
| TanStack Query    | 5       |
| Axios             | 1       |
| React Hook Form   | 7       |

> **State management:** por definir (pendiente decisión del equipo).

## Requisitos

- Node >= 20
- pnpm (o npm)

## Instalación

```bash
git clone <repo-url>
cd Frontend-TP-DSW
pnpm install
cp .env.example .env   # editar VITE_API_URL con la URL del backend
```

## Scripts

| Comando           | Descripción                    |
| ----------------- | ------------------------------ |
| `pnpm dev`        | Inicia servidor de desarrollo  |
| `pnpm build`      | Compila para producción        |
| `pnpm preview`    | Previsualiza build producción  |
| `pnpm typecheck`  | Verificación de tipos estática |

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
```

## Arquitectura

- **Repositorios agnósticos:** frontend y backend son repos independientes. Toda comunicación vía REST API.
- **Feature-based:** cada funcionalidad vive en su propio módulo dentro de `features/`.
- **Data fetching:** TanStack Query + Axios, con URL configurable vía `VITE_API_URL`.
- **Containerizado:** `Containerfile` multi-stage para build + nginx.

## Alcance

Ver [proposal.md](./proposal.md) para detalle completo de funcionalidades.

## Licencia

Proyecto académico — DSW 2026.
