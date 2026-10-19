import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";
import { screenLoader } from "@/navigation/load-screen";
import { AppealARejection } from "@/screens/public/account-recovery/appeal-a-rejection";

/** `/application-status/appeal` — SCR-PUB-18. */
export const Route = createFileRoute("/application-status/appeal")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-PUB-18"),
  component: AppealARejection,
});
