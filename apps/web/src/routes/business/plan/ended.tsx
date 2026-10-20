import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PlanEnded } from "@/screens/organization/billing/plan-ended";

/** `/business/plan/ended` — SCR-ORG-68. */
export const Route = createFileRoute("/business/plan/ended")({
  loader: screenLoader("SCR-ORG-68"),
  head: pageHead("SCR-ORG-68"),
  component: PlanEnded,
});
