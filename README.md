# UltraBlue — Reportes de planta

Plataforma para que los operadores de planta (CDMX, Monterrey, Hermosillo) capturen
los reportes operativos (PO-01 a PO-07) y de calidad (PC-01 a PC-04), y para que
cualquiera pueda descargar cada reporte en Excel desde la misma plataforma.

Flujo: **seleccionar planta → seleccionar reporte → responder el formulario en
orden → guardar** (se almacena en base de datos) → **Descargas** genera y
descarga un `.xlsx` con todas las respuestas de ese reporte, actualizado al
momento.

Construido con Next.js (App Router) + Prisma + PostgreSQL (Supabase) +
exceljs.

## Desarrollo local

Necesitas un `.env` con `DATABASE_URL`, `DIRECT_URL` y `APP_PASSWORD` (ver
["Desplegar en Vercel"](#desplegar-en-vercel) para de dónde salen las dos
primeras). Puedes apuntar al mismo proyecto de Supabase que producción, o
crear uno aparte para no mezclar datos de prueba con los reales.

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
  11 reportes (secciones, preguntas, tipo de campo, lógica condicional
  "si respondió Sí/No", campos calculados como la diferencia de bolsas o si la
  concentración cumple especificación ISO 22241). Agregar o cambiar una
  pregunta se hace solo aquí, no hay que tocar el formulario.
- `src/components/DynamicForm.tsx` — un único motor de formulario que lee esa
  definición y renderiza cualquiera de los 11 reportes.
- `MasterListItem` (Prisma) — listas editables por planta (operadores,
  proveedores, tanques, clientes...). Cada dropdown tiene un botón
  **"+ Otro"** para agregar un valor nuevo sin tocar código.
- `ReportSubmission` (Prisma) — cada envío de formulario, guardado como JSON.
  Guardar todos los reportes en una sola tabla (en vez de 11 tablas) es lo que
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

Ya creado, ve a **Project Settings → Database → Connection string** y copia
las dos cadenas, porque Prisma necesita ambas:

| Variable | Pestaña | Puerto | Para qué |
| --- | --- | --- | --- |
| `DATABASE_URL` | Transaction pooler | 6543 | Las consultas de la app |
| `DIRECT_URL` | Direct connection | 5432 | Las migraciones |

A `DATABASE_URL` agrégale `?pgbouncer=true` al final. Queda así (sustituye
`[REF]`, `[PASSWORD]` y la región):

```
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

> **Por qué dos.** El puerto 6543 es PgBouncer, que agrupa conexiones para
> que las funciones serverless no agoten el límite de Postgres. Pero
> PgBouncer no sabe ejecutar migraciones, así que esas van por el 5432.
> `prisma/schema.prisma` ya está configurado para usar ambas.

### 3. Importa el proyecto en Vercel

En [vercel.com/new](https://vercel.com/new), elige "Import Git Repository" y
selecciona el repo. Vercel detecta Next.js automáticamente — no hay que
configurar nada más en este paso.

### 4. Conecta Vercel con Supabase

En Vercel → **Settings → Environment Variables**, agrega `DATABASE_URL` y
`DIRECT_URL` con los valores del paso 2.

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

Crea un archivo `.env` local con las mismas dos URLs del paso 2 (`.env` está
en `.gitignore`, no se sube), y desde tu máquina:

```bash
npx prisma migrate deploy   # crea las tablas (usa DIRECT_URL)
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

- **Fotos (PC-01)** se guardan como base64 dentro del registro; funciona bien
  para volúmenes moderados. Si el número de fotos crece mucho, migrar a
  [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) es el siguiente
  paso natural.
- **Operadores/planta**: hoy Monterrey, CDMX y Hermosillo comparten el mismo
  esquema de listas pero cada una tiene sus propios valores (seed idéntico,
  editable por separado desde el "+ Otro" de cada planta).
- Si necesitas agregar un reporte PO-08 o una pregunta nueva a uno existente,
  se edita únicamente el archivo correspondiente en
  `src/lib/reports/schemas/`.
