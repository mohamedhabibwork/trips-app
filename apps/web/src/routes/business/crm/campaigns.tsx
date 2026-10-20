import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Campaigns } from "@/screens/organization/crm/campaigns";

/** `/business/crm/campaigns` — SCR-ORG-48. */
export const Route = createFileRoute("/business/crm/campaigns")({
  loader: screenLoader("SCR-ORG-48"),
  head: pageHead("SCR-ORG-48"),
  component: Campaigns,
});
