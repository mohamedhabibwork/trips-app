import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PagesAnalytics } from "@/screens/admin/analytics/pages-analytics";

/** `/admin/analytics/pages` — SCR-ADM-38. */
export const Route = createFileRoute("/admin/analytics/pages")({
  loader: screenLoader("SCR-ADM-38"),
  head: pageHead("SCR-ADM-38"),
  component: PagesAnalytics,
});
