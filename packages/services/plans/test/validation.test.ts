import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapPlansError, PlansServiceError } from "../src/errors";
import {
  adminOverrideSubscriptionSchema,
  changePlanSchema,
  getPlanCatalogSchema,
} from "../src/schemas";

describe("Unit: plans validation schemas & error mapping (@trips-app/service-plans)", () => {
  test("plans Zod schemas and error mapper validate inputs", () => {
    expect(getPlanCatalogSchema.safeParse({ role: "organization" }).success).toBe(true);
    expect(getPlanCatalogSchema.safeParse(undefined).success).toBe(true);
    expect(
      changePlanSchema.safeParse({
        planId: "organization:growth",
        billingCycle: "annual",
      }).success,
    ).toBe(true);
    expect(
      adminOverrideSubscriptionSchema.safeParse({
        scope: "organization",
        tenantId: randomUUID(),
        planId: "organization:enterprise",
        billingCycle: "annual",
        overrideNote: "Strategic enterprise partner agreement",
      }).success,
    ).toBe(true);

    const err = new PlansServiceError("INVALID_PLAN_SCOPE", "Mismatched plan scope");
    expect(mapPlansError(err).code).toBe("VALIDATION_ERROR");
  });
});
