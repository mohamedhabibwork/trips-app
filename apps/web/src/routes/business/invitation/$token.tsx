import { createFileRoute } from "@tanstack/react-router";

import { screenLoader } from "@/navigation/load-screen";
import { EmployeeInvitationAcceptance } from "@/screens/organization/people/employee-invitation-acceptance";

/** `/business/invitation/$token` — SCR-ORG-02. */
export const Route = createFileRoute("/business/invitation/$token")({
  loader: screenLoader("SCR-ORG-02"),
  component: EmployeeInvitationAcceptance,
});
