import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { DisputeDetailAndRefundDecision } from "@/screens/admin/deals-and-disputes/dispute-detail-and-refund-decision";

/** `/admin/disputes/$disputeId` — SCR-ADM-24. */
export const Route = createFileRoute("/admin/disputes/$disputeId")({
  loader: screenLoader("SCR-ADM-24"),
  head: pageHead("SCR-ADM-24"),
  component: DisputeDetailAndRefundDecision,
});
