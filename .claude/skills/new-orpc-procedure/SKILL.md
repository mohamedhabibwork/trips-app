---
name: new-orpc-procedure
description: Adds a new oRPC procedure to the trips-app API end to end — zod input schema, handler on the appRouter, and a typed call from the web app. Use when the user asks for a new API endpoint, RPC procedure, or server function, or wants to expose a database query to the web client.
---

# New oRPC procedure

The API is one `appRouter` object in `packages/api/src/routers/index.ts`. Procedures are built from `publicProcedure` in `packages/api/src/index.ts`, which carries a `Context` of `{ db }` (see `packages/api/src/context.ts`). The server serves the same router over RPC and OpenAPI (`apps/server/src/index.ts`), and the web app gets a typed client from `apps/web/src/utils/orpc.ts`.

Today the only procedure is `healthCheck`, so follow the pattern below exactly.

## Steps

1. **Define the input schema with zod.** `zod` is a dependency of `@trips-app/api`. Declare the schema next to the handler. Every input must be validated; never trust the client.

   ```ts
   import { z } from "zod";

   const getTripInput = z.object({
     id: z.string().uuid(),
   });
   ```

2. **Add the procedure to `appRouter`.** Chain `.input(...)` and `.handler(...)` on `publicProcedure`, and read the database from `context.db`.

   The `trips` table in the example below is illustrative. The schema is empty until the first table is added, so adapt the query to real tables.

   ```ts
   export const appRouter = {
     healthCheck: publicProcedure.handler(() => {
       return "OK";
     }),
     getTrip: publicProcedure
       .input(getTripInput)
       .handler(async ({ input, context }) => {
         // context.db is the Drizzle Database from @trips-app/db
         return context.db.query.trips.findFirst({ where: { id: input.id } });
       }),
   };
   ```

   Handle failures explicitly. Throw an `ORPCError` with a code for expected cases such as not-found, and do not let database errors leak raw messages to the client.

3. **Do not invent auth.** There is no `protectedProcedure` yet. If the new procedure reads or writes user data, stop and ask the user how authentication should be wired. Do not add ad-hoc session checks inside the handler.

4. **Type-check.** From the repo root run `bun run check-types`. The web client's `AppRouterClient` type is derived from `appRouter`, so a type error here means the client is broken too.

5. **Call it from the web app.** Use the exported `client` from `apps/web/src/utils/orpc.ts`. Its types come from the router, so do not hand-write request or response types.

   ```ts
   import { client } from "@/utils/orpc";

   const trip = await client.getTrip({ id });
   ```

6. **Verify.** Run `bun run lint` and `bun run check-types`. Then exercise the procedure through the running dev server (`bun run dev`) with a real request. The test suite is currently empty, so do not claim test coverage that does not exist.

## Checklist

- [ ] Input validated by a zod schema defined in the same change
- [ ] Procedure registered on `appRouter`, not on a standalone export
- [ ] Expected errors thrown as `ORPCError`, no raw DB errors returned
- [ ] No auth shortcut added without confirming with the user
- [ ] `check-types` and `lint` pass
- [ ] Web call uses the typed `client`, no hand-written types
