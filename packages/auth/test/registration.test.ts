import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DEFAULT_SYSTEM_SETTINGS } from "@trips-app/domain";
import { SUPPORTED_LOCALES } from "@trips-app/i18n";

import {
  DEFAULT_COUNTRY_BY_LOCALE,
  DEFAULT_REGISTRATION_COUNTRY,
  REGISTRATION_COUNTRIES,
  UNSENT_REGISTRATION_FORM_KEYS,
  countryName,
  defaultCountryForLocale,
  isRegistrationCountryEnabled,
  toRegistrationPayload,
} from "../src/index";
import conventionsJson from "../src/conventions/conventions.json";

describe("Unit: registration countries (G1, G2, G6)", () => {
  test("the option list matches DEFAULT_SYSTEM_SETTINGS.markets", () => {
    // Meaningful because the list is read from conventions.json, not typed here: this is the check
    // that the contract and the domain cannot drift apart.
    const markets = Object.values(DEFAULT_SYSTEM_SETTINGS.markets);

    expect(REGISTRATION_COUNTRIES.length).toBe(markets.length);
    for (const market of markets) {
      const option = REGISTRATION_COUNTRIES.find((entry) => entry.code === market.countryCode);
      expect(option).toBeDefined();
      expect(option!.nameEn).toBe(market.nameEn);
      expect(option!.nameAr).toBe(market.nameAr);
      expect(option!.enabled).toBe(market.enabled);
    }
  });

  test("disabled markets stay in the list, greyed rather than hidden", () => {
    const codes = REGISTRATION_COUNTRIES.map((entry) => entry.code);
    expect(codes).toEqual(["EG", "SA", "AE"]);
    expect(isRegistrationCountryEnabled("EG")).toBe(true);
    expect(isRegistrationCountryEnabled("SA")).toBe(false);
    expect(isRegistrationCountryEnabled("AE")).toBe(false);
  });

  test("every country code is unique, so the select cannot render duplicate options", () => {
    const codes = REGISTRATION_COUNTRIES.map((entry) => entry.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  test("the default is an enabled market, never empty on first render", () => {
    expect(DEFAULT_REGISTRATION_COUNTRY).toBe("EG");
    expect(isRegistrationCountryEnabled(DEFAULT_REGISTRATION_COUNTRY)).toBe(true);
    expect(defaultCountryForLocale("ar")).toBe(DEFAULT_REGISTRATION_COUNTRY);
    expect(defaultCountryForLocale("en")).toBe(DEFAULT_REGISTRATION_COUNTRY);
  });

  test("names render in the active locale", () => {
    expect(countryName("EG", "en")).toBe("Egypt");
    expect(countryName("EG", "ar")).toBe("مصر");
    expect(countryName("ZZ", "en")).toBe("ZZ");
  });
});

describe("Unit: the locale → market map (G2, data not logic)", () => {
  test("the exported map deep-equals the JSON", () => {
    expect(DEFAULT_COUNTRY_BY_LOCALE).toEqual(conventionsJson.defaultCountryByLocale);
  });

  test("every key is a supported locale", () => {
    for (const locale of Object.keys(DEFAULT_COUNTRY_BY_LOCALE)) {
      expect(SUPPORTED_LOCALES as readonly string[]).toContain(locale);
    }
    // And every supported locale has an entry, so no locale can fall through by accident.
    for (const locale of SUPPORTED_LOCALES) {
      expect(Object.hasOwn(DEFAULT_COUNTRY_BY_LOCALE, locale)).toBe(true);
    }
  });

  test("every mapped code exists in the option list", () => {
    const codes = REGISTRATION_COUNTRIES.map((entry) => entry.code);
    for (const code of Object.values(DEFAULT_COUNTRY_BY_LOCALE)) {
      expect(codes).toContain(code);
    }
  });

  test("both locales resolve to Egypt today", () => {
    expect(defaultCountryForLocale("ar")).toBe("EG");
    expect(defaultCountryForLocale("en")).toBe("EG");
  });

  test("an unknown locale falls back to the first enabled market", () => {
    const firstEnabled = REGISTRATION_COUNTRIES.find((entry) => entry.enabled);

    expect(firstEnabled).toBeDefined();
    expect(defaultCountryForLocale("fr" as never)).toBe(firstEnabled!.code);
  });

  test("the derived default agrees with the scalar the codegen reads", () => {
    // `defaultRegistrationCountry` stays in the JSON for the Kotlin generator, but TypeScript derives
    // the constant from the locale map. This test is what stops the two keys drifting apart.
    expect(DEFAULT_REGISTRATION_COUNTRY).toBe(conventionsJson.defaultRegistrationCountry);
    expect(DEFAULT_REGISTRATION_COUNTRY).toBe(DEFAULT_COUNTRY_BY_LOCALE.en);
  });

  test("the derived default is always an enabled market", () => {
    expect(isRegistrationCountryEnabled(DEFAULT_REGISTRATION_COUNTRY)).toBe(true);
  });
});

describe("Unit: toRegistrationPayload (G3)", () => {
  const form = {
    fullName: "Sara",
    email: "sara@example.com",
    phone: "+201500000000",
    password: "DemoPassword123!",
    preferredLanguage: "ar" as const,
    surface: "web" as const,
    country: "EG",
  };

  test("sends neither country nor countryCode", () => {
    const payload = toRegistrationPayload(form) as Record<string, unknown>;

    // G3's wording only checks `country`; both are asserted so nobody can re-add `countryCode`
    // and still pass.
    for (const key of UNSENT_REGISTRATION_FORM_KEYS) {
      expect(Object.hasOwn(payload, key)).toBe(false);
    }
    expect(UNSENT_REGISTRATION_FORM_KEYS).toEqual(["country", "countryCode"]);
  });

  test("keeps every field the server does accept", () => {
    const payload = toRegistrationPayload(form);

    expect(payload.fullName).toBe("Sara");
    expect(payload.email).toBe("sara@example.com");
    expect(payload.phone).toBe("+201500000000");
    expect(payload.password).toBe("DemoPassword123!");
    expect(payload.surface).toBe("web");
    expect(Object.keys(payload).sort()).toEqual(
      ["email", "fullName", "password", "phone", "preferredLanguage", "surface"].sort(),
    );
  });

  test("also drops a stray countryCode a caller may pass", () => {
    const payload = toRegistrationPayload({ ...form, countryCode: "EG" }) as Record<
      string,
      unknown
    >;

    expect(Object.hasOwn(payload, "countryCode")).toBe(false);
  });

  test("does not mutate the form", () => {
    const input = { ...form };
    toRegistrationPayload(input);

    expect(input).toEqual(form);
    expect(input.country).toBe("EG");
  });

  test("the adapter carries the FR-AUTH-02 marker, so the one-line activation is discoverable", () => {
    const source = readFileSync(join(import.meta.dir, "..", "src", "registration.ts"), "utf8");

    expect(source).toContain("TODO(FR-AUTH-02)");
    expect(source).toContain("countryCode");
  });
});
