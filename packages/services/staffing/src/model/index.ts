// Entities and aggregates with their invariants. No I/O.
import {
  findPlanCatalogEntry,
  hashSha256,
  type TripStaffSource,
  type UserRole,
} from "@trips-app/domain";

export { findPlanCatalogEntry, hashSha256, type TripStaffSource, type UserRole };

export const TRIP_STAFF_SOURCES = [
  "org_staff",
  "platform_supplier",
  "unassigned",
] as const satisfies readonly TripStaffSource[];

export function computeTripStaffingGap(
  vehicles: readonly {
    driverSource: TripStaffSource;
    driverAccountId?: string | null;
    moderatorSource: TripStaffSource;
    moderatorAccountId?: string | null;
  }[],
): boolean {
  if (vehicles.length === 0) return true;
  return vehicles.some(
    (v) => v.driverSource === "unassigned" || v.moderatorSource === "unassigned",
  );
}

export function generateSixDigitStaffCode(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return String(num);
}
