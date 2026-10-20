// Entities and aggregates with their invariants. No I/O.
import {
  CURRENCY_CODES,
  type CurrencyCode,
  DEFAULT_PLAN_CATALOG,
  findPlanCatalogEntry,
  getStaticLookupByCode,
  type Money,
  money,
  type PlanFeatures,
  type PlanLimits,
  type SeatLayoutConfig,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type TravelerPlanCode,
  TRIP_PUBLISH_MODES,
  type TripPublishMode,
  type TripRoutePoint,
  TRIP_SEAT_ASSIGNMENT_MODES,
  type TripSeatAssignmentMode,
  TRIP_STAFF_SOURCES,
  type TripStaffSource,
  TRIP_STATES,
  type TripState,
  type TripWizardStepCompletion,
  type UserRole,
} from "@trips-app/domain";

export {
  CURRENCY_CODES,
  type CurrencyCode,
  DEFAULT_PLAN_CATALOG,
  findPlanCatalogEntry,
  getStaticLookupByCode,
  type Money,
  money,
  type PlanFeatures,
  type PlanLimits,
  type SeatLayoutConfig,
  SUPPORTED_LOCALES,
  type SupportedLocale,
  type TravelerPlanCode,
  TRIP_PUBLISH_MODES,
  type TripPublishMode,
  type TripRoutePoint,
  TRIP_SEAT_ASSIGNMENT_MODES,
  type TripSeatAssignmentMode,
  TRIP_STAFF_SOURCES,
  type TripStaffSource,
  TRIP_STATES,
  type TripState,
  type TripWizardStepCompletion,
  type UserRole,
};

export const PUBLIC_DISCOVERABLE_TRIP_STATES = [
  "published",
  "scheduled",
  "Selection",
] as const satisfies readonly TripState[];

export const CANCELLABLE_TRIP_STATES = [
  "draft",
  "published",
  "scheduled",
  "Selection",
] as const satisfies readonly TripState[];

export const SUPPORTED_CURRENCIES = CURRENCY_CODES;

export const DEFAULT_WIZARD_STEPS: TripWizardStepCompletion = {
  basics: false,
  schedule: false,
  vehicles: false,
  staffing: false,
  programs: false,
  seating: false,
  pricing: false,
  publish: false,
};

const ALLOWED_LIFECYCLE_TRANSITIONS: Readonly<Record<TripState, readonly TripState[]>> = {
  draft: [],
  published: ["scheduled"],
  scheduled: ["Selection"],
  Selection: ["in_progress"],
  in_progress: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransitionTripState(fromState: TripState, toState: TripState): boolean {
  return ALLOWED_LIFECYCLE_TRANSITIONS[fromState]?.includes(toState) ?? false;
}

export function canCancelTripState(state: TripState): boolean {
  return (CANCELLABLE_TRIP_STATES as readonly string[]).includes(state);
}

export function isValidTripCategoryCode(code: string): boolean {
  return getStaticLookupByCode(code, "TRIP_CATEGORY") !== undefined;
}

export function computeHasStaffingGap(
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

export function isTripEligibleForTravelerDiscovery(
  trip: {
    state: TripState;
    publishMode: TripPublishMode;
    targetedAudienceIds: readonly string[];
    vipEarlyAccessUntil: Date | null;
  },
  viewer: {
    accountId?: string | null;
    travelerPlanTier?: TravelerPlanCode | null;
  },
  now: Date = new Date(),
): boolean {
  if (!(PUBLIC_DISCOVERABLE_TRIP_STATES as readonly string[]).includes(trip.state)) {
    return false;
  }
  if (trip.publishMode === "draft") {
    return false;
  }
  if (trip.publishMode === "targeted") {
    if (!viewer.accountId) return false;
    if (!trip.targetedAudienceIds.includes(viewer.accountId)) return false;
  }
  if (trip.vipEarlyAccessUntil && trip.vipEarlyAccessUntil.getTime() > now.getTime()) {
    if (viewer.travelerPlanTier !== "vip") {
      return false;
    }
  }
  return true;
}
