import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import { PUBLIC_SCREENS } from "@/screens/public";
import { SHARED_SCREENS } from "@/screens/shared";
import { ensureSupplierSession, uploadItemsToDocuments } from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";

describe("Empirical Challenger: Milestone 3 Public & Shared Migration Stress Test", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? { accountId: "acc-123", email: "test@example.com", activeRole: "admin", role: "admin" }
          : null,
        record: null,
      }),
    } as unknown as SessionController;
  }

  function getTargetFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...getTargetFiles(fullPath));
      } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
        // Exclude test files from AST scan
        if (!fullPath.includes(".test.")) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }

  const screensDir = join(import.meta.dir);
  const targetFiles = [
    ...getTargetFiles(join(screensDir, "public")),
    ...getTargetFiles(join(screensDir, "shared")),
    join(screensDir, "onboarding-state.ts"),
  ];

  describe("Adversarial AST & Code Purity Inspection", () => {
    test("Zero occurrences of client. or client[ in any form across target files", () => {
      const violations: string[] = [];
      const forbiddenPattern = /(?<!queryClient)(?<!orpcClient)\bclient(\.|\[)/g;

      for (const file of targetFiles) {
        const content = readFileSync(file, "utf8");
        const matches = content.match(forbiddenPattern);
        if (matches && matches.length > 0) {
          violations.push(`${file}: found ${matches.length} matches: ${matches.join(", ")}`);
        }
      }

      expect(violations).toEqual([]);
    });

    test("Zero imports of client from orpc utils (including aliased or star imports)", () => {
      const violations: string[] = [];
      const forbiddenImportPattern =
        /import\s*(\*\s*as\s+\w+|\{[^}]*\bclient\b[^}]*\})\s*from\s*["'][^"']*\/utils\/orpc["']/g;

      for (const file of targetFiles) {
        const content = readFileSync(file, "utf8");
        const matches = content.match(forbiddenImportPattern);
        if (matches && matches.length > 0) {
          violations.push(`${file}: forbidden import found: ${matches.join("; ")}`);
        }
      }

      expect(violations).toEqual([]);
    });

    test("Zero useEffect hooks executing data fetching or RPC mutations", () => {
      const violations: string[] = [];
      const rpcInEffectPattern =
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[^}]*(\borpc\.|\.queryOptions|\.mutateAsync|\.mutate\b)[^}]*\}/gs;

      for (const file of targetFiles) {
        const content = readFileSync(file, "utf8");
        const matches = content.match(rpcInEffectPattern);
        if (matches && matches.length > 0) {
          violations.push(`${file}: found RPC call inside useEffect`);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Public Screens Loader Stress Testing", () => {
    const screensWithLoaders = PUBLIC_SCREENS.filter((s) => typeof s.loader === "function");

    test("All public screen loaders complete gracefully when given empty or malformed search objects", async () => {
      const mockQc = {
        ensureQueryData: mock(async () => ({ items: [] })),
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;
      const auth = createMockAuth("supplier-token");

      const malformedSearches = [
        {},
        { applicationId: null },
        { applicationId: undefined },
        { applicationId: "" },
        { applicationId: 12345 },
        { applicationId: ["arr", "item"] },
        { applicationId: { nested: true } },
      ];

      for (const screen of screensWithLoaders) {
        for (const search of malformedSearches) {
          await expect(
            screen.loader!({
              queryClient: mockQc,
              orpc,
              auth,
              params: {},
              search: search as Record<string, unknown>,
            }),
          ).resolves.toBeUndefined();
        }
      }
    });

    test("Protected public loaders (SCR-PUB-17, SCR-PUB-18) strictly block unauthenticated execution", async () => {
      const falsyTokens = [null, undefined, ""];

      for (const token of falsyTokens) {
        const auth = createMockAuth(token);
        const ensureSpy = mock(async () => ({}));
        const mockQc = {
          ensureQueryData: ensureSpy,
          prefetchQuery: mock(async () => {}),
        } as unknown as QueryClient;

        for (const id of ["SCR-PUB-17", "SCR-PUB-18"]) {
          const screen = PUBLIC_SCREENS.find((s) => s.id === id);
          expect(screen).toBeDefined();

          await screen!.loader!({
            queryClient: mockQc,
            orpc,
            auth,
            params: {},
            search: { applicationId: "app-test-id" },
          });

          expect(ensureSpy).not.toHaveBeenCalled();
        }
      }
    });

    test("Protected public loaders do not crash SSR when orpc server returns 500 Internal Error", async () => {
      const failingQc = {
        ensureQueryData: mock(async () => {
          throw new Error("HTTP 500: Database Connection Refused");
        }),
        prefetchQuery: mock(async () => {
          throw new Error("HTTP 500: Database Connection Refused");
        }),
      } as unknown as QueryClient;

      const auth = createMockAuth("valid-token");

      const protectedScreens = PUBLIC_SCREENS.filter((s) =>
        ["SCR-PUB-17", "SCR-PUB-18"].includes(s.id),
      );

      for (const screen of protectedScreens) {
        await expect(
          screen.loader!({
            queryClient: failingQc,
            orpc,
            auth,
            params: {},
            search: { applicationId: "app-xyz" },
          }),
        ).resolves.toBeUndefined();
      }
    });
  });

  describe("Shared Screens Loader Stress Testing", () => {
    test("Protected shared screens (SCR-SHR-11, 12, 13, 16) strictly block unauthenticated execution", async () => {
      for (const token of [null, undefined, ""]) {
        const auth = createMockAuth(token);
        const ensureSpy = mock(async () => ({}));
        const mockQc = {
          ensureQueryData: ensureSpy,
          prefetchQuery: mock(async () => {}),
        } as unknown as QueryClient;

        const protectedIds = ["SCR-SHR-11", "SCR-SHR-12", "SCR-SHR-13", "SCR-SHR-16"];
        for (const id of protectedIds) {
          const screen = SHARED_SCREENS.find((s) => s.id === id);
          expect(screen).toBeDefined();

          await screen!.loader!({
            queryClient: mockQc,
            orpc,
            auth,
            params: {},
            search: {},
          });

          expect(ensureSpy).not.toHaveBeenCalled();
        }
      }
    });

    test("SCR-SHR-15 (seat-map) handles empty trips array without querying seat map", async () => {
      const calls: string[] = [];
      const mockQc = {
        ensureQueryData: mock(async () => {
          calls.push("browsePublicTrips");
          return { items: [] }; // No trips available
        }),
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const screen = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-15");
      expect(screen).toBeDefined();

      await screen!.loader!({
        queryClient: mockQc,
        orpc,
        auth: createMockAuth(null),
        params: {},
        search: {},
      });

      expect(calls).toEqual(["browsePublicTrips"]);
    });

    test("SCR-SHR-15 (seat-map) handles null or malformed response from browsePublicTrips", async () => {
      const responses = [null, undefined, {}, { items: null }];

      const screen = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-15");
      expect(screen).toBeDefined();

      for (const resp of responses) {
        const mockQc = {
          ensureQueryData: mock(async () => resp),
          prefetchQuery: mock(async () => {}),
        } as unknown as QueryClient;

        await expect(
          screen!.loader!({
            queryClient: mockQc,
            orpc,
            auth: createMockAuth(null),
            params: {},
            search: {},
          }),
        ).resolves.toBeUndefined();
      }
    });

    test("SCR-SHR-13 (role/org switcher) executes Promise.allSettled and does not reject on partial failure", async () => {
      let callCount = 0;
      const mockQc = {
        ensureQueryData: mock(async () => {
          callCount++;
          if (callCount === 1) {
            throw new Error("Org settings service unavailable");
          }
          return { roles: [] };
        }),
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const screen = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-13");
      expect(screen).toBeDefined();

      await expect(
        screen!.loader!({
          queryClient: mockQc,
          orpc,
          auth: createMockAuth("valid-token"),
          params: {},
          search: {},
        }),
      ).resolves.toBeUndefined();

      expect(callCount).toBe(2);
    });
  });

  describe("Onboarding State Helper Stress Testing", () => {
    test("uploadItemsToDocuments correctly sanitizes special characters and identifies mime types", () => {
      const testFiles = [
        { name: "normal.pdf", status: "done" as const },
        { name: "image.PNG", status: "done" as const },
        { name: "photo.jpeg", status: "done" as const },
        { name: "modern.webp", status: "done" as const },
        { name: "../../malicious/path.pdf", status: "done" as const },
        { name: "strange#name$?& space.jpg", status: "done" as const },
        { name: "", status: "done" as const },
      ];

      const docs = uploadItemsToDocuments(testFiles, "national_id");
      expect(docs.length).toBe(7);

      expect(docs[0].mimeType).toBe("application/pdf");
      expect(docs[1].mimeType).toBe("image/png");
      expect(docs[2].mimeType).toBe("image/jpeg");
      expect(docs[3].mimeType).toBe("image/webp");
      expect(docs[4].mimeType).toBe("application/pdf");
      expect(docs[4].storageKey).not.toContain("../");
      expect(docs[4].storageKey).toContain("malicious_path.pdf");
      expect(docs[5].storageKey).toContain("strange_name____space.jpg");
      expect(docs[6].storageKey).toContain("file_7");
    });

    test("uploadItemsToDocuments handles empty items array cleanly", () => {
      const docs = uploadItemsToDocuments([], "portfolio_sample");
      expect(docs).toEqual([]);
    });

    test("ensureSupplierSession is a no-op when already authenticated", async () => {
      const signInSpy = mock(() => {});

      await ensureSupplierSession({
        isAuthenticated: true,
        signInWithSession: signInSpy,
        role: "platform_driver",
        fullName: "Test Driver",
        email: "driver@example.com",
        phone: "+201000000000",
      });

      expect(signInSpy).not.toHaveBeenCalled();
    });
  });

  describe("High-Concurrency Stress Harness", () => {
    test("100 concurrent executions of all public & shared screen loaders complete cleanly", async () => {
      const mockQc = {
        ensureQueryData: mock(async () => ({ items: [] })),
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;
      const auth = createMockAuth("concurrent-auth-token");

      const allLoaders = [
        ...PUBLIC_SCREENS.filter((s) => s.loader).map((s) => s.loader!),
        ...SHARED_SCREENS.filter((s) => s.loader).map((s) => s.loader!),
      ];

      const tasks: Promise<unknown>[] = [];

      for (let i = 0; i < 100; i++) {
        for (const loader of allLoaders) {
          tasks.push(
            loader({
              queryClient: mockQc,
              orpc,
              auth,
              params: {},
              search: { applicationId: `app-${i}` },
            }),
          );
        }
      }

      const results = await Promise.allSettled(tasks);
      const rejections = results.filter((r) => r.status === "rejected");
      expect(rejections).toEqual([]);
    });
  });
});
