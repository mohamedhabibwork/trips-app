import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep8Publish } from "@/screens/organization/trips/trip-wizard-step-8-publish";

/** `/business/trips/$tripId/edit/publish` — SCR-ORG-12. */
export const Route = createFileRoute("/business/trips/$tripId/edit/publish")({
  loader: screenLoader("SCR-ORG-12"),
  head: pageHead("SCR-ORG-12"),
  component: TripWizardStep8Publish,
});
