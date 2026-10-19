// Entities and aggregates with their invariants. No I/O.
import {
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type PlanLimits,
  type TripProgramStatus,
  type UserRole,
} from "@trips-app/domain";

export {
  type CurrencyCode,
  findPlanCatalogEntry,
  type Money,
  money,
  type PlanLimits,
  type TripProgramStatus,
  type UserRole,
};

export const TRIP_PROGRAM_STATUSES = [
  "active",
  "cancelled",
] as const satisfies readonly TripProgramStatus[];

export const SUPPORTED_CURRENCIES = [
  "EGP",
  "SAR",
  "AED",
] as const satisfies readonly CurrencyCode[];
