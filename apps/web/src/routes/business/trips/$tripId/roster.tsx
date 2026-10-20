import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PassengerRoster } from "@/screens/organization/trips/passenger-roster";

/** `/business/trips/$tripId/roster` — SCR-ORG-65. */
export const Route = createFileRoute("/business/trips/$tripId/roster")({
  loader: screenLoader("SCR-ORG-65"),
  head: pageHead("SCR-ORG-65"),
  component: PassengerRoster,
});
