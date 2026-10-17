// Arabic and English strings and direction helpers (UI-01, UI-02).
// Auth copy lives in ./auth (single source: ./auth/messages.json).
import type { Direction, Locale } from "./types";

export type { Direction, Locale } from "./types";
export {
  AUTH_MESSAGE_KEYS,
  AUTH_MESSAGES,
  DEFAULT_AUTH_LOCALE,
  authMessageKeys,
  hasAuthMessage,
  interpolate,
  t,
} from "./auth/index";

export const SUPPORTED_LOCALES = ["ar", "en"] as const satisfies readonly Locale[];

export function directionOf(locale: Locale): Direction {
  return locale === "ar" ? "rtl" : "ltr";
}
