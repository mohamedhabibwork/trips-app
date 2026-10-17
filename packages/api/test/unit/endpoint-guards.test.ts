import { describe, expect, test } from "bun:test";
import { createRouterClient } from "@orpc/server";
import type { Context } from "@trips-app/rpc";

import { appRouter } from "../../src/routers/index";
import {
  hasInputSchema,
  INTENTIONALLY_PUBLIC,
  listAppProcedures,
  procedureName,
} from "../../src/testing/procedure-catalog";

// A database stand-in that fails loudly if any service touches it. Unit tests must never reach data access.
const UNTOUCHABLE_DB = new Proxy(
  {},
  {
    get(_target, property) {
      throw new Error(`DB_TOUCHED:${String(property)}`);
    },
  },
);

// Error codes that prove a call stopped before the service layer: auth guards and input validation.
const PRE_SERVICE_ERROR_CODES = new Set(["UNAUTHORIZED", "VALIDATION_ERROR"]);

const procedures = listAppProcedures();
// Intentionally public procedures reach the service by design; the e2e suite checks their HTTP contract.
const guardedWithInput = procedures.filter(
  ({ path, procedure }) =>
    hasInputSchema(procedure) && !(procedureName(path) in INTENTIONALLY_PUBLIC),
);
const client = createRouterClient(appRouter, {
  context: { db: UNTOUCHABLE_DB, requestId: "unit-test", locale: "en", auth: null } as Context,
}) as unknown as Record<string, unknown>;

function resolveCaller(path: readonly string[]): (input: unknown) => Promise<unknown> {
  let node: unknown = client;
  for (const segment of path) {
    node = (node as Record<string, unknown>)[segment];
  }
  return node as (input: unknown) => Promise<unknown>;
}

describe("Unit: endpoint guards and input validation run before any service (@trips-app/api)", () => {
  test("discovers every service procedure from the app router", () => {
    expect(procedures.length).toBeGreaterThanOrEqual(85);
  });

  for (const { path } of guardedWithInput) {
    const name = procedureName(path);

    test(`${name} rejects an unauthenticated empty payload before the service runs`, async () => {
      // Arrange
      const call = resolveCaller(path);

      // Act
      const outcome = await call({}).then(
        (value) => ({ kind: "resolved" as const, value }),
        (error: unknown) => ({ kind: "rejected" as const, error }),
      );

      // Assert
      expect(outcome.kind).toBe("rejected");
      if (outcome.kind !== "rejected") return;
      const message = outcome.error instanceof Error ? outcome.error.message : "";
      expect(message.startsWith("DB_TOUCHED")).toBe(false);
      const code = (outcome.error as { code?: string }).code ?? "";
      expect(PRE_SERVICE_ERROR_CODES.has(code)).toBe(true);
    });
  }
});
