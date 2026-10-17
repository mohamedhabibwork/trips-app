// G2 / ARCHITECTURE §6 rule 3: the conventions TypeScript reads and the constants Kotlin compiles
// must be the *same values*, not merely documented as the same. The Kotlin side is generated from
// `src/conventions/conventions.json` by the Gradle `generateAuthContract` task, so this test parses
// the generated source and compares it with the JSON — a broken or stale codegen fails here instead
// of silently changing mobile behaviour.
//
// Precondition: the artifact exists after `cd mobile && ./gradlew :shared:generateAuthContract`
// (also produced by `:shared:testAndroidHostTest`). It is generated, never committed.
import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { AUTH_MESSAGE_KEYS } from "@trips-app/i18n";

import {
  AUTH_CONVENTIONS,
  AUTH_STORAGE_KEY,
  AUTH_STATUSES,
  DEFAULT_COUNTRY_BY_LOCALE,
  DEFAULT_REGISTRATION_COUNTRY,
  NO_REFRESH_PROCEDURES,
  REFRESH_LEAD_MS,
  REGISTRATION_COUNTRIES,
  SIGN_IN_PATHS,
  SURFACE_IDS,
  SURFACE_PLATFORMS,
} from "../src/index";

const GENERATED_DIR = join(
  import.meta.dir,
  "..",
  "..",
  "..",
  "mobile",
  "shared",
  "build",
  "generated",
  "authContract",
  "com",
  "tripsenjoy",
  "auth",
);

const CONVENTIONS_KT = join(GENERATED_DIR, "AuthConventions.kt");
const STRINGS_KT = join(GENERATED_DIR, "AuthStrings.kt");

function generatedSource(path: string): string {
  if (!existsSync(path)) {
    throw new Error(
      `Missing generated contract: ${path}\n` +
        "Run `cd mobile && ./gradlew :shared:generateAuthContract` before `bun test packages/auth`.",
    );
  }
  return readFileSync(path, "utf8");
}

/** `const val name: String = "value"` */
function constString(source: string, name: string): string {
  const match = new RegExp(`const val ${name}: String = "([^"]*)"`).exec(source);
  if (!match) throw new Error(`AuthConventions.kt has no const val ${name}: String`);
  return match[1]!;
}

/** `const val name: Long = 60000L` or `const val name: Int = 6` */
function constNumber(source: string, name: string): number {
  const match = new RegExp(`const val ${name}: (?:Long|Int) = (-?\\d+)L?`).exec(source);
  if (!match) throw new Error(`AuthConventions.kt has no const val ${name}`);
  return Number(match[1]);
}

/** The quoted strings of `val name: List<String> = listOf(...)`, in order. */
function stringList(source: string, name: string): string[] {
  const match = new RegExp(`val ${name}: List<String> = listOf\\(([^)]*)\\)`).exec(source);
  if (!match) throw new Error(`AuthConventions.kt has no val ${name}: List<String>`);
  return [...match[1]!.matchAll(/"([^"]*)"/g)].map((entry) => entry[1]!);
}

/** The `"a" to "b"` pairs of `val name: Map<String, String> = mapOf(...)`. */
function stringMap(source: string, name: string): Record<string, string> {
  const match = new RegExp(
    `val ${name}: Map<String, String> = mapOf\\(([\\s\\S]*?)\\n    \\)`,
  ).exec(source);
  if (!match) throw new Error(`AuthConventions.kt has no val ${name}: Map<String, String>`);
  const result: Record<string, string> = {};
  for (const entry of match[1]!.matchAll(/"([^"]*)" to "([^"]*)"/g)) {
    result[entry[1]!] = entry[2]!;
  }
  return result;
}

interface GeneratedRow {
  codes: string[];
  key: string;
  recovery: string;
  field: string | null;
}

function errorRows(source: string): GeneratedRow[] {
  const rows: GeneratedRow[] = [];
  const pattern =
    /AuthErrorRow\(\s*codes = listOf\(([^)]*)\),\s*key = "([^"]*)",\s*recovery = "([^"]*)",\s*field = (?:"([^"]*)"|null),/g;
  for (const match of source.matchAll(pattern)) {
    rows.push({
      codes: [...match[1]!.matchAll(/"([^"]*)"/g)].map((entry) => entry[1]!),
      key: match[2]!,
      recovery: match[3]!,
      field: match[4] ?? null,
    });
  }
  return rows;
}

describe("Parity: conventions.json ⇄ generated AuthConventions.kt (§6)", () => {
  test("the scalars are identical on both sides", () => {
    const source = generatedSource(CONVENTIONS_KT);

    expect(constString(source, "storageKey")).toBe(AUTH_CONVENTIONS.storageKey);
    expect(constString(source, "storageKey")).toBe(AUTH_STORAGE_KEY);
    expect(constString(source, "storageKey")).toBe("trips.auth.v1");

    expect(constNumber(source, "refreshLeadMs")).toBe(AUTH_CONVENTIONS.refreshLeadMs);
    expect(constNumber(source, "refreshLeadMs")).toBe(REFRESH_LEAD_MS);
    expect(constNumber(source, "refreshLeadMs")).toBe(60_000);

    expect(constNumber(source, "accessTokenTtlSeconds")).toBe(900);
    expect(constNumber(source, "webSessionMaxSeconds")).toBe(43_200);
    expect(constNumber(source, "otpCodeLength")).toBe(6);
    expect(constNumber(source, "otpMaxWrongAttempts")).toBe(5);
    expect(constNumber(source, "version")).toBe(AUTH_CONVENTIONS.version);

    expect(constString(source, "maxSessionReason")).toBe(AUTH_CONVENTIONS.maxSessionReason);
    expect(constString(source, "fallbackErrorKey")).toBe(AUTH_CONVENTIONS.fallbackErrorKey);
  });

  test("the status strings are identical, in the documented order", () => {
    const generated = stringList(generatedSource(CONVENTIONS_KT), "statuses");

    expect(generated).toEqual([...AUTH_STATUSES]);
    expect(generated).toEqual(["loading", "authenticated", "anonymous", "sessionExpired"]);
  });

  test("the surface list and the platform map are identical", () => {
    const source = generatedSource(CONVENTIONS_KT);

    expect(stringList(source, "surfaces")).toEqual([...SURFACE_IDS]);
    expect(stringMap(source, "surfacePlatforms")).toEqual({ ...SURFACE_PLATFORMS });
  });

  test("the sign-in route per surface is identical", () => {
    const generated = stringMap(generatedSource(CONVENTIONS_KT), "signInPaths");

    expect(generated).toEqual({ ...SIGN_IN_PATHS });
  });

  test("the no-refresh list is identical and holds all eight procedures", () => {
    const generated = stringList(generatedSource(CONVENTIONS_KT), "noRefreshProcedures");

    expect(generated).toEqual([...NO_REFRESH_PROCEDURES]);
    expect(generated.length).toBe(8);
    // The three second-factor procedures are the ones the PRD's R4 sentence omits but the real
    // backend emits; both platforms must refuse to refresh them.
    for (const procedure of [
      "auth/verifyOtp",
      "auth/adminVerifyTotp",
      "auth/staffVerifySecondFactor",
    ]) {
      expect(generated).toContain(procedure);
    }
  });

  test("the sign-in, OTP and refreshable-code sets are identical", () => {
    const source = generatedSource(CONVENTIONS_KT);

    expect(stringList(source, "signInProcedures")).toEqual([...AUTH_CONVENTIONS.signInProcedures]);
    expect(stringList(source, "otpProcedures")).toEqual([...AUTH_CONVENTIONS.otpProcedures]);
    expect(stringList(source, "refreshableCodes")).toEqual([...AUTH_CONVENTIONS.refreshableCodes]);
    expect(stringList(source, "fieldNames")).toEqual([...AUTH_CONVENTIONS.fieldNames]);
  });

  test("the error table is identical row for row", () => {
    const generated = errorRows(generatedSource(CONVENTIONS_KT));
    const expected = AUTH_CONVENTIONS.errorRows.map((row) => ({
      codes: [...row.codes],
      key: row.key,
      recovery: row.recovery,
      field: row.field ?? null,
    }));

    expect(generated.length).toBeGreaterThan(0);
    expect(generated).toEqual(expected);
  });
});

interface GeneratedCountry {
  code: string;
  nameEn: string;
  nameAr: string;
  enabled: boolean;
}

/** The `AuthCountry(...)` entries of `val AuthCountries: List<AuthCountry> = listOf(...)`. */
function registrationCountries(source: string): GeneratedCountry[] {
  const block = /val AuthCountries: List<AuthCountry> = listOf\(([\s\S]*?)\n    \)/.exec(source);
  if (!block) throw new Error("AuthConventions.kt has no val AuthCountries");
  const countries: GeneratedCountry[] = [];
  for (const match of block[1]!.matchAll(
    /AuthCountry\(\s*code = "([^"]*)",\s*nameEn = "([^"]*)",\s*nameAr = "([^"]*)",\s*enabled = (true|false),/g,
  )) {
    countries.push({
      code: match[1]!,
      nameEn: match[2]!,
      nameAr: match[3]!,
      enabled: match[4] === "true",
    });
  }
  return countries;
}

describe("Parity: the registration country contract (PRD §7.10 G1, G2, G6)", () => {
  test("the option list is byte-identical on both platforms, in order", () => {
    const generated = registrationCountries(generatedSource(CONVENTIONS_KT));
    const expected = REGISTRATION_COUNTRIES.map((country) => ({
      code: country.code,
      nameEn: country.nameEn,
      nameAr: country.nameAr,
      enabled: country.enabled,
    }));

    expect(generated.length).toBeGreaterThan(0);
    expect(generated).toEqual(expected);
  });

  test("a disabled market is generated as disabled, never dropped", () => {
    const generated = registrationCountries(generatedSource(CONVENTIONS_KT));

    expect(generated.filter((country) => !country.enabled).length).toBeGreaterThan(0);
    expect(generated.some((country) => country.enabled)).toBe(true);
    expect(generated.map((country) => country.code)).toEqual(["EG", "SA", "AE"]);
  });

  test("the Arabic market names are real Arabic, not transliteration", () => {
    for (const country of registrationCountries(generatedSource(CONVENTIONS_KT))) {
      expect(/[\u0600-\u06FF]/.test(country.nameAr)).toBe(true);
    }
  });

  test("the locale → market map and its fallback are identical", () => {
    const source = generatedSource(CONVENTIONS_KT);
    const generated = stringMap(source, "AuthDefaultCountryByLocale");

    expect(generated).toEqual({ ...DEFAULT_COUNTRY_BY_LOCALE });
    expect(generated).toEqual({ ar: "EG", en: "EG" });
    // The derived fallback resolves to an enabled market on both sides.
    expect(DEFAULT_REGISTRATION_COUNTRY).toBe("EG");
    expect(generated.en).toBe(DEFAULT_REGISTRATION_COUNTRY);
  });
});

describe("Parity: the auth catalog ⇄ generated AuthStrings.kt (§6)", () => {
  test("Kotlin ships exactly the key set the TypeScript catalog holds", () => {
    const source = generatedSource(STRINGS_KT);
    const generated = [...source.matchAll(/^\s{8}"([^"]+)",$/gm)].map((entry) => entry[1]!);

    expect(generated.length).toBeGreaterThan(0);
    expect(generated).toEqual([...AUTH_MESSAGE_KEYS]);
  });

  test("both locales are generated and English is the documented fallback", () => {
    const source = generatedSource(STRINGS_KT);

    expect(stringList(source, "locales")).toEqual(["en", "ar"]);
    expect(constString(source, "defaultLocale")).toBe("en");
  });
});
