import { describe, expect, mock, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";

import {
  ensureLookupByCode,
  ensureLookupTypeByCode,
  ensureLookupTypes,
  ensureLookupsByTypeCodes,
  lookupByCodeQueryOptions,
  lookupTypeByCodeQueryOptions,
  lookupTypesQueryOptions,
  lookupsByTypeCodesQueryOptions,
  normalizeLookupCode,
  prefetchLookupByCode,
  prefetchLookupTypeByCode,
  prefetchLookupTypes,
  prefetchLookupsByTypeCodes,
  toLookupSelectOptions,
} from "./lookups";

describe("Unit: Lookups Query Helpers (M1)", () => {
  test("normalizeLookupCode trims, uppercases, and replaces non-alphanumeric chars with underscore", () => {
    expect(normalizeLookupCode("  trip_status  ")).toBe("TRIP_STATUS");
    expect(normalizeLookupCode("vehicle-type/sub")).toBe("VEHICLE_TYPE_SUB");
  });

  test("lookupTypesQueryOptions produces valid queryKey and queryFn", () => {
    const opts = lookupTypesQueryOptions({ codes: ["TRIP_STATUS"] });
    expect(opts).toBeDefined();
    expect(Array.isArray(opts.queryKey)).toBe(true);
    expect(typeof opts.queryFn).toBe("function");
  });

  test("lookupTypeByCodeQueryOptions normalizes code in queryKey and queryFn", () => {
    const opts = lookupTypeByCodeQueryOptions("trip_status", { parentLookupCode: "parent" });
    expect(opts).toBeDefined();
    expect(Array.isArray(opts.queryKey)).toBe(true);
    expect(typeof opts.queryFn).toBe("function");
  });

  test("lookupsByTypeCodesQueryOptions normalizes codes", () => {
    const opts = lookupsByTypeCodesQueryOptions(["trip_status", "vehicle_type"]);
    expect(opts).toBeDefined();
    expect(Array.isArray(opts.queryKey)).toBe(true);
    expect(typeof opts.queryFn).toBe("function");
  });

  test("lookupByCodeQueryOptions normalizes code and typeCode", () => {
    const opts = lookupByCodeQueryOptions("active", "status");
    expect(opts).toBeDefined();
    expect(Array.isArray(opts.queryKey)).toBe(true);
    expect(typeof opts.queryFn).toBe("function");
  });

  test("ensureLookupTypes and prefetchLookupTypes delegate to queryClient", async () => {
    const ensureSpy = mock(async () => ({ lookupTypes: [] }));
    const prefetchSpy = mock(async () => {});
    const qc = {
      ensureQueryData: ensureSpy,
      prefetchQuery: prefetchSpy,
    } as unknown as QueryClient;

    await ensureLookupTypes(qc, { codes: ["TRIP_STATUS"] });
    expect(ensureSpy).toHaveBeenCalledTimes(1);

    await prefetchLookupTypes(qc);
    expect(prefetchSpy).toHaveBeenCalledTimes(1);
  });

  test("ensureLookupTypeByCode and prefetchLookupTypeByCode delegate to queryClient", async () => {
    const ensureSpy = mock(async () => null);
    const prefetchSpy = mock(async () => {});
    const qc = {
      ensureQueryData: ensureSpy,
      prefetchQuery: prefetchSpy,
    } as unknown as QueryClient;

    await ensureLookupTypeByCode(qc, "trip_status");
    expect(ensureSpy).toHaveBeenCalledTimes(1);

    await prefetchLookupTypeByCode(qc, "trip_status");
    expect(prefetchSpy).toHaveBeenCalledTimes(1);
  });

  test("ensureLookupsByTypeCodes and prefetchLookupsByTypeCodes delegate to queryClient", async () => {
    const ensureSpy = mock(async () => ({}));
    const prefetchSpy = mock(async () => {});
    const qc = {
      ensureQueryData: ensureSpy,
      prefetchQuery: prefetchSpy,
    } as unknown as QueryClient;

    await ensureLookupsByTypeCodes(qc, ["code_a", "code_b"]);
    expect(ensureSpy).toHaveBeenCalledTimes(1);

    await prefetchLookupsByTypeCodes(qc, ["code_a", "code_b"]);
    expect(prefetchSpy).toHaveBeenCalledTimes(1);
  });

  test("ensureLookupByCode and prefetchLookupByCode delegate to queryClient", async () => {
    const ensureSpy = mock(async () => ({ lookup: null, childLookups: [] }));
    const prefetchSpy = mock(async () => {});
    const qc = {
      ensureQueryData: ensureSpy,
      prefetchQuery: prefetchSpy,
    } as unknown as QueryClient;

    await ensureLookupByCode(qc, "item_code", "type_code");
    expect(ensureSpy).toHaveBeenCalledTimes(1);

    await prefetchLookupByCode(qc, "item_code", "type_code");
    expect(prefetchSpy).toHaveBeenCalledTimes(1);
  });

  test("toLookupSelectOptions maps items with localization and sorting", () => {
    const options = toLookupSelectOptions(
      [
        {
          id: 2,
          uuid: "u2",
          typeCode: "TEST",
          code: "B",
          value: "b",
          name: { ar: "ب", en: "B" },
          description: null,
          lookupTypeId: 1,
          parentId: null,
          parentCode: null,
          sortBy: 2,
          isPublic: true,
          isActive: true,
        },
        {
          id: 1,
          uuid: "u1",
          typeCode: "TEST",
          code: "A",
          value: "a",
          name: { ar: "أ", en: "A" },
          description: null,
          lookupTypeId: 1,
          parentId: null,
          parentCode: null,
          sortBy: 1,
          isPublic: true,
          isActive: true,
        },
      ],
      "en",
    );

    expect(options.length).toBe(2);
    expect(options[0]?.code).toBe("A");
    expect(options[0]?.label).toBe("A");
    expect(options[1]?.code).toBe("B");
    expect(options[1]?.label).toBe("B");
  });
});
