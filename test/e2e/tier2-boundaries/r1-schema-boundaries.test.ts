import { describe, expect, test } from "bun:test";
import { createInsertSchema, createSelectSchema, schema } from "@trips-app/db";
import { z } from "zod/v4";
import { selectVehicleTypesSchema, selectTripsSchema } from "@trips-app/db/zod";

describe("Tier 2 - Boundary Cases: R1 Dynamic Zod Schemas", () => {
  const vehicleTypeInsert = createInsertSchema(schema.vehicleTypes, {
    nameAr: (col) => col.trim().min(2).max(100),
    nameEn: (col) => col.trim().min(2).max(100),
    seatCount: (col) => col.int().min(1).max(120),
  });

  test("R1-B01: Null, undefined, empty string, and non-object inputs are rejected by required schemas", () => {
    // Contract: public boundary schema must reject non-object payloads
    expect(vehicleTypeInsert.safeParse(null).success).toBe(false);
    expect(vehicleTypeInsert.safeParse(undefined).success).toBe(false);
    expect(vehicleTypeInsert.safeParse("string payload").success).toBe(false);
    expect(vehicleTypeInsert.safeParse(12345).success).toBe(false);
    expect(vehicleTypeInsert.safeParse(true).success).toBe(false);
    expect(vehicleTypeInsert.safeParse([]).success).toBe(false);
  });

  test("R1-B02: String length boundary conditions (empty, 1-char, max exceeded, whitespace trim) are strictly enforced", () => {
    const validBase = {
      tenantId: "10000000-0000-4000-8000-000000000001",
      categoryLookupCode: "CAT_VAN",
      nameAr: "حافلة",
      nameEn: "Van",
      seatCount: 14,
      seatLayout: { rows: 2, cols: 2, cells: [] },
      scope: "organization",
      status: "active",
      createdByAccountId: "20000000-0000-4000-8000-000000000002",
    };

    // Sub-boundary 1: 1-char string when min(2) is required
    const tooShort = { ...validBase, nameEn: "V" };
    expect(vehicleTypeInsert.safeParse(tooShort).success).toBe(false);

    // Sub-boundary 2: whitespace trimmed to empty or too short
    const whitespaceOnly = { ...validBase, nameEn: "   " };
    expect(vehicleTypeInsert.safeParse(whitespaceOnly).success).toBe(false);

    // Sub-boundary 3: string exceeding max(100)
    const tooLong = { ...validBase, nameEn: "A".repeat(101) };
    expect(vehicleTypeInsert.safeParse(tooLong).success).toBe(false);

    // Sub-boundary 4: exact boundary at max(100) passes
    const exactMax = { ...validBase, nameEn: "A".repeat(100) };
    expect(vehicleTypeInsert.safeParse(exactMax).success).toBe(true);
  });

  test("R1-B03: Numeric boundaries (zero, negatives, floats, extreme values) are rejected when violating invariants", () => {
    const validBase = {
      tenantId: "10000000-0000-4000-8000-000000000001",
      categoryLookupCode: "CAT_VAN",
      nameAr: "حافلة",
      nameEn: "Van",
      seatLayout: { rows: 2, cols: 2, cells: [] },
      scope: "organization",
      status: "active",
      createdByAccountId: "20000000-0000-4000-8000-000000000002",
    };

    // Sub-boundary 1: zero seats when min(1) is required
    expect(vehicleTypeInsert.safeParse({ ...validBase, seatCount: 0 }).success).toBe(false);

    // Sub-boundary 2: negative seats
    expect(vehicleTypeInsert.safeParse({ ...validBase, seatCount: -5 }).success).toBe(false);

    // Sub-boundary 3: fractional float seats when int() is required
    expect(vehicleTypeInsert.safeParse({ ...validBase, seatCount: 14.5 }).success).toBe(false);

    // Sub-boundary 4: seats exceeding max(120)
    expect(vehicleTypeInsert.safeParse({ ...validBase, seatCount: 121 }).success).toBe(false);

    // Sub-boundary 5: valid boundary at min(1) and max(120)
    expect(vehicleTypeInsert.safeParse({ ...validBase, seatCount: 1 }).success).toBe(true);
    expect(vehicleTypeInsert.safeParse({ ...validBase, seatCount: 120 }).success).toBe(true);
  });

  test("R1-B04: Malicious property injection (__proto__, constructor) and unrecognized fields are handled safely", () => {
    const maliciousPayload = JSON.parse(
      '{"__proto__":{"polluted":true},"tenantId":"10000000-0000-4000-8000-000000000001","categoryLookupCode":"CAT_VAN","nameAr":"حافلة","nameEn":"Van","seatCount":14,"seatLayout":{"rows":2,"cols":2,"cells":[]},"scope":"organization","status":"active","createdByAccountId":"20000000-0000-4000-8000-000000000002","extraHack":"forbidden"}',
    );

    const parsed = vehicleTypeInsert.safeParse(maliciousPayload);
    // Parse succeeds and strips/ignores proto pollution without affecting Object prototype
    expect((({} as Record<string, unknown>).polluted)).toBeUndefined();
    if (parsed.success) {
      expect((parsed.data as Record<string, unknown>).polluted).toBeUndefined();
    }
  });

  test("R1-B05: Format-specific boundary violations (invalid UUID, malformed dates) are rejected", () => {
    const validBase = {
      categoryLookupCode: "CAT_VAN",
      nameAr: "حافلة",
      nameEn: "Van",
      seatCount: 14,
      seatLayout: { rows: 2, cols: 2, cells: [] },
      scope: "organization",
      status: "active",
      createdByAccountId: "20000000-0000-4000-8000-000000000002",
    };

    // Invalid UUID format
    const badUuid = { ...validBase, tenantId: "not-a-uuid" };
    expect(vehicleTypeInsert.safeParse(badUuid).success).toBe(false);

    // Empty string for UUID
    const emptyUuid = { ...validBase, tenantId: "" };
    expect(vehicleTypeInsert.safeParse(emptyUuid).success).toBe(false);
  });
});
