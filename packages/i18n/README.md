# `@trips-app/i18n`

Arabic and English strings for every surface (UI-01).

Usage, in the server or the web app:

```ts
import { directionOf, type Locale } from "@trips-app/i18n";

const locale: Locale = "ar";
const dir = directionOf(locale); // "rtl"
```

Both apps list it as `"@trips-app/i18n": "workspace:*"`.

- Each key exists in both `ar` and `en`. A missing Arabic string fails the build (T-FND-19).
- Helpers for direction (`rtl` and `ltr`), which apps use to mirror layouts (UI-02).
- Error messages come from here, keyed by stable error category, so the same category shows in the caller's language (IF-08).
- Arabic copy is still to be written in the Arabic copy pass (see `docs/screens/README.md`).
