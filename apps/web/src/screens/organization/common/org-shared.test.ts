import { describe, expect, test } from "bun:test";

import { TRIP_WIZARD_STEP_IDS, wizardStepHref } from "./org-shared";

describe("wizardStepHref", () => {
  test("step 1 of a new trip is /business/trips/new", () => {
    expect(wizardStepHref("basics", null)).toBe("/business/trips/new");
  });

  test("step 1 of a saved draft carries the trip", () => {
    expect(wizardStepHref("basics", "trip-1")).toBe("/business/trips/trip-1/edit");
  });

  test("steps 2 to 8 carry the trip in the URL", () => {
    // Arrange
    const later = TRIP_WIZARD_STEP_IDS.filter((step) => step !== "basics");

    // Act
    const hrefs = later.map((step) => wizardStepHref(step, "trip-1"));

    // Assert
    expect(hrefs).toEqual(later.map((step) => `/business/trips/trip-1/edit/${step}`));
  });

  test("a later step without a trip goes to the trips list, never to a wizard page", () => {
    expect(wizardStepHref("schedule", null)).toBe("/business/trips");
    expect(wizardStepHref("publish", undefined)).toBe("/business/trips");
  });
});
