import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripCommandView } from "@/screens/organization/trips/trip-command-view";

/** `/business/trips/$tripId` — SCR-ORG-14. */
export const Route = createFileRoute("/business/trips/$tripId/")({
  loader: screenLoader("SCR-ORG-14"),
  component: TripCommandView,
});
