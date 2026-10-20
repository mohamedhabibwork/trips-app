import { createFileRoute } from "@tanstack/react-router";

import { requireSignedIn } from "@/auth/guard";
import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ScrShr11NotificationCentre } from "@/screens/shared/scr-shr-11-notification-centre";

/** `/notifications` — SCR-SHR-11. */
export const Route = createFileRoute("/notifications")({
  beforeLoad: requireSignedIn(),
  loader: screenLoader("SCR-SHR-11"),
  head: pageHead("SCR-SHR-11"),
  component: ScrShr11NotificationCentre,
});
