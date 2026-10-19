import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripAccounting } from "@/screens/organization/accounting/trip-accounting";

/** `/business/accounting` — SCR-ORG-30. */
export const Route = createFileRoute("/business/accounting/")({
  loader: screenLoader("SCR-ORG-30"),
  component: TripAccounting,
});
