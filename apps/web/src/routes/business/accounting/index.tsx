import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripAccounting } from "@/screens/organization/accounting/trip-accounting";

/** `/business/accounting` — SCR-ORG-30. */
export const Route = createFileRoute("/business/accounting/")({
  loader: screenLoader("SCR-ORG-30"),
  head: pageHead("SCR-ORG-30"),
  component: TripAccounting,
});
