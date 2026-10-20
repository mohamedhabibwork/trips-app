import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ChoosePlan } from "@/screens/organization/billing/choose-plan";

/** `/business/plan` — SCR-ORG-66. */
export const Route = createFileRoute("/business/plan/")({
  loader: screenLoader("SCR-ORG-66"),
  head: pageHead("SCR-ORG-66"),
  component: ChoosePlan,
});
