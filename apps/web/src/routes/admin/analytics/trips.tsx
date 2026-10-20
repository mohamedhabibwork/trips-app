import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { TripsAnalytics } from "@/screens/admin/analytics/trips-analytics";

/** `/admin/analytics/trips` — SCR-ADM-37. */
export const Route = createFileRoute("/admin/analytics/trips")({
  loader: screenLoader("SCR-ADM-37"),
  head: pageHead("SCR-ADM-37"),
  component: TripsAnalytics,
});
