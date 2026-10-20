import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { CustomerAnalytics } from "@/screens/organization/operations/customer-analytics";

/** `/business/analytics/customers` — SCR-ORG-45. */
export const Route = createFileRoute("/business/analytics/customers")({
  loader: screenLoader("SCR-ORG-45"),
  head: pageHead("SCR-ORG-45"),
  component: CustomerAnalytics,
});
