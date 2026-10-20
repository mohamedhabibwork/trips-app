import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripAnalytics } from "@/screens/organization/operations/trip-analytics";

/** `/business/analytics/trips/$tripId` — SCR-ORG-44. */
export const Route = createFileRoute("/business/analytics/trips/$tripId")({
  loader: screenLoader("SCR-ORG-44"),
  head: pageHead("SCR-ORG-44"),
  component: TripAnalytics,
});
