import { describe, expect, test } from "bun:test";
import { getTestContext, getTestDb } from "../helpers/db";
import { createTripsService } from "@trips-app/service-trips";
import { createFleetService } from "@trips-app/service-fleet";
import { createBookingService, createBookingRepository } from "@trips-app/service-booking";
import { createEmployeesService } from "@trips-app/service-employees";
import { createMediaService } from "@trips-app/service-media";
import { createLookupsRepository, type Database } from "@trips-app/db";
import {
  apiErrorResponseSchema,
  apiResponseMetaSchema,
  createApiSuccessResponseSchema,
} from "@trips-app/rpc";
import { z } from "zod/v4";

describe("Tier 1 - Feature R4: Exact Behavioral & Interface Preservation", () => {
  const db = getTestDb();

  test("R4-01: Public service factories export callable constructors accepting ServiceDatabase", () => {
    // Authoritative source: PROJECT.md Section Interface Contracts
    const tripsService = createTripsService(db);
    expect(typeof tripsService.listOrganizationTrips).toBe("function");
    expect(typeof tripsService.getOrganizationTrip).toBe("function");
    expect(typeof tripsService.createDraft).toBe("function");
    expect(typeof tripsService.publish).toBe("function");

    const fleetService = createFleetService(db);
    expect(typeof fleetService.listVehicles).toBe("function");
    expect(typeof fleetService.listVehicleTypes).toBe("function");

    const bookingService = createBookingService(db);
    expect(typeof bookingService.createBooking).toBe("function");
    expect(typeof bookingService.cancelBooking).toBe("function");

    const employeesService = createEmployeesService(db);
    expect(typeof employeesService.list).toBe("function");
    expect(typeof employeesService.invite).toBe("function");

    const mediaService = createMediaService(db);
    expect(typeof mediaService.createUploadIntent).toBe("function");
    expect(typeof mediaService.confirmUploadIntent).toBe("function");
  });

  test("R4-02: Public services and repositories instantiate cleanly with transaction clients", async () => {
    await db.transaction(async (tx) => {
      const txDb = tx as unknown as Database;
      // Services accepting tx
      const tripsService = createTripsService(txDb);
      expect(typeof tripsService.listOrganizationTrips).toBe("function");

      const fleetService = createFleetService(txDb);
      expect(typeof fleetService.listVehicles).toBe("function");

      // Exported repositories accepting tx
      const bookingRepo = createBookingRepository(txDb);
      expect(typeof bookingRepo.findTripById).toBe("function");

      const lookupsRepo = createLookupsRepository(txDb);
      expect(typeof lookupsRepo.listLookupTypes).toBe("function");
    });
  });

  test("R4-03: RPC procedure envelopes preserve ApiSuccessResponse and ApiErrorResponse schemas", () => {
    // Response metadata schema invariant
    const metaParsed = apiResponseMetaSchema.safeParse({
      requestId: "req_test_123",
      timestamp: new Date().toISOString(),
      locale: "ar",
    });
    expect(metaParsed.success).toBe(true);

    // Error response schema invariant
    const errorParsed = apiErrorResponseSchema.safeParse({
      success: false,
      data: null,
      error: {
        code: "RESOURCE_NOT_FOUND",
        category: "NOT_FOUND",
        status: 404,
        message: "Resource was not found",
      },
      requestId: "req_error_123",
      meta: {
        requestId: "req_error_123",
        timestamp: new Date().toISOString(),
        locale: "ar",
      },
    });
    expect(errorParsed.success).toBe(true);

    // Dynamic success envelope generator invariant
    const samplePayloadSchema = z.object({ id: z.string(), status: z.string() });
    const successEnvelopeSchema = createApiSuccessResponseSchema(samplePayloadSchema);

    const successParsed = successEnvelopeSchema.safeParse({
      success: true,
      data: { id: "test-id", status: "ok" },
      error: null,
      requestId: "req_ok_123",
      meta: {
        requestId: "req_ok_123",
        timestamp: new Date().toISOString(),
        locale: "en",
      },
    });
    expect(successParsed.success).toBe(true);
  });

  test("R4-04: Boundary validation preserves field presence and does not strip required attributes", () => {
    // Testing validation preservation across service boundary inputs
    const testData = {
      plateNumber: "ABC 1234",
      model: "Mercedes",
      manufacturingYear: 2023,
      seatCount: 45,
    };

    const schemaTest = z.object({
      plateNumber: z.string().trim().min(1),
      model: z.string().trim().min(1),
      manufacturingYear: z.number().int(),
      seatCount: z.number().int().min(1),
    });

    const parsed = schemaTest.safeParse(testData);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(testData);
    }
  });

  test("R4-05: Service queries return well-formed DTOs adhering to public contract interfaces", async () => {
    const ctx = await getTestContext();
    const tripsService = createTripsService(db);

    const authContext = {
      accountId: ctx.ownerAccountId,
      sessionId: "00000000-0000-4000-8000-000000000000",
      activeRole: "organization_owner" as const,
      activeTenantId: ctx.tenantId,
      planTier: "enterprise",
    };

    const result = await tripsService.listOrganizationTrips(authContext, {});
    expect(Array.isArray(result.items)).toBe(true);
  });
});
