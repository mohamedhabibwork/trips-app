import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { ApplicationQueue } from "@/screens/admin/applications/application-queue";

/** `/admin/applications` — SCR-ADM-02. */
export const Route = createFileRoute("/admin/applications/")({
  loader: screenLoader("SCR-ADM-02"),
  component: ApplicationQueue,
});
