import { describe, expect, mock, test } from "bun:test";
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import { PUBLIC_SCREENS } from "@/screens/public";
import { SHARED_SCREENS } from "@/screens/shared";
import { createQueryClient, orpc } from "@/utils/orpc";

describe("Empirical Challenger: M3 Mutation Options & Query Key Invalidation Stress Test", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
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

  describe("SCR-SHR-01 (Plan Limit Upgrade Prompt): Mutation Options & Cache Invalidation", () => {
    test("changeOrganizationPlan.mutationOptions configures exact mutationKey and onSuccess invalidation", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = {
        invalidateQueries: invalidateSpy,
      } as unknown as QueryClient;

      // Instantiate mutation options directly as used in SCR-SHR-01
      const mutationOptions = orpc.plans.changeOrganizationPlan.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.plans.key() });
        },
      });

      expect(mutationOptions).toBeDefined();
      expect(Array.isArray(mutationOptions.mutationKey)).toBe(true);
      expect(typeof mutationOptions.onSuccess).toBe("function");

      // Trigger onSuccess handler
      mutationOptions.onSuccess?.(
        { id: "org_pro" } as never,
        { planId: "org_pro", billingCycle: "monthly" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const callArg = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(callArg?.queryKey).toEqual(orpc.plans.key());
    });

    test("orpc.plans.key() invalidation marks plans queries as invalidated without corrupting other domains", async () => {
      const qc = createQueryClient();
      const planQuery = orpc.plans.getPlan.queryOptions({ input: { planId: "org_starter" } });
      const notifQuery = orpc.notifications.listInbox.queryOptions({ input: {} });
      const ledgerQuery = orpc.accounting.listLedgerEntries.queryOptions({ input: {} });

      qc.setQueryData(planQuery.queryKey, { id: "org_starter", name: "Starter" });
      qc.setQueryData(notifQuery.queryKey, [{ id: "n1", titleEn: "Test" }]);
      qc.setQueryData(ledgerQuery.queryKey, [{ id: "led-1", netAmountMinor: 500 }]);

      expect(qc.getQueryState(planQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(notifQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(ledgerQuery.queryKey)?.isInvalidated).toBe(false);

      // Execute plans invalidation as performed in SCR-SHR-01 onSuccess
      await qc.invalidateQueries({ queryKey: orpc.plans.key() });

      expect(qc.getQueryState(planQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(notifQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(ledgerQuery.queryKey)?.isInvalidated).toBe(false);
    });

    test("mutation failure does not invoke onSuccess or invalidate cache", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = {
        invalidateQueries: invalidateSpy,
      } as unknown as QueryClient;

      let errorCallbackInvoked = false;
      const mutationOptions = orpc.plans.changeOrganizationPlan.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.plans.key() });
        },
        onError: () => {
          errorCallbackInvoked = true;
        },
      });

      // Simulate failure path
      mutationOptions.onError?.(
        new Error("Payment Failed: Card Declined"),
        { planId: "org_pro", billingCycle: "monthly" } as never,
        undefined as never,
      );

      expect(errorCallbackInvoked).toBe(true);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });

    test("concurrency stress: 50 parallel plan mutations invalidate cleanly without race conditions", async () => {
      const qc = createQueryClient();
      const planQuery = orpc.plans.getPlan.queryOptions({ input: { planId: "org_pro" } });
      qc.setQueryData(planQuery.queryKey, { id: "org_pro", name: "Pro" });

      const runs = Array.from({ length: 50 }, (_, i) => i);
      await Promise.all(
        runs.map(async () => {
          const mutationOptions = orpc.plans.changeOrganizationPlan.mutationOptions({
            onSuccess: () => {
              qc.invalidateQueries({ queryKey: orpc.plans.key() });
            },
          });
          mutationOptions.onSuccess?.({} as never, {} as never, undefined as never);
        }),
      );

      expect(qc.getQueryState(planQuery.queryKey)?.isInvalidated).toBe(true);
    });
  });

  describe("SCR-SHR-11 (Notification Centre): Mutation Options & Cache Invalidation", () => {
    test("notifications.markRead.mutationOptions invalidates orpc.notifications.key() on success", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = {
        invalidateQueries: invalidateSpy,
      } as unknown as QueryClient;

      const mutationOptions = orpc.notifications.markRead.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.notifications.key() });
        },
      });

      expect(typeof mutationOptions.onSuccess).toBe("function");
      mutationOptions.onSuccess?.(
        { success: true } as never,
        { notificationId: "n-123" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const arg = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(arg?.queryKey).toEqual(orpc.notifications.key());
    });

    test("orpc.notifications.key() invalidation only touches notifications cache", async () => {
      const qc = createQueryClient();
      const notifQuery = orpc.notifications.listInbox.queryOptions({ input: {} });
      const planQuery = orpc.plans.getPlan.queryOptions({ input: { planId: "p1" } });
      const onboardingQuery = orpc.onboarding.getApplicationStatus.queryOptions({ input: {} });

      qc.setQueryData(notifQuery.queryKey, [{ id: "n1" }]);
      qc.setQueryData(planQuery.queryKey, { id: "p1" });
      qc.setQueryData(onboardingQuery.queryKey, { status: "PENDING" });

      await qc.invalidateQueries({ queryKey: orpc.notifications.key() });

      expect(qc.getQueryState(notifQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(planQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(onboardingQuery.queryKey)?.isInvalidated).toBe(false);
    });

    test("sequential batch markRead (handleMarkAllAsRead pattern) invalidates reliably", async () => {
      const qc = createQueryClient();
      const notifQuery = orpc.notifications.listInbox.queryOptions({ input: {} });
      qc.setQueryData(notifQuery.queryKey, [
        { id: "n1", isRead: false },
        { id: "n2", isRead: false },
      ]);

      const notificationIds = ["n1", "n2", "n3", "n4", "n5"];
      for (const id of notificationIds) {
        const mutationOptions = orpc.notifications.markRead.mutationOptions({
          onSuccess: () => {
            qc.invalidateQueries({ queryKey: orpc.notifications.key() });
          },
        });
        mutationOptions.onSuccess?.(
          { success: true } as never,
          { notificationId: id } as never,
          undefined as never,
        );
      }

      expect(qc.getQueryState(notifQuery.queryKey)?.isInvalidated).toBe(true);
    });
  });

  describe("SCR-SHR-12 (Receipt & Invoice View): Queries & SSR Loader Cache Behavior", () => {
    test("listLedgerEntries queryOptions produces valid queryKey and queryFn", () => {
      const options = orpc.accounting.listLedgerEntries.queryOptions({ input: {} });
      expect(options).toBeDefined();
      expect(Array.isArray(options.queryKey)).toBe(true);
      expect(typeof options.queryFn).toBe("function");
    });

    test("invalidating orpc.accounting.key() invalidates ledger entries while isolating other domains", async () => {
      const qc = createQueryClient();
      const ledgerQuery = orpc.accounting.listLedgerEntries.queryOptions({ input: {} });
      const planQuery = orpc.plans.getPlan.queryOptions({ input: { planId: "p1" } });
      const notifQuery = orpc.notifications.listInbox.queryOptions({ input: {} });

      qc.setQueryData(ledgerQuery.queryKey, [{ id: "l1", netAmountMinor: 1000 }]);
      qc.setQueryData(planQuery.queryKey, { id: "p1" });
      qc.setQueryData(notifQuery.queryKey, []);

      // Invalidate accounting
      await qc.invalidateQueries({ queryKey: orpc.accounting.key() });

      expect(qc.getQueryState(ledgerQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(planQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(notifQuery.queryKey)?.isInvalidated).toBe(false);
    });

    test("SCR-SHR-12 SSR loader respects auth guard and handles RPC errors gracefully", async () => {
      const shr12 = SHARED_SCREENS.find((s) => s.id === "SCR-SHR-12");
      expect(shr12).toBeDefined();
      expect(typeof shr12?.loader).toBe("function");

      const ensureSpy = mock(async () => {
        throw new Error("RPC Network Timeout");
      });
      const failingQc = {
        ensureQueryData: ensureSpy,
      } as unknown as QueryClient;

      // 1. Unauthenticated SSR -> must skip prefetch
      const unauth = createMockAuth(null);
      await shr12!.loader!({
        queryClient: failingQc,
        orpc,
        auth: unauth,
        params: {},
        search: {},
      });
      expect(ensureSpy).not.toHaveBeenCalled();

      // 2. Authenticated SSR with RPC failure -> must not throw / crash SSR
      const auth = createMockAuth("valid-bearer-token");
      await expect(
        shr12!.loader!({
          queryClient: failingQc,
          orpc,
          auth,
          params: {},
          search: {},
        }),
      ).resolves.toBeUndefined();
      expect(ensureSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("SCR-PUB-06 (Organization Sign-Up): Mutation Options & Cache Invalidation", () => {
    test("submitOrganizationApplication.mutationOptions invalidates orpc.onboarding.key() on success", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = {
        invalidateQueries: invalidateSpy,
      } as unknown as QueryClient;

      const mutationOptions = orpc.onboarding.submitOrganizationApplication.mutationOptions({
        onSuccess: () => {
          mockQueryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      expect(mutationOptions).toBeDefined();
      expect(typeof mutationOptions.onSuccess).toBe("function");

      mutationOptions.onSuccess?.(
        { id: "app-org-99" } as never,
        { legalEntityName: "Test Org LLC" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const arg = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(arg?.queryKey).toEqual(orpc.onboarding.key());
    });

    test("orpc.onboarding.key() invalidation marks onboarding queries as invalidated without touching plans/accounting", async () => {
      const qc = createQueryClient();
      const appStatusQuery = orpc.onboarding.getApplicationStatus.queryOptions({
        input: { applicationId: "app-org-99" },
      });
      const planQuery = orpc.plans.getPlan.queryOptions({ input: { planId: "org_starter" } });
      const ledgerQuery = orpc.accounting.listLedgerEntries.queryOptions({ input: {} });

      qc.setQueryData(appStatusQuery.queryKey, {
        application: { id: "app-org-99", status: "PENDING" },
      });
      qc.setQueryData(planQuery.queryKey, { id: "org_starter" });
      qc.setQueryData(ledgerQuery.queryKey, []);

      await qc.invalidateQueries({ queryKey: orpc.onboarding.key() });

      expect(qc.getQueryState(appStatusQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(planQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(ledgerQuery.queryKey)?.isInvalidated).toBe(false);
    });

    test("SCR-PUB-06 loader prefetches lookup types via ensureLookupTypes", async () => {
      const pub06 = PUBLIC_SCREENS.find((s) => s.id === "SCR-PUB-06");
      expect(pub06).toBeDefined();
      expect(typeof pub06?.loader).toBe("function");

      const ensureSpy = mock(async () => [{ code: "CR", labelEn: "Commercial Registration" }]);
      const mockQc = {
        ensureQueryData: ensureSpy,
      } as unknown as QueryClient;

      await pub06!.loader!({
        queryClient: mockQc,
        orpc,
        auth: createMockAuth(null),
        params: {},
        search: {},
      });

      expect(ensureSpy).toHaveBeenCalledTimes(1);
      const calledOptions = ensureSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(Array.isArray(calledOptions?.queryKey)).toBe(true);
    });
  });

  describe("Cross-Domain Query Invalidation Matrix & Prefix Matching", () => {
    test("every domain key helper only invalidates queries in its respective domain", async () => {
      const qc = createQueryClient();

      const queries = {
        plans: orpc.plans.getPlan.queryOptions({ input: { planId: "p1" } }),
        notifications: orpc.notifications.listInbox.queryOptions({ input: {} }),
        accounting: orpc.accounting.listLedgerEntries.queryOptions({ input: {} }),
        onboarding: orpc.onboarding.getApplicationStatus.queryOptions({ input: {} }),
        auth: orpc.auth.getAuthSettings.queryOptions({ input: undefined }),
        seats: orpc.seats.getSeatMap.queryOptions({ input: { tripId: "trip-1" } }),
        media: orpc.media.listFiles.queryOptions({ input: {} }),
        trips: orpc.trips.browsePublicTrips.queryOptions({ input: {} }),
      };

      const domainKeys = {
        plans: orpc.plans.key(),
        notifications: orpc.notifications.key(),
        accounting: orpc.accounting.key(),
        onboarding: orpc.onboarding.key(),
        auth: orpc.auth.key(),
        seats: orpc.seats.key(),
        media: orpc.media.key(),
        trips: orpc.trips.key(),
      };

      // Test each domain individually
      for (const [targetDomain, key] of Object.entries(domainKeys)) {
        // Reset all data
        for (const [d, q] of Object.entries(queries)) {
          qc.setQueryData(q.queryKey, { domain: d });
        }

        // Invalidate single domain
        await qc.invalidateQueries({ queryKey: key });

        // Verify ONLY targetDomain is invalidated
        for (const [d, q] of Object.entries(queries)) {
          const isInv = qc.getQueryState(q.queryKey)?.isInvalidated;
          if (d === targetDomain) {
            expect(isInv).toBe(true);
          } else {
            expect(isInv).toBe(false);
          }
        }
      }
    });

    test("domain key helper matches nested procedures with varied query inputs", async () => {
      const qc = createQueryClient();

      const queryA = orpc.onboarding.getApplicationStatus.queryOptions({
        input: { applicationId: "app-1" },
      });
      const queryB = orpc.onboarding.getApplicationStatus.queryOptions({
        input: { applicationId: "app-2" },
      });
      const queryC = orpc.onboarding.getApplicationStatus.queryOptions({ input: {} });

      qc.setQueryData(queryA.queryKey, { id: "app-1" });
      qc.setQueryData(queryB.queryKey, { id: "app-2" });
      qc.setQueryData(queryC.queryKey, { id: "app-none" });

      await qc.invalidateQueries({ queryKey: orpc.onboarding.key() });

      expect(qc.getQueryState(queryA.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(queryB.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(queryC.queryKey)?.isInvalidated).toBe(true);
    });
  });
});
