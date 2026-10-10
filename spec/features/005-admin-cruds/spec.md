# 005 · Administración de datos

**Estado:** primer bloque implementado (acceso y maestros); quedan pendientes clientes, productos, descuentos e ingresos

## Objetivo

Permitir que un usuario con rol `ADMIN` gestione desde la aplicación los datos necesarios para operar la tienda. La UI consume exclusivamente la API del backend y presenta sus validaciones y reglas; no reemplaza reglas de negocio ni modifica existencias directamente.

## Usuarios y acceso

- Solo usuarios autenticados con rol `ADMIN` pueden acceder a las pantallas y operaciones de administración.
- Usuarios anónimos que abran una ruta administrativa son enviados al login.
- Usuarios autenticados con rol `CLIENTE` no pueden acceder a rutas ni operaciones administrativas y vuelven a la portada.
- La autorización del backend sigue siendo obligatoria; ocultar enlaces en la UI no constituye un control de acceso.

## Alcance y orden de entrega

La feature se implementa en bloques comprobables:

1. **Maestros del catálogo:** marcas, tipos de producto y proveedores.
2. **Clientes:** alta, consulta, edición y activación/desactivación de usuarios `CLIENTE`.
3. **Productos:** alta, consulta, edición y baja lógica con referencias a marca, tipo y proveedor.
4. **Descuentos:** gestión del descuento y su aplicación a productos con vigencia.
5. **Ingresos de mercadería:** registrar líneas de ingreso y anular un ingreso registrado cuando la API lo permita.

Dependencias: producto requiere los maestros activos de tipo y marca; proveedor es opcional en un producto. Descuento e ingreso requieren productos activos. Ingreso además requiere proveedor activo y puede cambiar el stock únicamente mediante las operaciones del backend.

## Operaciones cubiertas

### Marcas

- Endpoints: `GET /api/marcas`, `GET /api/marcas/:id`, `POST /api/marcas`, `PUT /api/marcas/:id`, `DELETE /api/marcas/:id`.
- Formulario: `nombre` obligatorio, entre 2 y 80 caracteres.
- Eliminar es baja lógica; los registros inactivos no se muestran en el listado público ni pueden seleccionarse para nuevas relaciones. El nombre duplicado responde `409`.

### Tipos de producto

- Endpoints: `GET /api/tipos-producto`, `GET /api/tipos-producto/:id`, `POST /api/tipos-producto`, `PUT /api/tipos-producto/:id`, `DELETE /api/tipos-producto/:id`.
- Formulario: `nombre` obligatorio, entre 2 y 80 caracteres; `descripcion` opcional, hasta 500 caracteres.
- Eliminar es baja lógica. Nombre duplicado responde `409`.

### Proveedores

- Endpoints: `GET /api/proveedores`, `GET /api/proveedores/:id`, `POST /api/proveedores`, `PUT /api/proveedores/:id`, `DELETE /api/proveedores/:id`.
- Formulario: `razonSocial` obligatoria (máximo 255), `cuit` obligatorio (11 dígitos), `telefono`, `email` y `domicilio` opcionales.
- Eliminar es baja lógica. El CUIT duplicado responde `409`; el email debe tener formato válido si se informa.
- Datos internos de proveedor solo se muestran en administración; nunca se exponen en el catálogo público.

### Clientes

- Endpoints: `GET /api/clientes`, `GET /api/clientes/:id`, `POST /api/clientes`, `PUT /api/clientes/:id`, `PATCH /api/clientes/:id/activar`, `PATCH /api/clientes/:id/desactivar`.
- Listado con filtros soportados por la API: búsqueda `q` y estado `activo`.
- Alta: `nombre`, `email`, `password`; teléfono y dirección opcionales. Edición de datos y cambio de password solo cuando se envía explícitamente.
- La API fuerza el rol `CLIENTE`; no se crea ni promociona administradores desde este panel. No se muestran contraseñas ni hashes. No existe borrado físico.

### Productos

- Endpoints: `GET /api/productos/admin`, `GET /api/productos/admin/:id`, `POST /api/productos`, `PUT /api/productos/admin/:id`, `DELETE /api/productos/admin/:id`.
- Listado administrativo admite `nombre`, `idTipoProducto`, `idMarca`, `idProveedor`, `activo`, `page` y `size`.
- Alta: `nombre`, `descripcion?`, `precioUnitario`, `stockInicial`, `idTipoProducto`, `idMarca`, `idProveedor?`.
- Edición: los mismos datos editables excepto `stockInicial`; el cliente no puede modificar `stock`.
- Baja lógica. El precio se transmite como decimal string y se formatea solo para mostrar. La API valida las relaciones activas y las reglas de precio/stock.

### Descuentos y aplicación

- Endpoints: `GET /api/descuentos`, `GET /api/descuentos/:id`, `POST /api/descuentos`, `PUT /api/descuentos/:id`, `DELETE /api/descuentos/:id`, `POST /api/descuentos/:id/aplicaciones`, `DELETE /api/descuentos/:id/aplicaciones/:aplicacionId`.
- Descuento: `descripcion`, `cantidadMinima` (mínimo 1), `porcentaje` (mayor a 0 y hasta 100), `activo?`.
- Aplicación: `idProducto`, `fechaDesde`, `fechaHasta`; fechas inclusivas gestionadas por el backend.
- El frontend presenta los descuentos y aplicaciones recibidos, pero no calcula descuentos de compra ni decide cuál se aplica. Descuentos distintos pueden tener vigencias solapadas; no se repite el mismo descuento sobre el mismo producto con fechas solapadas (`409`).

### Ingresos

- Endpoints: `GET /api/ingresos`, `GET /api/ingresos/:id`, `POST /api/ingresos`, `POST /api/ingresos/:id/anular`.
- Listado admite `estado`, `desde` y `hasta`.
- Alta: `nroIngreso`, `idProveedor`, `fecha?` y al menos una línea con `idProducto`, `cantidad` y `precioUnitario`.
- Importe total, validación de líneas, estado y mutaciones de stock pertenecen al backend. La UI no calcula ni edita stock. Anular un ingreso es irreversible y la API puede rechazarlo si dejaría stock negativo.

## Criterios de aceptación globales

- [x] Existe navegación administrativa visible únicamente para `ADMIN` y una sección de administración para marcas, tipos y proveedores.
- [x] Rutas administrativas bloquean tanto usuarios anónimos como usuarios `CLIENTE`; las llamadas también dependen de autorización del backend.
- [ ] Los siete módulos cubiertos ofrecen listado, alta y las operaciones de edición/detalle/activación/baja que define su API, con formularios basados en DTOs reales.
- [ ] Los campos de relación usan opciones cargadas de la API; se impide ofrecer maestros inactivos para nuevas asignaciones.
- [ ] Cada pantalla presenta estados de carga, error, resultado vacío y confirmación visible de operación exitosa.
- [ ] Errores de validación, duplicados y autorización se comunican sin descartarlos ni simular éxito.
- [x] Se invalidan/refrescan las queries relacionadas después de una mutación de marcas, tipos o proveedores, manteniendo la UI sincronizada con el servidor.
- [ ] El stock solo cambia como efecto de alta/anulación de ingreso en backend; nunca mediante formularios de producto ni cálculos locales.
- [ ] El frontend no incluye permisos codificados como sustituto de las comprobaciones del servidor, ni registra secretos/tokens.
- [ ] Hay pruebas para autorización de rutas, formularios/requests, respuesta exitosa y errores de cada bloque.

## Fuera de alcance

- Cambios de esquema, migraciones, seeds o acceso directo a base de datos desde el frontend.
- Alta/edición de usuarios `ADMIN`, roles interactivos o borrado físico.
- Modificación directa de stock desde producto.
- Cálculo local de importes, descuentos, efectos de ingreso o reglas de negocio.
- Asociación N:M marca-producto o proveedor-producto (el modelo actual las maneja mediante relaciones del producto).
- Funcionalidades de carrito, pedidos y pagos.

## Prerrequisitos para empezar a implementar

- Las features frontend 001–004 están completadas en el roadmap.
- Los endpoints de backend 003–009 están disponibles; sus contratos se verifican contra la fuente backend al implementar cada bloque.
- Cargar datos de prueba por la API cuando se necesiten pruebas manuales; no depender de datos personales o credenciales compartidas.
