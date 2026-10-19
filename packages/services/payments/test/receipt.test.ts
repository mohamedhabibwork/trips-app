import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import {
  buildReceiptLines,
  hasReceipt,
  invoiceNumberFor,
  type ReceiptBookingSource,
} from "../src/model";
import { getReceiptSchema } from "../src/schemas";

const BOOKING: ReceiptBookingSource = {
  passengersCount: 3,
  selectedProgramIds: ["p-1", "p-2"],
  subtotalMinor: 300_000,
  programsTotalMinor: 40_000,
  discountMinor: 25_000,
  couponCode: "NILE10",
  tripTitleAr: "رحلة الأقصر",
  tripTitleEn: "Luxor trip",
};

describe("Unit: payments receipt (@trips-app/service-payments)", () => {
  test("getReceiptSchema accepts a payment UUID", () => {
    // Arrange
    const input = { paymentId: randomUUID() };

    // Act
    const result = getReceiptSchema.safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  test("getReceiptSchema rejects a missing or malformed payment id", () => {
    // Arrange
    const payloads = [{}, { paymentId: "not-a-uuid" }, { paymentId: 42 }];

    // Act
    const results = payloads.map((payload) => getReceiptSchema.safeParse(payload).success);

    // Assert
    expect(results).toEqual([false, false, false]);
  });

  test("only paid, refunded or disputed payments have a receipt", () => {
    // Arrange
    const statuses = [
      "pending",
      "requires_action",
      "failed",
      "succeeded",
      "refunded",
      "disputed",
    ] as const;

    // Act
    const withReceipt = statuses.filter((status) => hasReceipt(status));

    // Assert
    expect(withReceipt).toEqual(["succeeded", "refunded", "disputed"]);
  });

  test("invoiceNumberFor matches the number written to the ledger", () => {
    // Arrange
    const reference = "PAYMOB-0A1B2C3D4E5F6A7B";

    // Act
    const invoiceNumber = invoiceNumberFor(reference);

    // Assert
    expect(invoiceNumber).toBe("INV-PAYMOB-0A1B2C3D4E5F6A7B");
  });

  test("a booking receipt lists seats, programs and the coupon discount", () => {
    // Arrange
    const amountPaid = 315_000;

    // Act
    const lines = buildReceiptLines(BOOKING, amountPaid);

    // Assert
    expect(lines.map((line) => [line.kind, line.quantity, line.amountMinor])).toEqual([
      ["trip", 3, 300_000],
      ["programs", 2, 40_000],
      ["discount", 1, -25_000],
    ]);
    expect(lines[0]?.titleEn).toBe("Luxor trip");
    expect(lines[2]?.couponCode).toBe("NILE10");
  });

  test("a booking without programs or discount has only the seats line", () => {
    // Arrange
    const booking = { ...BOOKING, programsTotalMinor: 0, discountMinor: 0 };

    // Act
    const lines = buildReceiptLines(booking, booking.subtotalMinor);

    // Assert
    expect(lines.map((line) => line.kind)).toEqual(["trip"]);
  });

  test("a payment with no booking is one subscription line for the amount paid", () => {
    // Arrange
    const amountPaid = 99_900;

    // Act
    const lines = buildReceiptLines(null, amountPaid);

    // Assert
    expect(lines).toEqual([
      {
        kind: "subscription",
        titleAr: null,
        titleEn: null,
        couponCode: null,
        quantity: 1,
        amountMinor: amountPaid,
      },
    ]);
  });
});
