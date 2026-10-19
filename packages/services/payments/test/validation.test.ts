import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapPaymentsError, PaymentsServiceError } from "../src/errors";
import {
  DEFAULT_PLATFORM_COMMISSION_BPS,
  FAWRY_EXPIRY_HOURS,
  generateFawryReferenceCode,
  generateProviderReference,
} from "../src/model";
import {
  confirmPaymentSchema,
  createPaymentIntentSchema,
  openDisputeSchema,
  refundPaymentSchema,
  resolveDisputeSchema,
} from "../src/schemas";

describe("Unit: payments validation schemas, reference generators & error mapping (@trips-app/service-payments)", () => {
  test("generateProviderReference and generateFawryReferenceCode produce valid tokens", () => {
    expect(FAWRY_EXPIRY_HOURS).toBe(48);
    expect(DEFAULT_PLATFORM_COMMISSION_BPS).toBe(1000);
    expect(generateProviderReference("paymob")).toMatch(/^PAYMOB-[0-9A-F]{16}$/);
    expect(generateFawryReferenceCode()).toMatch(/^\d{10}$/);
  });

  test("payments Zod schemas and error mapper validate inputs", () => {
    expect(
      createPaymentIntentSchema.safeParse({
        bookingId: randomUUID(),
        gateway: "fawry",
        currencyCode: "EGP",
      }).success,
    ).toBe(true);
    expect(confirmPaymentSchema.safeParse({ paymentId: randomUUID() }).success).toBe(true);
    expect(
      refundPaymentSchema.safeParse({
        paymentId: randomUUID(),
        refundAmountMinor: 50_000,
        reason: "Customer requested partial refund",
      }).success,
    ).toBe(true);
    expect(
      openDisputeSchema.safeParse({
        paymentId: randomUUID(),
        reason: "Duplicate charge on statement",
      }).success,
    ).toBe(true);
    expect(
      resolveDisputeSchema.safeParse({
        paymentId: randomUUID(),
        resolution: "resolved_refund",
      }).success,
    ).toBe(true);

    const err = new PaymentsServiceError("INVALID_PAYMENT_STATE", "Fawry expired");
    expect(mapPaymentsError(err).code).toBe("CONFLICT");
  });
});
