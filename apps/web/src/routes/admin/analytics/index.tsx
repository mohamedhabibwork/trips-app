import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PlatformAnalytics } from "@/screens/admin/analytics/platform-analytics";

/** `/admin/analytics` — SCR-ADM-34. */
export const Route = createFileRoute("/admin/analytics/")({
  loader: screenLoader("SCR-ADM-34"),
  head: pageHead("SCR-ADM-34"),
  component: PlatformAnalytics,
});
