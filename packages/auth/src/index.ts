// @trips-app/auth — the shared authentication contract (ARCHITECTURE-auth.md §3).
//
// Pure rules and constants: no transport, no DOM, no `node:crypto`. Web owns `RPCLink`, mobile owns
// `ApiClient`; both consume exactly these functions, so the two platforms cannot drift.
//
// The only runtime dependency is `@trips-app/i18n` (dependency-free) for `messageFor()`.
export * from "./types";
export * from "./conventions/index";
export * from "./storage";
export * from "./expiry";
export * from "./refresh-policy";
export * from "./errors";
export * from "./return-to";
export * from "./surfaces";
export * from "./registration";
export * from "./log";
