# 005 · Administración de datos — Tareas

> Feature implementada por bloques. Acceso, maestros, clientes y productos están completos; descuentos e ingresos siguen pendientes.

## A. Contrato y acceso

- [x] Comparar los contratos de maestros con rutas, DTOs y servicios del backend vigente.
- [x] Implementar guardia reutilizable por autenticación y rol `ADMIN`.
- [x] Agregar entrada de administración solo para el usuario `ADMIN` y proteger rutas `/admin/*`.
- [x] Probar acceso permitido, redirección de anónimo y bloqueo de `CLIENTE`.

## B. Maestros de catálogo

- [x] Implementar gestión de marcas: listado, alta, edición, detalle y baja lógica.
- [x] Implementar gestión de tipos de producto: listado, alta, edición, detalle y baja lógica.
- [x] Implementar gestión de proveedores: listado, alta, edición, detalle y baja lógica.
- [x] Mostrar errores de API, duplicado y autorización; confirmar las bajas.
- [x] Cubrir tests de formularios, requests y errores de los tres módulos.

## C. Clientes

- [x] Implementar listado filtrado por `q` y `activo`, detalle/edición de clientes existentes.
- [x] Implementar acciones explícitas activar/desactivar.
- [x] Mantener el alta fuera de administración; crear cuentas desde el flujo público de autenticación.
- [x] No mostrar ni persistir password/hash en respuestas o estado visible; cambiar password solo cuando el admin lo solicita.
- [x] Cubrir requests, errores y permisos con tests.

## D. Productos

- [x] Implementar listado administrativo, detalle y filtros soportados por backend.
- [x] Implementar alta con `stockInicial` y relaciones a tipo/marca, proveedor opcional.
- [x] Implementar edición sin campo de stock y baja lógica confirmada.
- [x] Cubrir validación de dependencias, errores y forma de las mutaciones con tests.

## E. Descuentos

- [ ] Implementar listado, detalle y CRUD del descuento.
- [ ] Implementar gestión de aplicaciones con producto y ventana de vigencia.
- [ ] Presentar errores 400/404/409 de reglas de vigencia sin calcular descuentos localmente.
- [ ] Cubrir alta/edición/baja y aplicaciones con tests.

## F. Ingresos

- [ ] Implementar listado con filtros `estado`, `desde` y `hasta`, más detalle de líneas.
- [ ] Implementar alta con proveedor, número, fecha opcional y al menos una línea.
- [ ] Implementar anulación explícita solo de ingresos `REGISTRADO`, con confirmación y errores visibles.
- [ ] No calcular ni ajustar stock/importes de manera autoritativa en el cliente.
- [ ] Cubrir requests y respuestas de alta/anulación, incluido conflicto por stock insuficiente.

## G. Cierre

- [ ] Revisar todos los criterios de aceptación de `spec.md` al terminar los bloques C-F.
- [ ] Ejecutar `pnpm lint`.
- [ ] Ejecutar `pnpm build`.
- [ ] Ejecutar `pnpm test`.
- [ ] Realizar smoke manual con usuario ADMIN en el backend local.
- [ ] Actualizar roadmap al terminar los bloques C-F.
