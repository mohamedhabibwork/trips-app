import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapStaffingError, StaffingServiceError } from "../src/errors";
import { computeTripStaffingGap, generateSixDigitStaffCode } from "../src/model";
import {
  assignVehicleStaffInputSchema,
  issueModeratorStaffCodeInputSchema,
  listTripStaffingInputSchema,
  revokeModeratorAssignmentInputSchema,
} from "../src/schemas/validation";

describe("Unit: staffing validation schemas, staffing gap detection & staff code generation (@trips-app/service-staffing)", () => {
  test("computeTripStaffingGap and generateSixDigitStaffCode enforce staffing invariants", () => {
    expect(computeTripStaffingGap([])).toBe(true);
    expect(
      computeTripStaffingGap([{ driverSource: "org_staff", moderatorSource: "unassigned" }]),
    ).toBe(true);
    expect(
      computeTripStaffingGap([{ driverSource: "org_staff", moderatorSource: "org_staff" }]),
    ).toBe(false);

    const code = generateSixDigitStaffCode();
    expect(code).toMatch(/^\d{6}$/);
  });

  test("staffing Zod schemas and error mapper validate boundary inputs", () => {
    expect(listTripStaffingInputSchema.safeParse({ tripId: randomUUID() }).success).toBe(true);
    expect(
      assignVehicleStaffInputSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        driverSource: "org_staff",
        driverAccountId: randomUUID(),
        moderatorSource: "org_staff",
        moderatorAccountId: randomUUID(),
      }).success,
    ).toBe(true);

    expect(
      issueModeratorStaffCodeInputSchema.safeParse({
        tripId: randomUUID(),
        vehicleId: randomUUID(),
        moderatorAccountId: randomUUID(),
      }).success,
    ).toBe(true);

    expect(
      revokeModeratorAssignmentInputSchema.safeParse({
        assignmentId: randomUUID(),
      }).success,
    ).toBe(true);

    const err = new StaffingServiceError("RESOURCE_NOT_FOUND", "Assignment not found");
    expect(mapStaffingError(err).code).toBe("RESOURCE_NOT_FOUND");
  });
});
