import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { WebhooksList } from "@/screens/organization/integrations/webhooks";

/** `/business/integrations/webhooks` — SCR-ORG-58. */
export const Route = createFileRoute("/business/integrations/webhooks/")({
  loader: screenLoader("SCR-ORG-58"),
  head: pageHead("SCR-ORG-58"),
  component: WebhooksList,
});
