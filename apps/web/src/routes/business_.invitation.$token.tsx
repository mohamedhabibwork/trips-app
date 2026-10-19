import { createFileRoute } from "@tanstack/react-router";

import { EmployeeInvitationAcceptance } from "@/screens/organization/people/employee-invitation-acceptance";

/**
 * `/business/invitation/$token` — SCR-ORG-02.
 *
 * Opened from the invitation email, often before the invited person has an account or a session,
 * so it sits outside the guarded `/business` layout (the trailing `_`) and in the public shell.
 * Accepting still needs a session; the page links to sign-in and sign-up and comes back here.
 */
export const Route = createFileRoute("/business_/invitation/$token")({
  component: EmployeeInvitationAcceptance,
});
