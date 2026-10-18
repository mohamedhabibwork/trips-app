import type { ScreenEntry } from "@/screens/types";

import { WorkspaceHome } from "./workspace/workspace-home";
import { EmployeeInvitationAcceptance } from "./people/employee-invitation-acceptance";
import { OrganizationProfileSettingsAndBranding } from "./workspace/organization-profile-settings-and-branding";
import { TripsList } from "./trips/trips-list";
import { TripWizardStep1Basics } from "./trips/trip-wizard-step-1-basics";
import { TripWizardStep2ScheduleAndRoute } from "./trips/trip-wizard-step-2-schedule-and-route";
import { TripWizardStep3Vehicles } from "./trips/trip-wizard-step-3-vehicles";
import { TripWizardStep4Staffing } from "./trips/trip-wizard-step-4-staffing";
import { TripWizardStep5Programs } from "./trips/trip-wizard-step-5-programs";
import { TripWizardStep6Seating } from "./trips/trip-wizard-step-6-seating";
import { TripWizardStep7PricingAndCapacity } from "./trips/trip-wizard-step-7-pricing-and-capacity";
import { TripWizardStep8Publish } from "./trips/trip-wizard-step-8-publish";
import { ProgramEditor } from "./trips/program-editor";
import { TripCommandView } from "./trips/trip-command-view";
import { CancelTripDecision } from "./trips/cancel-trip-decision";
import { VehicleRegistry } from "./vehicles/vehicle-registry";
import { VehicleEditor } from "./vehicles/vehicle-editor";
import { VehicleTypesAndSeatLayout } from "./vehicles/vehicle-types-and-seat-layout";
import { StaffingBoard } from "./staffing/staffing-board";
import { OrganizationOwnedDriversAndPhotographers } from "./staffing/organization-owned-drivers-and-photographers";
import { PlatformSupplierSearchAndDealStart } from "./staffing/platform-supplier-search-and-deal-start";

/** SCR-ORG-01 to SCR-ORG-21, in spec order. */
export const ORGANIZATION_SCREENS_PART_A: readonly ScreenEntry[] = [
  {
    id: "SCR-ORG-01",
    slug: "workspace-home",
    titleKey: "screen.registry.organization.workspaceHome.title",
    surface: "organization",
    component: WorkspaceHome,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
          queryClient.prefetchQuery(
            orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
          ),
          queryClient.prefetchQuery(orpc.notifications.listInbox.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-02",
    slug: "employee-invitation-acceptance",
    titleKey: "screen.registry.organization.employeeInvitationAcceptance.title",
    surface: "organization",
    component: EmployeeInvitationAcceptance,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-03",
    slug: "organization-profile-settings-and-branding",
    titleKey: "screen.registry.organization.organizationProfileSettingsAndBranding.title",
    surface: "organization",
    component: OrganizationProfileSettingsAndBranding,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-04",
    slug: "trips-list",
    titleKey: "screen.registry.organization.tripsList.title",
    surface: "organization",
    component: TripsList,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-05",
    slug: "trip-wizard-step-1-basics",
    titleKey: "screen.registry.organization.tripWizardStep1Basics.title",
    surface: "organization",
    component: TripWizardStep1Basics,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-06",
    slug: "trip-wizard-step-2-schedule-and-route",
    titleKey: "screen.registry.organization.tripWizardStep2ScheduleAndRoute.title",
    surface: "organization",
    component: TripWizardStep2ScheduleAndRoute,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-07",
    slug: "trip-wizard-step-3-vehicles",
    titleKey: "screen.registry.organization.tripWizardStep3Vehicles.title",
    surface: "organization",
    component: TripWizardStep3Vehicles,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.fleet.listVehicles.queryOptions({ input: {} })),
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-08",
    slug: "trip-wizard-step-4-staffing",
    titleKey: "screen.registry.organization.tripWizardStep4Staffing.title",
    surface: "organization",
    component: TripWizardStep4Staffing,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-09",
    slug: "trip-wizard-step-5-programs",
    titleKey: "screen.registry.organization.tripWizardStep5Programs.title",
    surface: "organization",
    component: TripWizardStep5Programs,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-10",
    slug: "trip-wizard-step-6-seating",
    titleKey: "screen.registry.organization.tripWizardStep6Seating.title",
    surface: "organization",
    component: TripWizardStep6Seating,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-11",
    slug: "trip-wizard-step-7-pricing-and-capacity",
    titleKey: "screen.registry.organization.tripWizardStep7PricingAndCapacity.title",
    surface: "organization",
    component: TripWizardStep7PricingAndCapacity,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-12",
    slug: "trip-wizard-step-8-publish",
    titleKey: "screen.registry.organization.tripWizardStep8Publish.title",
    surface: "organization",
    component: TripWizardStep8Publish,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-13",
    slug: "program-editor",
    titleKey: "screen.registry.organization.programEditor.title",
    surface: "organization",
    component: ProgramEditor,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-14",
    slug: "trip-command-view",
    titleKey: "screen.registry.organization.tripCommandView.title",
    surface: "organization",
    component: TripCommandView,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-15",
    slug: "cancel-trip-decision",
    titleKey: "screen.registry.organization.cancelTripDecision.title",
    surface: "organization",
    component: CancelTripDecision,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-16",
    slug: "vehicle-registry",
    titleKey: "screen.registry.organization.vehicleRegistry.title",
    surface: "organization",
    component: VehicleRegistry,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.fleet.listVehicles.queryOptions({ input: {} })),
          queryClient.prefetchQuery(orpc.fleet.listVehicleTypes.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-17",
    slug: "vehicle-editor",
    titleKey: "screen.registry.organization.vehicleEditor.title",
    surface: "organization",
    component: VehicleEditor,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.fleet.listVehicles.queryOptions({ input: {} })),
          queryClient.prefetchQuery(orpc.fleet.listVehicleTypes.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-18",
    slug: "vehicle-types-and-seat-layout",
    titleKey: "screen.registry.organization.vehicleTypesAndSeatLayout.title",
    surface: "organization",
    component: VehicleTypesAndSeatLayout,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(orpc.fleet.listVehicleTypes.queryOptions({ input: {} }));
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-19",
    slug: "staffing-board",
    titleKey: "screen.registry.organization.staffingBoard.title",
    surface: "organization",
    component: StaffingBoard,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
          queryClient.prefetchQuery(
            orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
          ),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-20",
    slug: "organization-owned-drivers-and-photographers",
    titleKey: "screen.registry.organization.organizationOwnedDriversAndPhotographers.title",
    surface: "organization",
    component: OrganizationOwnedDriversAndPhotographers,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await queryClient.ensureQueryData(
          orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
        );
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
  {
    id: "SCR-ORG-21",
    slug: "platform-supplier-search-and-deal-start",
    titleKey: "screen.registry.organization.platformSupplierSearchAndDealStart.title",
    surface: "organization",
    component: PlatformSupplierSearchAndDealStart,
    loader: async ({ queryClient, orpc, auth }) => {
      if (typeof window === "undefined" && !auth.accessToken()) return;
      try {
        await Promise.allSettled([
          queryClient.prefetchQuery(
            orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
          ),
          queryClient.prefetchQuery(
            orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
          ),
          queryClient.prefetchQuery(orpc.trips.listOrganizationTrips.queryOptions({ input: {} })),
        ]);
      } catch {
        // Gracefully ignore SSR errors
      }
    },
  },
];
