import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { EmployeeInvitationAndPermissions } from "@/screens/organization/people/employee-invitation-and-permissions";

/** `/business/employees/invite` — SCR-ORG-35. */
export const Route = createFileRoute("/business/employees/invite")({
  loader: screenLoader("SCR-ORG-35"),
  component: EmployeeInvitationAndPermissions,
});
