import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { DealAuditList } from "@/screens/admin/deals-and-disputes/deal-audit-list";

/** `/admin/deals` — SCR-ADM-21. */
export const Route = createFileRoute("/admin/deals/")({
  loader: screenLoader("SCR-ADM-21"),
  component: DealAuditList,
});
