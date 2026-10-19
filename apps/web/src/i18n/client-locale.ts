// Browser side of the locale cookie: `getLocale()` answers from the cookie the server rendered with
// (Arabic when there is none), and every language switch writes it back, so the next server render
// matches.
import { DEFAULT_LOCALE, setLocaleResolver, subscribeLocale } from "@trips-app/i18n";

import { readLocaleCookie, serializeLocaleCookie } from "./locale-cookie";

let installed = false;

export function installClientLocale(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  setLocaleResolver(() => readLocaleCookie(document.cookie) ?? DEFAULT_LOCALE);
  subscribeLocale((locale) => {
    document.cookie = serializeLocaleCookie(locale);
  });
}
