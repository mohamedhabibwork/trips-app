import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapModeratorError, ModeratorServiceError } from "../src/errors";
import {
  raiseSafetyAlertSchema,
  recordBoardingCheckInSchema,
  recordHeadcountSchema,
} from "../src/schemas";

describe("Unit: moderator validation schemas & error mapping (@trips-app/service-moderator)", () => {
  test("moderator Zod schemas and error mapper validate inputs", () => {
    expect(
      recordBoardingCheckInSchema.safeParse({
        checkInRecordId: randomUUID(),
        status: "checked_in",
        notes: "Boarded at Cairo gate",
      }).success,
    ).toBe(true);
    expect(
      recordHeadcountSchema.safeParse({
        countedPassengers: 24,
        notes: "All passengers accounted for at rest stop",
      }).success,
    ).toBe(true);
    expect(
      raiseSafetyAlertSchema.safeParse({
        severity: "critical",
        messageAr: "تأخر بسبب عطل فني",
        messageEn: "Mechanical delay on highway",
      }).success,
    ).toBe(true);

    const err = new ModeratorServiceError("PASSENGER_NOT_IN_VEHICLE_MANIFEST", "Wrong vehicle");
    expect(mapModeratorError(err).code).toBe("FORBIDDEN");
  });
});
