# spec/ — Entreno 2.0 Frontend

> Desarrollo dirigido por especificación (SDD): primero la spec, luego el plan, luego las tareas, y solo entonces el código.
> Mismo sistema de trabajo que el backend ([Backend-TP-DSW](https://github.com/JuaniCroci/Backend-TP-DSW)), adaptado al frontend.

## Estructura

```
spec/
├── constitution/            ← reglas estables del proyecto
│   ├── mission.md           ← qué construimos y para quién
│   ├── tech-stack.md        ← tecnologías, estructura, decisiones, límites
│   ├── roadmap.md           ← orden y estado de las features + dependencias del back
│   ├── coding-playbook.md   ← fuente de verdad para escribir código
│   ├── api-contract.md      ← snapshot del contrato HTTP del backend
│   └── engineering-loop.md  ← loop de validación por feature (gates)
└── features/                ← una carpeta por feature
    └── NNN-nombre-feature/
        ├── spec.md          ← qué hace + criterios de aceptación
        ├── plan.md          ← cómo se implementa + interfaces externas
        └── tasks.md         ← checklist de tareas
```

## Flujo para una feature

1. Revisar `spec.md` y `plan.md` (si no existen, escribirlos antes de tocar código).
2. Seguir `constitution/engineering-loop.md` (carga de contexto → prereqs → tasks → gates).
3. Ejecutar las tareas de `tasks.md` marcando `[x]`.
4. Validar contra los criterios de aceptación de `spec.md`.
5. Pasar los 4 gates: `pnpm lint` → `pnpm build` → `pnpm test` → playbook review.
6. Mover la feature a "Hecho" en `constitution/roadmap.md` y reportar desvíos en `plan.md`.

## Relación con el backend

- **Repositorios agnósticos**: este repo no importa ni depende de código del backend. Toda comunicación es REST.
- **Fuente de verdad del contrato HTTP**: `spec/constitution/api-contract.md` **del backend**.
- Este repo guarda un **snapshot** en [`constitution/api-contract.md`](./constitution/api-contract.md); si el back cambia ese archivo, sincronizarlo (gate en el loop).
- **El front no implementa lógica de negocio**: stock, descuentos, totales y transiciones de estado los calcula/enforcea la API. El frontend valida entradas para UX y presenta lo que la API responde.

> La constitución manda: si una feature choca con `mission.md` o `tech-stack.md`, se replantea la feature, no la constitución.
