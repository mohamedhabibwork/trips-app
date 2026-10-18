// Authentication copy — one table per locale, in ./en.ts and ./ar.ts (PRD I1, ARCHITECTURE §6).
//
// `en.ts` is the base: its keys define `AuthMessageKey`, so adding a key there makes the compiler
// demand the Arabic translation. Look strings up with `t(key)`, which resolves the current locale
// through `getLocale()`; an untranslated key renders as the key itself, never as English and never
// as an empty string, so a gap is obvious in review and in tests.
import type { Locale } from "../types";

import { ar } from "./ar";
import { en } from "./en";
import type { AuthMessageKey, AuthMessages } from "./en";

export type { AuthMessageKey, AuthMessages } from "./en";
export { interpolate, t } from "../catalog";

const CATALOG: Readonly<Record<Locale, AuthMessages>> = { ar, en };

/** Arabic is the product default (I2). */
export const DEFAULT_AUTH_LOCALE: Locale = "ar";

/** Every key in the catalog (identical in both locales — asserted by the drift test). */
export const AUTH_MESSAGE_KEYS: readonly AuthMessageKey[] = Object.keys(
  en,
).sort() as AuthMessageKey[];

/** The raw catalog, for the codegen parity test. */
export const AUTH_MESSAGES: Readonly<Record<Locale, Readonly<Record<string, string>>>> = CATALOG;

/** Whether a key exists in the base (English) table. */
export function hasAuthMessage(key: string): boolean {
  return typeof key === "string" && Object.hasOwn(en, key);
}

/** Whether `locale` actually has a non-empty string for `key`. */
export function hasTranslation(locale: Locale, key: string): boolean {
  const value = CATALOG[locale]?.[key as AuthMessageKey];
  return typeof value === "string" && value.length > 0;
}

/** The key set of one locale, used to prove the two locales stay in lockstep. */
export function authMessageKeys(locale: Locale = DEFAULT_AUTH_LOCALE): readonly string[] {
  return Object.keys(CATALOG[locale]).sort();
}
