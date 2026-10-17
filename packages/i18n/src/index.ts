// Arabic and English strings, current-locale resolution and direction helpers (UI-01, UI-02).
// Auth copy lives in ./auth, one table per locale: ./auth/en.ts (base) and ./auth/ar.ts.
export type { Direction, Locale } from "./types";
export type { AuthMessageKey, AuthMessages } from "./auth/index";
export {
  AUTH_MESSAGE_KEYS,
  AUTH_MESSAGES,
  DEFAULT_AUTH_LOCALE,
  authMessageKeys,
  hasAuthMessage,
  hasTranslation,
  interpolate,
  t,
} from "./auth/index";
export {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  directionOf,
  getLocale,
  isLocale,
  normalizeLocale,
  resetLocale,
  setLocale,
  subscribeLocale,
} from "./locale";
