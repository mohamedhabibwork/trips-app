import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep8Publish } from "@/screens/organization/trips/trip-wizard-step-8-publish";

/** `/business/trips/new/publish` — SCR-ORG-12. */
export const Route = createFileRoute("/business/trips/new/publish")({
  loader: screenLoader("SCR-ORG-12"),
  component: TripWizardStep8Publish,
});
