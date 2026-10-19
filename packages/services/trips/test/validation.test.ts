import { describe, expect, test } from "bun:test";
import { randomUUID } from "node:crypto";

import { mapTripsError, TripsServiceError } from "../src/errors";
import {
  canCancelTripState,
  canTransitionTripState,
  computeHasStaffingGap,
  isTripEligibleForTravelerDiscovery,
  isValidTripCategoryCode,
} from "../src/model";
import {
  browsePublicTripsInputSchema,
  cancelTripInputSchema,
  createDraftTripInputSchema,
  getPublicTripDetailInputSchema,
  publishTripInputSchema,
  saveWizardStepInputSchema,
  transitionTripStateInputSchema,
} from "../src/schemas/validation";

describe("Unit: trips validation schemas, lifecycle state machine & discovery rules (@trips-app/service-trips)", () => {
  test("canTransitionTripState and canCancelTripState enforce operational state machine", () => {
    expect(canTransitionTripState("published", "scheduled")).toBe(true);
    expect(canTransitionTripState("scheduled", "Selection")).toBe(true);
    expect(canTransitionTripState("Selection", "in_progress")).toBe(true);
    expect(canTransitionTripState("in_progress", "completed")).toBe(true);

    expect(canTransitionTripState("draft", "in_progress")).toBe(false);
    expect(canTransitionTripState("published", "completed")).toBe(false);
    expect(canTransitionTripState("completed", "cancelled")).toBe(false);

    expect(canCancelTripState("draft")).toBe(true);
    expect(canCancelTripState("published")).toBe(true);
    expect(canCancelTripState("scheduled")).toBe(true);
    expect(canCancelTripState("Selection")).toBe(true);
    expect(canCancelTripState("in_progress")).toBe(false);
    expect(canCancelTripState("completed")).toBe(false);
    expect(canCancelTripState("cancelled")).toBe(false);
  });

  test("computeHasStaffingGap and isTripEligibleForTravelerDiscovery enforce staffing and visibility", () => {
    expect(computeHasStaffingGap([])).toBe(true);
    expect(
      computeHasStaffingGap([{ driverSource: "org_staff", moderatorSource: "unassigned" }]),
    ).toBe(true);
    expect(
      computeHasStaffingGap([{ driverSource: "org_staff", moderatorSource: "org_staff" }]),
    ).toBe(false);

    const now = new Date("2026-10-18T12:00:00Z");
    const futureVip = new Date("2026-10-19T12:00:00Z");

    // Draft and cancelled are never discoverable
    expect(
      isTripEligibleForTravelerDiscovery(
        {
          state: "draft",
          publishMode: "public",
          targetedAudienceIds: [],
          vipEarlyAccessUntil: null,
        },
        {},
        now,
      ),
    ).toBe(false);

    // VIP early access blocks free/explorer travelers until window expires
    expect(
      isTripEligibleForTravelerDiscovery(
        {
          state: "published",
          publishMode: "public",
          targetedAudienceIds: [],
          vipEarlyAccessUntil: futureVip,
        },
        { accountId: "acc-1", travelerPlanTier: "free" },
        now,
      ),
    ).toBe(false);

    expect(
      isTripEligibleForTravelerDiscovery(
        {
          state: "published",
          publishMode: "public",
          targetedAudienceIds: [],
          vipEarlyAccessUntil: futureVip,
        },
        { accountId: "acc-vip", travelerPlanTier: "vip" },
        now,
      ),
    ).toBe(true);

    // Targeted trips only visible to targeted audience
    expect(
      isTripEligibleForTravelerDiscovery(
        {
          state: "published",
          publishMode: "targeted",
          targetedAudienceIds: ["acc-allowed"],
          vipEarlyAccessUntil: null,
        },
        { accountId: "acc-other", travelerPlanTier: "vip" },
        now,
      ),
    ).toBe(false);

    expect(
      isTripEligibleForTravelerDiscovery(
        {
          state: "published",
          publishMode: "targeted",
          targetedAudienceIds: ["acc-allowed"],
          vipEarlyAccessUntil: null,
        },
        { accountId: "acc-allowed", travelerPlanTier: "free" },
        now,
      ),
    ).toBe(true);
  });

  test("wizard discriminated union and trip schemas validate boundary inputs", () => {
    expect(isValidTripCategoryCode("DESERT_SAFARI_CAMP")).toBe(true);

    expect(
      createDraftTripInputSchema.safeParse({
        titleAr: "رحلة سيوة",
        titleEn: "Siwa Oasis Expedition",
        categoryLookupCode: "DESERT_SAFARI_CAMP",
      }).success,
    ).toBe(true);

    expect(
      saveWizardStepInputSchema.safeParse({
        tripId: randomUUID(),
        step: "pricing",
        basePrice: { amountMinor: 250000, currency: "EGP" },
        childTrackingEnabled: false,
      }).success,
    ).toBe(true);

    expect(
      publishTripInputSchema.safeParse({
        tripId: randomUUID(),
        publishMode: "public",
      }).success,
    ).toBe(true);

    expect(
      transitionTripStateInputSchema.safeParse({
        tripId: randomUUID(),
        targetState: "scheduled",
      }).success,
    ).toBe(true);

    expect(
      cancelTripInputSchema.safeParse({
        tripId: randomUUID(),
        reason: "Severe weather advisory",
      }).success,
    ).toBe(true);

    expect(browsePublicTripsInputSchema.safeParse(undefined).success).toBe(true);
    expect(getPublicTripDetailInputSchema.safeParse({}).success).toBe(true);

    const err = new TripsServiceError("PRECONDITION_FAILED", "Wizard incomplete");
    expect(mapTripsError(err).code).toBe("PRECONDITION_FAILED");
  });
});
