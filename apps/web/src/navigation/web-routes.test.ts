import { describe, expect, test } from "bun:test";

import { ALL_SCREENS, findScreenById } from "@/screens/registry";

import { ADMIN_NAV, ORGANIZATION_NAV } from "./shell-nav";
import { WEB_ROUTES, matchWebRoute, pathFor, surfaceForScreenId, webRouteById } from "./web-routes";

// Shared screens that are components mounted inside pages, not pages with a URL.
const COMPONENT_ONLY = new Set([
  "SCR-SHR-01",
  "SCR-SHR-03",
  "SCR-SHR-05",
  "SCR-SHR-08",
  "SCR-SHR-09",
  "SCR-SHR-10",
  "SCR-SHR-13",
  "SCR-SHR-14",
  "SCR-SHR-15",
  "SCR-SHR-16",
]);

describe("web route table", () => {
  test("every registered screen has a URL unless it is a component-only screen", () => {
    // Arrange
    const missing = ALL_SCREENS.filter(
      (screen) => !webRouteById(screen.id) && !COMPONENT_ONLY.has(screen.id),
    ).map((screen) => screen.id);

    // Assert
    expect(missing).toEqual([]);
  });

  test("every route points at a registered screen on the matching surface", () => {
    for (const route of WEB_ROUTES) {
      const entry = findScreenById(route.id);
      expect(entry?.surface).toBe(surfaceForScreenId(route.id));
    }
  });

  test("no two routes share a path", () => {
    const paths = WEB_ROUTES.map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  test("every catch-all route matches its own pattern back to itself", () => {
    for (const route of WEB_ROUTES.filter((candidate) => !candidate.fileRoute)) {
      // Arrange
      const params = Object.fromEntries(
        [...route.path.matchAll(/\$([A-Za-z]+)/g)].map(([, name]) => [name, `sample-${name}`]),
      );

      // Act
      const match = matchWebRoute(route.area, pathFor(route.id, params));

      // Assert
      expect(match?.route.id).toBe(route.id);
      expect(match?.params).toEqual(params);
    }
  });
});

describe("matchWebRoute", () => {
  test("prefers a static segment over a param", () => {
    expect(matchWebRoute("organization", "/business/vehicles/types")?.route.id).toBe("SCR-ORG-18");
    expect(matchWebRoute("organization", "/business/vehicles/v-42")?.route.id).toBe("SCR-ORG-17");
  });

  test("returns the decoded params of a detail page", () => {
    const match = matchWebRoute("admin", "/admin/applications/app%2001/reject");
    expect(match?.route.id).toBe("SCR-ADM-05");
    expect(match?.params).toEqual({ applicationId: "app 01" });
  });

  test("returns nothing for a path no screen owns", () => {
    expect(matchWebRoute("organization", "/business/nowhere")).toBeUndefined();
    expect(matchWebRoute("public", "/no-such-page")).toBeUndefined();
  });

  test("skips pages served by their own file route", () => {
    expect(matchWebRoute("public", "/sign-in")).toBeUndefined();
  });
});

describe("pathFor", () => {
  test("builds the dashboard home URLs", () => {
    expect(pathFor("SCR-ORG-01")).toBe("/business");
    expect(pathFor("SCR-ADM-01")).toBe("/admin");
  });

  test("throws when a param is missing", () => {
    expect(() => pathFor("SCR-ORG-14")).toThrow(/tripId/);
  });

  test("throws for an unknown screen", () => {
    expect(() => pathFor("SCR-XXX-99")).toThrow(/SCR-XXX-99/);
  });
});

describe("shell navigation", () => {
  test("every sidebar item opens a page in its own section", () => {
    for (const navItem of [...ORGANIZATION_NAV, ...ADMIN_NAV]) {
      expect(webRouteById(navItem.screenId)?.section).toBe(navItem.section);
    }
  });
});
