import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Inbox } from "@/screens/organization/crm/inbox";

/** `/business/crm/inbox` — SCR-ORG-54. */
export const Route = createFileRoute("/business/crm/inbox")({
  loader: screenLoader("SCR-ORG-54"),
  head: pageHead("SCR-ORG-54"),
  component: Inbox,
});
