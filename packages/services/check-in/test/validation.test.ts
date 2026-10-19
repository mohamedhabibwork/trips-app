import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { CheckInServiceError, mapCheckInError } from "../src/errors";
import {
  getMyBoardingPassesSchema,
  listTripManifestSchema,
  manualCheckInOverrideSchema,
  verifyAndCheckInByQrSchema,
} from "../src/schemas";

describe("Unit: check-in validation schemas & error mapping (@trips-app/service-check-in)", () => {
  test("check-in Zod schemas and error mapper validate inputs", () => {
    expect(listTripManifestSchema.safeParse({ tripId: randomUUID() }).success).toBe(true);
    expect(
      verifyAndCheckInByQrSchema.safeParse({
        qrCodeToken: "QR-BK-123456-1-abcdef0123456789",
      }).success,
    ).toBe(true);
    expect(
      manualCheckInOverrideSchema.safeParse({
        checkInRecordId: randomUUID(),
        status: "checked_in",
        notes: "Verified national ID at gate",
      }).success,
    ).toBe(true);
    expect(getMyBoardingPassesSchema.safeParse(undefined).success).toBe(true);

    const err = new CheckInServiceError("ALREADY_CHECKED_IN", "Duplicate scan");
    expect(mapCheckInError(err).code).toBe("CONFLICT");
  });
});
