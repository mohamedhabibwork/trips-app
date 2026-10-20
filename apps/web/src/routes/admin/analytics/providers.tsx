import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ProvidersAnalytics } from "@/screens/admin/analytics/providers-analytics";

/** `/admin/analytics/providers` — SCR-ADM-36. */
export const Route = createFileRoute("/admin/analytics/providers")({
  loader: screenLoader("SCR-ADM-36"),
  head: pageHead("SCR-ADM-36"),
  component: ProvidersAnalytics,
});
