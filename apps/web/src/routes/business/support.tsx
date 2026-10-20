import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Support } from "@/screens/organization/workspace/support";

/** `/business/support` — SCR-ORG-63. */
export const Route = createFileRoute("/business/support")({
  loader: screenLoader("SCR-ORG-63"),
  head: pageHead("SCR-ORG-63"),
  component: Support,
});
