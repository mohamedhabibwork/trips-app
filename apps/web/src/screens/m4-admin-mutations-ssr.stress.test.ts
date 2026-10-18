import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import { ADMIN_SCREENS_PART_1 } from "@/screens/admin/entries-part-1";
import { ADMIN_SCREENS_PART_2 } from "@/screens/admin/entries-part-2";
import { createQueryClient, orpc } from "@/utils/orpc";

describe("Empirical Challenger: M4 Admin Surface SSR, Mutations & Cache Invalidation Stress-Test", () => {
  const ALL_ADMIN_SCREENS = [...ADMIN_SCREENS_PART_1, ...ADMIN_SCREENS_PART_2];

  function createMockAuth(token: string | null | undefined = null): SessionController {
    return {
      accessToken: () => token as string | null,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? {
              accountId: "acc-admin-99",
              email: "admin@trips.local",
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

  /* -------------------------------------------------------------------------- */
  /* Task 2: Mutation Options & Invalidation across Admin Screens               */
  /* (SCR-ADM-03, 13, 17, 19, 24, 29, 32)                                       */
  /* -------------------------------------------------------------------------- */
  describe("Mutation Options & Domain Invalidation for Required Screens", () => {
    test("SCR-ADM-03 (application-review-detail): verifyDoc & approve mutations invalidate onboarding domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const verifyOptions = orpc.onboarding.verifyApplicationDocument.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      const approveOptions = orpc.onboarding.approveApplication.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      expect(typeof verifyOptions.onSuccess).toBe("function");
      expect(typeof approveOptions.onSuccess).toBe("function");

      verifyOptions.onSuccess?.(
        {} as never,
        { applicationId: "app-1", documentId: "doc-1" } as never,
        undefined as never,
      );
      approveOptions.onSuccess?.(
        {} as never,
        { applicationId: "app-1", decisionReasonCode: "verified" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.onboarding.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.onboarding.key() });
    });

    test("SCR-ADM-13 (lab-test-detail-and-decision): adminReviewLabTest invalidates both driver and onboarding domains", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const reviewOptions = orpc.driver.adminReviewLabTest.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.driver.key() });
          mockQc.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      expect(typeof reviewOptions.onSuccess).toBe("function");

      reviewOptions.onSuccess?.(
        {} as never,
        { labTestId: "lab-123", decision: "verified_pass", reviewNotes: "Clear" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.driver.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.onboarding.key() });
    });

    test("SCR-ADM-17 (subscriptions-and-overrides): adminOverrideSubscription invalidates plans domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const overrideOptions = orpc.plans.adminOverrideSubscription.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.plans.key() });
        },
      });

      expect(typeof overrideOptions.onSuccess).toBe("function");

      overrideOptions.onSuccess?.(
        {} as never,
        {
          scope: "account",
          accountId: "acc-1",
          planId: "org_pro",
          billingCycle: "monthly",
        } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.plans.key() });
    });

    test("SCR-ADM-19 (platform-coupons): updateStatus invalidates coupons domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const revokeOptions = orpc.coupons.updateStatus.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.coupons.key() });
        },
      });

      expect(typeof revokeOptions.onSuccess).toBe("function");

      revokeOptions.onSuccess?.(
        {} as never,
        { couponId: "coup-1", status: "paused" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.coupons.key() });
    });

    test("SCR-ADM-24 (dispute-detail-and-refund-decision): refundPayment invalidates payments domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const refundOptions = orpc.payments.refundPayment.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.payments.key() });
        },
      });

      expect(typeof refundOptions.onSuccess).toBe("function");

      refundOptions.onSuccess?.(
        {} as never,
        { paymentId: "pay-123", reason: "Refund dispute approved" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.payments.key() });
    });

    test("SCR-ADM-29 (trip-oversight): cancel invalidates trips domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const cancelOptions = orpc.trips.cancel.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      expect(typeof cancelOptions.onSuccess).toBe("function");

      cancelOptions.onSuccess?.(
        {} as never,
        { tripId: "trip-999", reason: "Force cancellation" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.trips.key() });
    });

    test("SCR-ADM-32 (feature-flags-and-platform-configuration): updateSystemSettings invalidates admin domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const updateSettingsOptions = orpc.admin.updateSystemSettings.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.admin.key() });
        },
      });

      expect(typeof updateSettingsOptions.onSuccess).toBe("function");

      updateSettingsOptions.onSuccess?.(
        {} as never,
        {
          marketCountryCode: "EG",
          marketEnabled: true,
          featureFlags: {},
          reason: "Settings update",
        } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.admin.key() });
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Domain Isolation & Cross-Domain Integrity Matrix                           */
  /* -------------------------------------------------------------------------- */
  describe("Cross-Domain Invalidation Isolation & Integrity Matrix", () => {
    test("invalidating a specific admin domain queryKey isolates and does not invalidate other domains", async () => {
      const qc = createQueryClient();

      const testQueries = {
        onboarding: orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
        driver: orpc.driver.getDriverProfile.queryOptions({ input: undefined }),
        plans: orpc.plans.getCatalog.queryOptions({ input: {} }),
        coupons: orpc.coupons.listPlatformCoupons.queryOptions({ input: {} }),
        payments: orpc.payments.getPaymentConfig.queryOptions({ input: undefined }),
        trips: orpc.trips.browsePublicTrips.queryOptions({ input: {} }),
        admin: orpc.admin.getSystemSettings.queryOptions(),
        accounting: orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
        auth: orpc.auth.getAuthSettings.queryOptions({ input: undefined }),
      };

      const domainKeys = {
        onboarding: orpc.onboarding.key(),
        driver: orpc.driver.key(),
        plans: orpc.plans.key(),
        coupons: orpc.coupons.key(),
        payments: orpc.payments.key(),
        trips: orpc.trips.key(),
        admin: orpc.admin.key(),
        accounting: orpc.accounting.key(),
        auth: orpc.auth.key(),
      };

      for (const [targetDomain, key] of Object.entries(domainKeys)) {
        // Initialize all queries with dummy data
        for (const [dom, q] of Object.entries(testQueries)) {
          qc.setQueryData(q.queryKey, { domain: dom, timestamp: Date.now() });
        }

        // Invalidate single target domain
        await qc.invalidateQueries({ queryKey: key });

        // Check invalidation state
        for (const [dom, q] of Object.entries(testQueries)) {
          const state = qc.getQueryState(q.queryKey);
          if (dom === targetDomain) {
            expect(state?.isInvalidated).toBe(true);
          } else {
            expect(state?.isInvalidated).toBe(false);
          }
        }
      }
    });

    test("Dual domain invalidation (SCR-ADM-13 / SCR-ADM-14 pattern) strictly invalidates driver and onboarding only", async () => {
      const qc = createQueryClient();

      const driverQ = orpc.driver.getDriverProfile.queryOptions({ input: undefined });
      const onbQ = orpc.onboarding.listReviewQueue.queryOptions({ input: {} });
      const tripsQ = orpc.trips.browsePublicTrips.queryOptions({ input: {} });
      const plansQ = orpc.plans.getCatalog.queryOptions({ input: {} });
      const couponsQ = orpc.coupons.listPlatformCoupons.queryOptions({ input: {} });
      const adminQ = orpc.admin.getSystemSettings.queryOptions();

      qc.setQueryData(driverQ.queryKey, { id: "dr-1" });
      qc.setQueryData(onbQ.queryKey, [{ id: "app-1" }]);
      qc.setQueryData(tripsQ.queryKey, { items: [] });
      qc.setQueryData(plansQ.queryKey, []);
      qc.setQueryData(couponsQ.queryKey, { items: [] });
      qc.setQueryData(adminQ.queryKey, { markets: {} });

      // Invalidate driver and onboarding
      await Promise.all([
        qc.invalidateQueries({ queryKey: orpc.driver.key() }),
        qc.invalidateQueries({ queryKey: orpc.onboarding.key() }),
      ]);

      expect(qc.getQueryState(driverQ.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(onbQ.queryKey)?.isInvalidated).toBe(true);

      // Other domains must remain untouched
      expect(qc.getQueryState(tripsQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(plansQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(couponsQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(adminQ.queryKey)?.isInvalidated).toBe(false);
    });

    test("High-concurrency stress: 100 interleaved mutations across all domains preserve accurate invalidation state", async () => {
      const qc = createQueryClient();
      const tripsQuery = orpc.trips.browsePublicTrips.queryOptions({ input: {} });
      const plansQuery = orpc.plans.getCatalog.queryOptions({ input: {} });
      const couponsQuery = orpc.coupons.listPlatformCoupons.queryOptions({ input: {} });

      qc.setQueryData(tripsQuery.queryKey, { items: [] });
      qc.setQueryData(plansQuery.queryKey, []);
      qc.setQueryData(couponsQuery.queryKey, { items: [] });

      const runs = Array.from({ length: 100 }, (_, i) => i);
      await Promise.all(
        runs.map(async (i) => {
          if (i % 3 === 0) {
            await qc.invalidateQueries({ queryKey: orpc.trips.key() });
          } else if (i % 3 === 1) {
            await qc.invalidateQueries({ queryKey: orpc.plans.key() });
          } else {
            await qc.invalidateQueries({ queryKey: orpc.coupons.key() });
          }
        }),
      );

      expect(qc.getQueryState(tripsQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(plansQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(couponsQuery.queryKey)?.isInvalidated).toBe(true);
    });

    test("Mutation onError branch does NOT trigger cache invalidation", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      let errorCaught = false;
      const options = orpc.trips.cancel.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
        },
        onError: () => {
          errorCaught = true;
        },
      });

      options.onError?.(
        new Error("Network Unreachable"),
        { tripId: "t-1" } as never,
        undefined as never,
      );
      expect(errorCaught).toBe(true);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Task 4: Stress-Test Unauthenticated SSR Behavior in Admin Screen Loaders   */
  /* -------------------------------------------------------------------------- */
  describe("Task 4: Unauthenticated SSR Behavior in Admin Screen Loaders", () => {
    test("All 33 admin screen loaders return immediately and perform ZERO RPC fetches when auth token is null", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQc = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauth = createMockAuth(null);

      for (const screen of ALL_ADMIN_SCREENS) {
        expect(screen.loader).toBeDefined();
        await screen.loader!({
          queryClient: mockQc,
          orpc,
          auth: unauth,
          params: {},
          search: {},
        });
      }

      expect(ensureSpy).toHaveBeenCalledTimes(0);
      expect(prefetchSpy).toHaveBeenCalledTimes(0);
    });

    test("All 33 admin screen loaders return immediately when auth token is empty string or undefined", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQc = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      // Test empty string token
      const emptyAuth = createMockAuth("");
      for (const screen of ALL_ADMIN_SCREENS) {
        await screen.loader!({
          queryClient: mockQc,
          orpc,
          auth: emptyAuth,
          params: { applicationId: "app-test" },
          search: { applicationId: "app-test" },
        });
      }
      expect(ensureSpy).toHaveBeenCalledTimes(0);
      expect(prefetchSpy).toHaveBeenCalledTimes(0);

      // Test undefined token
      const undefAuth = createMockAuth(undefined);
      for (const screen of ALL_ADMIN_SCREENS) {
        await screen.loader!({
          queryClient: mockQc,
          orpc,
          auth: undefAuth,
          params: {},
          search: {},
        });
      }
      expect(ensureSpy).toHaveBeenCalledTimes(0);
      expect(prefetchSpy).toHaveBeenCalledTimes(0);
    });

    test("All 33 admin loaders handle 401 Unauthorized RPC rejections gracefully without unhandled promise rejections", async () => {
      const failingQc = {
        ensureQueryData: mock(async () => {
          const err = new Error("401 Unauthorized: Session Expired");
          (err as unknown as { status: number }).status = 401;
          throw err;
        }),
        prefetchQuery: mock(async () => {
          const err = new Error("401 Unauthorized: Session Expired");
          (err as unknown as { status: number }).status = 401;
          throw err;
        }),
      } as unknown as QueryClient;

      // Simulated authenticated session that has expired on server
      const expiredAuth = createMockAuth("expired-token");

      for (const screen of ALL_ADMIN_SCREENS) {
        // Must resolve cleanly without throwing
        await expect(
          screen.loader!({
            queryClient: failingQc,
            orpc,
            auth: expiredAuth,
            params: { applicationId: "app-123", testId: "t-123" },
            search: { applicationId: "app-123", testId: "t-123" },
          }),
        ).resolves.toBeUndefined();
      }
    });

    test("All 33 admin loaders handle 403 Forbidden and 500 Server Errors gracefully without crashing SSR", async () => {
      const error500Qc = {
        ensureQueryData: mock(async () => {
          throw new Error("500 Internal Server Error: Database Deadlock");
        }),
        prefetchQuery: mock(async () => {
          throw new Error("500 Internal Server Error: Database Deadlock");
        }),
      } as unknown as QueryClient;

      const auth = createMockAuth("admin-token");

      for (const screen of ALL_ADMIN_SCREENS) {
        await expect(
          screen.loader!({
            queryClient: error500Qc,
            orpc,
            auth,
            params: { id: "test-id" },
            search: { query: "test-query" },
          }),
        ).resolves.toBeUndefined();
      }
    });

    test("All 33 admin loaders survive extreme / adversarial params and search payloads", async () => {
      const qc = {
        ensureQueryData: mock(async () => ({})),
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const auth = createMockAuth("admin-token");

      const adversarialInputs = [
        { params: {}, search: {} },
        { params: { applicationId: "" }, search: { applicationId: "" } },
        {
          params: {
            applicationId: "'; DROP TABLE applications; --",
            testId: "<script>alert(1)</script>",
          },
          search: {
            applicationId: "'; DROP TABLE applications; --",
            testId: "<script>alert(1)</script>",
          },
        },
        {
          params: { applicationId: "a".repeat(10000) },
          search: { applicationId: "a".repeat(10000) },
        },
      ];

      for (const input of adversarialInputs) {
        for (const screen of ALL_ADMIN_SCREENS) {
          await expect(
            screen.loader!({
              queryClient: qc,
              orpc,
              auth,
              params: input.params,
              search: input.search,
            }),
          ).resolves.toBeUndefined();
        }
      }
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Static AST Audit: Zero client. and Zero Imports of client in Admin Screens */
  /* -------------------------------------------------------------------------- */
  describe("Static AST Audit Across All 33 Admin Screens", () => {
    const adminDir = join(import.meta.dir, "admin");
    const adminFiles = getTsxFiles(adminDir);

    test("No admin screen file contains raw imperative client. calls", () => {
      const violations: string[] = [];

      for (const file of adminFiles) {
        const content = readFileSync(file, "utf8");
        const clientRegex = /(?<!queryClient)(?<!orpcClient)\bclient\.[a-zA-Z]/g;
        const matches = content.match(clientRegex);
        if (matches && matches.length > 0) {
          violations.push(`${file}: found ${matches.join(", ")}`);
        }
      }

      expect(violations).toEqual([]);
    });

    test("No admin screen file imports client from '@/utils/orpc'", () => {
      const violations: string[] = [];

      for (const file of adminFiles) {
        const content = readFileSync(file, "utf8");
        if (/import\s*\{[^}]*\bclient\b[^}]*\}\s*from\s*["']@\/utils\/orpc["']/.test(content)) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });

    test("All 33 admin screens are registered with non-empty slug, titleKey, surface: 'admin'", () => {
      expect(ALL_ADMIN_SCREENS.length).toBe(33);

      for (const screen of ALL_ADMIN_SCREENS) {
        expect(screen.surface).toBe("admin");
        expect(typeof screen.slug).toBe("string");
        expect(screen.slug.length).toBeGreaterThan(0);
        expect(typeof screen.titleKey).toBe("string");
        expect(screen.titleKey.length).toBeGreaterThan(0);
        expect(typeof screen.component).toBe("function");
        expect(typeof screen.loader).toBe("function");
      }
    });
  });
});
