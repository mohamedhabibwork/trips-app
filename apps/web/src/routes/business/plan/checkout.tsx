import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { BillingCheckout } from "@/screens/organization/billing/checkout";

/** `/business/plan/checkout` — SCR-ORG-67. */
export const Route = createFileRoute("/business/plan/checkout")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
    cycle: typeof search.cycle === "string" ? search.cycle : undefined,
  }),
  loader: screenLoader("SCR-ORG-67"),
  head: pageHead("SCR-ORG-67"),
  component: BillingCheckout,
});
