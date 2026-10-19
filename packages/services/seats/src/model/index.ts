// Entities and aggregates with their invariants. No I/O.
import {
  findPlanCatalogEntry,
  type SeatInventoryStatus,
  type SeatLayoutConfig,
  type TravelerPlanCode,
  type UserRole,
} from "@trips-app/domain";

export {
  findPlanCatalogEntry,
  type SeatInventoryStatus,
  type SeatLayoutConfig,
  type TravelerPlanCode,
  type UserRole,
};

export const SEAT_INVENTORY_STATUSES = [
  "available",
  "held",
  "reserved",
  "blocked",
] as const satisfies readonly SeatInventoryStatus[];

export const DEFAULT_SEAT_HOLD_MINUTES = 15;

export function isSeatHoldExpired(holdExpiresAt: Date | null, now: Date = new Date()): boolean {
  if (!holdExpiresAt) return true;
  return holdExpiresAt.getTime() <= now.getTime();
}
