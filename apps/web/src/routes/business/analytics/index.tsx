import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CompanyAnalytics } from "@/screens/organization/operations/company-analytics";

/** `/business/analytics` — SCR-ORG-43. */
export const Route = createFileRoute("/business/analytics/")({
  loader: screenLoader("SCR-ORG-43"),
  head: pageHead("SCR-ORG-43"),
  component: CompanyAnalytics,
});
