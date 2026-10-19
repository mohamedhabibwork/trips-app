import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapSeatsError, SeatsServiceError } from "../src/errors";
import { DEFAULT_SEAT_HOLD_MINUTES, isSeatHoldExpired } from "../src/model";
import {
  assignSeatByOrgInputSchema,
  getSeatMapInputSchema,
  holdSeatsInputSchema,
  releaseSeatHoldInputSchema,
} from "../src/schemas/validation";

describe("Unit: seats validation schemas, hold expiry & error mapping (@trips-app/service-seats)", () => {
  test("isSeatHoldExpired evaluates hold timestamps accurately", () => {
    expect(DEFAULT_SEAT_HOLD_MINUTES).toBe(15);
    const now = new Date("2026-10-18T10:00:00Z");
    expect(isSeatHoldExpired(null, now)).toBe(true);
    expect(isSeatHoldExpired(new Date("2026-10-18T09:59:59Z"), now)).toBe(true);
    expect(isSeatHoldExpired(new Date("2026-10-18T10:15:00Z"), now)).toBe(false);
  });

  test("seats Zod schemas and error mapper validate boundary inputs", () => {
    expect(getSeatMapInputSchema.safeParse({ tripId: randomUUID() }).success).toBe(true);
    expect(
      holdSeatsInputSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        seatLabels: ["1A", "1B"],
      }).success,
    ).toBe(true);
    expect(
      holdSeatsInputSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        seatLabels: [],
      }).success,
    ).toBe(false);
    expect(
      releaseSeatHoldInputSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        seatLabels: ["1A"],
      }).success,
    ).toBe(true);
    expect(
      assignSeatByOrgInputSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        seatLabel: "2A",
        status: "blocked",
      }).success,
    ).toBe(true);

    const err = new SeatsServiceError("SEAT_NOT_AVAILABLE", "Seat 1A is held");
    expect(mapSeatsError(err).code).toBe("SEAT_NOT_AVAILABLE");
  });
});
