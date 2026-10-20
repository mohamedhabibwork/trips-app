import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { OperationsHealthDashboard } from "@/screens/admin/operations/operations-health-dashboard";

/** `/admin/platform/health` — SCR-ADM-33. */
export const Route = createFileRoute("/admin/platform/health")({
  loader: screenLoader("SCR-ADM-33"),
  head: pageHead("SCR-ADM-33"),
  component: OperationsHealthDashboard,
});
