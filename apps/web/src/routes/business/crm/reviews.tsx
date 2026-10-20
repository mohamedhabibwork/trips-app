import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Reviews } from "@/screens/organization/crm/reviews";

/** `/business/crm/reviews` — SCR-ORG-55. */
export const Route = createFileRoute("/business/crm/reviews")({
  loader: screenLoader("SCR-ORG-55"),
  head: pageHead("SCR-ORG-55"),
  component: Reviews,
});
