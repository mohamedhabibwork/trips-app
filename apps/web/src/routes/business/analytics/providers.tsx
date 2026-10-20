import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ProviderAnalytics } from "@/screens/organization/operations/provider-analytics";

/** `/business/analytics/providers` — SCR-ORG-46. */
export const Route = createFileRoute("/business/analytics/providers")({
  loader: screenLoader("SCR-ORG-46"),
  head: pageHead("SCR-ORG-46"),
  component: ProviderAnalytics,
});
