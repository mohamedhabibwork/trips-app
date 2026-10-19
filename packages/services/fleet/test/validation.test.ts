import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { FleetServiceError, mapFleetError } from "../src/errors";
import {
  areValidAmenityCodes,
  isValidVehicleCategoryCode,
  normalizeAmenityCodes,
  normalizePlateNumber,
  validateSeatLayout,
} from "../src/model";
import {
  createVehicleInputSchema,
  createVehicleTypeInputSchema,
  listVehiclesInputSchema,
  listVehicleTypesInputSchema,
  removeVehicleInputSchema,
  updateVehicleInputSchema,
  updateVehicleTypeInputSchema,
} from "../src/schemas/validation";

describe("Unit: fleet validation schemas, 2D seat layout validator & plate normalization (@trips-app/service-fleet)", () => {
  test("normalizePlateNumber and amenity helpers normalize and validate inputs", () => {
    expect(normalizePlateNumber(" ق هـ ر - 1234 ")).toBe("قهـر1234");
    expect(normalizePlateNumber("abc - 987")).toBe("ABC987");
    expect(isValidVehicleCategoryCode("COASTER_MINIBUS_28")).toBe(true);
    expect(isValidVehicleCategoryCode("UNKNOWN_CATEGORY")).toBe(false);
    expect(areValidAmenityCodes(["AC", "wifi", "GPS_TRACKER"])).toBe(true);
    expect(areValidAmenityCodes(["AC", "JETPACK"])).toBe(false);
    expect(normalizeAmenityCodes(["wifi", "AC", "WIFI"])).toEqual(["WIFI", "AC"]);
  });

  test("validateSeatLayout enforces grid bounds, unique coordinates, unique seat labels, and exact seatCount match", () => {
    const validLayout = {
      rows: 2,
      cols: 2,
      cells: [
        { row: 0, col: 0, type: "driver" as const },
        { row: 0, col: 1, type: "moderator" as const },
        { row: 1, col: 0, type: "seat" as const, seatLabel: "1A" },
        { row: 1, col: 1, type: "seat" as const, seatLabel: "1B" },
      ],
    };

    expect(validateSeatLayout(2, validLayout)).toEqual({ valid: true });

    // Mismatched seatCount
    expect(validateSeatLayout(3, validLayout).valid).toBe(false);

    // Duplicate seatLabel
    expect(
      validateSeatLayout(2, {
        rows: 2,
        cols: 2,
        cells: [
          { row: 0, col: 0, type: "seat", seatLabel: "1A" },
          { row: 0, col: 1, type: "seat", seatLabel: "1a" },
        ],
      }).valid,
    ).toBe(false);

    // Out-of-bounds cell
    expect(
      validateSeatLayout(1, {
        rows: 2,
        cols: 2,
        cells: [{ row: 2, col: 0, type: "seat", seatLabel: "1A" }],
      }).valid,
    ).toBe(false);
  });

  test("Zod schemas validate create/update vehicle types and vehicles", () => {
    expect(
      createVehicleTypeInputSchema.safeParse({
        categoryLookupCode: "COASTER_MINIBUS_28",
        nameAr: "ميني باص كوستر",
        nameEn: "Coaster Minibus",
        seatCount: 2,
        seatLayout: {
          rows: 1,
          cols: 2,
          cells: [
            { row: 0, col: 0, type: "seat", seatLabel: "1A" },
            { row: 0, col: 1, type: "seat", seatLabel: "1B" },
          ],
        },
      }).success,
    ).toBe(true);

    expect(
      createVehicleInputSchema.safeParse({
        vehicleTypeId: randomUUID(),
        plateNumber: "ABC-123",
        model: "Toyota Coaster",
        manufacturingYear: 2025,
        seatCount: 28,
        amenityCodes: ["AC", "WIFI"],
      }).success,
    ).toBe(true);

    expect(listVehicleTypesInputSchema.safeParse(undefined).success).toBe(true);
    expect(listVehiclesInputSchema.safeParse({}).success).toBe(true);
    expect(updateVehicleTypeInputSchema.safeParse({ vehicleTypeId: randomUUID() }).success).toBe(
      true,
    );
    expect(updateVehicleInputSchema.safeParse({ vehicleId: randomUUID() }).success).toBe(true);
    expect(removeVehicleInputSchema.safeParse({ vehicleId: randomUUID() }).success).toBe(true);

    const err = new FleetServiceError("BUSINESS_RULE_VIOLATION", "Seat count mismatch");
    expect(mapFleetError(err).code).toBe("BUSINESS_RULE_VIOLATION");
  });
});
