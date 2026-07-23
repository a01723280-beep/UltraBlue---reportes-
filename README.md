# UltraBlue — Reportes de planta

Plataforma para que los operadores de planta (CDMX, Monterrey, Hermosillo) capturen
los reportes operativos (PO-01 a PO-07) y de calidad (PC-01 a PC-04), y para que
cualquiera pueda descargar cada reporte en Excel desde la misma plataforma.

Flujo: **seleccionar planta → seleccionar reporte → responder el formulario en
orden → guardar** (se almacena en base de datos) → **Descargas** genera y
descarga un `.xlsx` con todas las respuestas de ese reporte, actualizado al
momento.

Construido con Next.js (App Router) + Prisma + SQLite en desarrollo /
PostgreSQL en producción + exceljs.

## Desarrollo local

```bash
npm install
npx prisma migrate dev   # crea prisma/dev.db (SQLite) con las tablas
npm run db:seed          # carga operadores/proveedores/tanques base por planta
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

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

### 2. Cambia la base de datos de SQLite a Postgres

SQLite vive en un archivo local; en Vercel el sistema de archivos se borra en
cada request, así que **no sirve en producción**. Antes de desplegar, edita
[`prisma/schema.prisma`](prisma/schema.prisma):

```prisma
datasource db {
  provider = "postgresql"   // antes decía "sqlite"
  url      = env("DATABASE_URL")
}
```

Y elimina la carpeta `prisma/migrations/` (las migraciones de SQLite no
aplican a Postgres; se vuelven a generar en el paso 4).

### 3. Importa el proyecto en Vercel

En [vercel.com/new](https://vercel.com/new), elige "Import Git Repository" y
selecciona el repo. Vercel detecta Next.js automáticamente — no hay que
configurar nada más en este paso.

### 4. Crea la base de datos Postgres

En el proyecto ya importado, abre la pestaña **Storage → Create Database →
Postgres** (o Neon/Supabase si prefieres). Al conectarla al proyecto, Vercel
agrega automáticamente la variable de entorno `DATABASE_URL`.

### 5. Crea las tablas y carga los datos base

Con la `DATABASE_URL` de producción (cópiala desde Vercel → Settings →
Environment Variables) en tu máquina:

```bash
DATABASE_URL="<la url de Postgres de Vercel>" npx prisma migrate deploy
DATABASE_URL="<la url de Postgres de Vercel>" npm run db:seed
```

Esto crea las tablas y precarga los nombres de operadores, proveedores
(Femssa, Santzer) y tanques que vienen en el documento original — todos
editables después desde la app con "+ Otro".

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
