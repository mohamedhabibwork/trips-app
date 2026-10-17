# Drizzle-Zod schemas (required for all backend validation)

The Drizzle tables in `packages/db/src/schema/` are the source of truth for backend data. Input validation schemas are generated from them with the Drizzle-Zod `SchemaFactory`, not written by hand. Reference: https://orm.drizzle.team/docs/zod

A hand-written `z.object({...})` that repeats a table's columns is a defect. Derive it instead.

## The factory

- Import from `@trips-app/db/zod` only. It exports `createInsertSchema`, `createSelectSchema`, `createUpdateSchema` and `schema` (the table definitions). Never call `drizzle-orm/zod` directly and never create a second factory. One factory keeps one zod instance and coercion off, so input is validated as sent.
- Allowed in `schemas/` and `repository/` only. Routes, services and model code never import the db package.
- The root `@trips-app/db` stays repository-only. It opens the connection; `@trips-app/db/zod` does not.

## Which builder to use

| Need                                | Builder                                     |
| ----------------------------------- | ------------------------------------------- |
| Create input (new row)              | `createInsertSchema(schema.<table>, {...})` |
| Patch or update input (partial row) | `createUpdateSchema(schema.<table>, {...})` |
| Response or DTO shape (row as read) | `createSelectSchema(schema.<table>, {...})` |

## Skip what is not needed

Take only the fields the caller may send. Never accept a server-owned field.

- `.pick({ ... })` when the input uses a few columns.
- `.omit({ ... })` when the input uses most columns. Always omit `id`, `uuid`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `deletedBy`, `deletedAt`, and `isDeleted` unless the caller sets them.
- A tenant key that comes from the session or the path is omitted from the body schema, and the service adds it.

## Add what the table does not have

- `.extend({ ... })` for input fields that are not columns, for example a code that resolves to a foreign key such as `parentCode` for `parentId`.
- `.superRefine(...)` for cross-field rules that a column cannot express.

## Refine, don't re-declare

- Refinements are callbacks on the column: `{ code: (column) => column.min(1).max(120) }`. The callback receives the generated schema, and nullability and optionality are applied afterwards, so do not add `.nullable()` or `.optional()` inside it.
- Column lengths come from the table (`varchar(255)` becomes `max(255)`). Add a refinement only when the API limit is stricter than the column, or when the column is unbounded `text`.
- Replace a generated field with a zod schema only for JSON columns and enums: `{ name: () => localizedTextSchema }`, `{ defaultLanguage: () => z.enum(["ar", "en"]) }`. Optionality still follows the builder.

## Generic and shared

- A refinement or shape used by two or more schemas moves to a named export in `packages/db/src/zod.ts`, for example a localized text schema or a 120-character code. Do not copy it between files.
- Build each schema once at module scope and derive from it. Derive the update schema from the same base as the insert schema when the fields overlap, so the limits cannot drift apart.
- Export the inferred type with `z.infer<typeof schema>` from `types/`. Do not write an interface by hand that repeats the schema.

## Migrating a hand-written schema

1. Write the derived schema beside the old one.
2. Compare them on valid, invalid and edge payloads (empty, too long, wrong type, null, unknown keys). Both must accept and reject the same inputs and return the same data.
3. Replace the old schema only after the comparison passes. Keep the export name, so callers do not change.
4. Run `bun run services:check`, `bun run check-types` and the package tests.

## Not allowed

- A column list copied into `z.object` for a value that a table already defines.
- Coercion in boundary schemas (`coerce` stays off).
- Importing the root `@trips-app/db` from `schemas/`. Use `@trips-app/db/zod`.
- A server-owned field (ids, timestamps, audit columns) in an input schema.

## Related

- [service-architecture.md](service-architecture.md): where validation schemas live and which layer may import the db package.
- [api-endpoint-testing.md](api-endpoint-testing.md): tests that every input schema must pass.
