import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PlansCatalog } from "@/screens/admin/plans/plans-catalog";

/** `/admin/plans` — SCR-ADM-15. */
export const Route = createFileRoute("/admin/plans/")({
  loader: screenLoader("SCR-ADM-15"),
  head: pageHead("SCR-ADM-15"),
  component: PlansCatalog,
});
