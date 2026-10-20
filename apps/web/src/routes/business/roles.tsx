import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { RolesPermissions } from "@/screens/organization/people/roles-permissions";

/** `/business/roles` — SCR-ORG-64. */
export const Route = createFileRoute("/business/roles")({
  loader: screenLoader("SCR-ORG-64"),
  head: pageHead("SCR-ORG-64"),
  component: RolesPermissions,
});
