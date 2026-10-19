import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep2ScheduleAndRoute } from "@/screens/organization/trips/trip-wizard-step-2-schedule-and-route";

/** `/business/trips/new/schedule` — SCR-ORG-06. */
export const Route = createFileRoute("/business/trips/new/schedule")({
  loader: screenLoader("SCR-ORG-06"),
  component: TripWizardStep2ScheduleAndRoute,
});
