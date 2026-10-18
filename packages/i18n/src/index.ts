// Arabic and English strings, current-locale resolution and direction helpers (UI-01, UI-02).
//
// Auth copy lives in ./auth, every other surface in ./app, one table per locale. Both are merged in
// ./catalog, which owns `t()`; the tables stay split so the auth contract (and the Kotlin codegen
// that reads it) is unaffected by screen copy.
export type { Direction, Locale } from "./types";
export type { AppMessageKey, AppMessages } from "./app/index";
export type { AuthMessageKey, AuthMessages } from "./auth/index";
export {
  AUTH_MESSAGE_KEYS,
  AUTH_MESSAGES,
  DEFAULT_AUTH_LOCALE,
  authMessageKeys,
  hasAuthMessage,
  hasTranslation,
} from "./auth/index";
export { MESSAGE_KEYS, hasMessage, interpolate, t } from "./catalog";
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
