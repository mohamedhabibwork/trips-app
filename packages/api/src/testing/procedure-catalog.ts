// Test-only helpers that enumerate every procedure in the app router. Used by unit and e2e endpoint tests.
import type { AnyProcedure, AnyRouter } from "@orpc/server";

import { appRouter } from "../routers/index";
import type { ProcedureEntry } from "../types";

export type { ProcedureEntry } from "../types";

/**
 * Public procedures that are intentionally callable without a session. Each entry must say why.
 * Adding an entry is a security decision: it needs owner review.
 */
export const INTENTIONALLY_PUBLIC: Readonly<Record<string, string>> = {
  healthCheck: "Public liveness probe. Returns a fixed string.",
  "auth.signOut": "Sign-out is idempotent: with no session it reports success and changes nothing.",
  "auth.getPlanCatalog":
    "Read-only public pricing list of subscription tiers, shown before sign-up. Needs owner confirmation.",
  "auth.getRoleCatalog": "Read-only role list shown before sign-in. Needs owner confirmation.",
  "auth.getPermissionCatalog":
    "Read-only permission area list shown before sign-in. Needs owner confirmation.",
  "auth.getAuthSettings":
    "Public OTP and lockout thresholds for the sign-in screen. Needs owner confirmation: it discloses lockout policy to anonymous callers.",
  "lookups.listTypes":
    "Read-only public lookup type catalog used by web and mobile clients to populate localized dropdown lists before and after sign-in.",
  "lookups.getTypeByCode":
    "Read-only public lookup list query by lookup_types.code (e.g. COUNTRY, CURRENCY, SERVICE_REGION) used by web and mobile forms.",
  "lookups.getByTypeCodes":
    "Read-only batch query for public lookup lists by lookup_types.code array used by web and mobile bootstrap.",
  "lookups.getByCode":
    "Read-only public lookup item query by lookups.code (and child lookups) used by web and mobile screens.",
  "trips.browsePublicTrips":
    "Read-only public trip discovery endpoint for web and mobile travelers (SCR-TRV-01, FR-TRIP-02); filters out draft, cancelled, targeted, and active VIP early-access trips.",
  "trips.getPublicTripDetail":
    "Read-only public trip detail endpoint for web and mobile travelers (SCR-TRV-02, FR-TRIP-02); enforces visibility and VIP early-access rules.",
  "programs.listPublicTripPrograms":
    "Read-only public trip program itinerary endpoint for web and mobile travelers viewing published trips (SCR-TRV-02).",
};

function isProcedure(node: unknown): node is AnyProcedure {
  return (
    (typeof node === "object" || typeof node === "function") && node !== null && "~orpc" in node
  );
}

export function flattenRouter(router: AnyRouter, prefix: readonly string[] = []): ProcedureEntry[] {
  return Object.entries(router).flatMap(([key, node]) => {
    const path = [...prefix, key];
    if (isProcedure(node)) return [{ path, procedure: node }];
    return flattenRouter(node as AnyRouter, path);
  });
}

export function listAppProcedures(): ProcedureEntry[] {
  return flattenRouter(appRouter);
}

export function hasInputSchema(procedure: AnyProcedure): boolean {
  return (
    (procedure as unknown as { "~orpc": { inputSchema?: unknown } })["~orpc"].inputSchema !==
    undefined
  );
}

export function procedureName(path: readonly string[]): string {
  return path.join(".");
}
