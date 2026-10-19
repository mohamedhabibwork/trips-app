import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { RequestChangesDecision } from "@/screens/admin/applications/request-changes-decision";

/** `/admin/applications/$applicationId/request-changes` — SCR-ADM-04. */
export const Route = createFileRoute("/admin/applications/$applicationId/request-changes")({
  loader: screenLoader("SCR-ADM-04"),
  component: RequestChangesDecision,
});
