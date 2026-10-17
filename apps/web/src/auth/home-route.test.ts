// The literal-union narrowing between `homePathForRole` (a `string`) and TanStack Router's `to`
// (a union). It is the last hop of every successful sign-in, so an unexpected value here sends the
// user to the wrong surface — or to a route that does not exist.
import { describe, expect, test } from "bun:test";

import { homeRouteForRole } from "./home-route";

describe("Unit: homeRouteForRole (AC-2)", () => {
  test("each role lands on the surface it owns", () => {
    expect(homeRouteForRole("traveler", "traveler")).toBe("/");
    expect(homeRouteForRole("parent", "traveler")).toBe("/");
    expect(homeRouteForRole("platform_driver", "driver")).toBe("/");
    expect(homeRouteForRole("org_driver", "driver")).toBe("/");
    expect(homeRouteForRole("organization_owner", "business")).toBe("/business");
    expect(homeRouteForRole("organization_employee", "business")).toBe("/business");
    expect(homeRouteForRole("admin", "admin")).toBe("/admin");
    expect(homeRouteForRole("moderator", "crew")).toBe("/crew");
    expect(homeRouteForRole("platform_photographer", "photographer")).toBe("/studio");
    expect(homeRouteForRole("org_photographer", "studio")).toBe("/studio");
  });

  test("the role decides, not the surface argument", () => {
    // `requireAnonymous("admin")` passes the surface it is guarding; the destination must still be
    // the role's own home, never the guarded surface.
    expect(homeRouteForRole("admin", "traveler")).toBe("/admin");
    expect(homeRouteForRole("organization_owner", "admin")).toBe("/business");
    expect(homeRouteForRole("moderator", "traveler")).toBe("/crew");
  });

  test("anything unknown degrades to the public home page", () => {
    expect(homeRouteForRole("wizard")).toBe("/");
    expect(homeRouteForRole("wizard", "admin")).toBe("/");
    expect(homeRouteForRole("")).toBe("/");
  });

  test("the default surface is the traveler surface", () => {
    expect(homeRouteForRole("traveler")).toBe("/");
    expect(homeRouteForRole("traveler", "traveler")).toBe("/");
  });

  test("the result is always one of the five routes the router declares", () => {
    const allowed = new Set(["/", "/business", "/admin", "/crew", "/studio"]);
    const roles = [
      "traveler",
      "parent",
      "platform_driver",
      "org_driver",
      "platform_photographer",
      "org_photographer",
      "organization_owner",
      "organization_employee",
      "moderator",
      "admin",
      "wizard",
    ];

    for (const role of roles) {
      expect(allowed.has(homeRouteForRole(role))).toBe(true);
    }
  });
});
