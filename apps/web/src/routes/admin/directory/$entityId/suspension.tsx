import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { SuspendOrReinstateDecision } from "@/screens/admin/directory/suspend-or-reinstate-decision";

/** `/admin/directory/$entityId/suspension` — SCR-ADM-09. */
export const Route = createFileRoute("/admin/directory/$entityId/suspension")({
  loader: screenLoader("SCR-ADM-09"),
  component: SuspendOrReinstateDecision,
});
