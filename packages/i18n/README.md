# `@trips-app/i18n`

Arabic and English strings for every surface (UI-01), with one table per locale:
`src/auth/en.ts` (base) and `src/auth/ar.ts`.

Usage, in the server or the web app:

```ts
import { getLocale, setLocale, t, directionOf } from "@trips-app/i18n";

t("auth.signIn.title"); // the current locale — Arabic unless the visitor chose otherwise
t("auth.signIn.title", "en"); // an explicit locale, for server responses and context values
t("auth.error.accountLocked", "ar", { seconds: 30 }); // `{seconds}` is interpolated

getLocale(); // "ar" | "en": choice in this tab → remembered choice → <html lang> → browser → "ar"
setLocale("en"); // remembers the choice and mirrors it onto <html lang dir>

directionOf("ar"); // "rtl"
```

Both apps list it as `"@trips-app/i18n": "workspace:*"`.

- `en.ts` defines `AuthMessageKey`, and `ar.ts` is typed as `AuthMessages`, so a missing Arabic
  string fails the build (T-FND-19).
- `t()` falls back to the key itself — never to English, never to an empty string — so an
  untranslated or unknown key is obvious in the UI, in review and in tests.
- Helpers for direction (`rtl` and `ltr`), which apps use to mirror layouts (UI-02).
- Error messages come from here, keyed by stable error category, so the same category shows in the
  caller's language (IF-08).
- Arabic copy is complete for the auth surface: all 158 keys are translated in `src/auth/ar.ts`. The
  side-by-side source/translation table lives in `docs/i18n/translations-ar-en.md`; other surfaces
  still need their Arabic copy pass (see `docs/screens/README.md`).
