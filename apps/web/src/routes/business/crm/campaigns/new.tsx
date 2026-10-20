import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CampaignNew } from "@/screens/organization/crm/campaign-new";

/** `/business/crm/campaigns/new` — SCR-ORG-49. */
export const Route = createFileRoute("/business/crm/campaigns/new")({
  loader: screenLoader("SCR-ORG-49"),
  head: pageHead("SCR-ORG-49"),
  component: CampaignNew,
});
