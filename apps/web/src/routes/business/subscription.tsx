import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { SubscriptionAndBilling } from "@/screens/organization/billing/subscription-and-billing";

/** `/business/subscription` — SCR-ORG-33. */
export const Route = createFileRoute("/business/subscription")({
  loader: screenLoader("SCR-ORG-33"),
  head: pageHead("SCR-ORG-33"),
  component: SubscriptionAndBilling,
});
