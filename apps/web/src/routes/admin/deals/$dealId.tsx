import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { DealAuditDetail } from "@/screens/admin/deals-and-disputes/deal-audit-detail";

/** `/admin/deals/$dealId` — SCR-ADM-22. */
export const Route = createFileRoute("/admin/deals/$dealId")({
  loader: screenLoader("SCR-ADM-22"),
  component: DealAuditDetail,
});
