import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CompaniesAnalytics } from "@/screens/admin/analytics/companies-analytics";

/** `/admin/analytics/companies` — SCR-ADM-35. */
export const Route = createFileRoute("/admin/analytics/companies")({
  loader: screenLoader("SCR-ADM-35"),
  head: pageHead("SCR-ADM-35"),
  component: CompaniesAnalytics,
});
