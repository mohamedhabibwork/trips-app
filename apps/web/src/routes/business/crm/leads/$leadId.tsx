import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { LeadDetail } from "@/screens/organization/crm/lead-detail";

/** `/business/crm/leads/$leadId` — SCR-ORG-53. */
export const Route = createFileRoute("/business/crm/leads/$leadId")({
  loader: screenLoader("SCR-ORG-53"),
  head: pageHead("SCR-ORG-53"),
  component: LeadDetail,
});
