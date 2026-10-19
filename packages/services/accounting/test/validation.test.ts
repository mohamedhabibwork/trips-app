import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { AccountingServiceError, mapAccountingError } from "../src/errors";
import {
  createPayoutSettlementSchema,
  flagReconciliationExceptionSchema,
  listLedgerEntriesSchema,
} from "../src/schemas";

describe("Unit: accounting validation schemas & error mapping (@trips-app/service-accounting)", () => {
  test("accounting Zod schemas and error mapper validate inputs", () => {
    expect(listLedgerEntriesSchema.safeParse(undefined).success).toBe(true);
    expect(
      listLedgerEntriesSchema.safeParse({
        tripId: randomUUID(),
        status: "posted",
      }).success,
    ).toBe(true);
    expect(
      createPayoutSettlementSchema.safeParse({
        amountMinor: 150_000,
        currencyCode: "EGP",
        invoiceNumber: "SET-2026-001",
        description: "Weekly bank settlement",
      }).success,
    ).toBe(true);
    expect(
      flagReconciliationExceptionSchema.safeParse({
        entryId: randomUUID(),
        reason: "Gateway payout settlement mismatch",
      }).success,
    ).toBe(true);

    const err = new AccountingServiceError("INSUFFICIENT_SETTLEMENT_BALANCE", "Balance exceeded");
    expect(mapAccountingError(err).code).toBe("CONFLICT");
  });
});
