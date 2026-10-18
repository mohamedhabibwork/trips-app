# `@trips-app/i18n`

Arabic and English strings for every surface (UI-01), with one table per locale and per surface:

- `src/auth/en.ts` (base) + `src/auth/ar.ts` — the authentication surface and the mobile contract.
- `src/app/en.ts` (base) + `src/app/ar.ts` — every other surface: screens, shared components, routes.

`src/catalog.ts` merges both tables so callers use one `t()`.

Usage, in the server or the web app:

```ts
import { getLocale, setLocale, t, directionOf } from "@trips-app/i18n";

t("auth.signIn.title"); // the current locale — Arabic unless the visitor chose otherwise
t("screen.admin.applications.applicationQueue.applicationQueue"); // screen copy uses the same lookup
t("auth.signIn.title", "en"); // an explicit locale, for server responses and context values
t("auth.error.accountLocked", { seconds: 30 }); // `{seconds}` is interpolated
t("auth.error.accountLocked", "ar", { seconds: 30 }); // locale and params

getLocale(); // "ar" | "en": choice in this tab → remembered choice → <html lang> → browser → "ar"
setLocale("en"); // remembers the choice and mirrors it onto <html lang dir>

directionOf("ar"); // "rtl"
```

Both apps list it as `"@trips-app/i18n": "workspace:*"`; `@trips-app/ui` lists it too, because its
component defaults (empty states, status words, calendar and pagination labels) are copy as well.

- `en.ts` defines `AuthMessageKey` / `AppMessageKey`, and the Arabic tables are typed as
  `AuthMessages` / `AppMessages`, so a missing Arabic string fails the build (T-FND-19).
- `t()` falls back to the key itself — never to English, never to an empty string — so an
  untranslated or unknown key is obvious in the UI, in review and in tests.
- Screen keys are `<surface>.<area>.<screen>.<slug>`: `screen.*` for the design-review screens,
  `component.*` for `apps/web/src/components`, `ui.*` for `packages/ui`, `route.*` for the router
  shell. The slug comes from the English sentence, so a reviewer can find a string without opening
  the component.
- `validation.*` holds the copy for a rejected input, keyed by constraint rather than by sentence:
  `validation.tooShort` (`{min}`), `validation.invalidEmail`, `validation.invalidCode` (`{length}`),
  and so on. The server sends a code plus its parameters; `@trips-app/auth` picks the key.
- `bun run --cwd packages/i18n emit:mobile` regenerates `src/auth/messages.json` and the Kotlin
  `AuthStrings.kt` from the auth tables, so the mobile contract cannot drift. The TypeScript files
  stay the source of truth; both artifacts are generated. Screen copy is web-only and is not part of
  that contract.
- Helpers for direction (`rtl` and `ltr`), which apps use to mirror layouts (UI-02).
- Error messages come from here, keyed by stable error category, so the same category shows in the
  caller's language (IF-08).
- Arabic copy is complete for both tables: 172 auth keys and 2632 screen keys, all translated. The
  auth side-by-side table lives in `docs/i18n/translations-ar-en.md`; the screen-copy audit lives in
  `docs/i18n/coverage-2026-10-18.md`.
