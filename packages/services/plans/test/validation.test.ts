import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapPlansError, PlansServiceError } from "../src/errors";
import {
  adminOverrideSubscriptionSchema,
  changePlanSchema,
  getPlanCatalogSchema,
  organizationUsageDtoSchema,
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

describe("Unit: organization usage DTO (plans.getOrganizationUsage)", () => {
  test("accepts whole non-negative counts and rejects a negative or fractional one", () => {
    // Arrange
    const valid = {
      monthStart: "2026-10-01T00:00:00.000Z",
      activeTripsThisMonth: 3,
      employees: 2,
      activeCoupons: 0,
      maxVehiclesPerTrip: 2,
      maxProgramsPerTrip: 4,
    };

    // Assert
    expect(organizationUsageDtoSchema.safeParse(valid).success).toBe(true);
    expect(organizationUsageDtoSchema.safeParse({ ...valid, employees: -1 }).success).toBe(false);
    expect(organizationUsageDtoSchema.safeParse({ ...valid, activeCoupons: 1.5 }).success).toBe(
      false,
    );
  });
});
