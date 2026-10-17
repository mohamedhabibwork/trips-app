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
    title: "Workspace home",
    surface: "organization",
    component: WorkspaceHome,
  },
  {
    id: "SCR-ORG-02",
    slug: "employee-invitation-acceptance",
    title: "Employee invitation acceptance",
    surface: "organization",
    component: EmployeeInvitationAcceptance,
  },
  {
    id: "SCR-ORG-03",
    slug: "organization-profile-settings-and-branding",
    title: "Organization profile, settings and branding",
    surface: "organization",
    component: OrganizationProfileSettingsAndBranding,
  },
  {
    id: "SCR-ORG-04",
    slug: "trips-list",
    title: "Trips list",
    surface: "organization",
    component: TripsList,
  },
  {
    id: "SCR-ORG-05",
    slug: "trip-wizard-step-1-basics",
    title: "Trip wizard step 1: basics",
    surface: "organization",
    component: TripWizardStep1Basics,
  },
  {
    id: "SCR-ORG-06",
    slug: "trip-wizard-step-2-schedule-and-route",
    title: "Trip wizard step 2: schedule and route",
    surface: "organization",
    component: TripWizardStep2ScheduleAndRoute,
  },
  {
    id: "SCR-ORG-07",
    slug: "trip-wizard-step-3-vehicles",
    title: "Trip wizard step 3: vehicles",
    surface: "organization",
    component: TripWizardStep3Vehicles,
  },
  {
    id: "SCR-ORG-08",
    slug: "trip-wizard-step-4-staffing",
    title: "Trip wizard step 4: staffing",
    surface: "organization",
    component: TripWizardStep4Staffing,
  },
  {
    id: "SCR-ORG-09",
    slug: "trip-wizard-step-5-programs",
    title: "Trip wizard step 5: programs",
    surface: "organization",
    component: TripWizardStep5Programs,
  },
  {
    id: "SCR-ORG-10",
    slug: "trip-wizard-step-6-seating",
    title: "Trip wizard step 6: seating",
    surface: "organization",
    component: TripWizardStep6Seating,
  },
  {
    id: "SCR-ORG-11",
    slug: "trip-wizard-step-7-pricing-and-capacity",
    title: "Trip wizard step 7: pricing and capacity",
    surface: "organization",
    component: TripWizardStep7PricingAndCapacity,
  },
  {
    id: "SCR-ORG-12",
    slug: "trip-wizard-step-8-publish",
    title: "Trip wizard step 8: publish",
    surface: "organization",
    component: TripWizardStep8Publish,
  },
  {
    id: "SCR-ORG-13",
    slug: "program-editor",
    title: "Program editor",
    surface: "organization",
    component: ProgramEditor,
  },
  {
    id: "SCR-ORG-14",
    slug: "trip-command-view",
    title: "Trip command view",
    surface: "organization",
    component: TripCommandView,
  },
  {
    id: "SCR-ORG-15",
    slug: "cancel-trip-decision",
    title: "Cancel trip (decision)",
    surface: "organization",
    component: CancelTripDecision,
  },
  {
    id: "SCR-ORG-16",
    slug: "vehicle-registry",
    title: "Vehicle registry",
    surface: "organization",
    component: VehicleRegistry,
  },
  {
    id: "SCR-ORG-17",
    slug: "vehicle-editor",
    title: "Vehicle editor",
    surface: "organization",
    component: VehicleEditor,
  },
  {
    id: "SCR-ORG-18",
    slug: "vehicle-types-and-seat-layout",
    title: "Vehicle types and seat layout",
    surface: "organization",
    component: VehicleTypesAndSeatLayout,
  },
  {
    id: "SCR-ORG-19",
    slug: "staffing-board",
    title: "Staffing board",
    surface: "organization",
    component: StaffingBoard,
  },
  {
    id: "SCR-ORG-20",
    slug: "organization-owned-drivers-and-photographers",
    title: "Organization-owned drivers and photographers",
    surface: "organization",
    component: OrganizationOwnedDriversAndPhotographers,
  },
  {
    id: "SCR-ORG-21",
    slug: "platform-supplier-search-and-deal-start",
    title: "Platform supplier search and deal start",
    surface: "organization",
    component: PlatformSupplierSearchAndDealStart,
  },
];
