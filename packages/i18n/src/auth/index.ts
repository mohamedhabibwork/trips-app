// Authentication copy — the single source is ./messages.json (PRD I1, ARCHITECTURE §6).
//
// The same JSON is read by the mobile Gradle `generateAuthContract` task, so web and Kotlin cannot
// drift. No user-facing auth string may be hardcoded in a component or a Kotlin file.
import messagesJson from "./messages.json";
import type { Locale } from "../types";

type MessageTable = Record<string, string>;

const CATALOG: Readonly<Record<Locale, MessageTable>> = {
  en: messagesJson.en as MessageTable,
  ar: messagesJson.ar as MessageTable,
};

/** Arabic is the product default (I2). */
export const DEFAULT_AUTH_LOCALE: Locale = "ar";

/** Every key in the catalog (identical in both locales — asserted by the drift test). */
export const AUTH_MESSAGE_KEYS: readonly string[] = Object.keys(CATALOG.en).sort();

/** The raw catalog, for the codegen parity test. */
export const AUTH_MESSAGES: Readonly<Record<Locale, MessageTable>> = CATALOG;

/** Whether a key exists in the catalog. */
export function hasAuthMessage(key: string): boolean {
  return typeof key === "string" && Object.hasOwn(CATALOG.en, key);
}

/** The key set of one locale, used to prove the two locales stay in lockstep. */
export function authMessageKeys(locale: Locale = DEFAULT_AUTH_LOCALE): readonly string[] {
  return Object.keys(CATALOG[locale]).sort();
}

/**
 * Looks a key up and interpolates `{name}` placeholders.
 *
 * Fallback order: requested locale → English → the key itself. Returning the key (rather than an
 * empty string) makes a missing translation obvious in review and in tests.
 */
export function t(
  key: string,
  locale: Locale = DEFAULT_AUTH_LOCALE,
  params?: Record<string, string | number>,
): string {
  if (typeof key !== "string" || key.length === 0) return "";
  const template = CATALOG[locale]?.[key] ?? CATALOG.en[key];
  if (template === undefined) return key;
  return params ? interpolate(template, params) : template;
}

/** Replaces `{name}` with `params.name`; unknown placeholders are left untouched. */
export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}
