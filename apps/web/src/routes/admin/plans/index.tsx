import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PlansCatalog } from "@/screens/admin/plans/plans-catalog";

/** `/admin/plans` — SCR-ADM-15. */
export const Route = createFileRoute("/admin/plans/")({
  loader: screenLoader("SCR-ADM-15"),
  component: PlansCatalog,
});
