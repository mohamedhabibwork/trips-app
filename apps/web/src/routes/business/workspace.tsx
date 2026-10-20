import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { ChooseWorkspace } from "@/screens/organization/workspace/choose-workspace";

/** `/business/workspace` — SCR-ORG-62. */
export const Route = createFileRoute("/business/workspace")({
  loader: screenLoader("SCR-ORG-62"),
  head: pageHead("SCR-ORG-62"),
  component: ChooseWorkspace,
});
