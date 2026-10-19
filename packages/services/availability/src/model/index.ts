// Entities and aggregates with their invariants. No I/O.
import { type AvailabilityBlockType, type SupplierRole, type UserRole } from "@trips-app/domain";

export { type AvailabilityBlockType, type SupplierRole, type UserRole };

export const AVAILABILITY_BLOCK_TYPES = [
  "available",
  "unavailable",
  "assigned_trip",
] as const satisfies readonly AvailabilityBlockType[];

export const SUPPLIER_ROLES = [
  "platform_driver",
  "org_driver",
  "platform_photographer",
  "org_photographer",
] as const satisfies readonly SupplierRole[];

export function windowsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
