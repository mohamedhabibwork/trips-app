// The surface matrix as a truth table (AC-6, A1/A2).
//
// The existing suite cross-checks one direction (a granted surface must belong to a platform the
// domain allows). This file pins the whole table, so widening a role's reach — the classic
// copy-paste mistake when a new role is added — fails here instead of shipping.
import { describe, expect, test } from "bun:test";

import {
  SURFACE_IDS,
  allowedSurfacesForRole,
  canAccessSurface,
  homePathForRole,
  platformForSurface,
  signInPathForSurface,
} from "../src/index";
import type { SurfaceId } from "../src/index";

/** The client-side surface each role may open (ARCHITECTURE §3, `ROLE_SURFACES`). */
const EXPECTED_SURFACES: Readonly<Record<string, readonly SurfaceId[]>> = {
  traveler: ["traveler"],
  parent: ["traveler"],
  platform_driver: ["driver"],
  org_driver: ["driver"],
  platform_photographer: ["photographer", "studio"],
  org_photographer: ["photographer", "studio"],
  organization_owner: ["business"],
  organization_employee: ["business"],
  moderator: ["crew", "moderator"],
  admin: ["admin"],
};

describe("Unit: the surface matrix is exactly the documented table", () => {
  test("every role grants exactly its documented surfaces and nothing else", () => {
    for (const [role, expected] of Object.entries(EXPECTED_SURFACES)) {
      expect([...allowedSurfacesForRole(role)].sort()).toEqual([...expected].sort());

      for (const surface of SURFACE_IDS) {
        expect(canAccessSurface(role, null, surface)).toBe(expected.includes(surface));
      }
    }
  });

  test("the truth table covers all 10 roles × 8 surfaces", () => {
    let grants = 0;
    for (const role of Object.keys(EXPECTED_SURFACES)) {
      for (const surface of SURFACE_IDS) {
        if (canAccessSurface(role, null, surface)) grants += 1;
      }
    }

    // 1+1+1+1+2+2+1+1+2+1
    expect(grants).toBe(13);
  });
});

describe("Unit: adminSubRole only narrows, never widens", () => {
  test("a sub-role changes nothing outside the admin surface", () => {
    for (const role of Object.keys(EXPECTED_SURFACES)) {
      for (const surface of SURFACE_IDS) {
        if (surface === "admin") continue;
        expect(canAccessSurface(role, "super_admin", surface)).toBe(
          canAccessSurface(role, null, surface),
        );
      }
    }
  });

  test("an admin token with no sub-role claim may render /admin (the server re-checks)", () => {
    expect(canAccessSurface("admin", null, "admin")).toBe(true);
  });

  test("each catalogued sub-role passes and anything else fails", () => {
    for (const subRole of ["super_admin", "operations", "finance"]) {
      expect(canAccessSurface("admin", subRole, "admin")).toBe(true);
    }
    for (const subRole of ["", "wizard", "SUPER_ADMIN", "super-admin"]) {
      expect(canAccessSurface("admin", subRole, "admin")).toBe(false);
    }
  });

  test("a sub-role cannot grant /admin to a non-admin role", () => {
    expect(canAccessSurface("organization_owner", "super_admin", "admin")).toBe(false);
    expect(canAccessSurface("traveler", "super_admin", "admin")).toBe(false);
  });
});

describe("Unit: homePathForRole never lands on a sign-in route", () => {
  test("every role × surface combination returns a usable path", () => {
    const signInPaths = new Set(SURFACE_IDS.map((surface) => signInPathForSurface(surface)));

    for (const role of Object.keys(EXPECTED_SURFACES)) {
      for (const surface of SURFACE_IDS) {
        const home = homePathForRole(role, surface);

        expect(home.startsWith("/")).toBe(true);
        expect(home.startsWith("//")).toBe(false);
        expect(signInPaths.has(home)).toBe(false);
      }
    }
  });

  test("the home path is the surface root for the roles that own a surface", () => {
    expect(homePathForRole("admin", "admin")).toBe("/admin");
    expect(homePathForRole("organization_owner", "business")).toBe("/business");
    expect(homePathForRole("moderator", "crew")).toBe("/crew");
    expect(homePathForRole("platform_photographer", "studio")).toBe("/studio");
    expect(homePathForRole("traveler", "traveler")).toBe("/");
  });
});

describe("Unit: each surface owns one sign-in route, consistent with its platform", () => {
  test("the mobile surfaces share /sign-in, except the moderator's staff-code route", () => {
    const mobileSurfaces = SURFACE_IDS.filter(
      (surface) => platformForSurface(surface) === "mobile",
    );

    expect(mobileSurfaces).toEqual(["driver", "photographer", "moderator"]);
    for (const surface of mobileSurfaces) {
      const expected = surface === "moderator" ? "/crew/sign-in" : "/sign-in";
      expect(signInPathForSurface(surface)).toBe(expected);
    }
  });

  test("the web surfaces each have their own route", () => {
    expect(signInPathForSurface("traveler")).toBe("/sign-in");
    expect(signInPathForSurface("business")).toBe("/business/sign-in");
    expect(signInPathForSurface("admin")).toBe("/admin/sign-in");
    expect(signInPathForSurface("studio")).toBe("/sign-in");
  });

  test("an unknown surface degrades to the traveler route", () => {
    expect(signInPathForSurface("moon" as SurfaceId)).toBe("/sign-in");
    expect(platformForSurface("moon" as SurfaceId)).toBe("web");
  });
});
