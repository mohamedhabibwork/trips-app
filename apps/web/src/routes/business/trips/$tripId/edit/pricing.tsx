import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripWizardStep7PricingAndCapacity } from "@/screens/organization/trips/trip-wizard-step-7-pricing-and-capacity";

/** `/business/trips/$tripId/edit/pricing` — SCR-ORG-11. */
export const Route = createFileRoute("/business/trips/$tripId/edit/pricing")({
  loader: screenLoader("SCR-ORG-11"),
  head: pageHead("SCR-ORG-11"),
  component: TripWizardStep7PricingAndCapacity,
});
