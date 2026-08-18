# UltraBlue — Reportes de planta

Plataforma para que los operadores de planta (CDMX, Monterrey, Hermosillo) capturen
los reportes operativos (PO-01 a PO-10), de calidad (PC-01 a PC-05) y de
evidencias (EV-01), y para que cualquiera pueda descargar cada reporte en
Excel desde la misma plataforma.

Flujo: **seleccionar planta → seleccionar reporte → responder el formulario en
orden → guardar** (se almacena en base de datos) → **Descargas** genera y
descarga un `.xlsx` con todas las respuestas de ese reporte, actualizado al
momento.

Construido con Next.js (App Router) + Prisma + PostgreSQL (Supabase) +
exceljs.

## Desarrollo local

Necesitas un `.env` con las credenciales de Supabase y `APP_PASSWORD`. La
forma más simple es traerlas de Vercel ya configuradas:

```bash
npx vercel link       # una sola vez, enlaza la carpeta con el proyecto
npx vercel env pull .env
```

Eso deja en `.env` las variables `POSTGRES_*` que crea la integración de
Supabase. Agrega tú `APP_PASSWORD` si no la pusiste en el entorno
Development.

```bash
npm install
npx prisma migrate deploy   # crea las tablas
npm run db:seed             # carga operadores/proveedores/tanques base por planta
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) y entra con la
contraseña de `APP_PASSWORD`.

Nota: si `next dev` falla con un error de Turbopack en tu máquina, usa
`next dev --webpack` (ver `.claude/launch.json`).

## Cómo está armado

- `src/lib/reports/schemas/*.ts` — la definición completa de cada uno de los
  16 reportes (secciones, preguntas, tipo de campo, lógica condicional
  "si respondió Sí/No", campos calculados como la diferencia de bolsas o si la
  concentración cumple especificación ISO 22241). Agregar o cambiar una
  pregunta se hace solo aquí, no hay que tocar el formulario.
- `src/components/DynamicForm.tsx` — un único motor de formulario que lee esa
  definición y renderiza cualquiera de los 16 reportes.
- `MasterListItem` (Prisma) — listas editables por planta (operadores,
  proveedores, tanques, clientes...). Cada dropdown tiene un botón
  **"+ Otro"** para agregar un valor nuevo sin tocar código.
- `ReportSubmission` (Prisma) — cada envío de formulario, guardado como JSON.
  Guardar todos los reportes en una sola tabla (en vez de una tabla por reporte) es lo que
  permite que `/api/export` arme el Excel de cualquier reporte de forma
  genérica.
- `/api/export` — arma el `.xlsx` al vuelo con `exceljs` a partir de lo
  guardado en base de datos. No se guardan archivos Excel de forma separada;
  siempre se generan al momento de descargar, así que nunca están
  desactualizados.

## Desplegar en Vercel

### 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "UltraBlue - reportes de planta"
gh repo create ultrablue-reportes --private --source=. --push
# o crea el repo manualmente en github.com y haz git push
```

### 2. Crea la base de datos en Supabase

En [supabase.com](https://supabase.com) crea un proyecto. Guarda la
contraseña de la base que te pide al crearlo — no se vuelve a mostrar.

### 3. Importa el proyecto en Vercel

En [vercel.com/new](https://vercel.com/new), elige "Import Git Repository" y
selecciona el repo. Vercel detecta Next.js automáticamente.

Hazlo **antes** de conectar Supabase: la integración conecta la base a un
proyecto de Vercel que ya existe, no lo crea. Este primer deploy va a
fallar porque todavía no hay base de datos; es normal.

### 4. Conecta Supabase con Vercel

Desde el panel de Supabase, instala la integración de Vercel y elige el
proyecto. Dos detalles al hacerlo:

- **Custom Environment Variable Prefix**: déjalo **vacío**. Un prefijo
  renombra las variables (`MIAPP_POSTGRES_PRISMA_URL`) y entonces Prisma
  ya no las encuentra.
- **Supabase Preview Branch**: sin marcar, salvo que quieras una copia de
  la base por cada rama de git.

La integración crea sola las variables que la app necesita:

| Variable | Puerto | Para qué |
| --- | --- | --- |
| `POSTGRES_PRISMA_URL` | 6543 | Las consultas de la app (pooler) |
| `POSTGRES_URL_NON_POOLING` | 5432 | Las migraciones |

> **Por qué dos.** El 6543 es PgBouncer, que agrupa conexiones para que las
> funciones serverless no agoten el límite de Postgres. Pero PgBouncer no
> sabe ejecutar migraciones, así que esas van por el 5432.
> [`prisma/schema.prisma`](prisma/schema.prisma) ya lee ambas.

### 4b. Define la contraseña de acceso

El sitio está detrás de una contraseña compartida (ver
[`src/proxy.ts`](src/proxy.ts)). En Vercel → **Settings → Environment
Variables**, agrega:

| Variable | Valor |
| --- | --- |
| `APP_PASSWORD` | la contraseña que compartirás con los operadores |

Sin esta variable la app responde con error en todas las rutas. Cambiarla
cierra la sesión de todos los dispositivos, porque también firma la cookie.

### 5. Crea las tablas y carga los datos base

Trae las credenciales a tu máquina (`.env` está en `.gitignore`, no se
sube) y corre las migraciones:

```bash
npx vercel link             # una sola vez
npx vercel env pull .env
npx prisma migrate deploy   # crea las tablas (usa POSTGRES_URL_NON_POOLING)
npm run db:seed             # carga operadores, proveedores, tanques…
```

Esto precarga los nombres de operadores, proveedores (Femssa, Santzer),
tanques e instructores — todos editables después desde la app con "+ Otro".

Puedes comprobar en Supabase → **Table Editor** que aparecieron las tablas
`MasterListItem` y `ReportSubmission`.

### 6. Despliega

```bash
git push
```

Vercel construye y publica automáticamente en cada push (el script `build`
ya incluye `prisma generate`). La primera vez también puedes lanzarlo con
`vercel --prod` desde la CLI.

### 7. Pruébalo

Entra a la URL que te da Vercel, elige una planta, llena un reporte y
verifica que aparezca en **Descargas** con un botón de Excel.

## Notas para producción

- **Fotos** se guardan como base64 dentro del registro. El navegador las
  redimensiona a 1600px y las recodifica como JPEG antes de enviarlas (ver
  `compressImage` en `src/components/DynamicForm.tsx`), porque el envío
  viaja como un solo JSON y el límite de body en serverless es de 4.5 MB.
  Si el volumen de fotos crece mucho, migrar a
  [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) es el siguiente
  paso natural.
- **Operadores/planta**: hoy Monterrey, CDMX y Hermosillo comparten el mismo
  esquema de listas pero cada una tiene sus propios valores (seed idéntico,
  editable por separado desde el "+ Otro" de cada planta).
- Si necesitas agregar un reporte nuevo o una pregunta a uno existente, se
  edita únicamente el archivo correspondiente en
  `src/lib/reports/schemas/` (y se registra en `schemas/index.ts`).
- **El acceso** es una sola contraseña compartida (`APP_PASSWORD`), no hay
  cuentas por usuario. Cambiarla cierra la sesión de todos los dispositivos
  porque también firma la cookie.
