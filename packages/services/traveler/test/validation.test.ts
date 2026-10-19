import { describe, expect, test } from "bun:test";

import { mapTravelerError, TravelerServiceError } from "../src/errors";
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  DELETION_GRACE_DAYS,
  PRIVACY_REQUEST_TYPES,
  QUIET_HOURS_NOTICE,
  SUPPORTED_COUNTRIES,
  SUPPORTED_LOCALES,
  TRAVELER_PLAN_CODES,
} from "../src/model";
import {
  requestPrivacyActionInputSchema,
  updateNotificationPreferencesInputSchema,
  updateProfileInputSchema,
} from "../src/schemas/validation";

describe("Unit: traveler validation schemas, model constants & error mapping (@trips-app/service-traveler)", () => {
  test("updateProfileInputSchema enforces D-20 required name and countryCode", () => {
    expect(
      updateProfileInputSchema.safeParse({
        fullName: "Nour El-Din",
        countryCode: "EG",
        preferredLanguage: "ar",
        email: "nour@example.com",
      }).success,
    ).toBe(true);

    expect(
      updateProfileInputSchema.safeParse({
        fullName: "",
        countryCode: "EG",
      }).success,
    ).toBe(false);

    expect(
      updateProfileInputSchema.safeParse({
        fullName: "Nour El-Din",
        countryCode: "US",
      }).success,
    ).toBe(false);
  });

  test("updateNotificationPreferencesInputSchema and requestPrivacyActionInputSchema validate inputs", () => {
    expect(
      updateNotificationPreferencesInputSchema.safeParse({
        bookingsPush: true,
        tripUpdatesSms: false,
        promotionsEmail: true,
      }).success,
    ).toBe(true);

    expect(
      requestPrivacyActionInputSchema.safeParse({
        requestType: "data_export",
      }).success,
    ).toBe(true);

    expect(
      requestPrivacyActionInputSchema.safeParse({
        requestType: "account_deletion",
        reason: "Moving abroad",
      }).success,
    ).toBe(true);

    expect(
      requestPrivacyActionInputSchema.safeParse({
        requestType: "invalid_action",
      }).success,
    ).toBe(false);
  });

  test("model constants and error mapper work as expected", () => {
    expect(SUPPORTED_COUNTRIES).toEqual(["EG", "SA", "AE"]);
    expect(SUPPORTED_LOCALES).toEqual(["ar", "en"]);
    expect(TRAVELER_PLAN_CODES).toEqual(["free", "explorer", "vip"]);
    expect(PRIVACY_REQUEST_TYPES).toEqual(["data_export", "account_deletion"]);
    expect(DELETION_GRACE_DAYS).toBe(30);
    expect(DEFAULT_NOTIFICATION_PREFERENCES.bookingsPush).toBe(true);
    expect(QUIET_HOURS_NOTICE).toContain("10 pm to 7 am");

    const err = new TravelerServiceError("DUPLICATE_RESOURCE", "Duplicate email");
    const mapped = mapTravelerError(err);
    expect(mapped.code).toBe("DUPLICATE_RESOURCE");
    expect(mapped.serviceId).toBe("traveler");
  });
});
