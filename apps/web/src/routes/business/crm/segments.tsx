import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { Segments } from "@/screens/organization/crm/segments";

/** `/business/crm/segments` — SCR-ORG-56. */
export const Route = createFileRoute("/business/crm/segments")({
  loader: screenLoader("SCR-ORG-56"),
  head: pageHead("SCR-ORG-56"),
  component: Segments,
});
