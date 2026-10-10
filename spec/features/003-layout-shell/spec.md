# 003 · Layout shell

**Estado:** implementada

## Qué hace

Presenta la portada pública de Entreno 2.0 y la estructura de navegación principal. Incluye rutas para el inicio y el login, una cabecera compartida con estado de sesión y un pie de página.

## Criterios de aceptación

- [x] La ruta `/` muestra una portada adaptable a pantallas chicas y grandes.
- [x] La portada presenta Entreno 2.0, una propuesta breve y accesos a las categorías de la tienda.
- [x] La cabecera permite volver al inicio, recorrer la sección de categorías y abrir el login.
- [x] La cabecera refleja si hay una sesión iniciada y permite cerrarla.
- [x] La ruta `/login` muestra el formulario de login existente y conserva la marca Entreno 2.0.
- [x] Al iniciar sesión correctamente desde `/login`, se vuelve a la portada.
- [x] Una ruta desconocida vuelve al inicio.
- [x] Hay pruebas de la navegación principal y del flujo de login/logout desde la app.
- [x] La portada no inventa productos ni consulta endpoints que todavía pertenecen a features posteriores.

## Fuera de alcance

- Catálogo real, filtros y detalle de producto.
- Carrito, pedidos y panel de administración.
- Rutas privadas por rol.
- Contenido promocional administrable desde el backend.
