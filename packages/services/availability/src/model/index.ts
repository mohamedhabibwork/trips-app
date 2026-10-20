// Entities and aggregates with their invariants. No I/O.
import {
  AVAILABILITY_BLOCK_TYPES,
  SUPPLIER_ROLES,
  type AvailabilityBlockType,
  type SupplierRole,
  type UserRole,
} from "@trips-app/domain";

export {
  AVAILABILITY_BLOCK_TYPES,
  SUPPLIER_ROLES,
  type AvailabilityBlockType,
  type SupplierRole,
  type UserRole,
};

export function windowsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}
