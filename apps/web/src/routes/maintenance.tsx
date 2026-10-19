import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ScrShr07MaintenancePage } from "@/screens/shared/scr-shr-07-maintenance-page";

/** `/maintenance` — SCR-SHR-07. */
export const Route = createFileRoute("/maintenance")({
  loader: screenLoader("SCR-SHR-07"),
  component: ScrShr07MaintenancePage,
});
