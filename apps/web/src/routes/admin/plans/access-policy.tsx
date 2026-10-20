import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { PlanAccessPolicy } from "@/screens/admin/plans/plan-access-policy";

/** `/admin/plans/access-policy` — SCR-ADM-45. */
export const Route = createFileRoute("/admin/plans/access-policy")({
  loader: screenLoader("SCR-ADM-45"),
  head: pageHead("SCR-ADM-45"),
  component: PlanAccessPolicy,
});
