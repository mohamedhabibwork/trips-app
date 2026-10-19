import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapNegotiationError, NegotiationServiceError } from "../src/errors";
import { isActiveNegotiationStatus } from "../src/model";
import {
  createNegotiationOfferInputSchema,
  listNegotiationsInputSchema,
  respondNegotiationOfferInputSchema,
} from "../src/schemas/validation";

describe("Unit: negotiation validation schemas, status invariants & error mapping (@trips-app/service-negotiation)", () => {
  test("isActiveNegotiationStatus classifies active vs terminal deal states", () => {
    expect(isActiveNegotiationStatus("pending_supplier")).toBe(true);
    expect(isActiveNegotiationStatus("countered_by_supplier")).toBe(true);
    expect(isActiveNegotiationStatus("countered_by_org")).toBe(true);
    expect(isActiveNegotiationStatus("accepted")).toBe(false);
    expect(isActiveNegotiationStatus("declined")).toBe(false);
    expect(isActiveNegotiationStatus("expired")).toBe(false);
    expect(isActiveNegotiationStatus("cancelled")).toBe(false);
  });

  test("negotiation Zod schemas and error mapper validate inputs", () => {
    expect(
      createNegotiationOfferInputSchema.safeParse({
        tripId: randomUUID(),
        supplierAccountId: randomUUID(),
        supplierRole: "platform_driver",
        offerAmountMinor: 350000,
        currencyCode: "EGP",
      }).success,
    ).toBe(true);

    expect(
      respondNegotiationOfferInputSchema.safeParse({
        negotiationId: randomUUID(),
        action: "counter",
        counterOfferMinor: 400000,
      }).success,
    ).toBe(true);

    expect(listNegotiationsInputSchema.safeParse(undefined).success).toBe(true);

    const err = new NegotiationServiceError("INVALID_STATE_TRANSITION", "Offer expired");
    expect(mapNegotiationError(err).code).toBe("INVALID_STATE_TRANSITION");
  });
});
