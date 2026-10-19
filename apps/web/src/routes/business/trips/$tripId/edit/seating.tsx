import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep6Seating } from "@/screens/organization/trips/trip-wizard-step-6-seating";

/** `/business/trips/$tripId/edit/seating` — SCR-ORG-10. */
export const Route = createFileRoute("/business/trips/$tripId/edit/seating")({
  loader: screenLoader("SCR-ORG-10"),
  component: TripWizardStep6Seating,
});
