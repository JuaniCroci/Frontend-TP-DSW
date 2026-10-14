# Material de la cátedra (DSW — TP Entreno 2.0)

Fuente original: `tp-dsw-back00/datos_pre_inicio/` (repo backend). Copiado acá para que el frontend sea autosuficiente.

## Contenido

| Archivo                                                      | Qué es                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| [`enunciado-tp.md`](./enunciado-tp.md)                       | README del TP de la cátedra: requisitos técnicos/funcionales, entregas, fechas, evaluación |
| [`proposal-catedra.md`](./proposal-catedra.md)               | Plantilla de propuesta que la cátedra exige actualizar antes de cada entrega               |
| [`DER-Entreno2.0.drawio.html`](./DER-Entreno2.0.drawio.html) | Modelo entidad-relación (abrir con draw.io / diagrams.net)                                 |

## Requisitos del enunciado aplicados a este repo

Los requisitos técnicos de frontend de [`enunciado-tp.md`](./enunciado-tp.md) están reflejados en la constitución:

| Requisito de la cátedra                  | Dónde vive                                                           |
| ---------------------------------------- | -------------------------------------------------------------------- |
| Framework de frontend + HTML5            | `spec/constitution/tech-stack.md` (React 19)                         |
| CSS con framework/guía de estilo         | `spec/constitution/tech-stack.md` (Tailwind CSS 4 — definitivo)      |
| Guía de estilo JS (Airbnb, sugerida)     | ESLint flat + Prettier (`eslint.config.js`)                          |
| Mobile-first + breakpoints SM/MD/LG      | `spec/constitution/coding-playbook.md` (sección CSS/Tailwind)        |
| Manejo de eventos, errores y reactividad | `spec/constitution/coding-playbook.md` (estados loading/error/vacío) |
| Input / output property                  | `spec/constitution/coding-playbook.md` (props y callbacks)           |
| Al menos un servicio                     | Capa `features/<name>/api/` + `core/api/`                            |
| Modelos con interfaces/tipos custom      | `src/app/models/` (`spec/constitution/tech-stack.md`)                |
| Patrón de diseño (de ser posible)        | `ApiError` (clase) en `core/api/apiError.ts`                         |
| UX/UI sin manual de usuario              | `spec/constitution/coding-playbook.md` (accesibilidad y estados)     |

## Pendientes

- **`docs.md`** y **`FAQ.md`** — el enunciado los referencia (secciones 3.4 y 6) pero no están en `datos_pre_inicio`. Pedirlos al equipo y sumarlos acá.
- **Test end-to-end** (aprobación) — decidir herramienta (Playwright/Cypress) al iniciar la fase de aprobación.
- ~~**Evidencia de gestión** (README §4)~~ — ✅ 2026-10-14: metodología + minutas en [`docs/gestion/`](../gestion/README.md) y [GitHub Projects board](https://github.com/users/JuaniCroci/projects/1) (issues #1–#11).
- **Fecha de regularidad:** 12/10 al 16/10 (recuperatorio 26/10–30/10; última instancia 9/11–13/11).
