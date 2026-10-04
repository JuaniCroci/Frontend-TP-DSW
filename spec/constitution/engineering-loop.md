# Engineering Loop — Entreno 2.0 Frontend

> Protocolo de implementación para agentes de IA.
> Cada feature se implementa con este ciclo. No se avanza a la siguiente feature hasta que todos los gates pasan.
> Espejo del loop del backend, adaptado al frontend.

---

## Visión general del loop

```
┌──────────────────────────────────────────────────────────────┐
│  PARA CADA FEATURE (001 → 008, en orden)                     │
│                                                              │
│  1. CARGA DE CONTEXTO          (leer docs)                   │
│  2. VERIFICAR PREREQUISITOS    (back ✅ + features previas)   │
│  3. IMPLEMENTAR                (tasks.md)                    │
│  4. GATE: lint                 (pnpm lint)                   │
│  5. GATE: build                (pnpm build)                  │
│  6. GATE: tests                (pnpm test)                   │
│  7. GATE: playbook review      (checklist manual)            │
│  8. MARCAR HECHO               (roadmap.md)                  │
│  9. REPORTE DE DESVÍOS         (si los hay)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Paso 1 — Carga de contexto

El agente **debe leer** estos archivos antes de escribir una sola línea:

| Archivo                                | Por qué                                         |
| -------------------------------------- | ----------------------------------------------- |
| `spec/constitution/tech-stack.md`      | Stack, estructura, decisiones cerradas, límites |
| `spec/constitution/coding-playbook.md` | Convenciones de código                          |
| `spec/constitution/api-contract.md`    | Formato de respuestas HTTP (snapshot del back)  |
| `spec/constitution/mission.md`         | Qué construimos y para quién                    |
| `spec/features/NNN-nombre/spec.md`     | Qué hace la feature + criterios de aceptación   |
| `spec/features/NNN-nombre/plan.md`     | Cómo implementarla + interfaces externas        |
| `spec/features/NNN-nombre/tasks.md`    | Checklist de tareas a ejecutar                  |

> **No** leer otros `plan.md` o código fuente salvo que la sección "Interfaces externas" del `plan.md` de la feature lo indique explícitamente.

### 1.b Sincronizar el contrato

Antes de implementar, verificar que el snapshot `spec/constitution/api-contract.md` siga igual al del backend (mismo path en el repo del back). Si cambió, copiar los cambios y anotarlo en `plan.md` bajo "Desvíos de implementación".

---

## Paso 2 — Verificar prerequisitos

Antes de implementar, confirmar dos cosas:

1. **Back**: la columna "Back" de `roadmap.md` está en ✅ (el endpoint existe).
2. **Front**: las features anteriores de las que depende están marcadas como `✅` en `roadmap.md`.

| Feature           | Depende de back    | Depende de front |
| ----------------- | ------------------ | ---------------- |
| 001 · Setup       | 001 ✅             | — (primera)      |
| 002 · Core+Auth   | 002 ✅             | 001              |
| 003 · Layout      | —                  | 001, 002         |
| 004 · Catálogo    | 007 ✅, 010 ✅     | 001–003          |
| 005 · Admin CRUDs | 003–009 ✅         | 001–003          |
| 006 · Carrito     | 011 ✅             | 001–004          |
| 007 · Pedidos     | 012 ✅, **013 ⏳** | 001–006          |
| 008 · Perfil      | 002 ✅             | 001–003          |

Si una dependencia no está lista, **detenerse**: implementarla primero o, si es del back, esperar/avisar al equipo.

---

## Paso 3 — Implementar

Ejecutar las tareas de `tasks.md` en orden, marcando `[x]` a medida que se completan.

### Reglas durante la implementación

1. **Respetar el contrato**: todo shape de request/response sale de `api-contract.md`. Si algo no está ahí, averiguarlo en el plan de la feature, no inventarlo.
2. **No crear archivos sin respaldo en tasks.md**: si se necesita un archivo no listado, agregarlo al `tasks.md` antes de crearlo.
3. **La red vive en `features/<name>/api/`** (queries/mutations) y en `core/api/`. Nada de `fetch`/`axios` en componentes.
4. **Sin lógica de negocio**: si la UI necesita un cálculo que la API no devuelve, es un cambio para el **back** (reportar), no un cálculo local.
5. **Idioma**: mensajes de UI, textos y comentarios en español.

---

## Paso 4 — GATE: Lint

```bash
pnpm lint
```

**Condición de paso:** cero errores. Los warnings son aceptables pero deben documentarse.

Si falla → corregir antes de continuar. No parchear con `// eslint-disable`.

---

## Paso 5 — GATE: Build

```bash
pnpm build
```

**Condición de paso:** `tsc -b && vite build` sin errores (`strict: true`).

Errores comunes a verificar:

- Respuestas de API tipadas contra el contrato (wrapper `{ data, total }`, dinero `string`).
- Props de componentes sin interface o con `any`.
- Imports circulares entre features.

---

## Paso 6 — GATE: Tests

```bash
pnpm test
```

**Condición de paso:** todos los tests pasan, incluidos los nuevos de la feature. **No requiere el backend corriendo** (los tests de red usan un adapter/mocks).

Si un test nuevo no pasa → es un bug en la implementación o en el test. Corregir. No borrar el test.

Verificar cobertura mínima de la feature:

- Al menos 1 test unitario (hook, util o normalizador) con happy path.
- Al menos 1 test de feature/UI que renderice el flujo principal con `apiClient` mockeado.
- Al menos 1 test de caso de error (respuesta 4xx/5xx de la API → estado de error en la UI).

---

## Paso 7 — GATE: Playbook Review

Checklist manual contra `coding-playbook.md`. El agente responde cada ítem antes de avanzar:

```
[ ] Archivos siguen la tabla de sección 1 del playbook
[ ] Estructura feature module correcta (pages/components/hooks/api); la red vive en api/
[ ] Componentes: un componente por archivo, props tipadas, export default solo en páginas
[ ] Estados loading / error / vacío presentes en cada pantalla asíncrona
[ ] Data fetching vía TanStack Query con queryKey canónica; sin fetch en useEffect
[ ] Mutations invalidan sus queryKeys después del éxito
[ ] Modelos de src/app/models/ consistentes con api-contract.md
    (dinero string, listas { data, total }, estados en MAYÚSCULAS, sin passwordHash)
[ ] Errores manejados vía ApiError del interceptor (forms mapean details[].field)
[ ] Sin URLs hardcodeadas (VITE_API_URL) ni dependencias del backend
[ ] Sin console.log ni .env commiteado
[ ] Sin lógica de negocio autoritativa en el front
[ ] Snapshot de api-contract.md sincronizado con el back (si hubo cambios allá)
```

Si algún ítem falla → corregir y volver al gate de lint.

---

## Paso 8 — Marcar hecho

Una vez que todos los gates pasan:

1. Mover la feature a "Hecho ✅" en `spec/constitution/roadmap.md` (y tacharla en "En orden").
2. Actualizar el estado en `spec/features/NNN-nombre/spec.md` de `propuesta` a `implementada`.
3. Marcar todos los ítems de `tasks.md` como `[x]`.

---

## Paso 9 — Reporte de desvíos

Si durante la implementación se tomó alguna decisión que **no estaba en el plan** o que **difiere del playbook**, documentarla al final del `plan.md` de la feature en una sección nueva:

```markdown
## Desvíos de implementación

- **[descripción breve]**: [razón]. Impacto: [qué puede afectar].
```

Esto sirve de contexto para el agente que implemente features posteriores y para el humano que hace la revisión final.

---

## Orden de implementación y modelo de invocación

### Fase 1 — Regularidad (features 001–008)

```
Serie obligatoria:  001 → 002 → 003
Paralelo posible:   004 ∥ 005   (ambas solo dependen de 001–003)
Serie obligatoria:  004 → 006 → 007
008 puede correr en paralelo con 006/007
```

### Prompt base para invocar un agente por feature

```
Implementa la feature NNN-[nombre] del frontend Entreno 2.0.

Lee estos archivos antes de escribir código:
- spec/constitution/tech-stack.md
- spec/constitution/coding-playbook.md
- spec/constitution/api-contract.md
- spec/constitution/mission.md
- spec/features/NNN-[nombre]/spec.md
- spec/features/NNN-[nombre]/plan.md
- spec/features/NNN-[nombre]/tasks.md

Sigue el engineering-loop.md al pie de la letra:
1. Lee los archivos de contexto y sincroniza api-contract.md si el back cambió.
2. Verifica que los prerequisitos (back y front) estén implementados.
3. Implementa los tasks en orden.
4. Ejecuta pnpm lint → pnpm build → pnpm test.
5. Completa el checklist de playbook review.
6. Marca la feature como hecha en roadmap.md.
7. Reporta desvíos al final del plan.md si los hay.

No modifiques archivos fuera de:
- src/app/features/[nombre]/
- src/app/core/ o src/app/shared/ (si la feature lo requiere)
- src/app/models/
- tests/unit/ y tests/feature/
- spec/features/NNN-[nombre]/ (solo para marcar tasks y desvíos)
- spec/constitution/roadmap.md (solo para marcar hecho)
```

---

## Reglas de oro del loop

> 1. **Un gate roto detiene la feature.** No avanzar a la siguiente con gates fallidos.
> 2. **No parchear los gates.** Si lint falla, corregir el código, no deshabilitar la regla.
> 3. **Los desvíos se documentan, no se ocultan.** Un agente posterior que lea el plan.md puede adaptar su implementación.
> 4. **La constitución manda.** Si el plan de la feature choca con `mission.md` o `tech-stack.md`, se replantea la feature, no la constitución.
> 5. **El orden de features es el orden de dependencias.** No omitir features "simples" para ir directo a las complejas.
> 6. **El contrato manda sobre la intuición.** Si un shape no está en `api-contract.md`, no se asume: se verifica en el back o se reporta.
