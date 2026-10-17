---
name: db-migrate
description: Runs a safe Drizzle schema change for trips-app — edit the schema, generate SQL, review it, and apply it with the repo's migrate scripts. Use only when the user explicitly asks to change the database schema, generate a migration, or apply migrations.
disable-model-invocation: true
---

# Database migration (Drizzle)

Schema lives in `packages/db/src/schema/index.ts`. Relations are derived from that module in `packages/db/src/relations.ts`, so new tables must be exported from `schema/index.ts` to be visible to the query API. Generated SQL goes to `packages/db/src/migrations`. The Drizzle config is `packages/db/drizzle.config.ts`, which reads `DATABASE_URL` through varlock.

The schema is currently empty (`export {};`), so the first migration will be the first real one. Treat every migration as permanent once it has been applied anywhere else.

## Commands (run from repo root)

| Goal                                            | Command               |
| ----------------------------------------------- | --------------------- |
| Generate SQL from schema changes                | `bun run db:generate` |
| Apply pending migrations                        | `bun run db:migrate`  |
| Browse the database                             | `bun run db:studio`   |
| Push schema without a migration file (dev only) | `bun run db:push`     |

## Steps

1. **Confirm the target.** Check `DATABASE_URL` points at the intended database before anything that writes. If it is unclear whether it is production, stop and ask.
2. **Edit the schema** in `packages/db/src/schema/index.ts` and export any new tables from there.
3. **Generate.** Run `bun run db:generate`. This writes a new SQL file and snapshot under `packages/db/src/migrations`.
4. **Review the SQL.** Read the generated file before applying it. Look for dropped columns or tables, type narrowing, and `NOT NULL` added to populated columns. For destructive changes, use an expand-then-contract sequence across separate migrations instead of one drop.
5. **Apply.** Run `bun run db:migrate` against the dev database first. Verify with `bun run db:studio` or a real query through the API.
6. **Commit the migration files.** Commit the SQL and the snapshot together with the schema change, in one commit.

## Rules

- Never edit a migration file that has already been applied. Write a new migration instead.
- Use `db:generate` plus `db:migrate` for shared databases. Do not use `db:push` there: it skips migration files, so the change can't be reproduced.
- Never run destructive SQL by hand against a shared database.
- Keep credentials out of the chat and out of committed files. `DATABASE_URL` comes from varlock, not from source.
