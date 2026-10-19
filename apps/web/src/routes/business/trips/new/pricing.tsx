import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripWizardStep7PricingAndCapacity } from "@/screens/organization/trips/trip-wizard-step-7-pricing-and-capacity";

/** `/business/trips/new/pricing` — SCR-ORG-11. */
export const Route = createFileRoute("/business/trips/new/pricing")({
  loader: screenLoader("SCR-ORG-11"),
  component: TripWizardStep7PricingAndCapacity,
});
