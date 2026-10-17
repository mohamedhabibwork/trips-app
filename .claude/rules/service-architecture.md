# Service architecture (required for all API work)

Every backend service lives in `packages/services/<name>/` and follows this layout. The checker `bun run services:check` enforces it. Run it before finishing any change under `packages/services/` or `packages/rpc/`.

## Layout

Each service is a workspace package named `@trips-app/service-<name>`:

```
packages/services/<name>/
  package.json          exports only "."; depends on @trips-app/db, @trips-app/domain, @trips-app/rpc, zod
  tsconfig.json
  src/
    index.ts            the only public entry point: exports SERVICE_ID and routes
    model/              entities and aggregates with invariants. No I/O.
    types/              shared types, ids, enums. No I/O.
    errors/             error categories (SRS IF-04) and this service's error classes
    schemas/
      validation/       zod schemas for input validation
      dtos/             request and response shapes
    repository/         data access through @trips-app/db; exports ServiceDatabase
    services/           business logic; exports a factory, createXService(db)
    routes/             oRPC procedures built on @trips-app/rpc; exports routes
```

Every folder listed above must exist with an `index.ts`. Do not add a top-level folder under `src/` without updating the rule and `scripts/services.ts`.

## How the layers connect to the database and the API

- `@trips-app/db` is used only by `repository`. Its `Database` type is re-exported as `ServiceDatabase` for the other layers.
- `@trips-app/rpc` (the procedure base and the `Context` type with `db`) is used only by `routes`.
- A route reads `context.db`, calls the service factory `createXService(context.db)`, and returns the result. The route never imports a repository.
- `packages/rpc` mounts every service's `routes` under `appRouter` (`packages/rpc/src/routers/services.ts`). That file is generated. Run `bun scripts/services.ts sync` after changing a service's routes or the service list. `check` fails if the generated file is out of date.

## Layer rules

Allowed imports (a file may always import its own layer):

| From         | May import                                                                               |
| ------------ | ---------------------------------------------------------------------------------------- |
| `routes`     | `services`, `schemas`, `model`, `types`, `errors`, `@trips-app/rpc`, `@trips-app/domain` |
| `services`   | `repository`, `schemas`, `model`, `types`, `errors`, `@trips-app/domain`                 |
| `repository` | `model`, `types`, `errors`, `@trips-app/db`, `@trips-app/db/zod`                         |
| `schemas`    | `model`, `types`, `errors`, `@trips-app/domain`, `@trips-app/db/zod`                     |
| `model`      | `types`, `errors`, `@trips-app/domain`                                                   |
| `errors`     | `types`, `@trips-app/domain`                                                             |
| `types`      | `schemas`, `@trips-app/domain`                                                           |

Rules that apply everywhere:

1. Only `repository` touches `@trips-app/db`. Routes and services never query the database. `schemas` may import `@trips-app/db/zod` only, to derive input schemas from the tables. The rules are in [drizzle-zod-schemas.md](drizzle-zod-schemas.md).
2. Only `routes` imports `@trips-app/rpc`. It is the shared source for the procedure base (`publicProcedure`) and the `Context` type. Do not define a second `Context` in a service or in the server.
   2a. Every service exposes at least one procedure in `routes/`. Each service has a local `routes/procedure.ts` that extends the shared `publicProcedure` (`export const procedure = publicProcedure.use(mapErrors);`), and `routes/index.ts` builds its procedures on that local `procedure`. Service-specific middleware and errors go in `procedure.ts`, not in each handler. `services:check` fails a service with no `procedure.ts`, a `procedure.ts` that does not extend `publicProcedure`, or a `routes/index.ts` with no procedure.
3. Routes never call repositories. A route validates input with a schema, calls one service, and maps errors.
4. Every input is validated by a zod schema from `schemas/validation`, defined in the same change as the procedure.
5. Services never import each other's internals. Another service is imported only by its package root, for example `import { SERVICE_ID } from "@trips-app/service-trips"`. Deep imports such as `@trips-app/service-trips/src/model` are not allowed.
6. Every tenant-owned query in `repository` filters by tenant ID (DAT-01, CON-01). A request for another tenant's record returns not-found (IF-12).
7. Plan limits and permissions are checked in `services`, on the server (CON-06). Routes do not decide them.
8. Errors are thrown as subclasses of `ServiceError` in `errors/` referencing the centralized `SharedErrorCode` catalog in `@trips-app/domain` (IF-04), and mapped via `createServiceErrorMapper` + `createServiceErrorMiddleware`. Raw database errors are never returned to the client.
9. Money uses the amount plus currency type from `@trips-app/domain`, never a bare number (DAT-06).

## Adding a service

1. Add the name to `SERVICE_NAMES` in `scripts/services.ts`. Each name maps to an SRS module (`ARCHITECTURE.md` section 3).
2. Run `bun scripts/services.ts create <name>`, then `bun scripts/services.ts sync`, then `bun install`.
3. Fill the folders in dependency order: `model`, `types`, `errors`, `schemas`, `repository`, `services`, `routes`.
4. Run `bun run services:check` and `bun run check-types`.

## Making a service its own app later

A service becomes deployable on its own by adding an `apps/<name>-api/` (or `mobile/` app) that imports `@trips-app/service-<name>` and mounts its `routes` with the same `Context`. Nothing in `packages/services/<name>` changes for that. Keep `src/index.ts` as the single entry point so this stays true.

## Checklist before finishing a change under `packages/services/` or `packages/rpc/`

- [ ] `bun scripts/services.ts sync` run after any route or service-list change
- [ ] `bun run services:check` passes
- [ ] New code sits in the right layer and follows the table above
- [ ] Input validated by a schema in `schemas/validation`, derived from a table with `@trips-app/db/zod` where one exists (see [drizzle-zod-schemas.md](drizzle-zod-schemas.md))
- [ ] Tenant filter present in every new repository query
- [ ] `bun run check-types` passes
