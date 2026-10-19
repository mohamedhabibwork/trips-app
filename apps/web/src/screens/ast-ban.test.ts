import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import { authController } from "@/auth/instance";
import type { SessionController } from "@/auth/session-controller";
import { ADMIN_SCREENS } from "@/screens/admin";
import { ORGANIZATION_SCREENS } from "@/screens/organization";
import { PUBLIC_SCREENS } from "@/screens/public";
import { SHARED_SCREENS } from "@/screens/shared";
import { TRAVELER_SCREENS } from "@/screens/traveler";
import { ALL_SCREENS } from "@/screens/registry";
import { orpc } from "@/utils/orpc";

describe("Milestone 6: Global AST Barrier & Source Purity Audit", () => {
  const screensDir = join(import.meta.dir);

  function getAllFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...getAllFiles(fullPath));
      } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
        results.push(fullPath);
      }
    }
    return results;
  }

  function getSourceFiles(dir: string): string[] {
    return getAllFiles(dir).filter(
      (file) => !file.endsWith(".test.ts") && !file.endsWith(".test.tsx"),
    );
  }

  function createMockAuth(token: string | null = null): SessionController {
    return {
      ...authController,
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? {
              accountId: "acc-user-1",
              email: "user@example.com",
              activeRole: "admin",
              role: "admin",
            }
          : null,
        record: null,
      }),
    } as unknown as SessionController;
  }

  describe("File Inventory & Scope Discovery", () => {
    test("Recursively discovers all TypeScript and TSX files across screens directory", () => {
      const allFiles = getAllFiles(screensDir);
      // The screens directory contains all 152+ screen, helper, registry, and test files
      expect(allFiles.length).toBeGreaterThanOrEqual(152);

      const surfaces = ["admin", "organization", "public", "shared"];
      for (const surface of surfaces) {
        const surfaceFiles = allFiles.filter((f) => f.includes(`/${surface}/`));
        expect(surfaceFiles.length).toBeGreaterThan(0);
      }
    });

    test("Discovers all screen component source files (excluding test suites)", () => {
      const sourceFiles = getSourceFiles(screensDir);
      // At least 140 pure source files across screens directory (the public and shared rebuild
      // removed the unused design-review helpers).
      expect(sourceFiles.length).toBeGreaterThanOrEqual(140);
    });
  });

  describe("Static AST Barrier: Exactly 0 Imperative client. Calls", () => {
    test("Zero occurrences of raw client. across all screen source files", () => {
      const sourceFiles = getSourceFiles(screensDir);
      const violations: string[] = [];

      // Matches client.<method> that is not queryClient.<method> or orpcClient.<method>
      const clientRegex = /(?<!queryClient)(?<!orpcClient)\bclient\.[a-zA-Z]/g;

      for (const file of sourceFiles) {
        const content = readFileSync(file, "utf8");
        const matches = content.match(clientRegex);
        if (matches && matches.length > 0) {
          violations.push(
            `${file}: found ${matches.length} client. references: ${matches.join(", ")}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Static AST Barrier: Exactly 0 Imports of { client } from @/utils/orpc", () => {
    test("Zero imports of raw client from @/utils/orpc across all screen source files", () => {
      const sourceFiles = getSourceFiles(screensDir);
      const violations: string[] = [];

      const importRegex = /import\s*\{[^}]*\bclient\b[^}]*\}\s*from\s*["']@\/utils\/orpc["']/;

      for (const file of sourceFiles) {
        const content = readFileSync(file, "utf8");
        if (importRegex.test(content)) {
          violations.push(`${file} imports { client } from "@/utils/orpc"`);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Static AST Barrier: Exactly 0 useEffect Hooks Performing Imperative RPC Data Fetching", () => {
    test("Zero useEffect hooks perform imperative RPC data fetching across all screens", () => {
      const sourceFiles = getSourceFiles(screensDir).filter((f) => f.endsWith(".tsx"));
      const violations: string[] = [];

      for (const file of sourceFiles) {
        const content = readFileSync(file, "utf8");
        if (!content.includes("useEffect")) continue;

        // Split into useEffect occurrences and check for imperative fetch / RPC patterns
        const effectPattern =
          /useEffect\s*\(\s*(?:async\s*)?\(\s*\)\s*=>\s*\{([\s\S]*?)\}\s*,\s*\[([\s\S]*?)\]\s*\)/g;
        let match: RegExpExecArray | null;
        while ((match = effectPattern.exec(content)) !== null) {
          const body = match[1] || "";
          if (
            /(?<!queryClient)\bclient\.[a-zA-Z]/.test(body) ||
            /\borpc\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\.call\b/.test(body) ||
            /\bfetch\s*\(/.test(body)
          ) {
            violations.push(`${file}: useEffect contains imperative data fetching`);
          }
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Screen Registry Completeness: 131 Screens with Typed Loaders", () => {
    test("ADMIN_SCREENS contains 33 registered screens and all define typed loaders", () => {
      expect(ADMIN_SCREENS.length).toBe(33);
      for (const screen of ADMIN_SCREENS) {
        expect(typeof screen.loader).toBe("function");
      }
    });

    test("ORGANIZATION_SCREENS contains 42 registered screens and all define typed loaders", () => {
      expect(ORGANIZATION_SCREENS.length).toBe(42);
      for (const screen of ORGANIZATION_SCREENS) {
        expect(typeof screen.loader).toBe("function");
      }
    });

    test("PUBLIC_SCREENS contains 19 registered screens and all define typed loaders", () => {
      expect(PUBLIC_SCREENS.length).toBe(19);
      for (const screen of PUBLIC_SCREENS) {
        expect(typeof screen.loader).toBe("function");
      }
    });

    test("SHARED_SCREENS contains 16 registered screens and all define typed loaders", () => {
      expect(SHARED_SCREENS.length).toBe(16);
      for (const screen of SHARED_SCREENS) {
        expect(typeof screen.loader).toBe("function");
      }
    });

    test("TRAVELER_SCREENS contains 21 registered screens and all define typed loaders", () => {
      expect(TRAVELER_SCREENS.length).toBe(21);
      for (const screen of TRAVELER_SCREENS) {
        expect(typeof screen.loader).toBe("function");
      }
    });

    test("ALL_SCREENS contains all 131 screens and every single screen entry defines a typed loader", () => {
      expect(ALL_SCREENS.length).toBe(131);
      for (const screen of ALL_SCREENS) {
        expect(typeof screen.loader).toBe("function");
      }
    });
  });

  describe("SSR Loader Safety: Unauthenticated Guard Verification", () => {
    test("All 33 admin screen loaders enforce unauthenticated SSR safety guards", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);

      for (const screen of ADMIN_SCREENS) {
        await screen.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth: unauthAuth,
          params: {},
          search: {},
        });
      }

      // Zero RPC queries may leak on unauthenticated SSR across admin screens
      expect(ensureSpy).not.toHaveBeenCalled();
      expect(prefetchSpy).not.toHaveBeenCalled();
    });

    test("All 42 organization screen loaders enforce unauthenticated SSR safety guards", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);

      for (const screen of ORGANIZATION_SCREENS) {
        await screen.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth: unauthAuth,
          params: {},
          search: {},
        });
      }

      // Zero RPC queries may leak on unauthenticated SSR across organization screens
      expect(ensureSpy).not.toHaveBeenCalled();
      expect(prefetchSpy).not.toHaveBeenCalled();
    });

    test("Protected public and shared loaders enforce unauthenticated SSR safety guards", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);

      const protectedPublicScreens = PUBLIC_SCREENS.filter(
        (s) => s.id === "SCR-PUB-17" || s.id === "SCR-PUB-18",
      );
      const protectedSharedScreens = SHARED_SCREENS.filter(
        (s) =>
          s.id === "SCR-SHR-11" ||
          s.id === "SCR-SHR-12" ||
          s.id === "SCR-SHR-13" ||
          s.id === "SCR-SHR-16",
      );

      for (const screen of [...protectedPublicScreens, ...protectedSharedScreens]) {
        await screen.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth: unauthAuth,
          params: {},
          search: {},
        });
      }

      expect(ensureSpy).not.toHaveBeenCalled();
      expect(prefetchSpy).not.toHaveBeenCalled();
    });

    test("Public queries safely prefetch during SSR without throwing", async () => {
      const ensureSpy = mock(async () => ({ items: [{ id: "trip-1" }] }));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);

      const landing = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-01");
      const gracePeriod = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-16");
      const seatMap = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-15");

      expect(landing?.loader).toBeDefined();
      expect(gracePeriod?.loader).toBeDefined();
      expect(seatMap?.loader).toBeDefined();

      await landing!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: {},
      });

      await gracePeriod!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: {},
      });

      await seatMap!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: {},
      });

      // Landing (1), Grace Period (1), Seat Map (browsePublicTrips + getSeatMap = 2)
      expect(ensureSpy).toHaveBeenCalled();
    });
  });

  describe("SSR Loader Resilience: Graceful Handling of Exceptions", () => {
    test("All 131 screen loaders absorb server errors gracefully without unhandled rejections", async () => {
      const rejectingQueryClient = {
        ensureQueryData: mock(async () => {
          throw new Error("RPC Network Timeout / 500 Internal Error");
        }),
        prefetchQuery: mock(async () => {
          throw new Error("RPC Network Timeout / 500 Internal Error");
        }),
      } as unknown as QueryClient;

      const auth = createMockAuth("admin-access-token");

      for (const screen of ALL_SCREENS) {
        expect(typeof screen.loader).toBe("function");

        // Should resolve cleanly even when queryClient throws
        await expect(
          screen.loader!({
            queryClient: rejectingQueryClient,
            orpc,
            auth,
            params: { surface: screen.surface, slug: screen.slug },
            search: { applicationId: "app-test-1" },
          }),
        ).resolves.toBeUndefined();
      }
    });
  });
});
