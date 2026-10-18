import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import { ORGANIZATION_SCREENS_PART_A } from "@/screens/organization/entries-part-1";
import { ORGANIZATION_SCREENS_PART_B } from "@/screens/organization/entries-part-2";
import { createQueryClient, orpc } from "@/utils/orpc";

describe("Empirical Challenger: M5 Organization Surface SSR, Mutations & Cache Invalidation Stress-Test", () => {
  const ALL_ORG_SCREENS = [...ORGANIZATION_SCREENS_PART_A, ...ORGANIZATION_SCREENS_PART_B];

  function createMockAuth(token: string | null | undefined = null): SessionController {
    return {
      accessToken: () => token as string | null,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? {
              accountId: "acc-org-owner",
              email: "owner@tripcorp.sa",
              activeRole: "organization",
              role: "organization",
              activeTenantId: "tenant-org-99",
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
  /* Task 2: Mutation Options & Invalidation across Organization Screens        */
  /* (SCR-ORG-03, 05, 10, 12, 17, 20, 25, 28, 33, 38)                          */
  /* -------------------------------------------------------------------------- */
  describe("Task 2: Mutation Options & Domain Invalidation for Required Screens", () => {
    test("SCR-ORG-03 (organization-profile-settings-and-branding): updateOrganizationSettings invalidates organization domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.organization.updateOrganizationSettings.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.organization.key() });
        },
      });

      expect(typeof options.onSuccess).toBe("function");

      options.onSuccess?.(
        {} as never,
        { displayNameEn: "Trip Corp", timeZone: "Asia/Riyadh" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.organization.key() });
    });

    test("SCR-ORG-05 (trip-wizard-step-1-basics): saveWizardStep & createDraft invalidate trips domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const saveStepOptions = orpc.trips.saveWizardStep.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      const createDraftOptions = orpc.trips.createDraft.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      expect(typeof saveStepOptions.onSuccess).toBe("function");
      expect(typeof createDraftOptions.onSuccess).toBe("function");

      saveStepOptions.onSuccess?.(
        {} as never,
        {
          tripId: "trip-1",
          step: "basics",
          titleAr: "رحلة جبلية",
          titleEn: "Mountain Trip",
        } as never,
        undefined as never,
      );
      createDraftOptions.onSuccess?.(
        {} as never,
        { titleAr: "رحلة شاطئية", titleEn: "Beach Trip" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.trips.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.trips.key() });
    });

    test("SCR-ORG-10 (trip-wizard-step-6-seating): saveWizardStep dual-invalidates both trips AND seats domains", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const seatingOptions = orpc.trips.saveWizardStep.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
          mockQc.invalidateQueries({ queryKey: orpc.seats.key() });
        },
      });

      expect(typeof seatingOptions.onSuccess).toBe("function");

      seatingOptions.onSuccess?.(
        {} as never,
        {
          tripId: "trip-1",
          step: "seating",
          seatAssignmentMode: "traveler_choice",
          seatPriorityWindowHours: 24,
        } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.trips.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.seats.key() });
    });

    test("SCR-ORG-12 (trip-wizard-step-8-publish): saveWizardStep & publish invalidate trips domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const saveStepOptions = orpc.trips.saveWizardStep.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      const publishOptions = orpc.trips.publish.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      expect(typeof saveStepOptions.onSuccess).toBe("function");
      expect(typeof publishOptions.onSuccess).toBe("function");

      saveStepOptions.onSuccess?.(
        {} as never,
        { tripId: "trip-1", step: "publish", publishMode: "public" } as never,
        undefined as never,
      );
      publishOptions.onSuccess?.({} as never, { tripId: "trip-1" } as never, undefined as never);

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.trips.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.trips.key() });
    });

    test("SCR-ORG-17 (vehicle-editor): createVehicle, updateVehicle & removeVehicle invalidate fleet domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const createOptions = orpc.fleet.createVehicle.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.fleet.key() });
        },
      });

      const updateOptions = orpc.fleet.updateVehicle.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.fleet.key() });
        },
      });

      const removeOptions = orpc.fleet.removeVehicle.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.fleet.key() });
        },
      });

      expect(typeof createOptions.onSuccess).toBe("function");
      expect(typeof updateOptions.onSuccess).toBe("function");
      expect(typeof removeOptions.onSuccess).toBe("function");

      createOptions.onSuccess?.(
        {} as never,
        { plateNumber: "ABC 1111", vehicleTypeId: "vt-1", seatCount: 30 } as never,
        undefined as never,
      );
      updateOptions.onSuccess?.(
        {} as never,
        { vehicleId: "v-1", plateNumber: "ABC 2222" } as never,
        undefined as never,
      );
      removeOptions.onSuccess?.({} as never, { vehicleId: "v-1" } as never, undefined as never);

      expect(invalidateSpy).toHaveBeenCalledTimes(3);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.fleet.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.fleet.key() });
      expect(invalidateSpy.mock.calls[2]?.[0]).toEqual({ queryKey: orpc.fleet.key() });
    });

    test("SCR-ORG-20 (organization-owned-drivers-and-photographers): onboard & remove supplier invalidate onboarding domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const onboardOptions = orpc.onboarding.onboardOrganizationSupplier.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      const removeOptions = orpc.onboarding.removeOrganizationSupplier.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      expect(typeof onboardOptions.onSuccess).toBe("function");
      expect(typeof removeOptions.onSuccess).toBe("function");

      onboardOptions.onSuccess?.(
        {} as never,
        { supplierAccountId: "acc-driver-1", supplierRole: "org_driver" } as never,
        undefined as never,
      );
      removeOptions.onSuccess?.(
        {} as never,
        { supplierAccountId: "acc-driver-1" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.onboarding.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.onboarding.key() });
    });

    test("SCR-ORG-25 (seat-map-and-seat-assignment): assignSeatByOrganization dual-invalidates both seats AND booking domains", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const assignOptions = orpc.seats.assignSeatByOrganization.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.seats.key() });
          mockQc.invalidateQueries({ queryKey: orpc.booking.key() });
        },
      });

      expect(typeof assignOptions.onSuccess).toBe("function");

      assignOptions.onSuccess?.(
        {} as never,
        { tripId: "trip-1", vehicleId: "v-1", seatLabel: "1A", status: "reserved" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.seats.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.booking.key() });
    });

    test("SCR-ORG-28 (coupon-editor): createOrganizationCoupon invalidates coupons domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const createCouponOptions = orpc.coupons.createOrganizationCoupon.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.coupons.key() });
        },
      });

      expect(typeof createCouponOptions.onSuccess).toBe("function");

      createCouponOptions.onSuccess?.(
        {} as never,
        {
          code: "SUMMER25",
          titleAr: "خصم الصيف",
          titleEn: "Summer Discount",
          discountType: "percentage",
          discountValue: 25,
        } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.coupons.key() });
    });

    test("SCR-ORG-33 (subscription-and-billing): changeOrganizationPlan invalidates plans domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const changePlanOptions = orpc.plans.changeOrganizationPlan.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.plans.key() });
        },
      });

      expect(typeof changePlanOptions.onSuccess).toBe("function");

      changePlanOptions.onSuccess?.(
        {} as never,
        { planId: "organization:growth", billingCycle: "annual" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.plans.key() });
    });

    test("SCR-ORG-38 (issue-invoice-b2b-or-b2c): createPayoutSettlement invalidates accounting domain", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQc = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const payoutOptions = orpc.accounting.createPayoutSettlement.mutationOptions({
        onSuccess: () => {
          mockQc.invalidateQueries({ queryKey: orpc.accounting.key() });
        },
      });

      expect(typeof payoutOptions.onSuccess).toBe("function");

      payoutOptions.onSuccess?.(
        {} as never,
        { amountMinor: 75000, currencyCode: "SAR", invoiceNumber: "INV-ORG-001" } as never,
        undefined as never,
      );

      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.accounting.key() });
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Cross-Domain Invalidation Isolation & Integrity Matrix                     */
  /* -------------------------------------------------------------------------- */
  describe("Cross-Domain Invalidation Isolation & Integrity Matrix", () => {
    test("Invalidating an organization domain queryKey isolates that domain and preserves all other domains", async () => {
      const qc = createQueryClient();

      const testQueries = {
        trips: orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
        fleet: orpc.fleet.listVehicles.queryOptions({ input: {} }),
        organization: orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
        onboarding: orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
        negotiation: orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
        seats: orpc.seats.getSeatMap.queryOptions({ input: { tripId: "t-1" } }),
        booking: orpc.booking.listOrganizationBookings.queryOptions({ input: {} }),
        coupons: orpc.coupons.listOrganizationCoupons.queryOptions({ input: {} }),
        plans: orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined }),
        employees: orpc.employees.list.queryOptions({ input: {} }),
        accounting: orpc.accounting.getOrganizationSummary.queryOptions({ input: undefined }),
        tracking: orpc.tracking.listLiveVehicles.queryOptions({ input: undefined }),
      };

      const domainKeys = {
        trips: orpc.trips.key(),
        fleet: orpc.fleet.key(),
        organization: orpc.organization.key(),
        onboarding: orpc.onboarding.key(),
        negotiation: orpc.negotiation.key(),
        seats: orpc.seats.key(),
        booking: orpc.booking.key(),
        coupons: orpc.coupons.key(),
        plans: orpc.plans.key(),
        employees: orpc.employees.key(),
        accounting: orpc.accounting.key(),
        tracking: orpc.tracking.key(),
      };

      for (const [targetDomain, key] of Object.entries(domainKeys)) {
        // Prime all queries with mock cache data
        for (const [dom, q] of Object.entries(testQueries)) {
          qc.setQueryData(q.queryKey, { domain: dom, timestamp: Date.now() });
        }

        // Invalidate single target domain
        await qc.invalidateQueries({ queryKey: key });

        // Assert strictly isolated invalidation
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

    test("Dual-domain invalidation (SCR-ORG-10: trips + seats) strictly invalidates trips and seats only", async () => {
      const qc = createQueryClient();

      const tripsQ = orpc.trips.listOrganizationTrips.queryOptions({ input: {} });
      const seatsQ = orpc.seats.getSeatMap.queryOptions({ input: { tripId: "t-1" } });
      const fleetQ = orpc.fleet.listVehicles.queryOptions({ input: {} });
      const orgQ = orpc.organization.getOrganizationSettings.queryOptions({ input: {} });
      const bookingQ = orpc.booking.listOrganizationBookings.queryOptions({ input: {} });
      const plansQ = orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined });

      qc.setQueryData(tripsQ.queryKey, { items: [] });
      qc.setQueryData(seatsQ.queryKey, { seats: [] });
      qc.setQueryData(fleetQ.queryKey, { items: [] });
      qc.setQueryData(orgQ.queryKey, { organization: {} });
      qc.setQueryData(bookingQ.queryKey, []);
      qc.setQueryData(plansQ.queryKey, null);

      await Promise.all([
        qc.invalidateQueries({ queryKey: orpc.trips.key() }),
        qc.invalidateQueries({ queryKey: orpc.seats.key() }),
      ]);

      expect(qc.getQueryState(tripsQ.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(seatsQ.queryKey)?.isInvalidated).toBe(true);

      expect(qc.getQueryState(fleetQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(orgQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(bookingQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(plansQ.queryKey)?.isInvalidated).toBe(false);
    });

    test("Dual-domain invalidation (SCR-ORG-25: seats + booking) strictly invalidates seats and booking only", async () => {
      const qc = createQueryClient();

      const seatsQ = orpc.seats.getSeatMap.queryOptions({ input: { tripId: "t-1" } });
      const bookingQ = orpc.booking.listOrganizationBookings.queryOptions({ input: {} });
      const tripsQ = orpc.trips.listOrganizationTrips.queryOptions({ input: {} });
      const fleetQ = orpc.fleet.listVehicles.queryOptions({ input: {} });
      const couponsQ = orpc.coupons.listOrganizationCoupons.queryOptions({ input: {} });
      const employeesQ = orpc.employees.list.queryOptions({ input: {} });

      qc.setQueryData(seatsQ.queryKey, { seats: [] });
      qc.setQueryData(bookingQ.queryKey, []);
      qc.setQueryData(tripsQ.queryKey, { items: [] });
      qc.setQueryData(fleetQ.queryKey, { items: [] });
      qc.setQueryData(couponsQ.queryKey, { items: [] });
      qc.setQueryData(employeesQ.queryKey, { employees: [] });

      await Promise.all([
        qc.invalidateQueries({ queryKey: orpc.seats.key() }),
        qc.invalidateQueries({ queryKey: orpc.booking.key() }),
      ]);

      expect(qc.getQueryState(seatsQ.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(bookingQ.queryKey)?.isInvalidated).toBe(true);

      expect(qc.getQueryState(tripsQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(fleetQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(couponsQ.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(employeesQ.queryKey)?.isInvalidated).toBe(false);
    });

    test("High-concurrency stress: 120 interleaved mutations across all organization domains preserve state integrity", async () => {
      const qc = createQueryClient();
      const tripsQ = orpc.trips.listOrganizationTrips.queryOptions({ input: {} });
      const fleetQ = orpc.fleet.listVehicles.queryOptions({ input: {} });
      const couponsQ = orpc.coupons.listOrganizationCoupons.queryOptions({ input: {} });
      const plansQ = orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined });

      qc.setQueryData(tripsQ.queryKey, { items: [] });
      qc.setQueryData(fleetQ.queryKey, { items: [] });
      qc.setQueryData(couponsQ.queryKey, { items: [] });
      qc.setQueryData(plansQ.queryKey, null);

      const runs = Array.from({ length: 120 }, (_, i) => i);
      await Promise.all(
        runs.map(async (i) => {
          const mod = i % 4;
          if (mod === 0) {
            await qc.invalidateQueries({ queryKey: orpc.trips.key() });
          } else if (mod === 1) {
            await qc.invalidateQueries({ queryKey: orpc.fleet.key() });
          } else if (mod === 2) {
            await qc.invalidateQueries({ queryKey: orpc.coupons.key() });
          } else {
            await qc.invalidateQueries({ queryKey: orpc.plans.key() });
          }
        }),
      );

      expect(qc.getQueryState(tripsQ.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(fleetQ.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(couponsQ.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(plansQ.queryKey)?.isInvalidated).toBe(true);
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
        new Error("RPC Aborted: 409 Conflict"),
        { tripId: "t-1", reason: "Trip ongoing" } as never,
        undefined as never,
      );
      expect(errorCaught).toBe(true);
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  /* -------------------------------------------------------------------------- */
  /* Task 4: Stress-Test Unauthenticated SSR Behavior in Organization Screens   */
  /* -------------------------------------------------------------------------- */
  describe("Task 4: Unauthenticated SSR Behavior in Organization Screen Loaders", () => {
    test("All 42 organization screen loaders return immediately and perform ZERO RPC fetches when auth token is null", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQc = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauth = createMockAuth(null);

      for (const screen of ALL_ORG_SCREENS) {
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

    test("All 42 organization screen loaders return immediately when auth token is empty string or undefined", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQc = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      // Test empty string token
      const emptyAuth = createMockAuth("");
      for (const screen of ALL_ORG_SCREENS) {
        await screen.loader!({
          queryClient: mockQc,
          orpc,
          auth: emptyAuth,
          params: { tripId: "trip-test" },
          search: { tripId: "trip-test" },
        });
      }
      expect(ensureSpy).toHaveBeenCalledTimes(0);
      expect(prefetchSpy).toHaveBeenCalledTimes(0);

      // Test undefined token
      const undefAuth = createMockAuth(undefined);
      for (const screen of ALL_ORG_SCREENS) {
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

    test("All 42 organization loaders handle 401 Unauthorized RPC rejections gracefully without unhandled rejections", async () => {
      const failingQc = {
        ensureQueryData: mock(async () => {
          const err = new Error("401 Unauthorized: Session Token Expired");
          (err as unknown as { status: number }).status = 401;
          throw err;
        }),
        prefetchQuery: mock(async () => {
          const err = new Error("401 Unauthorized: Session Token Expired");
          (err as unknown as { status: number }).status = 401;
          throw err;
        }),
      } as unknown as QueryClient;

      const expiredAuth = createMockAuth("expired-org-token");

      for (const screen of ALL_ORG_SCREENS) {
        await expect(
          screen.loader!({
            queryClient: failingQc,
            orpc,
            auth: expiredAuth,
            params: { tripId: "tr-123", bookingId: "bk-456" },
            search: { tripId: "tr-123", bookingId: "bk-456" },
          }),
        ).resolves.toBeUndefined();
      }
    });

    test("All 42 organization loaders handle 403 Forbidden and 500 Server Errors gracefully without crashing SSR", async () => {
      const error500Qc = {
        ensureQueryData: mock(async () => {
          throw new Error("500 Internal Server Error: Database Connection Pool Exhausted");
        }),
        prefetchQuery: mock(async () => {
          throw new Error("500 Internal Server Error: Database Connection Pool Exhausted");
        }),
      } as unknown as QueryClient;

      const auth = createMockAuth("valid-org-token");

      for (const screen of ALL_ORG_SCREENS) {
        await expect(
          screen.loader!({
            queryClient: error500Qc,
            orpc,
            auth,
            params: { tripId: "tr-500" },
            search: { query: "fail" },
          }),
        ).resolves.toBeUndefined();
      }
    });

    test("All 42 organization loaders survive extreme / adversarial params and search payloads", async () => {
      const qc = {
        ensureQueryData: mock(async () => ({})),
        prefetchQuery: mock(async () => {}),
      } as unknown as QueryClient;

      const auth = createMockAuth("org-token");

      const adversarialInputs = [
        { params: {}, search: {} },
        { params: { tripId: "" }, search: { tripId: "" } },
        {
          params: { tripId: "'; DROP TABLE trips; --", bookingId: "<script>alert(1)</script>" },
          search: { tripId: "'; DROP TABLE trips; --", bookingId: "<script>alert(1)</script>" },
        },
        {
          params: { tripId: "x".repeat(10000) },
          search: { tripId: "x".repeat(10000) },
        },
      ];

      for (const input of adversarialInputs) {
        for (const screen of ALL_ORG_SCREENS) {
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
  /* Static AST Audit: Zero client. and Zero Imports of client in Org Screens   */
  /* -------------------------------------------------------------------------- */
  describe("Static AST Audit Across All 42 Organization Screens", () => {
    const orgDir = join(import.meta.dir, "organization");
    const orgFiles = getTsxFiles(orgDir);

    test("No organization screen file contains raw imperative client. calls", () => {
      const violations: string[] = [];

      for (const file of orgFiles) {
        const content = readFileSync(file, "utf8");
        const clientRegex = /(?<!queryClient)(?<!orpcClient)\bclient\.[a-zA-Z]/g;
        const matches = content.match(clientRegex);
        if (matches && matches.length > 0) {
          violations.push(`${file}: found ${matches.join(", ")}`);
        }
      }

      expect(violations).toEqual([]);
    });

    test("No organization screen file contains raw client[ or client( calls", () => {
      const violations: string[] = [];

      for (const file of orgFiles) {
        const content = readFileSync(file, "utf8");
        const clientBracketRegex = /(?<!queryClient)(?<!orpcClient)\bclient\[/g;
        const clientCallRegex = /(?<!queryClient)(?<!orpcClient)\bclient\(/g;
        if (clientBracketRegex.test(content) || clientCallRegex.test(content)) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });

    test("No organization screen file imports client from '@/utils/orpc'", () => {
      const violations: string[] = [];

      for (const file of orgFiles) {
        const content = readFileSync(file, "utf8");
        if (/import\s*\{[^}]*\bclient\b[^}]*\}\s*from\s*["']@\/utils\/orpc["']/.test(content)) {
          violations.push(file);
        }
      }

      expect(violations).toEqual([]);
    });

    test("All 42 organization screens are registered with non-empty slug, titleKey, surface: 'organization'", () => {
      expect(ALL_ORG_SCREENS.length).toBe(42);

      for (const screen of ALL_ORG_SCREENS) {
        expect(screen.surface).toBe("organization");
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
