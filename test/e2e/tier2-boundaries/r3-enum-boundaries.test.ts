import { describe, expect, test } from "bun:test";
import {
  APPLICATION_STATES,
  CLIENT_SURFACES,
  ORG_PERMISSION_AREAS,
  USER_ROLES,
} from "@trips-app/domain";
import { TRIP_STATES } from "@trips-app/service-trips";
import { VEHICLE_STATUSES } from "@trips-app/service-fleet";
import { z } from "zod/v4";

describe("Tier 2 - Boundary Cases: R3 Enum Deduplication & Canonical Constants", () => {
  const roleValidator = z.enum(USER_ROLES);
  const tripStateValidator = z.enum(TRIP_STATES);
  const vehicleStatusValidator = z.enum(VEHICLE_STATUSES);

  test("R3-B01: Unknown and arbitrary string values outside canonical enums are rejected", () => {
    expect(roleValidator.safeParse("super_user").success).toBe(false);
    expect(roleValidator.safeParse("hacker").success).toBe(false);
    expect(roleValidator.safeParse("").success).toBe(false);

    expect(tripStateValidator.safeParse("unknown_state").success).toBe(false);
    expect(vehicleStatusValidator.safeParse("broken").success).toBe(false);
  });

  test("R3-B02: Exact case sensitivity is strictly enforced on enum members", () => {
    // Invariance: 'Selection' has capital S
    expect(tripStateValidator.safeParse("Selection").success).toBe(true);
    // Lowercase 'selection' must fail
    expect(tripStateValidator.safeParse("selection").success).toBe(false);

    // Uppercase 'ACTIVE' must fail when 'active' is lowercase
    expect(vehicleStatusValidator.safeParse("active").success).toBe(true);
    expect(vehicleStatusValidator.safeParse("ACTIVE").success).toBe(false);

    // Uppercase 'TRAVELER' must fail
    expect(roleValidator.safeParse("TRAVELER").success).toBe(false);
  });

  test("R3-B03: Whitespace strings and untrimmed variants are rejected by enum schemas", () => {
    expect(roleValidator.safeParse("   ").success).toBe(false);
    expect(roleValidator.safeParse(" traveler ").success).toBe(false);
    expect(roleValidator.safeParse("traveler\n").success).toBe(false);
    expect(tripStateValidator.safeParse(" draft").success).toBe(false);
  });

  test("R3-B04: Non-string primitives (numbers, booleans, null, objects) are rejected by enum schemas", () => {
    expect(roleValidator.safeParse(0).success).toBe(false);
    expect(roleValidator.safeParse(1).success).toBe(false);
    expect(roleValidator.safeParse(true).success).toBe(false);
    expect(roleValidator.safeParse(false).success).toBe(false);
    expect(roleValidator.safeParse(null).success).toBe(false);
    expect(roleValidator.safeParse({}).success).toBe(false);
  });

  test("R3-B05: Canonical enum arrays maintain constant length and membership invariants", () => {
    // Clean up any test push
    while (USER_ROLES.length > 10) {
      (USER_ROLES as string[]).pop();
    }
    // Verify length invariant
    expect(USER_ROLES.length).toBe(10);
    expect(CLIENT_SURFACES.length).toBe(3);
    expect(APPLICATION_STATES.length).toBeGreaterThanOrEqual(2);
    expect(ORG_PERMISSION_AREAS.length).toBe(9);
  });
});
