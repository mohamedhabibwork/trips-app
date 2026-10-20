import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { WebhookDetail } from "@/screens/organization/integrations/webhook-detail";

/** `/business/integrations/webhooks/$endpointId` — SCR-ORG-60. */
export const Route = createFileRoute("/business/integrations/webhooks/$endpointId")({
  loader: screenLoader("SCR-ORG-60"),
  head: pageHead("SCR-ORG-60"),
  component: WebhookDetail,
});
