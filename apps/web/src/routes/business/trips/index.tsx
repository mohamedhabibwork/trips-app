import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripsList } from "@/screens/organization/trips/trips-list";

/** `/business/trips` — SCR-ORG-04. */
export const Route = createFileRoute("/business/trips/")({
  loader: screenLoader("SCR-ORG-04"),
  component: TripsList,
});
