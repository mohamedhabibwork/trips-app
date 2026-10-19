// Entities and aggregates with their invariants. No I/O.
import {
  getStaticLookupByCode,
  type SeatLayoutCell,
  type SeatLayoutCellType,
  type SeatLayoutConfig,
  type UserRole,
  type VehicleRegistrationStatus,
  type VehicleStatus,
  type VehicleTypeScope,
  type VehicleTypeStatus,
} from "@trips-app/domain";

export {
  getStaticLookupByCode,
  type SeatLayoutCell,
  type SeatLayoutCellType,
  type SeatLayoutConfig,
  type UserRole,
  type VehicleRegistrationStatus,
  type VehicleStatus,
  type VehicleTypeScope,
  type VehicleTypeStatus,
};

export const VEHICLE_TYPE_SCOPES = ["platform", "organization"] as const;
export const VEHICLE_TYPE_STATUSES = ["active", "archived"] as const;
export const VEHICLE_REGISTRATION_STATUSES = ["valid", "pending_renewal", "expired"] as const;
export const VEHICLE_STATUSES = ["active", "maintenance", "retired"] as const;
export const SEAT_LAYOUT_CELL_TYPES = [
  "seat",
  "aisle",
  "driver",
  "moderator",
  "door",
  "empty",
] as const;

export const VEHICLE_AMENITY_CODES = [
  "AC",
  "WIFI",
  "USB_CHARGING",
  "RESTROOM",
  "RECLINING_SEATS",
  "ENTERTAINMENT_SCREEN",
  "FIRST_AID_KIT",
  "GPS_TRACKER",
  "CHILD_SEAT_READY",
  "WHEELCHAIR_LIFT",
] as const;

export type VehicleAmenityCode = (typeof VEHICLE_AMENITY_CODES)[number];

export function normalizePlateNumber(plateNumber: string): string {
  return plateNumber
    .trim()
    .toUpperCase()
    .replace(/[\s\-_]+/g, "");
}

export function isValidVehicleCategoryCode(code: string): boolean {
  return getStaticLookupByCode(code, "VEHICLE_TYPE") !== undefined;
}

export function areValidAmenityCodes(codes: readonly string[]): boolean {
  const allowed = new Set<string>(VEHICLE_AMENITY_CODES);
  return codes.every((code) => allowed.has(code.trim().toUpperCase()));
}

export function normalizeAmenityCodes(codes: readonly string[]): string[] {
  return [...new Set(codes.map((code) => code.trim().toUpperCase()).filter(Boolean))];
}

export interface SeatLayoutValidationResult {
  valid: boolean;
  reason?: string;
  field?: string;
}

export function validateSeatLayout(
  seatCount: number,
  seatLayout: SeatLayoutConfig,
): SeatLayoutValidationResult {
  if (!Number.isInteger(seatCount) || seatCount < 1 || seatCount > 120) {
    return {
      valid: false,
      reason: "Seat count must be an integer between 1 and 120.",
      field: "seatCount",
    };
  }

  if (
    !Number.isInteger(seatLayout.rows) ||
    seatLayout.rows < 1 ||
    seatLayout.rows > 40 ||
    !Number.isInteger(seatLayout.cols) ||
    seatLayout.cols < 1 ||
    seatLayout.cols > 12
  ) {
    return {
      valid: false,
      reason: "Seat layout dimensions must be between 1x1 and 40x12.",
      field: "seatLayout",
    };
  }

  const coordinates = new Set<string>();
  const labels = new Set<string>();
  let countedSeats = 0;

  for (const cell of seatLayout.cells) {
    if (
      !Number.isInteger(cell.row) ||
      cell.row < 0 ||
      cell.row >= seatLayout.rows ||
      !Number.isInteger(cell.col) ||
      cell.col < 0 ||
      cell.col >= seatLayout.cols
    ) {
      return {
        valid: false,
        reason: `Cell at (${cell.row}, ${cell.col}) is outside the ${seatLayout.rows}x${seatLayout.cols} layout grid.`,
        field: "seatLayout.cells",
      };
    }

    const coordKey = `${cell.row}:${cell.col}`;
    if (coordinates.has(coordKey)) {
      return {
        valid: false,
        reason: `Duplicate cell coordinate at (${cell.row}, ${cell.col}).`,
        field: "seatLayout.cells",
      };
    }
    coordinates.add(coordKey);

    if (cell.type === "seat") {
      countedSeats += 1;
      const label = cell.seatLabel?.trim() ?? "";
      if (!label) {
        return {
          valid: false,
          reason: `Seat cell at (${cell.row}, ${cell.col}) must have a non-empty seatLabel.`,
          field: "seatLayout.cells",
        };
      }
      const normalizedLabel = label.toUpperCase();
      if (labels.has(normalizedLabel)) {
        return {
          valid: false,
          reason: `Duplicate seat label "${label}" in seat layout.`,
          field: "seatLayout.cells",
        };
      }
      labels.add(normalizedLabel);
    }
  }

  if (countedSeats !== seatCount) {
    return {
      valid: false,
      reason: `Seat layout contains ${countedSeats} seat cells, which does not match seatCount (${seatCount}).`,
      field: "seatCount",
    };
  }

  return { valid: true };
}
