# 005 · Administración de datos — Plan

## Enfoque

Construir un área administrativa bajo `src/app/features/admin/`, reutilizando el `AuthContext`, `apiClient`, TanStack Query y los componentes/layout compartidos. Primero se verifica el rol en rutas; cada bloque agrega sus modelos, queries, mutaciones, páginas y pruebas contra el contrato ya implementado del backend.

Los contratos de cada bloque se verifican contra las rutas, DTOs y servicios del backend antes de implementarlos, ya que el snapshot del frontend no contiene todavía todos los endpoints administrativos.

## Rutas previstas

- `/admin` — inicio administrativo con enlaces a los recursos.
- `/admin/marcas`, `/admin/tipos-producto`, `/admin/proveedores`.
- `/admin/clientes`.
- `/admin/productos`.
- `/admin/descuentos`.
- `/admin/ingresos`.

La forma de alta/edición y el detalle pueden resolverse con formularios/paneles dentro de cada sección si eso mantiene la navegación clara; no se crean rutas públicas para las mutaciones administrativas.

## Secuencia y dependencias

1. **Acceso y maestros:** guardia `ADMIN`, navegación administrativa, marcas, tipos y proveedores.
2. **Clientes:** independiente de productos; se implementa después del primer bloque para completar la secuencia de la feature.
3. **Productos:** depende de marcas, tipos y proveedores, y alimenta el catálogo público existente.
4. **Descuentos:** depende de producto y sus aplicaciones vigentes.
5. **Ingresos:** depende de proveedores y productos; pruebas comprueban que el stock se actualiza únicamente desde el backend.

Aunque clientes no dependa de maestros del catálogo, se mantiene dentro de esta feature como bloque separado y no bloqueante para producto.

## Interfaces y límites

- Auth: `useAuth()` expone `user`, `isAuthenticated`, `logout`; rol `ADMIN` es el único permitido.
- API: Axios centralizado vía `apiClient`; TanStack Query para lectura, invalidación/refetch y mutaciones.
- Datos monetarios: strings decimales, sin cálculos autoritativos en cliente.
- Fechas: ISO 8601 hacia/desde backend; interfaz puede formatear para lectura.
- Listados: preservar envoltorios `{ data, total }` y paginación si el endpoint la devuelve.
- Bajas: presentar confirmación antes de solicitudes que desactiven/bajen/anulen datos.
- La UI informa los errores `400`, `401`, `403`, `404`, `409` y `5xx` usando el normalizador `ApiError`.

## Validación

Cada bloque debe incorporar pruebas con adaptador HTTP mockeado: guardia por rol, shape de request, estado de carga, éxito, error y refetch/invalidación. Para operaciones irreversibles o que cambien stock, verificar explícitamente que el frontend no haga cálculos locales.

Gates al cerrar la feature completa: `pnpm lint`, `pnpm build`, `pnpm test` y revisión del playbook.

## Riesgos

- La spec API local es snapshot y puede quedar desactualizada: verificar la fuente del backend y registrar diferencias antes de codificar.
- La feature agrupa siete CRUDs; se ejecuta por bloques independientes, sin marcarla completa hasta cubrir todos los criterios.
- Ingreso afecta stock como acción de negocio: no convertir alta/anulación en edición genérica de producto.
- Un usuario puede perder permisos o quedar inactivo entre cargar la UI y enviar una mutación; la respuesta 401/403 del servidor debe conservarse y reportarse.

## Desvíos

- Se implementa el área de administración en etapas: este primer bloque cubre guardia de rol y maestros (marca, tipo de producto, proveedor); el resto de la feature permanece pendiente.
- Listados de maestros solicitan `includeInactive=true` para que el administrador pueda distinguir bajas lógicas. Los endpoints de lectura de proveedor también requieren autenticación y rol ADMIN.
- Las rutas de alta/edición se manejan dentro de cada listado para evitar duplicar pantallas de formulario. El detalle usa el endpoint `GET /:id`.
- Smoke manual de lectura con el ADMIN local: `/admin/marcas` mostró Star Nutrition y `/admin/tipos-producto` mostró los tres tipos ya cargados; las operaciones de escritura se cubren con adaptadores mockeados.
- El contenido del contrato API del backend coincide con el snapshot frontend; la única diferencia detectada es la nota de snapshot en el encabezado del frontend, por lo que no hubo que sincronizar endpoints adicionales.
