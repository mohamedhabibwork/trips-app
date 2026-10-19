import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { CancelTripDecision } from "@/screens/organization/trips/cancel-trip-decision";

/** `/business/trips/$tripId/cancel` — SCR-ORG-15. */
export const Route = createFileRoute("/business/trips/$tripId/cancel")({
  loader: screenLoader("SCR-ORG-15"),
  component: CancelTripDecision,
});
