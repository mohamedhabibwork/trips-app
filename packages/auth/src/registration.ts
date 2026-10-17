// FR-AUTH-02 / FR-AUTH-11 registration rules (PRD §7.10).
//
// Country is **collected but not sent**. The server schemas do not declare it and the lead decided
// against any schema or DB change, so `toRegistrationPayload()` is the single adapter that removes
// it from the payload behind a `TODO(FR-AUTH-02)` marker. Persisting it later is a one-line change
// in that one function.
//
// The option list itself lives in `conventions.json` (not here): PRD §7.10 G6 requires a
// byte-identical list on web and mobile, and two hand-copied literals cannot prove that. The mobile
// `generateAuthContract` task emits the same values from the same file.
import {
  DEFAULT_COUNTRY_BY_LOCALE,
  DEFAULT_REGISTRATION_COUNTRY,
  REGISTRATION_COUNTRIES,
} from "./conventions/index";
import type { AuthLocale } from "./types";

/** Form keys that carry the collected country and must never reach the server. */
export const UNSENT_REGISTRATION_FORM_KEYS = ["country", "countryCode"] as const;

/** The first enabled market — the last-resort selection when a locale maps to nothing usable. */
export function firstEnabledRegistrationCountry(): string {
  const firstEnabled = REGISTRATION_COUNTRIES.find((country) => country.enabled);
  return firstEnabled?.code ?? DEFAULT_REGISTRATION_COUNTRY;
}

/**
 * G2: the default selection for a locale, so the required field is never empty on first render.
 *
 * One rule, read from the same table on every platform: the locale's mapped market, else the first
 * enabled one. No branch here can drift from the Kotlin mirror because there is no branch — only
 * `conventions.json` and this lookup.
 */
export function defaultCountryForLocale(locale: AuthLocale): string {
  const mapped = DEFAULT_COUNTRY_BY_LOCALE[locale];
  if (mapped && isRegistrationCountryEnabled(mapped)) return mapped;
  return firstEnabledRegistrationCountry();
}

/** The display name for a market in the active locale. */
export function countryName(code: string, locale: AuthLocale): string {
  const country = REGISTRATION_COUNTRIES.find((entry) => entry.code === code);
  if (!country) return code;
  return locale === "ar" ? country.nameAr : country.nameEn;
}

/** Whether a market can be submitted today. */
export function isRegistrationCountryEnabled(code: string): boolean {
  return REGISTRATION_COUNTRIES.some((country) => country.code === code && country.enabled);
}

/**
 * G3: the one adapter that turns a registration form into a request payload.
 *
 * It emits **neither** `country` nor `countryCode` — sending a field the schema does not declare is
 * exactly the drift this contract exists to prevent, even though Zod would strip it.
 *
 * TODO(FR-AUTH-02): the server schemas do not accept a country yet, so the value the form requires
 * (G1/G2) is dropped here. When `registerTravelerSchema` and `registerSupplierAccountSchema` gain the
 * field this becomes `return { ...rest, countryCode: form.country }` — one line, one place.
 */
export function toRegistrationPayload<T extends Record<string, unknown>>(
  form: T,
): Omit<T, "country" | "countryCode"> {
  const {
    country: _country,
    countryCode: _countryCode,
    ...rest
  } = form as T & { country?: unknown; countryCode?: unknown };
  return rest as Omit<T, "country" | "countryCode">;
}
