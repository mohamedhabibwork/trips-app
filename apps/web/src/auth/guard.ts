// Route guard (P0-6, AC-6). UX only: the server re-checks every call (A1/A2).
import { redirect } from "@tanstack/react-router";
import { canAccessSurface, signInPathForSurface } from "@trips-app/auth";
import type { SurfaceId } from "@trips-app/auth";

import { homeRouteForRole } from "./home-route";
import type { SessionSnapshot } from "./session-controller";

/**
 * The only part of the router context a guard reads.
 *
 * Deliberately structural rather than `RouterAppContext`: the guard must not depend on
 * `types/index.ts` → `routeTree.gen.ts` → every route (that chain would drag the whole route graph,
 * including unrelated screens, into the guard's module graph and into its tests).
 */
export interface GuardContext {
  auth: { getSnapshot(): SessionSnapshot };
}

export interface GuardArguments {
  context: GuardContext;
  location: { href: string };
}

/**
 * `beforeLoad` for a protected route.
 *
 * - SSR returns immediately: the page renders a hydration shell and the client decides (§4.3).
 * - While the controller is still hydrating it returns without redirecting, so a reload of a
 *   protected page never flashes the sign-in form.
 * - Anonymous users go to **that surface's own** sign-in route with `returnTo` (correction 6, E4 —
 *   no session-expired dialog). `signInPath` defaults to the route in `conventions.json`.
 * - A signed-in user without the role goes to `/forbidden`; the session is preserved (A3).
 */
export function requireSurface(surface: SurfaceId, signInPath?: string) {
  return ({ context, location }: GuardArguments): void => {
    if (typeof window === "undefined") return;

    const { status, actor } = context.auth.getSnapshot();
    if (status === "loading") return;

    if (status !== "authenticated" || !actor) {
      throw redirect({
        to: signInPath ?? signInPathForSurface(surface),
        search: { returnTo: location.href },
        replace: true,
      });
    }

    if (!canAccessSurface(actor.activeRole, actor.adminSubRole, surface)) {
      throw redirect({ to: "/forbidden", search: { from: surface } });
    }
  };
}

/**
 * The inverse guard for sign-in routes: a user who can already use this surface is sent to its home
 * instead of being shown a form. It never runs during SSR or hydration.
 *
 * A signed-in traveler is *not* bounced away from `/admin/sign-in`: they may legitimately be signing
 * in as an admin on the same browser.
 */
export function requireAnonymous(surface: SurfaceId) {
  return ({ context }: GuardArguments): void => {
    if (typeof window === "undefined") return;

    const { status, actor } = context.auth.getSnapshot();
    if (status !== "authenticated" || !actor) return;
    if (!canAccessSurface(actor.activeRole, actor.adminSubRole, surface)) return;

    throw redirect({ to: homeRouteForRole(actor.activeRole, surface), replace: true });
  };
}
