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
  test("defines all 23 canonical lookup type codes with bilingual names and unique codes", () => {
    expect(LOOKUP_TYPE_CODES).toHaveLength(23);
    expect(DEFAULT_LOOKUP_TYPES).toHaveLength(23);

    const seenCodes = new Set<string>();
    for (const typeDef of DEFAULT_LOOKUP_TYPES) {
      expect(seenCodes.has(typeDef.code)).toBe(false);
      seenCodes.add(typeDef.code);
      expect(typeDef.name.ar.length).toBeGreaterThan(0);
      expect(typeDef.name.en.length).toBeGreaterThan(0);
    }
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
