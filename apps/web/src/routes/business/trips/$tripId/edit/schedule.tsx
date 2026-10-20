import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep2ScheduleAndRoute } from "@/screens/organization/trips/trip-wizard-step-2-schedule-and-route";

/** `/business/trips/$tripId/edit/schedule` — SCR-ORG-06. */
export const Route = createFileRoute("/business/trips/$tripId/edit/schedule")({
  loader: screenLoader("SCR-ORG-06"),
  head: pageHead("SCR-ORG-06"),
  component: TripWizardStep2ScheduleAndRoute,
});
