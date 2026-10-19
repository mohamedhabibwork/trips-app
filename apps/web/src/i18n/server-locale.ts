// Server side of the locale cookie. Each request runs inside its own async scope, so concurrent
// requests in one worker never read each other's language through the shared `getLocale()`.
import { AsyncLocalStorage } from "node:async_hooks";

import { setLocaleResolver } from "@trips-app/i18n";
import type { Locale } from "@trips-app/i18n";

import { localeFromCookieHeader } from "./locale-cookie";

const requestLocale = new AsyncLocalStorage<Locale>();

setLocaleResolver(() => requestLocale.getStore() ?? null);

/** Runs `render` with the request's locale (cookie, else Arabic) as the answer of `getLocale()`. */
export function withRequestLocale<T>(request: Request, render: () => T): T {
  return requestLocale.run(localeFromCookieHeader(request.headers.get("cookie")), render);
}
