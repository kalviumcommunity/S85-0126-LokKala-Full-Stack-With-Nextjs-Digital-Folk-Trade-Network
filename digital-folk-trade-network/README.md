# Digital Folk Trade Network

Prisma is configured as the type-safe data layer for this Next.js app backed by PostgreSQL.

## JWT & session hardening
- Secrets required: set `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` in `.env` (32+ chars for both secrets). The Zod guard in [src/lib/env.ts](src/lib/env.ts) fails fast if any are missing.
- Access tokens: 15m lifetime, signed with `JWT_SECRET`, stored as HTTP-only, SameSite=Lax cookies named `accessToken`.
- Refresh tokens: 7d lifetime, signed with `JWT_REFRESH_SECRET`, stored as HTTP-only, SameSite=Strict cookies named `refreshToken`.
- Rotation: user field `refreshTokenVersion` in [prisma/schema.prisma](prisma/schema.prisma) increments on each login/refresh so older refresh tokens are rejected.
- Seed login for demos: any seeded user (e.g., `rohan@example.com`) uses password `folkpass123`. Update seeds in [prisma/seed.mjs](prisma/seed.mjs) if you change it.

### Auth endpoints
- POST `/api/auth/login`: body `{ email, password }`; issues rotated access + refresh tokens and sets cookies.
- POST `/api/auth/refresh`: uses the secure refresh cookie, bumps `refreshTokenVersion`, and re-issues both tokens (old refresh invalidated by version mismatch).
- GET `/api/auth/me`: returns the authenticated user when a valid access token is present (cookie or `Authorization: Bearer <token>`).
- POST `/api/auth/logout`: clears both cookies.
- Orders now require auth: POST/GET `/api/orders` expect a valid access token; POST checks that either the caller owns `userId` or has role `ADMIN`.

### Token flow evidence
- Cookies are HttpOnly to keep tokens out of JavaScript (mitigates XSS token theft). Refresh uses SameSite=Strict to blunt CSRF; access uses Lax for same-site form/fetch usability.
- Rotation proof: the refresh response returns `rotatedFromVersion` and `newRefreshTokenVersion`, and the DB column changes on each refresh/login.
- Expiry handling: when the access token expires, call `/api/auth/refresh` to obtain a fresh pair; clients should retry the original request after refresh.

### Quick curl script
```
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"rohan@example.com","password":"folkpass123"}'
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/auth/me
curl -i -c cookies.txt -b cookies.txt -X POST http://localhost:3000/api/auth/refresh
curl -i -c cookies.txt -b cookies.txt http://localhost:3000/api/orders?page=1
```

### Threat model notes
- XSS: tokens never touch `localStorage` or `sessionStorage`; only HttpOnly cookies. Sanitize any user input rendered in the UI.
- CSRF: SameSite cookies plus the ability to pair with Origin/Referer checks on sensitive routes. Refresh token is Strict to block cross-site refresh attempts.
- Replay: short-lived access tokens plus refresh rotation via `refreshTokenVersion` narrows the usable window of stolen tokens. Consider IP/device binding for stricter setups.

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

## Transaction & query optimisation
- Transaction workflow: POST `/api/orders` creates an order, inserts order items, and decrements inventory inside a single `$transaction`. Pass `simulateFailure: true` in the payload to force a rollback and verify that no partial writes occur.
- Query shape: GET `/api/orders?page=1&pageSize=10` returns a paginated, select-only projection (order meta, user summary, and lightweight item data) to avoid over-fetching.
- Indexes added in [prisma/schema.prisma](prisma/schema.prisma): `User.createdAt`, `Artifact.categoryId`, `Artifact.sellerId+createdAt`, `Order.status`, `Order.createdAt`, `Order.userId+status`, `Review.artifactId` (the unique constraint on `userId+artifactId` covers `userId`). Generate and apply with `npx prisma migrate dev --name add_indexes_for_optimisation`.
- Benchmarking: run `DEBUG="prisma:query" npm run dev`, call the same GET `/api/orders` before and after the index migration, and compare timings/plan output (use `EXPLAIN` if you have DB access). Capture logs/screenshots for evidence.
- Anti-patterns avoided: N+1 (batch fetch via relations in a single query), full-table scans on frequent filters (indexes), and over-fetching (explicit `select` plus pagination). In production, monitor Postgres query duration, lock wait time, and error rate; add alerting on slow queries and use Prisma query logging in lower environments.

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
