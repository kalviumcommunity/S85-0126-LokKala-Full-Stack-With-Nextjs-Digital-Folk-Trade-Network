# Digital Folk Trade Network

Prisma is configured as the type-safe data layer for this Next.js app backed by PostgreSQL.

## Setup
- Install tooling: `npm install --save-dev prisma` and `npm install @prisma/client` (already in `package.json`).
- Configure your database URL in `.env` (example): `DATABASE_URL="postgresql://username:password@localhost:5432/mydb"`.
- Sync schema to your dev database: `npx prisma db push` (or `npx prisma migrate dev --name init` when you want migrations).
- Generate the Prisma client after any schema change: `npx prisma generate`.

## Schema overview
- Models live in [prisma/schema.prisma](prisma/schema.prisma) and cover users, categories, artifacts, orders, order items, and reviews with enums for roles and order statuses.
- Relations: artifacts belong to users and categories; orders belong to users and contain order items; reviews connect users and artifacts with a uniqueness constraint.

## Runtime client reuse
- The Prisma singleton is defined in [src/lib/prisma.ts](src/lib/prisma.ts) to avoid excess connections during Next.js hot reloads.

## Health check
- GET `/api/prisma-check` to verify connectivity and see row counts. Implementation is in [src/app/api/prisma-check/route.ts](src/app/api/prisma-check/route.ts).
- Run `npm run dev` and hit the endpoint; success returns totals plus a timestamp. Logs show Prisma queries.

## Notes for the demo
- Show the schema file, the singleton, a `npx prisma generate` run, and the `/api/prisma-check` response in the terminal.
- Reflection prompt: Prisma’s generated queries bring type safety, reduced boilerplate, and safer relations; raw SQL can still be preferable for complex hand-tuned queries or DB-specific features.
