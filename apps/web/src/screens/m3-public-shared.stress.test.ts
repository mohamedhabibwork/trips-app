import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import { PUBLIC_SCREENS } from "@/screens/public";
import { SHARED_SCREENS } from "@/screens/shared";
import { applicationMimeType } from "@/screens/public/common/application-documents";
import { verificationTargets } from "@/screens/public/sign-up/supplier-onboarding";
import { dateInputToIso, isFutureDate, splitList } from "@/screens/public/sign-up/supplier-fields";
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
    test("applicationMimeType accepts documents and photos and rejects anything else", () => {
      // Arrange
      const picked = [
        { name: "registry.pdf", type: "" },
        { name: "photo.PNG", type: "" },
        { name: "scan", type: "image/jpeg" },
        { name: "modern.webp", type: "" },
        { name: "notes.txt", type: "text/plain" },
      ];

      // Act
      const types = picked.map((file) => applicationMimeType(file));

      // Assert
      expect(types).toEqual(["application/pdf", "image/png", "image/jpeg", "image/webp", null]);
    });

    test("verificationTargets keeps the server order and falls back to email then phone", () => {
      // Arrange
      const account = { email: "owner@example.test", phone: "+201000000000" };

      // Act
      const fromServer = verificationTargets(
        [{ targetIdentifier: "owner@example.test" }, { targetIdentifier: "+201000000000" }],
        account,
      );
      const fallback = verificationTargets(undefined, account);

      // Assert
      expect(fromServer).toEqual(["owner@example.test", "+201000000000"]);
      expect(fallback).toEqual(["owner@example.test", "+201000000000"]);
    });

    test("date helpers turn a date input into ISO and reject expired or malformed dates", () => {
      // Arrange
      const now = new Date("2026-10-19T12:00:00.000Z");

      // Act
      const iso = dateInputToIso("2027-01-31");

      // Assert
      expect(iso).toBe("2027-01-31T00:00:00.000Z");
      expect(dateInputToIso("31/01/2027")).toBeNull();
      expect(isFutureDate("2027-01-31", now)).toBe(true);
      expect(isFutureDate("2026-10-01", now)).toBe(false);
    });

    test("splitList reads comma, Arabic comma and newline separated answers", () => {
      // Arrange
      const answer = "Canon R5, Sony A7 IV،Nikon Z8\n , ";

      // Act
      const entries = splitList(answer);

      // Assert
      expect(entries).toEqual(["Canon R5", "Sony A7 IV", "Nikon Z8"]);
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
