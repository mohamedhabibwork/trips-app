import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CrmAndWebhooks } from "@/screens/organization/people/crm-and-webhooks";

/** `/business/settings/crm` — SCR-ORG-36. */
export const Route = createFileRoute("/business/settings/crm")({
  loader: screenLoader("SCR-ORG-36"),
  head: pageHead("SCR-ORG-36"),
  component: CrmAndWebhooks,
});
