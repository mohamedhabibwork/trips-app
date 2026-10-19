import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { BookingServiceError, mapBookingError } from "../src/errors";
import {
  calculateRefundAmountMinor,
  generateBookingReference,
  generateQrCodeToken,
} from "../src/model";
import {
  cancelBookingSchema,
  createBookingSchema,
  getBookingSchema,
  listOrganizationBookingsSchema,
} from "../src/schemas";

describe("Unit: booking validation schemas, refund tier calculation & error mapping (@trips-app/service-booking)", () => {
  test("generateBookingReference, generateQrCodeToken, and calculateRefundAmountMinor follow policy", () => {
    const ref = generateBookingReference();
    expect(ref).toMatch(/^BK-[A-Z0-9]{6}$/);
    const qr = generateQrCodeToken(ref, 0);
    expect(qr.startsWith(`QR-${ref}-1-`)).toBe(true);

    const now = new Date("2026-10-18T10:00:00Z");
    const farFuture = new Date("2026-10-25T10:00:00Z");
    const midWindow = new Date("2026-10-19T16:00:00Z");
    const imminent = new Date("2026-10-18T12:00:00Z");
    expect(calculateRefundAmountMinor(100_000, farFuture, now)).toBe(80_000);
    expect(calculateRefundAmountMinor(100_000, midWindow, now)).toBe(50_000);
    expect(calculateRefundAmountMinor(100_000, imminent, now)).toBe(0);
    expect(calculateRefundAmountMinor(100_000, null, now)).toBe(100_000);
  });

  test("booking Zod schemas and error mapper validate inputs", () => {
    expect(
      createBookingSchema.safeParse({
        tripId: randomUUID(),
        passengers: [
          {
            id: "pax-1",
            fullName: "Nour El-Din",
            isChild: false,
            nationalIdOrPassport: null,
            age: 30,
            seatLabel: "1A",
          },
        ],
        seatLabels: ["1A"],
        paymentGateway: "paymob",
      }).success,
    ).toBe(true);

    expect(
      cancelBookingSchema.safeParse({
        bookingId: randomUUID(),
        reason: "Schedule change",
      }).success,
    ).toBe(true);
    expect(getBookingSchema.safeParse({ bookingId: randomUUID() }).success).toBe(true);
    expect(listOrganizationBookingsSchema.safeParse(undefined).success).toBe(true);

    const err = new BookingServiceError("SEAT_UNAVAILABLE", "Seat 1A is taken");
    expect(mapBookingError(err).code).toBe("CONFLICT");
  });
});
