import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { DealDetailAndNegotiation } from "@/screens/organization/staffing/deal-detail-and-negotiation";

/** `/business/staffing/deals/$dealId` — SCR-ORG-22. */
export const Route = createFileRoute("/business/staffing/deals/$dealId")({
  loader: screenLoader("SCR-ORG-22"),
  head: pageHead("SCR-ORG-22"),
  component: DealDetailAndNegotiation,
});
