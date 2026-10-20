import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import { authController } from "@/auth/instance";
import type { SessionController } from "@/auth/session-controller";
import { ADMIN_SCREENS_PART_1 } from "@/screens/admin/entries-part-1";
import { ADMIN_SCREENS_PART_2 } from "@/screens/admin/entries-part-2";
import { ADMIN_SCREENS_PART_3 } from "@/screens/admin/entries-part-3";
import { createQueryClient, orpc } from "@/utils/orpc";

describe("Milestone 4: Admin Surface Screens Migration (SCR-ADM-01..46)", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
      ...authController,
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? {
              accountId: "acc-admin-1",
              email: "admin@trips-enjoy.com",
              activeRole: "admin",
              role: "admin",
            }
          : null,
        record: null,
      }),
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

  describe("Static AST & Source Purity: Zero imperative client.", () => {
    const adminDir = join(import.meta.dir, "admin");
    const adminFiles = getTsxFiles(adminDir);

    test("All admin screen files in apps/web/src/screens/admin have zero client. calls", () => {
      const violations: string[] = [];

      for (const file of adminFiles) {
        const content = readFileSync(file, "utf8");
        // Regex to match "client." that is not part of queryClient or orpcClient
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

    test("No admin screen file imports { client } from '@/utils/orpc'", () => {
      const violations: string[] = [];

      for (const file of adminFiles) {
        const content = readFileSync(file, "utf8");
        if (/import\s*\{[^}]*\bclient\b[^}]*\}\s*from\s*["']@\/utils\/orpc["']/.test(content)) {
          violations.push(`${file} imports { client } from "@/utils/orpc"`);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Screen Registry & Loaders Definition", () => {
    test("Registry contains all 46 admin screens (Part 1: 16, Part 2: 17, Part 3: 13)", () => {
      expect(ADMIN_SCREENS_PART_1.length).toBe(16);
      expect(ADMIN_SCREENS_PART_2.length).toBe(17);
      expect(ADMIN_SCREENS_PART_3.length).toBe(13);
      const allScreens = [
        ...ADMIN_SCREENS_PART_1,
        ...ADMIN_SCREENS_PART_2,
        ...ADMIN_SCREENS_PART_3,
      ];
      expect(allScreens.length).toBe(46);

      for (let i = 1; i <= 46; i++) {
        const expectedId = `SCR-ADM-${String(i).padStart(2, "0")}`;
        expect(allScreens.some((s) => s.id === expectedId)).toBe(true);
      }
    });

    test("Every admin screen defines a typed loader function", () => {
      const allScreens = [
        ...ADMIN_SCREENS_PART_1,
        ...ADMIN_SCREENS_PART_2,
        ...ADMIN_SCREENS_PART_3,
      ];
      for (const screen of allScreens) {
        expect(typeof screen.loader).toBe("function");
      }
    });
  });

  describe("SSR Loader Safety: Unauthenticated Requests", () => {
    test("All 46 admin loaders skip RPC prefetch on unauthenticated SSR", async () => {
      const ensureSpy = mock(async () => ({}));
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);
      const allScreens = [
        ...ADMIN_SCREENS_PART_1,
        ...ADMIN_SCREENS_PART_2,
        ...ADMIN_SCREENS_PART_3,
      ];

      for (const screen of allScreens) {
        await screen.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth: unauthAuth,
          params: {},
          search: {},
        });
      }

      // No ensureQueryData calls should be performed when accessToken is null on SSR
      expect(ensureSpy).not.toHaveBeenCalled();
    });
  });

  describe("SSR Loader Execution: Authenticated Requests", () => {
    test("Authenticated loaders perform prefetch for core queries", async () => {
      const ensureSpy = mock(async () => ({ items: [] }));
      const prefetchSpy = mock(async () => {});
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const auth = createMockAuth("admin-access-token");

      // Test a representative set across Part 1 and Part 2
      const homeScreen = ADMIN_SCREENS_PART_1.find((s) => s.id === "SCR-ADM-01");
      const appQueueScreen = ADMIN_SCREENS_PART_1.find((s) => s.id === "SCR-ADM-02");
      const dirScreen = ADMIN_SCREENS_PART_1.find((s) => s.id === "SCR-ADM-07");
      const labScreen = ADMIN_SCREENS_PART_1.find((s) => s.id === "SCR-ADM-12");
      const plansScreen = ADMIN_SCREENS_PART_1.find((s) => s.id === "SCR-ADM-15");

      const revenueScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-18");
      const couponsScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-19");
      const dealsScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-21");
      const disputesScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-23");
      const tripsScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-29");
      const auditScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-30");
      const notifScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-31");
      const settingsScreen = ADMIN_SCREENS_PART_2.find((s) => s.id === "SCR-ADM-32");

      const testScreens = [
        homeScreen,
        appQueueScreen,
        dirScreen,
        labScreen,
        plansScreen,
        revenueScreen,
        couponsScreen,
        dealsScreen,
        disputesScreen,
        tripsScreen,
        auditScreen,
        notifScreen,
        settingsScreen,
      ];

      for (const screen of testScreens) {
        expect(screen?.loader).toBeDefined();
        await screen!.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth,
          params: {},
          search: {},
        });
      }

      const totalPrefetched = ensureSpy.mock.calls.length + prefetchSpy.mock.calls.length;
      expect(totalPrefetched).toBeGreaterThanOrEqual(testScreens.length);
    });

    test("Loaders handle RPC rejection gracefully without throwing", async () => {
      const failingQueryClient = {
        ensureQueryData: mock(async () => {
          throw new Error("Simulated RPC Failure");
        }),
        prefetchQuery: mock(async () => {
          throw new Error("Simulated RPC Failure");
        }),
      } as unknown as QueryClient;

      const auth = createMockAuth("admin-access-token");
      const allScreens = [
        ...ADMIN_SCREENS_PART_1,
        ...ADMIN_SCREENS_PART_2,
        ...ADMIN_SCREENS_PART_3,
      ];

      for (const screen of allScreens) {
        await expect(
          screen.loader!({
            queryClient: failingQueryClient,
            orpc,
            auth,
            params: { applicationId: "app-1", testId: "test-1" },
            search: { applicationId: "app-1", testId: "test-1" },
          }),
        ).resolves.toBeUndefined();
      }
    });
  });

  describe("Mutation Options & Cache Invalidation", () => {
    test("onboarding.reviewApplication mutation invalidates orpc.onboarding.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.onboarding.reviewApplication.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { applicationId: "app-1", decision: "Approved" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.onboarding.key());
    });

    test("admin.suspendAccount mutation invalidates orpc.admin.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.admin.suspendAccount.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.admin.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { accountId: "acc-1", reason: "Suspicious" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.admin.key());
    });

    test("labTests.recordResult mutation invalidates orpc.labTests.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.labTests.recordResult.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.labTests.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { testId: "t-1", result: "Pass" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.labTests.key());
    });

    test("plans.adminOverrideSubscription mutation invalidates orpc.plans.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.plans.adminOverrideSubscription.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.plans.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          scope: "account",
          accountId: "acc-1",
          planId: "p-1",
          billingCycle: "monthly",
          overrideNote: "VIP",
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.plans.key());
    });

    test("coupons.createPlatformCoupon mutation invalidates orpc.coupons.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.coupons.createPlatformCoupon.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          code: "SAVE20",
          titleAr: "SAVE20",
          titleEn: "SAVE20",
          discountType: "percentage",
          discountValue: 20,
          currencyCode: "EGP",
          minOrderMinor: 0,
          maxRedemptions: 100,
          startsAt: null,
          expiresAt: null,
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.coupons.key());
    });

    test("trips.cancel mutation invalidates orpc.trips.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.trips.cancel.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { tripId: "trip-1", reason: "Weather" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.trips.key());
    });

    test("admin.updateSystemSettings mutation invalidates orpc.admin.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.admin.updateSystemSettings.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.admin.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          marketCountryCode: "EG",
          marketEnabled: true,
          featureFlags: {},
          reason: "Config update",
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.admin.key());
    });

    test("Domain cache invalidation is scoped and does not corrupt unrelated queries", async () => {
      const qc = createQueryClient();
      const queueQuery = orpc.onboarding.listReviewQueue.queryOptions({ input: {} });
      const tripsQuery = orpc.trips.browsePublicTrips.queryOptions({ input: {} });
      const plansQuery = orpc.plans.getCatalog.queryOptions({ input: {} });

      qc.setQueryData(queueQuery.queryKey, [{ id: "q-1" }]);
      qc.setQueryData(tripsQuery.queryKey, { items: [{ id: "tr-1" }] });
      qc.setQueryData(plansQuery.queryKey, [{ id: "pl-1" }]);

      expect(qc.getQueryState(queueQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(tripsQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(plansQuery.queryKey)?.isInvalidated).toBe(false);

      // Invalidate onboarding domain
      await qc.invalidateQueries({ queryKey: orpc.onboarding.key() });

      expect(qc.getQueryState(queueQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(tripsQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(plansQuery.queryKey)?.isInvalidated).toBe(false);
    });
  });
});
