import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep5Programs } from "@/screens/organization/trips/trip-wizard-step-5-programs";

/** `/business/trips/$tripId/edit/programs` — SCR-ORG-09. */
export const Route = createFileRoute("/business/trips/$tripId/edit/programs")({
  loader: screenLoader("SCR-ORG-09"),
  head: pageHead("SCR-ORG-09"),
  component: TripWizardStep5Programs,
});
