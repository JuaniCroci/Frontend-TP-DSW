# 004 · Catálogo de productos — Plan

## Enfoque

Consumir los endpoints públicos existentes mediante Axios y TanStack Query. Mantener filtros y orden en los parámetros de URL para que la vista pueda compartirse y el botón de volver conserve su estado. Presentar el listado paginado y una ruta de detalle.

## Interfaces externas verificadas

- `GET /api/productos` devuelve `{ data: [{ id, nombre, marca, precioUnitario, disponible }], total, page, size }`.
- Filtros admitidos: `idTipoProducto`, `idMarca`, `precioMin`, `precioMax`, `orden` (`nombre`/`precio`), `dir` (`asc`/`desc`), `page` y `size`.
- `GET /api/productos/:id` devuelve el producto público completo, más `disponible` y `descuentosVigentes`.
- `GET /api/marcas` y `GET /api/tipos-producto` devuelven `{ data, total }` y solo registros activos por defecto.
- Una consulta local de los tres endpoints respondió 200 con listas vacías; la UI debe mostrar estado vacío sin agregar datos de ejemplo.

## Implementación

1. Definir modelos TypeScript del listado, filtros, detalle, marca, tipo y envoltorios de lista.
2. Crear queries de TanStack Query para catálogo, marcas, tipos y detalle.
3. Agregar `QueryClientProvider` a la app.
4. Crear páginas/lista de producto, controles de filtros, paginación y detalle con estados de carga/error/vacío.
5. Agregar rutas `/productos` y `/productos/:id`.
6. Enlazar la tienda desde la portada y la navegación principal.
7. Cubrir la forma de las llamadas, filtros, resultado vacío/error y navegación de detalle mediante tests con adaptador mockeado.

## Riesgos

- El catálogo local está vacío actualmente; se valida el estado vacío con la API real y el resto del flujo mediante respuestas mockeadas.
- Los precios son strings decimales y no se deben usar para cálculos en el cliente.

## Desvíos de implementación

El catálogo local no tiene productos, marcas ni tipos cargados en la base. Se verificaron respuestas 200 con listas vacías; el estado vacío queda visible hasta que se cargue el catálogo desde administración.
