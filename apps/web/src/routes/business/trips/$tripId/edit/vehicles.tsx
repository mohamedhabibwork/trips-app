import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep3Vehicles } from "@/screens/organization/trips/trip-wizard-step-3-vehicles";

/** `/business/trips/$tripId/edit/vehicles` — SCR-ORG-07. */
export const Route = createFileRoute("/business/trips/$tripId/edit/vehicles")({
  loader: screenLoader("SCR-ORG-07"),
  head: pageHead("SCR-ORG-07"),
  component: TripWizardStep3Vehicles,
});
