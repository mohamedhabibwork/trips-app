import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { pageHead } from "@/navigation/seo";
import { EmployeeInvitationAndPermissions } from "@/screens/organization/people/employee-invitation-and-permissions";

/** `/business/employees/invite` — SCR-ORG-35. */
export const Route = createFileRoute("/business/employees/invite")({
  loader: screenLoader("SCR-ORG-35"),
  head: pageHead("SCR-ORG-35"),
  component: EmployeeInvitationAndPermissions,
});
