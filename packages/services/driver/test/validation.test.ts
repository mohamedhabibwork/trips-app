import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { DriverServiceError, mapDriverError } from "../src/errors";
import { DEFAULT_LAB_VALIDITY_DAYS } from "../src/model";
import {
  adminRequestLabTestSchema,
  adminReviewLabTestSchema,
  bookLabTestSchema,
  updateDriverProfileSchema,
  uploadLabTestResultSchema,
} from "../src/schemas";

describe("Unit: driver validation schemas, lab validity constants & error mapping (@trips-app/service-driver)", () => {
  test("driver Zod schemas and error mapper validate inputs", () => {
    expect(DEFAULT_LAB_VALIDITY_DAYS).toBe(180);
    expect(
      updateDriverProfileSchema.safeParse({
        yearsOfExperience: 8,
        serviceAreas: ["Cairo", "Alexandria"],
        hasOwnVehicle: true,
      }).success,
    ).toBe(true);
    expect(
      bookLabTestSchema.safeParse({
        labTestId: randomUUID(),
        labCenterName: "Al Borg Diagnostics",
        appointmentAt: "2026-11-01T09:00:00Z",
      }).success,
    ).toBe(true);
    expect(
      uploadLabTestResultSchema.safeParse({
        labTestId: randomUUID(),
        resultDocumentUrl: "https://cdn.trips.eg/labs/result.pdf",
      }).success,
    ).toBe(true);
    expect(
      adminRequestLabTestSchema.safeParse({
        driverAccountId: randomUUID(),
        deadlineAt: "2026-11-05T18:00:00Z",
      }).success,
    ).toBe(true);
    expect(
      adminReviewLabTestSchema.safeParse({
        labTestId: randomUUID(),
        decision: "verified_pass",
        reviewNotes: "Verified clean toxicology report",
      }).success,
    ).toBe(true);

    const err = new DriverServiceError("FORBIDDEN_LAB_TEST_ACCESS", "Not your test");
    expect(mapDriverError(err).code).toBe("FORBIDDEN");
  });
});
