import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { WebhookNew } from "@/screens/organization/integrations/webhook-new";

/** `/business/integrations/webhooks/new` — SCR-ORG-59. */
export const Route = createFileRoute("/business/integrations/webhooks/new")({
  loader: screenLoader("SCR-ORG-59"),
  head: pageHead("SCR-ORG-59"),
  component: WebhookNew,
});
