import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";
import { screenLoader } from "@/navigation/load-screen";
import { ApplicationStatusAndChangesResponse } from "@/screens/public/account-recovery/application-status-and-changes-response";

/** `/application-status` — SCR-PUB-17. */
export const Route = createFileRoute("/application-status/")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-PUB-17"),
  component: ApplicationStatusAndChangesResponse,
});
