# Gestión del proyecto — Evidencia de regularidad

> Requisito: enunciado §4 (_Gestión del proyecto_) — metodología + minutas + trackeo de features/bugfix.

## Metodología: Scrum liviano con tablero Kanban

Elegimos una variante **ligera de Scrum** con tablero **Kanban**, adaptada a un grupo chico y a un flujo spec→código:

| Elemento Scrum     | Cómo trabajamos en este TP                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Product Backlog    | [`docs/review-backlog.md`](../review-backlog.md) (lotes T1…) + el [board](https://github.com/users/JuaniCroci/projects/1) |
| Sprint / lote      | Un **lote** por ciclo: alcance acordado, gates verdes, commit y cierre marcado en el backlog con fecha + hash             |
| Daily              | Coordinación asíncrona por la tool del equipo; decisiones registradas en las [minutas](./minutas.md)                      |
| Review             | Revisión de la rama al cerrar el lote (gates + revisión de código)                                                        |
| Retro              | Sección "Ingresos" del backlog: los hallazgos nuevos se registran **antes** de arreglarlos, y alimentan el próximo lote   |
| Definition of Done | `pnpm lint` → `pnpm typecheck` → `pnpm test` → `pnpm build` verdes + backlog actualizado + commit                         |

## Trackeo (GitHub Projects)

- **Board:** <https://github.com/users/JuaniCroci/projects/1> (público)
- **Columnas (campo Status):** `Todo` · `In Progress` · `Done`
- **Issues:** <https://github.com/JuaniCroci/Frontend-TP-DSW/issues>
- **Labels:** `deploy`, `proceso` (evidencia/metodología), `fase-aprobacion` (no iniciar hasta el deploy), `voluntario` (backlog fuera del alcance mínimo)
- **Commits/PRs:** historial en <https://github.com/JuaniCroci/Frontend-TP-DSW>. Los cambios de más de una feature se hacen en rama y se mergean a `main`; los lotes chicos commitean directo.

## Minutas

Registro de avances y reuniones de coordinación: [`minutas.md`](./minutas.md) — se agrega una entrada por reunión/avance relevante.

## Changelog

Historial de cambios con fecha, autoría y commits: [`CHANGELOG.md`](../../CHANGELOG.md) — se agrega una entrada (formato del back: Feature / Comportamiento / Tests / Gates) al cerrar cada feature o lote, junto con su entrada en las minutas cuando el avance lo amerite.

## Convenciones de los issues

- El título lleva el número de feature cuando corresponde (`009 CRUD Tag (fase aprobacion)`).
- El body incluye contexto + **AC** (criterios de aceptación) con checklist.
- Un issue pasa a `In Progress` cuando arranca y a `Done` al mergear con gates verdes.
- Las features de la **fase de aprobación** tienen label `fase-aprobacion` y **no se arrancan** hasta definir y ejecutar el deploy (orden acordado 2026-10-14).
