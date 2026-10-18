// The single lookup table for every user-facing string.
//
// `./auth` holds the authentication surface, `./app` every other surface. Both are merged here so
// callers use one `t()` regardless of which table a key lives in. The merge happens once at module
// load; a key collision between the two tables is a build error (TypeScript would silently let the
// later spread win), so the parity test asserts the key sets are disjoint.
import { getLocale } from "./locale";
import type { Locale } from "./types";

import { ar as appAr } from "./app/ar";
import { en as appEn } from "./app/en";
import { ar as authAr } from "./auth/ar";
import { en as authEn } from "./auth/en";

/** Both tables, per locale. Screen copy wins nothing: keys are namespaced (`auth.*`, `screen.*`). */
const CATALOG: Readonly<Record<Locale, Readonly<Record<string, string>>>> = {
  ar: { ...authAr, ...appAr },
  en: { ...authEn, ...appEn },
};

/** Every key in either table, for the drift and parity tests. */
export const MESSAGE_KEYS: readonly string[] = Object.keys(CATALOG.en).sort();

/** Whether the base (English) tables define `key`. */
export function hasMessage(key: string): boolean {
  return typeof key === "string" && Object.hasOwn(CATALOG.en, key);
}

/**
 * Looks a key up in the current locale and interpolates `{name}` placeholders.
 *
 * Fallback order: requested locale → the key itself. Returning the key (rather than English or an
 * empty string) makes a missing translation obvious in review, in tests and in the UI.
 *
 * ```ts
 * t("auth.signIn.title");                               // current locale
 * t("auth.signIn.title", "en");                         // explicit locale
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

  const template = CATALOG[locale]?.[key];
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
