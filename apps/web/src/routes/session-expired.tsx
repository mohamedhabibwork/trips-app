import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { SessionExpired } from "@/screens/public/account-recovery/session-expired";

/** `/session-expired` — SCR-PUB-14. */
export const Route = createFileRoute("/session-expired")({
  loader: screenLoader("SCR-PUB-14"),
  component: SessionExpired,
});
