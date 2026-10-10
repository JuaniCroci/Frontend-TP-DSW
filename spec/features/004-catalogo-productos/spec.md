# 004 · Catálogo de productos

**Estado:** implementada

## Qué hace

Permite explorar productos activos de la tienda, acotar los resultados por tipo, marca y precio, ordenar y recorrer páginas. Cada resultado enlaza a una vista de detalle con disponibilidad y descuentos vigentes.

## Endpoints involucrados

- `GET /api/productos?page=&size=&idTipoProducto=&idMarca=&precioMin=&precioMax=&orden=&dir=` — `{ data, total, page, size }`
- `GET /api/productos/:id` — detalle público del producto
- `GET /api/marcas` — `{ data, total }`
- `GET /api/tipos-producto` — `{ data, total }`

## Criterios de aceptación

- [x] La ruta `/productos` muestra productos obtenidos de la API, sin fixtures en la UI.
- [x] Se puede filtrar por tipo de producto, marca y rango de precio.
- [x] Se puede ordenar por nombre o precio y recorrer resultados paginados.
- [x] Se muestran estados diferenciados de carga, error y listado vacío.
- [x] Las tarjetas presentan nombre, marca, precio y disponibilidad.
- [x] La ruta `/productos/:id` muestra datos completos del producto, disponibilidad y descuentos vigentes devueltos por la API.
- [x] Un producto inexistente o un error del servicio presenta un error visible y permite regresar al catálogo.
- [x] La navegación desde la portada y la cabecera permite abrir la tienda.
- [x] Hay pruebas de filtros/request shape, resultados, vacío, errores y detalle.
- [x] Se conserva el formato de dinero como string en los modelos; solo se formatea al presentarlo.

## Fuera de alcance

- Carrito y creación de pedidos.
- Gestión administrativa de productos.
- Imágenes, paginación infinita o búsqueda textual, que no forman parte de los endpoints públicos del catálogo.
