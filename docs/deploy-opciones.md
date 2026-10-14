# Estrategia de deploy — investigación y opciones (2026-10-14)

> Documento de trabajo para **decidir en grupo** dónde y cómo publicar la página.
> Investigado con los precios/páginas oficiales el 2026-10-14. Seguir el issue [#1](https://github.com/JuaniCroci/Frontend-TP-DSW/issues/1).

## Contexto: qué hay que desplegar

Son **3 piezas** separadas (no hay un "Supabase" que haga de API):

| Pieza     | Qué es                                                               | Dónde puede vivir                                     |
| --------- | -------------------------------------------------------------------- | ----------------------------------------------------- |
| **Front** | SPA React compilada a archivos estáticos (`pnpm build` → `dist/`)    | Cualquier host estático (Vercel, como ya usamos)      |
| **API**   | Express + Node corriendo **24/7**                                    | Plataforma Node gestionada (Render/Railway…) o un VPS |
| **BD**    | **MySQL** (MikroORM + `mysql2`) — Supabase es Postgres, **no sirve** | MySQL gestionado (TiDB) o MySQL propio (VPS)          |

### Particularidades verificadas en el código (condicionan la elección)

1. **Imágenes de producto en disco** (`PRODUCT_IMAGES_DIR`): el disco efímero de los hosts serverless **borra las imágenes** en cada restart/redeploy. Requiere disco persistente (VPS o planes pagos) o migrarlas a un storage gratis (Cloudinary / Supabase Storage — cambio chico en el back).
2. **Migraciones y seed manuales**: `pnpm migrate` y `pnpm seed:admin` hay que ejecutarlos en el pipeline de deploy (como release command), no corren solas.
3. **CORS por env var** `CORS_ORIGIN` (hoy default `http://localhost:5173`) → hay que setearlo al origen del front desplegado.
4. **`VITE_API_URL`** se inyecta **al buildear** el front → se configura en el dashboard del host del front, y hay que agregar un `vercel.json` con rewrite SPA (si no, 404 al refrescar rutas).
5. **Mixed content**: un front HTTPS no puede llamar a una API HTTP → la API necesita HTTPS. Las plataformas gestionadas lo dan gratis con su dominio; un VPS requiere certificado a mano.

## Investigación de free tiers (2026-10-14)

| Servicio                  | ¿Free real? | Detalle                                                                                                                                                                                                    |
| ------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vercel** (front)        | ✅          | Hobby gratis: HTTPS + dominio `.vercel.app`                                                                                                                                                                |
| **Render** (API)          | ✅ parcial  | Web service gratis 512MB, **pero** se duerme a los ~15 min sin tráfico, **sin disco persistente** (solo pago) y **no ofrece MySQL** gratis (solo Postgres/Key Value)                                       |
| **TiDB Starter** (BD)     | ✅          | MySQL-compatible gestionado, **gratis siempre y sin tarjeta**: 5 GiB + 50M req/mes (hasta 5 instancias). _Ojo: compatible MySQL pero no 100% (FKs no se aplican, sin procedures) — probar las migraciones_ |
| **Railway** (API+BD)      | ⚠️          | **Trial $5 / 30 días sin tarjeta**; plan gratis después = **$1/mes** de crédito (no alcanza para API+MySQL 24/7 ≈ $4–6/mes)                                                                                |
| **Fly.io**                | ❌          | Sin free tier para cuentas nuevas desde oct-2024 (solo trial de 2 h, tarjeta obligatoria)                                                                                                                  |
| **Supabase / Neon**       | ❌ acá      | Son Postgres; el back es MySQL                                                                                                                                                                             |
| **Oracle VM always free** | ✅          | VM gratis para siempre, pero pide **tarjeta** y es server manual                                                                                                                                           |

## Opción 1 — Managed gratis: Vercel + Render + TiDB ⭐

**Procedimiento:** `git push` → Vercel buildea el front (`VITE_API_URL` del dashboard) → Render buildea la API (`pnpm install && pnpm build`), corre `pnpm migrate && pnpm seed:admin` y arranca `pnpm start` con `DB_*`, `JWT_SECRET` y `CORS_ORIGIN=https://<front>`; la BD vive en TiDB Starter (host/puerto/user/password en los envs de Render).

- ✅ $0, sin tarjeta, dura para siempre, más parecido a lo que ya sabemos.
- ⚠️ La API **duerme** (~60 s el primer request); se mitiga con un ping externo cada 10 min (cron-job.org gratis).
- ⚠️ Las **imágenes** necesitan un storage externo (Cloudinary 25GB free / Supabase Storage 1GB free) o se pierden en cada redeploy.
- ⚠️ Riesgo: probar compatibilidad de las migraciones con TiDB.

## Opción 2 — Railway trial ($5 / 30 días, sin tarjeta)

**Procedimiento:** crear proyecto en Railway → añadir MySQL (un click) → añadir el servicio API desde GitHub (`pnpm build` / `pnpm start`), copiar credenciales al env, correr migrate + seed, `CORS_ORIGIN` al front (Vercel).

- ✅ Lo más rápido y simple: API+MySQL+disco en un lugar solo; **imágenes resueltas sin tocar código**; sin sleep.
- ❌ **Se apaga solo** cuando se acaba el crédito (~5–6 semanas si se achica el servicio) → cubre una defensa cercana, no el largo plazo.

## Opción 3 — Oracle Cloud Always Free VM (VPS gratis para siempre)

**Procedimiento:** crear la VM (ARM, gratis para siempre, requiere tarjeta) → instalar Podman/Docker → levantar el `docker-compose.yml` del back (hoy solo MySQL; hay que agregar el servicio API + un Dockerfile) → nginx sirve el `dist/` del front y proxy hacia `/api` → Let's Encrypt para HTTPS (con un subdominio gratis tipo DuckDNS).

- ✅ MySQL real, disco persistente, sin sleep, sin tocar código, gratis para siempre.
- ❌ Signup con fricción (tarjeta, disponibilidad regional), y manejo manual: servidor, certificados, backups, updates.

## Decisiones que faltan (para el grupo)

1. **¿Cuánto duramos?** ¿Solo hasta la defensa (Opción 2 rinde) o para siempre (Opción 1 o 3)?
2. **¿Hay tarjeta disponible?** Si no, se descarta la Opción 3.
3. **¿Qué hacemos con las imágenes?** Storage externo con cambio chico en el back / disco real / posponer.
4. **¿Aceptamos el sleep** de la Opción 1 con el truco del ping?
5. **¿Exige la entrega** de regularidad/defensa el deploy en una fecha?

## Links verificados (2026-10-14)

- <https://railway.com/pricing> · <https://render.com/pricing> · <https://docs.render.com/free> · <https://docs.render.com/disks>
- <https://docs.pingcap.com/tidbcloud/select-cluster-tier/> · <https://fly.io/docs/about/discontinued-plans>
