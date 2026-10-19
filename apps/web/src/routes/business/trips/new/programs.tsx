import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep5Programs } from "@/screens/organization/trips/trip-wizard-step-5-programs";

/** `/business/trips/new/programs` — SCR-ORG-09. */
export const Route = createFileRoute("/business/trips/new/programs")({
  loader: screenLoader("SCR-ORG-09"),
  component: TripWizardStep5Programs,
});
