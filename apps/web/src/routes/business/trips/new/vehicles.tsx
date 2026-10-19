import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep3Vehicles } from "@/screens/organization/trips/trip-wizard-step-3-vehicles";

/** `/business/trips/new/vehicles` — SCR-ORG-07. */
export const Route = createFileRoute("/business/trips/new/vehicles")({
  loader: screenLoader("SCR-ORG-07"),
  component: TripWizardStep3Vehicles,
});
