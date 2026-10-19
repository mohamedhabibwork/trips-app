import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { TripReportReview } from "@/screens/organization/operations/trip-report-review";

/** `/business/reports/trips/$tripId` — SCR-ORG-41. */
export const Route = createFileRoute("/business/reports/trips/$tripId")({
  loader: screenLoader("SCR-ORG-41"),
  component: TripReportReview,
});
