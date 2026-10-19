import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripOversight } from "@/screens/admin/trips/trip-oversight";

/** `/admin/trips` — SCR-ADM-29. */
export const Route = createFileRoute("/admin/trips")({
  loader: screenLoader("SCR-ADM-29"),
  component: TripOversight,
});
