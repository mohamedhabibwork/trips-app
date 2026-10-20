import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { AnalyticsAndReports } from "@/screens/organization/operations/analytics-and-reports";

/** `/business/reports` — SCR-ORG-39. */
export const Route = createFileRoute("/business/reports/")({
  loader: screenLoader("SCR-ORG-39"),
  head: pageHead("SCR-ORG-39"),
  component: AnalyticsAndReports,
});
