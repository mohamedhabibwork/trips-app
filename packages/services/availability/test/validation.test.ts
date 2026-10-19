import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { AvailabilityServiceError, mapAvailabilityError } from "../src/errors";
import { windowsOverlap } from "../src/model";
import {
  checkSupplierAvailabilityInputSchema,
  deleteAvailabilityBlockInputSchema,
  listMyBlocksInputSchema,
  upsertAvailabilityBlockInputSchema,
} from "../src/schemas/validation";

describe("Unit: availability validation schemas, window overlap & error mapping (@trips-app/service-availability)", () => {
  test("windowsOverlap detects overlapping and non-overlapping supplier windows", () => {
    const t1 = new Date("2026-11-01T08:00:00Z");
    const t2 = new Date("2026-11-01T12:00:00Z");
    const t3 = new Date("2026-11-01T10:00:00Z");
    const t4 = new Date("2026-11-01T14:00:00Z");

    expect(windowsOverlap(t1, t2, t3, t4)).toBe(true);
    expect(windowsOverlap(t1, t3, t2, t4)).toBe(false);
    expect(windowsOverlap(t1, t2, t2, t4)).toBe(false);
  });

  test("availability Zod schemas and error mapper validate inputs", () => {
    expect(listMyBlocksInputSchema.safeParse(undefined).success).toBe(true);
    expect(
      upsertAvailabilityBlockInputSchema.safeParse({
        blockType: "available",
        startsAt: "2026-11-01T08:00:00Z",
        endsAt: "2026-11-01T18:00:00Z",
        notes: "Available in Cairo & Giza",
      }).success,
    ).toBe(true);

    expect(
      checkSupplierAvailabilityInputSchema.safeParse({
        supplierAccountId: randomUUID(),
        startsAt: "2026-11-01T08:00:00Z",
        endsAt: "2026-11-01T18:00:00Z",
      }).success,
    ).toBe(true);

    expect(deleteAvailabilityBlockInputSchema.safeParse({ blockId: randomUUID() }).success).toBe(
      true,
    );

    const err = new AvailabilityServiceError("CONFLICT", "Overlapping block");
    expect(mapAvailabilityError(err).code).toBe("CONFLICT");
  });
});
