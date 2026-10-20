import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { LiveOperations } from "@/screens/organization/operations/live-operations";

/** `/business/live` — SCR-ORG-40. */
export const Route = createFileRoute("/business/live")({
  loader: screenLoader("SCR-ORG-40"),
  head: pageHead("SCR-ORG-40"),
  component: LiveOperations,
});
