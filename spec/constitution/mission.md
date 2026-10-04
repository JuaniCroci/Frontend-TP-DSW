# Misión

## Qué construimos

**Entreno 2.0** es el **frontend (SPA)** de un e-commerce de artículos de gimnasio y entrenamiento (suplementos, accesorios y más). Aplicación React 19 + Vite que consume **exclusivamente** la API REST del backend (repo separado) para consultar el catálogo, gestionar el carrito, realizar pedidos y administrar el negocio.

Piezas principales:

1. **Catálogo público** — listado de productos con filtros (tipo, marca, rango de precio) y detalle de producto.
2. **Autenticación y autorización** — registro/login con JWT; guardia de rutas por rol (`ADMIN` / `CLIENTE`).
3. **Carrito y pedidos** — carrito persistente por usuario, confirmación de pedido, historial del cliente.
4. **Panel de administración** — CRUDs de catálogo (marcas, tipos, proveedores, clientes, productos, descuentos, ingresos) y ciclo de vida de los pedidos (entregar / cancelar) + listados con filtros.

## Para quién

- **Cliente final** — se registra, navega el catálogo, arma el carrito, confirma pedidos y consulta su historial.
- **Administrador** — gestiona catálogo, proveedores, clientes, ingresos de mercadería y el estado de los pedidos.
- **Cátedra DSW (UNICEN)** — evalúa el TP según el README de la cátedra; la propuesta aceptada está en [proposal.md](../../proposal.md).
- **Equipo del TP** — 4 integrantes que desarrollan por features con evidencia de participación.

## Principios

- **Repositorios agnósticos** — este repo no importa ni depende de código del backend; toda comunicación es REST. La URL del backend **siempre** sale de `VITE_API_URL`, nunca se hardcodea.
- **Spec-driven** — no se escribe código de una feature sin `spec.md`, `plan.md` y `tasks.md` definidos; la constitución manda.
- **Sin lógica de negocio** — el backend es el dueño de las reglas (stock, descuentos, totales, transiciones de estado). El frontend valida entradas para UX y presenta lo que la API responde; **nunca recalcula de forma autoritativa**.
- **Feature-based** — cada funcionalidad se encapsula en `src/app/features/<nombre>/`.
- **TypeScript estricto** — interfaces en `src/app/models/`, derivadas del `api-contract.md`, nunca inventadas.

## Qué NO es

- **No es el backend** — la API vive en el repo separado [Backend-TP-DSW](https://github.com/JuaniCroci/Backend-TP-DSW); este repo solo la consume.
- **No tiene persistencia propia** — sin store local; el estado de servidor vive en la API (cache en TanStack Query).
- **No es SSR ni Next.js** — SPA 100% cliente (build de Vite + nginx en el `Containerfile`).
- **No decide reglas de negocio** — totales, stock, precios finales y estados vienen calculados/enforceados por la API.
- **No implementa features fuera del `roadmap.md`** sin crear antes su carpeta en `features/`.
- **No incluye alcance voluntario** — cupones, notificaciones y seguimiento de pedido están en el backlog de la cátedra.
