import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import { authController } from "@/auth/instance";
import type { SessionController } from "@/auth/session-controller";
import { PUBLIC_SCREENS } from "@/screens/public";
import { SHARED_SCREENS } from "@/screens/shared";
import { orpc } from "@/utils/orpc";

describe("Milestone 3: Public & Shared Screens Migration (M3)", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
      ...authController,
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
    } as unknown as SessionController;
  }

  function getTsxFiles(dir: string): string[] {
    const results: string[] = [];
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...getTsxFiles(fullPath));
      } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
        results.push(fullPath);
      }
    }
    return results;
  }

  describe("Static AST & Source Integrity: Zero imperative client.", () => {
    const screensDir = join(import.meta.dir);
    const publicDir = join(screensDir, "public");
    const sharedDir = join(screensDir, "shared");
    const onboardingStateFile = join(screensDir, "onboarding-state.ts");

    const targetFiles = [...getTsxFiles(publicDir), ...getTsxFiles(sharedDir), onboardingStateFile];

    test("All public screens, shared screens, and onboarding-state have zero client. calls", () => {
      const violations: string[] = [];

      for (const file of targetFiles) {
        const content = readFileSync(file, "utf8");
        // Regex to match "client." that is not part of a comment or queryClient
        const clientRegex = /(?<!queryClient)(?<!orpcClient)\bclient\.[a-zA-Z]/g;
        const matches = content.match(clientRegex);
        if (matches && matches.length > 0) {
          violations.push(
            `${file}: found ${matches.length} client. references: ${matches.join(", ")}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });

    test("No target file imports { client } from '@/utils/orpc'", () => {
      const violations: string[] = [];

      for (const file of targetFiles) {
        const content = readFileSync(file, "utf8");
        // Check for import containing client from orpc
        if (/import\s*\{[^}]*\bclient\b[^}]*\}\s*from\s*["']@\/utils\/orpc["']/.test(content)) {
          violations.push(`${file} imports { client } from "@/utils/orpc"`);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Screen Loaders Definition in Registry", () => {
    test("PUBLIC_SCREENS defines loaders for expected screens", () => {
      const screensWithLoaders = PUBLIC_SCREENS.filter((s) => typeof s.loader === "function").map(
        (s) => s.id,
      );

      // Verify SCR-PUB-01 (landing), 04, 05, 06 (sign-up lookups), 16 (deletion grace period), 17 (app status), 18 (appeal)
      expect(screensWithLoaders).toContain("SCR-PUB-01");
      expect(screensWithLoaders).toContain("SCR-PUB-04");
      expect(screensWithLoaders).toContain("SCR-PUB-05");
      expect(screensWithLoaders).toContain("SCR-PUB-06");
      expect(screensWithLoaders).toContain("SCR-PUB-16");
      expect(screensWithLoaders).toContain("SCR-PUB-17");
      expect(screensWithLoaders).toContain("SCR-PUB-18");
    });

    test("SHARED_SCREENS defines loaders for expected screens", () => {
      const screensWithLoaders = SHARED_SCREENS.filter((s) => typeof s.loader === "function").map(
        (s) => s.id,
      );

      // Verify SCR-SHR-11 (notifications), 12 (receipts), 13 (role switcher), 15 (seat map), 16 (upload)
      expect(screensWithLoaders).toContain("SCR-SHR-11");
      expect(screensWithLoaders).toContain("SCR-SHR-12");
      expect(screensWithLoaders).toContain("SCR-SHR-13");
      expect(screensWithLoaders).toContain("SCR-SHR-15");
      expect(screensWithLoaders).toContain("SCR-SHR-16");
    });
  });

  describe("SSR Loader Safety: Unauthenticated Requests", () => {
    test("Protected public loaders skip RPC prefetch on unauthenticated SSR", async () => {
      const ensureSpy = mock(async () => ({}));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);

      const pub17 = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-17");
      const pub18 = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-18");

      expect(pub17?.loader).toBeDefined();
      expect(pub18?.loader).toBeDefined();

      await pub17!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: { applicationId: "app-123" },
      });

      await pub18!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: { applicationId: "app-123" },
      });

      // No ensureQueryData calls should occur for unauthenticated sessions
      expect(ensureSpy).not.toHaveBeenCalled();
    });

    test("Protected shared loaders skip RPC prefetch on unauthenticated SSR", async () => {
      const ensureSpy = mock(async () => ({}));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);

      const protectedScreens = SHARED_SCREENS.filter((s) =>
        ["SCR-SHR-11", "SCR-SHR-12", "SCR-SHR-13", "SCR-SHR-16"].includes(s.id),
      );

      for (const screen of protectedScreens) {
        expect(screen.loader).toBeDefined();
        await screen.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth: unauthAuth,
          params: {},
          search: {},
        });
      }

      // No ensureQueryData calls should occur for unauthenticated sessions
      expect(ensureSpy).not.toHaveBeenCalled();
    });
  });

  describe("SSR Loader Execution: Authenticated Requests", () => {
    test("Protected public loaders perform prefetch when authenticated", async () => {
      const ensureSpy = mock(async () => ({ status: "PENDING" }));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const auth = createMockAuth("supplier-token");
      const pub17 = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-17");

      await pub17!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth,
        params: {},
        search: { applicationId: "app-123" },
      });

      expect(ensureSpy).toHaveBeenCalled();
    });

    test("Protected shared loaders perform prefetch when authenticated", async () => {
      const ensureSpy = mock(async () => ({ items: [] }));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const auth = createMockAuth("authenticated-user");
      const shr11 = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-11");
      const shr12 = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-12");
      const shr16 = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-16");

      await shr11!.loader!({ queryClient: mockQueryClient, orpc, auth, params: {}, search: {} });
      await shr12!.loader!({ queryClient: mockQueryClient, orpc, auth, params: {}, search: {} });
      await shr16!.loader!({ queryClient: mockQueryClient, orpc, auth, params: {}, search: {} });

      expect(ensureSpy).toHaveBeenCalledTimes(3);
    });

    test("Public loaders execute prefetching without auth check", async () => {
      const ensureSpy = mock(async () => ({ items: [] }));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);
      const pub01 = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-01");
      const pub16 = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-16");

      await pub01!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: {},
      });

      await pub16!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: {},
      });

      expect(ensureSpy).toHaveBeenCalledTimes(2);
    });

    test("Seat map loader prefetches public trips and seat map for first trip", async () => {
      const ensureSpy = mock(async () => {
        // Return dummy trip for trips.browsePublicTrips
        return { items: [{ id: "trip-456" }] };
      });
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);
      const shr15 = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-15");

      await shr15!.loader!({
        queryClient: mockQueryClient,
        orpc,
        auth: unauthAuth,
        params: {},
        search: {},
      });

      // Called first for browsePublicTrips, then for getSeatMap
      expect(ensureSpy).toHaveBeenCalledTimes(2);
    });

    test("Loaders handle RPC rejection gracefully without throwing during SSR", async () => {
      const failingQueryClient = {
        ensureQueryData: mock(async () => {
          throw new Error("RPC Network error");
        }),
        prefetchQuery: mock(async () => {
          throw new Error("RPC Network error");
        }),
      } as unknown as QueryClient;

      const auth = createMockAuth("valid-token");

      const screensWithTryCatch = [
        ...PUBLIC_SCREENS.filter((s) => ["SCR-PUB-17", "SCR-PUB-18"].includes(s.id)),
        ...SHARED_SCREENS.filter((s) =>
          ["SCR-SHR-11", "SCR-SHR-12", "SCR-SHR-13", "SCR-SHR-15", "SCR-SHR-16"].includes(s.id),
        ),
      ];

      for (const screen of screensWithTryCatch) {
        // Must not throw error
        await expect(
          screen.loader!({
            queryClient: failingQueryClient,
            orpc,
            auth,
            params: {},
            search: { applicationId: "app-1" },
          }),
        ).resolves.toBeUndefined();
      }
    });
  });
});
