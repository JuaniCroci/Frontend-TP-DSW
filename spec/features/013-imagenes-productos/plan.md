# 013 · Imágenes de productos — Plan

## Enfoque

Implementar primero el contrato del backend: entidad de registro, migración, endpoint protegido de
carga e historial, y endpoint público de archivo por UUID. La carga valida extensión/MIME y firma
binaria, y usa un directorio local configurable por el entorno. Después, actualizar los contratos
del frontend, integrar la carga en la administración de productos y presentar la imagen en catálogo
y detalle.

La imagen actual reemplaza a la principal, sin borrar filas ni archivos anteriores. Los registros
anteriores quedan disponibles en el historial administrativo. El contenido binario nunca se guarda
en MySQL.

## Contrato

- `POST /api/productos/admin/:id/imagenes` — multipart `imagen`, `altText`, `fuente`, `licencia`
  y `atribucion` opcional; solo ADMIN.
- `GET /api/productos/admin/:id/imagenes` — historial de metadatos; solo ADMIN.
- `GET /api/productos/imagenes/:uid` — entrega una imagen por UUID; público.
- Las respuestas existentes de producto incluyen `imagenPrincipal: null | { id, url, altText }`.

## Validación

- Pruebas de servicio/controlador y tests del formulario/catálogo.
- Backend: typecheck, lint y tests focalizados; migración aplicada solo contra la base local
  configurada para desarrollo, si está disponible.
- Frontend: lint, build y tests focalizados.

## Almacenamiento

El default local es `uploads/productos`. El directorio es configurable con
`PRODUCT_IMAGES_DIR`; en despliegues con contenedores debe montarse como almacenamiento persistente.
La imagen del proyecto es una fotografía propia del usuario; la autorización de uso de la marca
del envase permanece pendiente de confirmación con Star Nutrition.
