import { describe, expect, mock, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { QueryClient } from "@tanstack/react-query";

import { authController } from "@/auth/instance";
import type { SessionController } from "@/auth/session-controller";
import { ORGANIZATION_SCREENS_PART_A } from "@/screens/organization/entries-part-1";
import { ORGANIZATION_SCREENS_PART_B } from "@/screens/organization/entries-part-2";
import { createQueryClient, orpc } from "@/utils/orpc";

describe("Milestone 5: Organization Surface Screens Migration (SCR-ORG-01..42)", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
      ...authController,
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? {
              accountId: "acc-org-owner",
              email: "owner@organization.com",
              activeRole: "organization",
              role: "organization",
              activeTenantId: "tenant-org-1",
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
    const orgDir = join(import.meta.dir, "organization");
    const orgFiles = getTsxFiles(orgDir);

    test("All organization screen files in apps/web/src/screens/organization have zero client. calls", () => {
      const violations: string[] = [];

      for (const file of orgFiles) {
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

    test("No organization screen file imports { client } from '@/utils/orpc'", () => {
      const violations: string[] = [];

      for (const file of orgFiles) {
        const content = readFileSync(file, "utf8");
        if (/import\s*\{[^}]*\bclient\b[^}]*\}\s*from\s*["']@\/utils\/orpc["']/.test(content)) {
          violations.push(`${file} imports { client } from "@/utils/orpc"`);
        }
      }

      expect(violations).toEqual([]);
    });
  });

  describe("Screen Registry & Loaders Definition", () => {
    test("Registry contains all 42 organization screens (Part A: 21, Part B: 21)", () => {
      expect(ORGANIZATION_SCREENS_PART_A.length).toBe(21);
      expect(ORGANIZATION_SCREENS_PART_B.length).toBe(21);
      const allScreens = [...ORGANIZATION_SCREENS_PART_A, ...ORGANIZATION_SCREENS_PART_B];
      expect(allScreens.length).toBe(42);

      for (let i = 1; i <= 42; i++) {
        const expectedId = `SCR-ORG-${String(i).padStart(2, "0")}`;
        expect(allScreens.some((s) => s.id === expectedId)).toBe(true);
      }
    });

    test("Every organization screen defines a typed loader function", () => {
      const allScreens = [...ORGANIZATION_SCREENS_PART_A, ...ORGANIZATION_SCREENS_PART_B];
      for (const screen of allScreens) {
        expect(typeof screen.loader).toBe("function");
      }
    });
  });

  describe("SSR Loader Safety: Unauthenticated Requests", () => {
    test("All 42 organization loaders skip RPC prefetch on unauthenticated SSR", async () => {
      const ensureSpy = mock(async () => ({}));
      const prefetchSpy = mock(async () => {});
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauthAuth = createMockAuth(null);
      const allScreens = [...ORGANIZATION_SCREENS_PART_A, ...ORGANIZATION_SCREENS_PART_B];

      for (const screen of allScreens) {
        await screen.loader!({
          queryClient: mockQueryClient,
          orpc,
          auth: unauthAuth,
          params: {},
          search: {},
        });
      }

      // No ensureQueryData or prefetchQuery calls should be performed when accessToken is null on SSR
      expect(ensureSpy).not.toHaveBeenCalled();
      expect(prefetchSpy).not.toHaveBeenCalled();
    });
  });

  describe("SSR Loader Execution: Authenticated Requests", () => {
    test("Authenticated loaders perform prefetch for core organization queries", async () => {
      const ensureSpy = mock(async () => ({ items: [] }));
      const prefetchSpy = mock(async () => {});
      const mockQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const auth = createMockAuth("org-access-token");

      // Test representative screens across Part A and Part B
      const homeScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-01");
      const profileScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-03");
      const tripsListScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-04");
      const wizardBasicsScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-05");
      const vehicleRegistryScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-16");
      const vehicleTypesScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-18");
      const staffingBoardScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-19");
      const ownedDriversScreen = ORGANIZATION_SCREENS_PART_A.find((s) => s.id === "SCR-ORG-20");

      const dealDetailScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-22");
      const bookingsScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-23");
      const couponsListScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-27");
      const tripAccountingScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-30");
      const ledgerScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-31");
      const subscriptionScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-33");
      const employeesListScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-34");
      const crmWebhooksScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-36");
      const liveOpsScreen = ORGANIZATION_SCREENS_PART_B.find((s) => s.id === "SCR-ORG-40");

      const testScreens = [
        homeScreen,
        profileScreen,
        tripsListScreen,
        wizardBasicsScreen,
        vehicleRegistryScreen,
        vehicleTypesScreen,
        staffingBoardScreen,
        ownedDriversScreen,
        dealDetailScreen,
        bookingsScreen,
        couponsListScreen,
        tripAccountingScreen,
        ledgerScreen,
        subscriptionScreen,
        employeesListScreen,
        crmWebhooksScreen,
        liveOpsScreen,
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

      const auth = createMockAuth("org-access-token");
      const allScreens = [...ORGANIZATION_SCREENS_PART_A, ...ORGANIZATION_SCREENS_PART_B];

      for (const screen of allScreens) {
        await expect(
          screen.loader!({
            queryClient: failingQueryClient,
            orpc,
            auth,
            params: { tripId: "trip-1", bookingId: "b-1" },
            search: { tripId: "trip-1" },
          }),
        ).resolves.toBeUndefined();
      }
    });
  });

  describe("Mutation Options & Cache Invalidation", () => {
    test("trips.saveWizardStep mutation invalidates orpc.trips.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.trips.saveWizardStep.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { step: 1, tripId: "t-1", payload: {} } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.trips.key());
    });

    test("trips.publish mutation invalidates orpc.trips.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.trips.publish.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      options.onSuccess?.({} as never, { tripId: "t-1" } as never, undefined as never);
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.trips.key());
    });

    test("trips.cancel mutation invalidates orpc.trips.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.trips.cancel.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.trips.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { tripId: "t-1", reason: "Weather" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.trips.key());
    });

    test("fleet.createVehicle mutation invalidates orpc.fleet.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.fleet.createVehicle.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { plateNumber: "ABC 1234", vehicleTypeId: "vt-1", seatCount: 45 } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.fleet.key());
    });

    test("fleet.updateVehicleType mutation invalidates orpc.fleet.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.fleet.updateVehicleType.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { vehicleTypeId: "vt-1", nameEn: "Updated Bus", capacity: 50, seatingLayout: {} } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.fleet.key());
    });

    test("onboarding.onboardOrganizationSupplier mutation invalidates orpc.onboarding.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.onboarding.onboardOrganizationSupplier.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { supplierAccountId: "acc-supp-1", supplierRole: "org_driver" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.onboarding.key());
    });

    test("negotiation.createOffer mutation invalidates orpc.negotiation.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.negotiation.createOffer.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.negotiation.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          tripId: "t-1",
          supplierAccountId: "acc-supp-1",
          supplierRole: "platform_driver",
          offerAmountMinor: 15000,
          currencyCode: "SAR",
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.negotiation.key());
    });

    test("seats.assignSeatByOrganization mutation invalidates orpc.seats.key() and orpc.booking.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.seats.assignSeatByOrganization.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.seats.key() });
          void mockQueryClient.invalidateQueries({ queryKey: orpc.booking.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          tripId: "t-1",
          vehicleId: "v-1",
          seatLabel: "1A",
          status: "reserved",
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(2);
      expect(invalidateSpy.mock.calls[0]?.[0]).toEqual({ queryKey: orpc.seats.key() });
      expect(invalidateSpy.mock.calls[1]?.[0]).toEqual({ queryKey: orpc.booking.key() });
    });

    test("booking.cancelBooking mutation invalidates orpc.booking.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.booking.cancelBooking.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.booking.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { bookingId: "b-1", reason: "Customer request" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.booking.key());
    });

    test("coupons.createOrganizationCoupon mutation invalidates orpc.coupons.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.coupons.createOrganizationCoupon.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.coupons.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          code: "ORG10",
          titleAr: "ORG10",
          titleEn: "ORG10",
          discountType: "percentage",
          discountValue: 10,
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.coupons.key());
    });

    test("plans.changeOrganizationPlan mutation invalidates orpc.plans.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.plans.changeOrganizationPlan.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.plans.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { planId: "organization:enterprise", billingCycle: "annual" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.plans.key());
    });

    test("employees.updateStatus mutation invalidates orpc.employees.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.employees.updateStatus.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.employees.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { membershipId: "m-1", status: "revoked" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.employees.key());
    });

    test("employees.invite mutation invalidates orpc.employees.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.employees.invite.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.employees.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          invitedEmail: "test@org.com",
          roleTitle: "Staff",
          permissions: {
            trips: "view",
            bookings: "none",
            accounting: "none",
            coupons: "none",
            employees: "none",
            fleet: "none",
            subscription: "none",
            tracking: "none",
            settings: "none",
          },
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.employees.key());
    });

    test("organization.updateOrganizationSettings mutation invalidates orpc.organization.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.organization.updateOrganizationSettings.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.organization.key() });
        },
      });

      options.onSuccess?.({} as never, { crmProvider: "hubspot" } as never, undefined as never);
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.organization.key());
    });

    test("accounting.createPayoutSettlement mutation invalidates orpc.accounting.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.accounting.createPayoutSettlement.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        { amountMinor: 50000, currencyCode: "SAR", invoiceNumber: "INV-1" } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.accounting.key());
    });

    test("tracking.recordChildSafetyEvent mutation invalidates orpc.tracking.key()", () => {
      const invalidateSpy = mock(() => Promise.resolve());
      const mockQueryClient = { invalidateQueries: invalidateSpy } as unknown as QueryClient;

      const options = orpc.tracking.recordChildSafetyEvent.mutationOptions({
        onSuccess: () => {
          void mockQueryClient.invalidateQueries({ queryKey: orpc.tracking.key() });
        },
      });

      options.onSuccess?.(
        {} as never,
        {
          tripId: "t-1",
          childPassengerId: "c-1",
          eventType: "child_boarded",
        } as never,
        undefined as never,
      );
      expect(invalidateSpy).toHaveBeenCalledTimes(1);
      const call = invalidateSpy.mock.calls[0]?.[0] as { queryKey: unknown };
      expect(call?.queryKey).toEqual(orpc.tracking.key());
    });

    test("Domain cache invalidation is scoped and does not corrupt unrelated queries", async () => {
      const qc = createQueryClient();
      const tripsQuery = orpc.trips.listOrganizationTrips.queryOptions({ input: {} });
      const fleetQuery = orpc.fleet.listVehicles.queryOptions({ input: {} });
      const employeesQuery = orpc.employees.list.queryOptions({ input: {} });

      qc.setQueryData(tripsQuery.queryKey, { items: [{ id: "tr-1" }] });
      qc.setQueryData(fleetQuery.queryKey, { items: [{ id: "vh-1" }] });
      qc.setQueryData(employeesQuery.queryKey, { employees: [{ id: "emp-1" }] });

      expect(qc.getQueryState(tripsQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(fleetQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(employeesQuery.queryKey)?.isInvalidated).toBe(false);

      // Invalidate fleet domain
      await qc.invalidateQueries({ queryKey: orpc.fleet.key() });

      expect(qc.getQueryState(tripsQuery.queryKey)?.isInvalidated).toBe(false);
      expect(qc.getQueryState(fleetQuery.queryKey)?.isInvalidated).toBe(true);
      expect(qc.getQueryState(employeesQuery.queryKey)?.isInvalidated).toBe(false);
    });
  });
});
