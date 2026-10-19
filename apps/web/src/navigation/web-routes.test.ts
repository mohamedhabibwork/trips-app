import { describe, expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

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

  test("every route matches its own pattern back to itself", () => {
    for (const route of WEB_ROUTES) {
      // Arrange
      const params = Object.fromEntries(
        [...route.path.matchAll(/\$([A-Za-z]+)/g)].map(([, name]) => [name, `sample-${name}`]),
      );
      // `pathFor` builds a screen's main URL, so an alias is filled in from its own pattern.
      const path = route.alias
        ? route.path.replace(/\$([A-Za-z]+)/g, (_, name: string) => params[name] as string)
        : pathFor(route.id, params);

      // Act
      const match = matchWebRoute(route.area, path);

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

  test("matches pages that have a hand-written route file", () => {
    expect(matchWebRoute("public", "/sign-in")?.route.id).toBe("SCR-PUB-08");
  });
});

describe("trip wizard URLs", () => {
  test("step 1 creates at /trips/new and edits a saved draft at /trips/$tripId/edit", () => {
    expect(pathFor("SCR-ORG-05")).toBe("/business/trips/new");
    const edit = matchWebRoute("organization", "/business/trips/t-1/edit");
    expect(edit?.route.id).toBe("SCR-ORG-05");
    expect(edit?.params).toEqual({ tripId: "t-1" });
  });

  test("steps 2 to 8 carry the trip in the URL", () => {
    // Arrange
    const steps = ["06", "07", "08", "09", "10", "11", "12"].map((n) => `SCR-ORG-${n}`);

    // Act
    const paths = steps.map((id) => pathFor(id, { tripId: "t-1" }));

    // Assert
    for (const path of paths) expect(path.startsWith("/business/trips/t-1/edit/")).toBe(true);
    expect(() => pathFor("SCR-ORG-06")).toThrow(/tripId/);
  });

  test("the edit URLs do not fall through to the trip command view", () => {
    expect(matchWebRoute("organization", "/business/trips/t-1/edit/schedule")?.route.id).toBe(
      "SCR-ORG-06",
    );
    expect(matchWebRoute("organization", "/business/trips/t-1")?.route.id).toBe("SCR-ORG-14");
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

const ROUTES_DIR = join(import.meta.dir, "..", "routes");

/** Route path -> source of the file that declares it, for every file route. */
function fileRoutes(): Map<string, string> {
  const files = readdirSync(ROUTES_DIR, { recursive: true, encoding: "utf8" }).filter(
    (file) => file.endsWith(".tsx") && !file.includes(".test."),
  );
  const byPath = new Map<string, string>();
  for (const file of files) {
    const source = readFileSync(join(ROUTES_DIR, file), "utf8");
    const declared = /createFileRoute\("([^"]+)"\)/.exec(source)?.[1];
    if (!declared) continue;
    const path = declared.length > 1 ? declared.replace(/\/$/, "") : declared;
    byPath.set(path.replace(/\/(admin|business)_\//, "/$1/").replace(/_\//g, "/"), source);
  }
  return byPath;
}

describe("file routes", () => {
  const routes = fileRoutes();

  test("every screen URL is served by its own route file", () => {
    const missing = WEB_ROUTES.filter((route) => !routes.has(route.path)).map(
      (route) => `${route.id} ${route.path}`,
    );
    expect(missing).toEqual([]);
  });

  test("no catch-all or screen gallery route exposes pages outside their guards", () => {
    const open = [...routes.keys()].filter(
      (path) =>
        path.endsWith("/$") ||
        path === "/$" ||
        path.startsWith("/screens") ||
        path === "/components",
    );
    expect(open).toEqual([]);
  });

  test("public pages that need a session use the signed-in guard", () => {
    for (const route of WEB_ROUTES.filter((candidate) => candidate.signedIn)) {
      expect(routes.get(route.path)).toContain("beforeLoad: requireSignedIn(");
    }
  });

  test("the employee invitation opens without a session, outside the /business guard", () => {
    // Arrange
    const source = readFileSync(join(ROUTES_DIR, "business_.invitation.$token.tsx"), "utf8");

    // Assert
    expect(source).toContain('createFileRoute("/business_/invitation/$token")');
    expect(source).not.toContain("beforeLoad");
    expect(routes.get(pathFor("SCR-ORG-02", { token: "abc" }).replace("abc", "$token"))).toBe(
      source,
    );
  });

  test("organization and admin pages sit under their guarded layout", () => {
    const layouts = { organization: "business.tsx", admin: "admin.tsx" } as const;
    for (const [area, file] of Object.entries(layouts)) {
      const source = readFileSync(join(ROUTES_DIR, file), "utf8");
      expect(source).toContain("beforeLoad: requireSurface(");
      for (const route of WEB_ROUTES.filter((candidate) => candidate.area === area)) {
        expect(relative("/", route.path).split("/")[0]).toBe(file.replace(".tsx", ""));
      }
    }
  });
});
