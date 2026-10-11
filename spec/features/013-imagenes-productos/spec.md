# 013 · Imágenes de productos

**Estado:** implementada

## Qué hace

Permite que un administrador cargue una imagen principal para un producto y consulte el registro
de imágenes cargadas. El archivo se guarda en el almacenamiento local del backend con un nombre
UUID; sus metadatos y su relación con el producto se guardan en la base de datos. Al reemplazar
la imagen principal, la anterior permanece en el registro como no principal.

El catálogo y el detalle públicos muestran la imagen principal del producto cuando existe y
conservan un reemplazo visual cuando no existe.

## Criterios de aceptación

- [ ] Solo ADMIN puede cargar imágenes o consultar el registro administrativo de un producto.
- [ ] Cada carga acepta un archivo PNG, JPEG o WebP de hasta 5 MiB, comprueba su tipo real y
      recibe un UUID independiente del nombre original.
- [ ] El registro almacena ruta relativa, MIME, tamaño, texto alternativo, fuente, licencia,
      atribución opcional, fecha de carga y si la imagen es principal.
- [ ] Las nuevas cargas se convierten en imagen principal; las anteriores permanecen registradas
      como no principales.
- [ ] Los archivos se entregan mediante una ruta pública basada en UUID, sin exponer rutas del
      sistema de archivos.
- [ ] Las respuestas públicas de listado y detalle incluyen solo la imagen principal y mantienen
      compatibilidad para productos sin imagen.
- [ ] La administración permite seleccionar una imagen, completar metadatos y ver la principal
      junto con el historial registrado.
- [ ] El catálogo y el detalle muestran imagen con texto alternativo, manteniendo el placeholder
      cuando no hay imagen o esta no puede cargarse.
- [ ] Se documenta que el almacenamiento local debe persistirse mediante volumen o trasladarse a
      storage externo antes de desplegar en infraestructura efímera.
- [ ] Hay pruebas para autorización, validación del archivo, metadatos, exposición pública e
      interfaz de carga/visualización.

## Fuera de alcance

- Edición o eliminación física de archivos históricos.
- Galerías/carousels, procesamiento de imágenes, generación de miniaturas o CDN.
- Verificación legal automatizada de derechos sobre marcas o fotografías.
- Almacenamiento en la nube.
