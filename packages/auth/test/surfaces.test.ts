import { describe, expect, test } from "bun:test";

import { ROLE_AUTH_DEFAULTS, type UserRole } from "@trips-app/domain";

import {
  SURFACE_IDS,
  SURFACE_PLATFORMS,
  allowedSurfacesForRole,
  canAccessSurface,
  homePathForRole,
  platformForSurface,
  signInPathForSurface,
  surfaceForRole,
} from "../src/index";

const ROLES = Object.keys(ROLE_AUTH_DEFAULTS) as UserRole[];

describe("Unit: canAccessSurface (AC-6)", () => {
  test("covers 10 roles × 8 surfaces", () => {
    expect(ROLES.length).toBe(10);
    expect(SURFACE_IDS.length).toBe(8);

    let evaluated = 0;
    for (const role of ROLES) {
      for (const surface of SURFACE_IDS) {
        const allowed = canAccessSurface(role, null, surface);
        evaluated += 1;

        // Cross-check against the domain: a granted surface must belong to a platform the role
        // may use (ROLE_AUTH_DEFAULTS is the authority the server enforces).
        if (allowed) {
          expect(ROLE_AUTH_DEFAULTS[role].allowedSurfaces).toContain(SURFACE_PLATFORMS[surface]);
        }
      }
    }
    expect(evaluated).toBe(80);
  });

  test("every role with a platform has at least one surface", () => {
    for (const role of ROLES) {
      expect(allowedSurfacesForRole(role).length).toBeGreaterThan(0);
    }
  });

  test("a traveler cannot reach the admin, business or crew surfaces", () => {
    expect(canAccessSurface("traveler", null, "traveler")).toBe(true);
    expect(canAccessSurface("traveler", null, "admin")).toBe(false);
    expect(canAccessSurface("traveler", null, "business")).toBe(false);
    expect(canAccessSurface("traveler", null, "crew")).toBe(false);
    expect(canAccessSurface("traveler", null, "studio")).toBe(false);
  });

  test("an admin reaches only /admin", () => {
    expect(canAccessSurface("admin", "super_admin", "admin")).toBe(true);
    expect(canAccessSurface("admin", "operations", "admin")).toBe(true);
    expect(canAccessSurface("admin", "super_admin", "business")).toBe(false);
    expect(canAccessSurface("admin", "super_admin", "traveler")).toBe(false);
  });

  test("an unknown admin sub-role is rejected (tampered token)", () => {
    expect(canAccessSurface("admin", "wizard", "admin")).toBe(false);
  });

  test("an organization owner reaches /business", () => {
    expect(canAccessSurface("organization_owner", null, "business")).toBe(true);
    expect(canAccessSurface("organization_employee", null, "business")).toBe(true);
    expect(canAccessSurface("organization_owner", null, "admin")).toBe(false);
  });

  test("a moderator reaches the crew surface and the moderator surface", () => {
    expect(canAccessSurface("moderator", null, "crew")).toBe(true);
    expect(canAccessSurface("moderator", null, "moderator")).toBe(true);
    expect(canAccessSurface("moderator", null, "business")).toBe(false);
  });

  test("drivers and photographers reach their own surfaces", () => {
    expect(canAccessSurface("platform_driver", null, "driver")).toBe(true);
    expect(canAccessSurface("org_driver", null, "driver")).toBe(true);
    expect(canAccessSurface("platform_photographer", null, "photographer")).toBe(true);
    expect(canAccessSurface("org_photographer", null, "studio")).toBe(true);
    expect(canAccessSurface("platform_driver", null, "studio")).toBe(false);
  });

  test("an unknown role and an unknown surface fail closed", () => {
    expect(canAccessSurface("wizard", null, "traveler")).toBe(false);
    expect(canAccessSurface("traveler", null, "moon" as never)).toBe(false);
    expect(allowedSurfacesForRole("wizard")).toEqual([]);
  });
});

describe("Unit: homePathForRole", () => {
  test("each role lands on its own surface", () => {
    expect(homePathForRole("traveler", "traveler")).toBe("/");
    expect(homePathForRole("parent", "traveler")).toBe("/");
    expect(homePathForRole("organization_owner", "business")).toBe("/business");
    expect(homePathForRole("organization_employee", "business")).toBe("/business");
    expect(homePathForRole("admin", "admin")).toBe("/admin");
    expect(homePathForRole("moderator", "crew")).toBe("/crew");
    expect(homePathForRole("platform_photographer", "studio")).toBe("/studio");
    expect(homePathForRole("org_photographer", "photographer")).toBe("/studio");
    expect(homePathForRole("platform_driver", "driver")).toBe("/");
    expect(homePathForRole("org_driver", "driver")).toBe("/");
  });

  test("an unknown role or surface degrades to the public home page", () => {
    expect(homePathForRole("wizard", "traveler")).toBe("/");
    expect(homePathForRole("traveler", "moon" as never)).toBe("/");
  });
});

describe("Unit: surface sign-in routes (correction 6)", () => {
  test("each surface sends anonymous users to its own sign-in route", () => {
    expect(signInPathForSurface("traveler")).toBe("/sign-in");
    expect(signInPathForSurface("business")).toBe("/business/sign-in");
    expect(signInPathForSurface("admin")).toBe("/admin/sign-in");
    expect(signInPathForSurface("crew")).toBe("/crew/sign-in");
    expect(signInPathForSurface("moderator")).toBe("/crew/sign-in");
    expect(signInPathForSurface("studio")).toBe("/sign-in");
    expect(signInPathForSurface("driver")).toBe("/sign-in");
    expect(signInPathForSurface("photographer")).toBe("/sign-in");
  });
});

describe("Unit: signIn.surface value", () => {
  test("the moderator signs in on the PWA surface, everything else on web", () => {
    expect(surfaceForRole("moderator")).toBe("pwa");
    expect(surfaceForRole("traveler")).toBe("web");
    expect(surfaceForRole("organization_owner")).toBe("web");
    expect(surfaceForRole("admin")).toBe("web");
  });

  test("each surface maps to a platform the domain allows", () => {
    for (const surface of SURFACE_IDS) {
      expect(["web", "mobile", "pwa"]).toContain(platformForSurface(surface));
    }
  });
});
