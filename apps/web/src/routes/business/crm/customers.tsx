import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Customers } from "@/screens/organization/crm/customers";

/** `/business/crm/customers` — SCR-ORG-50. */
export const Route = createFileRoute("/business/crm/customers")({
  loader: screenLoader("SCR-ORG-50"),
  head: pageHead("SCR-ORG-50"),
  component: Customers,
});
