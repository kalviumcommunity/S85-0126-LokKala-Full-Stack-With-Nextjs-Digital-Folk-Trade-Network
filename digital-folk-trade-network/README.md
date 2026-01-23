# Digital Folk Trade Network

Prisma is configured as the type-safe data layer for this Next.js app backed by PostgreSQL.

## Setup
- Install tooling: `npm install --save-dev prisma` and `npm install @prisma/client` (already in `package.json`).
- Configure your database URL in `.env` (example): `DATABASE_URL="postgresql://username:password@localhost:5432/mydb"`.
- Sync schema to your dev database: `npx prisma db push` (or `npx prisma migrate dev --name init` when you want migrations).
- Generate the Prisma client after any schema change: `npx prisma generate`.

## Migrations workflow
- Create or update schema changes with `npx prisma migrate dev --name <change_name>`; generated SQL lives in [prisma/migrations](prisma/migrations).
- Reset locally with `npx prisma migrate reset` to drop, recreate, and optionally reseed while preserving migration history.
- Prefer small, descriptive migration names (for example `add_review_rating_check`) so reviewers can understand the intent from the SQL diff.
- Capture terminal output when you run migrations so the team and grading demo have evidence of successful application.

## Seed data
- Seed script lives at [prisma/seed.mjs](prisma/seed.mjs) and is wired to Prisma's `seed` hook in `package.json`.
- Run seeding after migrations: `npx prisma db seed`.
- The script truncates the seeded tables (reviews, order items, orders, artifacts, categories, users) before inserting deterministic fixtures for users, categories, artifacts, orders, and reviews. Re-runs stay idempotent in development.
- Verify results in Prisma Studio: `npx prisma studio` and inspect the tables for the expected sample rows.

## Rollback and safety notes
- Development resets: `npx prisma migrate reset` to clear and reapply every migration plus seed data.
- Production hygiene before applying a migration:
	- Take a database backup or ensure PITR snapshots are active.
	- Apply to staging first, validate `npx prisma migrate deploy`, then promote to production.
	- Prefer backward-compatible steps (add columns with defaults, avoid destructive drops) and ship application code that can handle both old and new shapes during rollout.
	- For risky changes, run during a maintenance window and watch database metrics/logs.

## What to show in your demo
- A `npx prisma migrate dev --name <change_name>` run with the generated folder visible in [prisma/migrations](prisma/migrations).
- A `npx prisma db seed` run showing the "Seed data inserted successfully." log.
- A quick Prisma Studio view of the inserted rows and a note that rerunning the seed does not duplicate data because the script resets the seeded tables first.

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

## REST API structure
- Hierarchy lives under `src/app/api` using Next.js file-based routing with plural resource folders.
- Collections: `GET` (paginated, filterable) and `POST` for creation at `/api/users`, `/api/tasks`, `/api/projects`.
- Single resources: `GET`, `PUT`, `DELETE` at `/api/users/:id`, `/api/tasks/:id`, `/api/projects/:id`.
- Pagination query params: `page` (default 1), `limit` (default 10). Filters: `search` across name/title/owner and optional `status` for tasks/projects.

### Sample requests
- List users (page 2, 5 per page): `curl "http://localhost:3000/api/users?page=2&limit=5"`
- Filter tasks by status: `curl "http://localhost:3000/api/tasks?status=in-progress"`
- Create user: `curl -X POST http://localhost:3000/api/users -H "Content-Type: application/json" -d '{"name":"Charlie","email":"charlie@example.com","age":25}'`
- Get single project: `curl http://localhost:3000/api/projects/1`
- Update task: `curl -X PUT http://localhost:3000/api/tasks/2 -H "Content-Type: application/json" -d '{"status":"done"}'`
- Delete user: `curl -X DELETE http://localhost:3000/api/users/3`

### Response conventions
- Success shape: `{ success: true, message, data, timestamp, pagination? }`.
- Error shape: `{ success: false, message, error: { code, details }, timestamp }`.
- Common codes: `E400` bad request/validation, `E002` not found, `E500` internal. Invalid pagination returns `400`; missing fields return `400`; not found returns `404`.

### Why the naming matters
- Consistent plural nouns and mirrored verbs keep the client mental model simple and speed up frontend integration.
- Predictable pagination and query params allow reusable frontend data hooks and SDK functions.
- File-based structure under `app/api` makes ownership clear per entity and keeps maintenance scoped as the project grows.
