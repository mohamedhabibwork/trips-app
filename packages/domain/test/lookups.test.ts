import { describe, expect, test } from "bun:test";

import {
  DEFAULT_LOOKUP_TYPES,
  DEFAULT_LOOKUPS,
  getStaticLookupByCode,
  getStaticLookupsByTypeCode,
  getStaticLookupTypeByCode,
  getStaticLookupValuesByTypeCode,
  LOOKUP_TYPE_CODES,
  localizeLookupText,
  normalizeLookupCode,
} from "../src/index";

describe("Domain: Lookup Types & Lookups Catalog", () => {
  test("defines every registered lookup type code with bilingual names and unique codes", () => {
    // The registry grew from 23 to 59 types in PRD LK-20; assert against the registry itself so a
    // new type never needs a magic number updated here.
    expect(LOOKUP_TYPE_CODES.length).toBeGreaterThanOrEqual(23);
    expect(LOOKUP_TYPE_CODES).toHaveLength(59);
    expect(DEFAULT_LOOKUP_TYPES).toHaveLength(LOOKUP_TYPE_CODES.length);

    const seenCodes = new Set<string>();
    for (const typeDef of DEFAULT_LOOKUP_TYPES) {
      expect(seenCodes.has(typeDef.code)).toBe(false);
      seenCodes.add(typeDef.code);
      expect(typeDef.name.ar.length).toBeGreaterThan(0);
      expect(typeDef.name.en.length).toBeGreaterThan(0);
    }
  });

  test("the type-code array and the type-code union have the same members", () => {
    // `LOOKUP_TYPE_CODES` is declared `as const satisfies readonly LookupTypeCode[]`, which only
    // proves the array is a subset of the union. The compile-time assertion in `src/lookups.ts`
    // proves equality; this test proves the array has no duplicate members.
    expect(new Set(LOOKUP_TYPE_CODES).size).toBe(LOOKUP_TYPE_CODES.length);
  });

  test("defines bilingual lookup items with valid typeCode and parentLookupCode links", () => {
    expect(DEFAULT_LOOKUPS.length).toBeGreaterThanOrEqual(95);

    const typeCodes = new Set<string>(DEFAULT_LOOKUP_TYPES.map((t) => t.code));
    const lookupCodes = new Set<string>(DEFAULT_LOOKUPS.map((l) => l.code));

    for (const item of DEFAULT_LOOKUPS) {
      expect(typeCodes.has(item.typeCode)).toBe(true);
      expect(item.name.ar.length).toBeGreaterThan(0);
      expect(item.name.en.length).toBeGreaterThan(0);
      if (item.parentLookupCode) {
        expect(lookupCodes.has(item.parentLookupCode)).toBe(true);
      }
    }
  });

  test("every registered type has at least one bilingual seed item with an integer sortBy (LK-20)", () => {
    const codesByType = new Map<string, string[]>();
    for (const item of DEFAULT_LOOKUPS) {
      const bucket = codesByType.get(item.typeCode) ?? [];
      bucket.push(item.code);
      codesByType.set(item.typeCode, bucket);
      expect(Number.isInteger(item.sortBy)).toBe(true);
    }

    for (const typeCode of LOOKUP_TYPE_CODES) {
      const codes = codesByType.get(typeCode) ?? [];
      expect(codes.length).toBeGreaterThanOrEqual(1);
      // Codes are unique within their type; the (lookup_type_id, code) unique index depends on it.
      expect(new Set(codes).size).toBe(codes.length);
    }
  });

  test("registers the 36 type codes PRD LK-20 and the fleet amenity enum require", () => {
    const required = [
      "TRIP_STATE",
      "COUPON_TYPE",
      "COUPON_AUDIENCE",
      "COUPON_STATE",
      "DISPUTE_STATE",
      "SETTLEMENT_STATE",
      "RECONCILIATION_STATE",
      "LAB_TEST_STATE",
      "LAB_TEST_TYPE",
      "ACCOUNT_STATUS",
      "ACCOUNT_ACTION",
      "DATA_REQUEST_TYPE",
      "DATA_REQUEST_STATE",
      "DEAL_STATE",
      "REFUND_DECISION",
      "SUBSCRIPTION_BILLING_STATUS",
      "INVOICE_TYPE",
      "STAFF_ASSIGNMENT_SOURCE",
      "PUBLISH_MODE",
      "PROGRAM_PRICING_MODEL",
      "VEHICLE_REGISTRATION_STATUS",
      "VEHICLE_AMENITY",
      "SUPPLIER_STATUS",
      "SAFETY_CASE_STATE",
      "SEAT_STATE",
      "CONTACT_CHANNEL",
      "ALBUM_PRIVACY",
      "PROFILE_VISIBILITY",
      "INCIDENT_CATEGORY",
      "HEADCOUNT_DIFFERENCE_REASON",
      "TIMEZONE",
      "WEBHOOK_EVENT_TYPE",
      "APPEAL_DECISION",
      "SEAT_ASSIGNMENT_MODE",
      "DRIVER_RUN_STATE",
      "ORG_ROLE_TITLE",
    ];
    expect(required).toHaveLength(36);

    const registered = new Set<string>(LOOKUP_TYPE_CODES);
    for (const code of required) {
      expect(registered.has(code)).toBe(true);
    }
  });

  test("the fleet service amenity enum is fully covered by the VEHICLE_AMENITY seed", () => {
    // `packages/services/fleet/src/model/index.ts` ships VEHICLE_AMENITY_CODES. Every one of those
    // codes must exist in the catalog so T10 can delete the enum without changing stored data.
    const seededAmenities = new Set(
      DEFAULT_LOOKUPS.filter((item) => item.typeCode === "VEHICLE_AMENITY").map(
        (item) => item.code,
      ),
    );
    for (const code of [
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
    ]) {
      expect(seededAmenities.has(code)).toBe(true);
    }
  });

  test("resolves lookup types and items by code and parentLookupCode", () => {
    expect(normalizeLookupCode("  service-region ")).toBe("SERVICE_REGION");

    const countryType = getStaticLookupTypeByCode("country");
    expect(countryType?.code).toBe("COUNTRY");
    expect(localizeLookupText(countryType?.name, "ar")).toBe("الدول والأسواق");
    expect(localizeLookupText(countryType?.name, "en")).toBe("Countries & Markets");

    const egyptRegions = getStaticLookupsByTypeCode("SERVICE_REGION", {
      parentLookupCode: "EG",
    });
    expect(egyptRegions.map((r) => r.value)).toContain("Cairo");
    expect(egyptRegions.map((r) => r.value)).toContain("Luxor");
    expect(egyptRegions.map((r) => r.value)).toContain("Red Sea");

    const saudiRegions = getStaticLookupsByTypeCode("SERVICE_REGION", {
      parentLookupCode: "SA",
    });
    expect(saudiRegions.map((r) => r.value)).toContain("Riyadh");

    const vehicleValues = getStaticLookupValuesByTypeCode("VEHICLE_TYPE");
    expect(vehicleValues).toEqual([
      "Mercedes-Benz Tourismo",
      "Toyota Coaster 2025",
      "Toyota HiAce Van",
      "Toyota Land Cruiser 4x4",
    ]);

    const cairoLookup = getStaticLookupByCode("CAIRO", "SERVICE_REGION");
    expect(cairoLookup?.value).toBe("Cairo");
    expect(cairoLookup?.parentLookupCode).toBe("EG");
  });
});

describe("Domain: canonical lookup code normalisation (LK-04)", () => {
  test("normalises case, spaces, hyphens and any other non-alphanumeric run", () => {
    expect(normalizeLookupCode("day_excursion")).toBe("DAY_EXCURSION");
    expect(normalizeLookupCode("Day Excursion")).toBe("DAY_EXCURSION");
    expect(normalizeLookupCode("  day-excursion  ")).toBe("DAY_EXCURSION");
    expect(normalizeLookupCode("Day / Excursion")).toBe("DAY_EXCURSION");
    expect(normalizeLookupCode("Africa/Cairo")).toBe("AFRICA_CAIRO");
    expect(normalizeLookupCode("__LEADING_AND_TRAILING__")).toBe("LEADING_AND_TRAILING");
    expect(normalizeLookupCode("   ")).toBe("");
  });

  test("a drifted value does not normalise onto a real code", () => {
    // LK-21: `day_trip` must stay distinguishable from `DAY_EXCURSION` so drift is visible.
    expect(normalizeLookupCode("day_trip")).toBe("DAY_TRIP");
    expect(normalizeLookupCode("day_trip")).not.toBe(normalizeLookupCode("DAY_EXCURSION"));
  });
});

describe("Domain: localized label fallback (LK-03)", () => {
  test("prefers the requested locale, then the other locale, then the code", () => {
    const both = { en: "Day Excursion", ar: "رحلة يوم واحد" };
    expect(localizeLookupText(both, "ar")).toBe("رحلة يوم واحد");
    expect(localizeLookupText(both, "en")).toBe("Day Excursion");

    const englishOnly = { en: "Day Excursion", ar: "" };
    expect(localizeLookupText(englishOnly, "ar")).toBe("Day Excursion");

    const arabicOnly = { en: "", ar: "رحلة يوم واحد" };
    expect(localizeLookupText(arabicOnly, "en")).toBe("رحلة يوم واحد");

    expect(localizeLookupText({ en: "", ar: "" }, "en", "DAY_EXCURSION")).toBe("DAY_EXCURSION");
    expect(localizeLookupText(null, "ar", "DAY_EXCURSION")).toBe("DAY_EXCURSION");
    expect(localizeLookupText(undefined, "en")).toBe("");
  });
});
