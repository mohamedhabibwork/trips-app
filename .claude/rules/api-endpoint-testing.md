# API endpoint testing (required for every backend endpoint)

Every oRPC procedure in `packages/services/*/src/routes/` needs two tests: a unit test and an e2e test. A procedure with no tests is not finished. Layering and validation rules live in `service-architecture.md`. This file covers tests.

## What each endpoint must have

1. **Unit test: validation and guards.** Runs in-process with no HTTP and no database. It proves that:
   - an unauthenticated call to a guarded procedure is rejected with `UNAUTHORIZED` before the service runs;
   - an invalid payload is rejected with `VALIDATION_ERROR` before the service runs;
   - the database is never touched by a rejected call.
     The shared suite `packages/api/test/unit/endpoint-guards.test.ts` covers every input-bearing procedure automatically. A new procedure gets this check once it is in the router. Add a case for each specific rule the schema enforces, such as a numeric range or a required enum, in `packages/services/<name>/test/`.
2. **E2e test: the HTTP contract.** Runs through `app.handle` against the real local database (`apps/server/test/e2e/`). It proves that:
   - the endpoint is mounted and returns no 5xx for any call;
   - the success envelope and the error codes match the contract;
   - a role without permission gets `403`, and no token gets `401`;
   - an invalid body gets `400` with the `VALIDATION_ERROR` envelope.
     The shared suite `apps/server/test/e2e/endpoints.e2e.test.ts` covers every procedure for the mount and guard checks. Add an authenticated happy-path test for each business endpoint, using a token signed with `signAccessToken` from `@trips-app/domain`.

## Public endpoints

A procedure that must be callable without a session is an explicit decision. Add it to `INTENTIONALLY_PUBLIC` in `packages/api/src/testing/procedure-catalog.ts` with a one-sentence reason. Without an entry, the shared tests fail. Each new entry needs owner review, so flag it in the PR description.

## Assertions

- Use the shared error codes from `@trips-app/domain`. Do not assert on message text.
- Assert the response envelope (`success`, `data`, `error.code`, `requestId`) and the HTTP status together.
- Test one behavior per test, named for what it proves: `admin.updateSystemSettings rejects an unknown payload with 400 VALIDATION_ERROR`.
- Arrange / Act / Assert, with the three sections labelled.
- Write tests create their own rows and remove them in `afterAll`. Read-only checks are the default for e2e.
- Known gaps are written as `test.todo("...")` with a comment on the observed behavior. Do not delete a failing test to make the suite green.

## Running

- `bun test packages/api` for unit tests of the router and guards.
- `bun test apps/server/test/e2e` for the HTTP contract. Requires local Postgres (`DATABASE_URL` in `apps/server/.env`).
- `bun run test` from the repo root runs all of them.
- Before finishing a change under `packages/services/` or `packages/rpc/`, run both suites with `services:check` and `check-types`.

## Coverage

- 80% line coverage minimum for each service, measured with `bun test --coverage`.
- A service with no `test/` directory fails review.

## Not allowed

- Mocking the database in e2e tests. E2e runs against real Postgres.
- Asserting a 200 response for a guarded procedure without a token. That is a security regression.
- Adding a new public procedure without an `INTENTIONALLY_PUBLIC` entry.

## Related

- [service-architecture.md](service-architecture.md): where validation schemas live and how routes are structured.
- The `new-orpc-procedure` skill: adding a procedure. Its verify step should include this file's tests.
