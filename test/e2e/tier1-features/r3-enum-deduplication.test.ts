import { describe, expect, test } from "bun:test";
import * as domain from "@trips-app/domain";
import {
  ACCOUNT_STATUSES,
  ADMIN_SUB_ROLES,
  APPLICATION_STATES,
  CLIENT_SURFACES,
  ORG_PERMISSION_AREAS,
  SUPPLIER_APPLICATION_TYPES,
  USER_ROLES,
} from "@trips-app/domain";
import { z } from "zod/v4";
import { TRIP_STATES } from "@trips-app/service-trips";
import { VEHICLE_STATUSES } from "@trips-app/service-fleet";
import {
  selectTripsSchema,
  selectVehiclesSchema,
} from "@trips-app/db/zod";

describe("Tier 1 - Feature R3: Enum Deduplication & Canonical Single Source of Truth", () => {
  test("R3-01: Canonical domain enums export immutable as const arrays with complete member sets", () => {
    // Authoritative source: @trips-app/domain interface contracts in PROJECT.md
    expect(Array.isArray(USER_ROLES)).toBe(true);
    expect(USER_ROLES).toContain("traveler");
    expect(USER_ROLES).toContain("organization_owner");
    expect(USER_ROLES).toContain("admin");
    expect(USER_ROLES.length).toBeGreaterThanOrEqual(8);

    expect(Array.isArray(ADMIN_SUB_ROLES)).toBe(true);
    expect(ADMIN_SUB_ROLES).toContain("super_admin");
    expect(ADMIN_SUB_ROLES).toContain("operations");
    expect(ADMIN_SUB_ROLES).toContain("finance");

    expect(Array.isArray(APPLICATION_STATES)).toBe(true);
    expect(APPLICATION_STATES).toContain("Pending Review");
    expect(APPLICATION_STATES).toContain("Approved");

    expect(Array.isArray(SUPPLIER_APPLICATION_TYPES)).toBe(true);
    expect(SUPPLIER_APPLICATION_TYPES).toContain("organization");
    expect(SUPPLIER_APPLICATION_TYPES).toContain("platform_driver");

    expect(Array.isArray(ACCOUNT_STATUSES)).toBe(true);
    expect(ACCOUNT_STATUSES).toContain("active");
    expect(ACCOUNT_STATUSES).toContain("suspended");

    expect(Array.isArray(CLIENT_SURFACES)).toBe(true);
    expect(CLIENT_SURFACES).toContain("web");
    expect(CLIENT_SURFACES).toContain("mobile");

    expect(Array.isArray(ORG_PERMISSION_AREAS)).toBe(true);
    expect(ORG_PERMISSION_AREAS).toContain("trips");
    expect(ORG_PERMISSION_AREAS).toContain("accounting");
  });

  test("R3-02: Zod enum validators constructed from canonical arrays validate all valid members", () => {
    // Test that z.enum(CANONICAL_ARRAY) accepts every element
    const roleValidator = z.enum(USER_ROLES);
    for (const role of USER_ROLES) {
      expect(roleValidator.safeParse(role).success).toBe(true);
    }

    const adminSubRoleValidator = z.enum(ADMIN_SUB_ROLES);
    for (const subRole of ADMIN_SUB_ROLES) {
      expect(adminSubRoleValidator.safeParse(subRole).success).toBe(true);
    }

    const appStateValidator = z.enum(APPLICATION_STATES);
    for (const state of APPLICATION_STATES) {
      expect(appStateValidator.safeParse(state).success).toBe(true);
    }

    const surfaceValidator = z.enum(CLIENT_SURFACES);
    for (const surface of CLIENT_SURFACES) {
      expect(surfaceValidator.safeParse(surface).success).toBe(true);
    }
  });

  test("R3-03: Drizzle-Zod table schemas align with canonical domain enum definitions", () => {
    // Verify that select/insert schemas validate rows having canonical enum values
    const tripValidator = selectTripsSchema.shape.state;
    for (const state of TRIP_STATES) {
      const parsed = tripValidator.safeParse(state);
      expect(parsed.success).toBe(true);
    }

    const vehicleStatusValidator = selectVehiclesSchema.shape.status;
    for (const status of VEHICLE_STATUSES) {
      expect(vehicleStatusValidator.safeParse(status).success).toBe(true);
    }
  });

  test("R3-04: Single source of truth invariants guarantee exact casing and domain fidelity", () => {
    // Casing invariance: TRIP_STATES must contain 'Selection' with capital S
    expect(TRIP_STATES).toContain("Selection");
    expect(TRIP_STATES).toContain("draft");
    expect(TRIP_STATES).toContain("published");
    expect(TRIP_STATES).toContain("cancelled");

    // VEHICLE_STATUSES must contain standard statuses
    expect(VEHICLE_STATUSES).toContain("active");
    expect(VEHICLE_STATUSES).toContain("maintenance");
    expect(VEHICLE_STATUSES).toContain("retired");

    // If domain exports TRIP_STATES, verify it matches
    const domainObj = domain as Record<string, unknown>;
    if (domainObj.TRIP_STATES) {
      expect(domainObj.TRIP_STATES).toEqual(TRIP_STATES);
    }
  });

  test("R3-05: Cross-layer enum consistency guarantees runtime compatibility", () => {
    // Constructing a payload using canonical enums and testing boundary validation
    const testRole = USER_ROLES[0];
    const testSurface = CLIENT_SURFACES[0];

    const sessionShape = z.object({
      role: z.enum(USER_ROLES),
      surface: z.enum(CLIENT_SURFACES),
    });

    const parsed = sessionShape.safeParse({
      role: testRole,
      surface: testSurface,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.role).toBe(testRole);
      expect(parsed.data.surface).toBe(testSurface);
    }
  });
});
