import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep1Basics } from "@/screens/organization/trips/trip-wizard-step-1-basics";

/** `/business/trips/new` — SCR-ORG-05. */
export const Route = createFileRoute("/business/trips/new/")({
  loader: screenLoader("SCR-ORG-05"),
  head: pageHead("SCR-ORG-05"),
  component: TripWizardStep1Basics,
});
