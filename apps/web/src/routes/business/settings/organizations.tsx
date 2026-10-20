import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { MyOrganizations } from "@/screens/organization/workspace/my-organizations";

/** `/business/settings/organizations` — SCR-ORG-61. */
export const Route = createFileRoute("/business/settings/organizations")({
  loader: screenLoader("SCR-ORG-61"),
  head: pageHead("SCR-ORG-61"),
  component: MyOrganizations,
});
