import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { RejectWithReasonDecision } from "@/screens/admin/applications/reject-with-reason-decision";

/** `/admin/applications/$applicationId/reject` — SCR-ADM-05. */
export const Route = createFileRoute("/admin/applications/$applicationId/reject")({
  loader: screenLoader("SCR-ADM-05"),
  component: RejectWithReasonDecision,
});
