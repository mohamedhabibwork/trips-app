import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep4Staffing } from "@/screens/organization/trips/trip-wizard-step-4-staffing";

/** `/business/trips/$tripId/edit/staffing` — SCR-ORG-08. */
export const Route = createFileRoute("/business/trips/$tripId/edit/staffing")({
  loader: screenLoader("SCR-ORG-08"),
  head: pageHead("SCR-ORG-08"),
  component: TripWizardStep4Staffing,
});
