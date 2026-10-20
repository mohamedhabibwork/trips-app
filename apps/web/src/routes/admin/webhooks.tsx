import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { WebhooksApi } from "@/screens/admin/platform/webhooks-api";

/** `/admin/webhooks` — SCR-ADM-42. */
export const Route = createFileRoute("/admin/webhooks")({
  loader: screenLoader("SCR-ADM-42"),
  head: pageHead("SCR-ADM-42"),
  component: WebhooksApi,
});
