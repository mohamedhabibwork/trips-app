// The visitor's language travels in a cookie, so the server renders the same language (and the same
// `<html lang dir>`) that the browser will hydrate with. Arabic is the default (PRD I2).
import { DEFAULT_LOCALE, normalizeLocale } from "@trips-app/i18n";
import type { Locale } from "@trips-app/i18n";

export const LOCALE_COOKIE = "trips.locale";

/** One year: the choice outlives the session, like the stored preference it mirrors. */
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** Reads the locale from a `Cookie` header or `document.cookie`. Null when absent or unsupported. */
export function readLocaleCookie(cookieHeader: string | null | undefined): Locale | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === LOCALE_COOKIE) return normalizeLocale(decodeURIComponent(rest.join("=")));
  }
  return null;
}

/** The locale a request renders in: the cookie when valid, otherwise the product default. */
export function localeFromCookieHeader(cookieHeader: string | null | undefined): Locale {
  return readLocaleCookie(cookieHeader) ?? DEFAULT_LOCALE;
}

/** The `document.cookie` assignment that remembers a locale. */
export function serializeLocaleCookie(locale: Locale): string {
  return `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}
