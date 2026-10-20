import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ProgramEnrollmentReport } from "@/screens/organization/bookings/program-enrollment-report";

/** `/business/trips/$tripId/enrollment` — SCR-ORG-26. */
export const Route = createFileRoute("/business/trips/$tripId/enrollment")({
  loader: screenLoader("SCR-ORG-26"),
  head: pageHead("SCR-ORG-26"),
  component: ProgramEnrollmentReport,
});
