import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapProgramsError, ProgramsServiceError } from "../src/errors";
import { findPlanCatalogEntry, SUPPORTED_CURRENCIES, TRIP_PROGRAM_STATUSES } from "../src/model";
import {
  createProgramInputSchema,
  deleteProgramInputSchema,
  listPublicTripProgramsInputSchema,
  listTripProgramsInputSchema,
  updateProgramInputSchema,
} from "../src/schemas/validation";

describe("Unit: programs validation schemas, plan limits & error mapping (@trips-app/service-programs)", () => {
  test("createProgramInputSchema and updateProgramInputSchema validate program payloads", () => {
    expect(SUPPORTED_CURRENCIES).toEqual(["EGP", "SAR", "AED"]);
    expect(TRIP_PROGRAM_STATUSES).toEqual(["active", "cancelled"]);

    expect(
      createProgramInputSchema.safeParse({
        tripId: randomUUID(),
        titleAr: "جولة السفاري",
        titleEn: "Desert Safari Excursion",
        dayNumber: 1,
        priceMinor: 45000,
        currencyCode: "EGP",
        isIncludedInBase: false,
        capacity: 25,
      }).success,
    ).toBe(true);

    expect(
      createProgramInputSchema.safeParse({
        tripId: "not-a-uuid",
        titleAr: "",
        titleEn: "Invalid",
      }).success,
    ).toBe(false);

    expect(
      updateProgramInputSchema.safeParse({
        programId: randomUUID(),
        status: "cancelled",
        priceMinor: 0,
      }).success,
    ).toBe(true);

    expect(deleteProgramInputSchema.safeParse({ programId: randomUUID() }).success).toBe(true);
    expect(listTripProgramsInputSchema.safeParse({ tripId: randomUUID() }).success).toBe(true);
    expect(listPublicTripProgramsInputSchema.safeParse(undefined).success).toBe(true);
  });

  test("plan limits and ProgramsServiceError map to shared error codes", () => {
    const starterPlan = findPlanCatalogEntry("organization", "starter");
    expect(starterPlan?.limits.programsPerTrip).toBeGreaterThan(0);

    const err = new ProgramsServiceError("PLAN_LIMIT_EXCEEDED", "Too many programs");
    expect(mapProgramsError(err).code).toBe("PLAN_LIMIT_EXCEEDED");
  });

  test("createProgramsRepository accepts ServiceDatabase and instantiates repository methods", async () => {
    const { createProgramsRepository } = await import("../src/repository");
    const mockDb = {} as import("@trips-app/db").TransactionClient;
    const repo = createProgramsRepository(mockDb);
    expect(typeof repo.findOrganizationPlan).toBe("function");
    expect(typeof repo.findTripForTenant).toBe("function");
    expect(typeof repo.insertProgram).toBe("function");
    expect(typeof repo.listProgramsForTrip).toBe("function");
    expect(typeof repo.listPublicProgramsForTrip).toBe("function");
  });
});
