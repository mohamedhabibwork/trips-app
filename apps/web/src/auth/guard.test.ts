import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { isRedirect } from "@tanstack/react-router";
import type { AuthActor } from "@trips-app/auth";

import { requireAnonymous, requireSurface, type GuardContext } from "./guard";

type RedirectOptions = { to?: string; search?: Record<string, unknown>; replace?: boolean };

/** The guard only reads `auth.getSnapshot()`, so the rest of the context is not needed. */
function contextFor(snapshot: {
  status: "loading" | "authenticated" | "anonymous" | "sessionExpired";
  actor: AuthActor | null;
}): GuardContext {
  return {
    auth: { getSnapshot: () => ({ ...snapshot, record: null }) },
  };
}

function actor(activeRole: string, adminSubRole: string | null = null): AuthActor {
  return {
    accountId: "acct_1",
    sessionId: "sess_1",
    activeRole,
    adminSubRole,
    activeTenantId: null,
    planTier: null,
    permissions: null,
    moderatorVehicleId: null,
    moderatorTripId: null,
  };
}

/** Runs the guard and returns the redirect it threw, or null when it allowed the navigation. */
function runGuard(
  guard: ReturnType<typeof requireSurface>,
  context: GuardContext,
  href = "/admin",
): RedirectOptions | null {
  try {
    guard({ context, location: { href } });
    return null;
  } catch (error) {
    if (!isRedirect(error)) throw error;
    return (error as Response & { options: RedirectOptions }).options;
  }
}

const originalWindow = (globalThis as { window?: unknown }).window;

beforeEach(() => {
  // bun:test has no `window`; the guard treats that as SSR and returns immediately, so the client
  // path needs a stand-in.
  (globalThis as { window?: unknown }).window = {};
});

afterEach(() => {
  if (originalWindow === undefined) {
    delete (globalThis as { window?: unknown }).window;
  } else {
    (globalThis as { window?: unknown }).window = originalWindow;
  }
});

describe("Unit: anonymous users (AC-6, E4)", () => {
  test("a direct hit on /admin redirects to the admin sign-in route with returnTo", () => {
    const redirect = runGuard(
      requireSurface("admin"),
      contextFor({ status: "anonymous", actor: null }),
      "/admin?tab=users",
    );

    expect(redirect?.to).toBe("/admin/sign-in");
    expect(redirect?.search).toEqual({ returnTo: "/admin?tab=users" });
    expect(redirect?.replace).toBe(true);
  });

  test("each surface redirects to its own sign-in route (correction 6)", () => {
    const anonymous = contextFor({ status: "anonymous", actor: null });

    expect(runGuard(requireSurface("business"), anonymous)?.to).toBe("/business/sign-in");
    expect(runGuard(requireSurface("crew"), anonymous)?.to).toBe("/crew/sign-in");
    expect(runGuard(requireSurface("traveler"), anonymous)?.to).toBe("/sign-in");
  });

  test("a sessionExpired user is treated as anonymous by the guard (no dialog, E4)", () => {
    const redirect = runGuard(
      requireSurface("admin"),
      contextFor({ status: "sessionExpired", actor: null }),
    );

    expect(redirect?.to).toBe("/admin/sign-in");
  });
});

describe("Unit: hydration and SSR", () => {
  test("while loading the guard does not redirect", () => {
    expect(
      runGuard(requireSurface("admin"), contextFor({ status: "loading", actor: null })),
    ).toBeNull();
  });

  test("during SSR the guard returns without touching the session", () => {
    delete (globalThis as { window?: unknown }).window;

    expect(
      runGuard(requireSurface("admin"), contextFor({ status: "anonymous", actor: null })),
    ).toBeNull();
  });
});

describe("Unit: role mismatch (A3, AC-6)", () => {
  test("a signed-in traveler is sent to /forbidden, not to sign-in", () => {
    const redirect = runGuard(
      requireSurface("admin"),
      contextFor({ status: "authenticated", actor: actor("traveler") }),
    );

    expect(redirect?.to).toBe("/forbidden");
    expect(redirect?.search).toEqual({ from: "admin" });
  });

  test("the session is not touched: no sign-out, no store access", () => {
    const snapshot = { status: "authenticated" as const, actor: actor("traveler") };
    const context = contextFor(snapshot);

    runGuard(requireSurface("business"), context);

    expect(context.auth.getSnapshot().status).toBe("authenticated");
    expect(context.auth.getSnapshot().actor).toEqual(actor("traveler"));
  });

  test("a matching role passes every surface it owns", () => {
    expect(
      runGuard(
        requireSurface("admin"),
        contextFor({ status: "authenticated", actor: actor("admin", "super_admin") }),
      ),
    ).toBeNull();
    expect(
      runGuard(
        requireSurface("business"),
        contextFor({ status: "authenticated", actor: actor("organization_owner") }),
      ),
    ).toBeNull();
    expect(
      runGuard(
        requireSurface("crew"),
        contextFor({ status: "authenticated", actor: actor("moderator") }),
      ),
    ).toBeNull();
    expect(
      runGuard(
        requireSurface("traveler"),
        contextFor({ status: "authenticated", actor: actor("traveler") }),
      ),
    ).toBeNull();
  });

  test("an organization owner cannot open /admin", () => {
    const redirect = runGuard(
      requireSurface("admin"),
      contextFor({ status: "authenticated", actor: actor("organization_owner") }),
    );

    expect(redirect?.to).toBe("/forbidden");
  });
});

describe("Unit: requireAnonymous", () => {
  test("sends an authenticated user who owns the surface home", () => {
    const redirect = runGuard(
      requireAnonymous("business"),
      contextFor({ status: "authenticated", actor: actor("organization_owner") }),
      "/business/sign-in",
    );

    expect(redirect?.to).toBe("/business");
    expect(redirect?.replace).toBe(true);
  });

  test("lets an anonymous user see the form", () => {
    expect(
      runGuard(
        requireAnonymous("business"),
        contextFor({ status: "anonymous", actor: null }),
        "/business/sign-in",
      ),
    ).toBeNull();
  });

  test("does nothing while loading", () => {
    expect(
      runGuard(
        requireAnonymous("traveler"),
        contextFor({ status: "loading", actor: null }),
        "/sign-in",
      ),
    ).toBeNull();
  });

  test("a traveler may still open the admin sign-in form", () => {
    expect(
      runGuard(
        requireAnonymous("admin"),
        contextFor({ status: "authenticated", actor: actor("traveler") }),
        "/admin/sign-in",
      ),
    ).toBeNull();
  });
});
