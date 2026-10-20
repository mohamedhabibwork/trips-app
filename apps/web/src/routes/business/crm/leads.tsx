import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Leads } from "@/screens/organization/crm/leads";

/** `/business/crm/leads` — SCR-ORG-52. */
export const Route = createFileRoute("/business/crm/leads")({
  loader: screenLoader("SCR-ORG-52"),
  head: pageHead("SCR-ORG-52"),
  component: Leads,
});
