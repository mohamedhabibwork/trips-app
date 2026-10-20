import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PageAnalytics } from "@/screens/organization/operations/page-analytics";

/** `/business/analytics/pages` — SCR-ORG-47. */
export const Route = createFileRoute("/business/analytics/pages")({
  loader: screenLoader("SCR-ORG-47"),
  head: pageHead("SCR-ORG-47"),
  component: PageAnalytics,
});
