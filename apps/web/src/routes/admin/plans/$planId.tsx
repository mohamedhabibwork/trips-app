import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { PlanEditor } from "@/screens/admin/plans/plan-editor";

/** `/admin/plans/$planId` — SCR-ADM-16. */
export const Route = createFileRoute("/admin/plans/$planId")({
  loader: screenLoader("SCR-ADM-16"),
  component: PlanEditor,
});
