import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { RevenueDashboard } from "@/screens/admin/finance/revenue-dashboard";

/** `/admin/plans/revenue` — SCR-ADM-18. */
export const Route = createFileRoute("/admin/plans/revenue")({
  loader: screenLoader("SCR-ADM-18"),
  component: RevenueDashboard,
});
