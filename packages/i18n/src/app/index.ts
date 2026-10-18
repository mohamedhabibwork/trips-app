// Screen copy — one table per locale, in ./en.ts (base) and ./ar.ts.
//
// `en.ts` defines `AppMessageKey`; `ar.ts` is typed as `AppMessages`, so a missing Arabic string
// fails the build. Keys are namespaced by surface (`screen.*`, `component.*`, `ui.*`), so a screen
// can be found from its key alone.
export type { AppMessageKey, AppMessages } from "./en";
export { en as appEn } from "./en";
export { ar as appAr } from "./ar";
