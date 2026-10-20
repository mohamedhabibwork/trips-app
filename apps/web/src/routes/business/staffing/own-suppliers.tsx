import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { OrganizationOwnedDriversAndPhotographers } from "@/screens/organization/staffing/organization-owned-drivers-and-photographers";

/** `/business/staffing/own-suppliers` — SCR-ORG-20. */
export const Route = createFileRoute("/business/staffing/own-suppliers")({
  loader: screenLoader("SCR-ORG-20"),
  head: pageHead("SCR-ORG-20"),
  component: OrganizationOwnedDriversAndPhotographers,
});
