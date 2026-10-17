// Route-path helpers for the auth layer.
//
// `homePathForRole` (in @trips-app/auth) is the single source of the rule; this module only narrows
// its `string` result to the literal union TanStack Router's `to` accepts.
import { homePathForRole } from "@trips-app/auth";
import type { SurfaceId } from "@trips-app/auth";

export type HomeRoute = "/" | "/business" | "/admin" | "/crew" | "/studio";

/** Where a freshly signed-in role lands (AC-2, AC-6). */
export function homeRouteForRole(role: string, surface: SurfaceId = "traveler"): HomeRoute {
  const path = homePathForRole(role, surface);
  if (path === "/business" || path === "/admin" || path === "/crew" || path === "/studio") {
    return path;
  }
  return "/";
}
