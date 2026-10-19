import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep1Basics } from "@/screens/organization/trips/trip-wizard-step-1-basics";

/** `/business/trips/$tripId/edit` (a saved draft) — SCR-ORG-05. */
export const Route = createFileRoute("/business/trips/$tripId/edit/")({
  loader: screenLoader("SCR-ORG-05"),
  component: TripWizardStep1Basics,
});
