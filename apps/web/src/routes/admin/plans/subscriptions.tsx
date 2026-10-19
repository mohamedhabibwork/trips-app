import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { SubscriptionsAndOverrides } from "@/screens/admin/plans/subscriptions-and-overrides";

/** `/admin/plans/subscriptions` — SCR-ADM-17. */
export const Route = createFileRoute("/admin/plans/subscriptions")({
  loader: screenLoader("SCR-ADM-17"),
  component: SubscriptionsAndOverrides,
});
