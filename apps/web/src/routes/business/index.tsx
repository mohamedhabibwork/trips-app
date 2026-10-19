import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { WorkspaceHome } from "@/screens/organization/workspace/workspace-home";

/** `/business` — SCR-ORG-01. */
export const Route = createFileRoute("/business/")({
  loader: screenLoader("SCR-ORG-01"),
  component: WorkspaceHome,
});
