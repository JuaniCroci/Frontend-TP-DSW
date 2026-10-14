# Minutas de avances y reuniones de coordinación

> Enunciado §4: _minutas de avances o reuniones de coordinación del equipo_.
> Plantilla al final. Agregar una entrada por evento, en orden cronológico inverso.

---

## 2026-10-14 · Avance: cierre de la concordancia con el back + evidencia de gestión

**Formato:** reunión de coordinación (equipo) + trabajo asíncrono.
**Participantes:** JuaniCroci (completar el resto del equipo).

### Realizado

- **Análisis de estado** del plan de regularidad vs. backend: `docs/analisis-estado-plan-regularidad-y-concordancia-con-el-back.md` (divergencias D1–D7).
- **Lote T6 (concordancia)** cerrado y mergeado:
  - D1: `api-contract.md` del back completado (imágenes, descuentos, carrito, 413) y resincronizado como snapshot idéntico en el front.
  - D2/D5/D6: catálogo `api-endpoints.md` re-extraído (rutas de imágenes, `includeInactive` en marcas, descuentos `GET` públicos).
  - D4: fuera el bloque "Fecha de entrega" del detalle de pedido (la API no lo expone); se conserva en el listado admin.
  - D7: feature 005 cerrada (bloques A–E); ingresos de mercadería extraídos al backlog de aprobación.
  - Smokes manuales contra backend local (Podman + `pnpm dev`): login admin/cliente, autorización, CRUD admin e imágenes end-to-end.
- **Lote T7**: deuda de formato Prettier del repo resuelta (`pnpm format` + gates verdes).
- **Evidencia de gestión**: board de GitHub Projects, issues con AC y esta estructura de minutas.
- Entorno: MySQL del TP renombrado a `entreno-2-mysql` (se distingue del del backend viejo); ambos repos actualizados en GitHub.

### Acuerdos

1. **Orden**: deploy de la página **antes** de iniciar la fase de aprobación (Tag, Favoritos, Reseñas, Abonar pedido, Ingreso de mercadería — issues #7–#11, sin arrancar).
2. El **deploy** es la próxima tarea en curso (issue #1): definir proveedor, `VITE_API_URL` y CORS.
3. Los hallazgos nuevos pasan primero por la sección "Ingresos" del `docs/review-backlog.md` (regla del equipo).

### Pendientes para la próxima

- Definir estrategia de deploy (issue #1) y ejecutarla.
- Completar nombres de participantes en esta minuta si hace falta.

---

## Plantilla

```markdown
## AAAA-MM-DD · [Avance | Reunión de coordinación] · [tema corto]

**Formato:** presencial / videollamada / asíncrono.
**Participantes:** ...

### Realizado

-

### Acuerdos

1.

### Pendientes para la próxima

-
```
