// Authentication copy — one table per locale, in ./en.ts and ./ar.ts (PRD I1, ARCHITECTURE §6).
//
// `en.ts` is the base: its keys define `AuthMessageKey`, so adding a key there makes the compiler
// demand the Arabic translation. Look strings up with `t(key)`, which resolves the current locale
// through `getLocale()`; an untranslated key renders as the key itself, never as English and never
// as an empty string, so a gap is obvious in review and in tests.
import { getLocale } from "../locale";
import type { Locale } from "../types";

import { ar } from "./ar";
import { en } from "./en";
import type { AuthMessageKey, AuthMessages } from "./en";

export type { AuthMessageKey, AuthMessages } from "./en";

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

/**
 * Looks a key up in the current locale and interpolates `{name}` placeholders.
 *
 * Fallback order: requested locale → the key itself. Returning the key (rather than English or an
 * empty string) makes a missing translation obvious in review, in tests and in the UI.
 *
 * Pass `locale` explicitly when the caller already knows it (a server response, a React context
 * that renders one locale); omit it to follow the current locale.
 *
 * ```ts
 * t("auth.signIn.title");                    // current locale
 * t("auth.signIn.title", "en");              // explicit locale
 * t("auth.error.accountLocked", { seconds: 30 });       // params only
 * t("auth.error.accountLocked", "ar", { seconds: 30 }); // locale and params
 * ```
 */
export function t(key: string, params?: Record<string, string | number>): string;
export function t(key: string, locale: Locale, params?: Record<string, string | number>): string;
export function t(
  key: string,
  localeOrParams?: Locale | Record<string, string | number>,
  params?: Record<string, string | number>,
): string {
  if (typeof key !== "string" || key.length === 0) return "";

  const locale = typeof localeOrParams === "string" ? localeOrParams : getLocale();
  const values =
    typeof localeOrParams === "object" && localeOrParams !== null ? localeOrParams : params;

  const template = CATALOG[locale]?.[key as AuthMessageKey];
  if (typeof template !== "string" || template.length === 0) return key;

  return values ? interpolate(template, values) : template;
}

/** Replaces `{name}` with `params.name`; unknown placeholders are left untouched. */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
