import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { StatePreview } from "../common/organization-state-preview";

export function EmployeeInvitationAcceptance() {
  const goTo = useOrgNavigate();

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title="Employee invitation acceptance"
          description="You have been invited to join an organization."
        />
        <TeInlineAlert tone="info">
          Accept only if the invitation was sent to the email address you are signed in with.
        </TeInlineAlert>
        <TeCard>
          <div className="flex flex-col gap-4">
            <h2 className="te-h2">[Organization name]</h2>
            <p className="te-body">Permission areas granted</p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <TeBadge tone="neutral">[Permission area]</TeBadge>
              </li>
            </ul>
            <div className="flex flex-wrap justify-end gap-3">
              <TeButton variant="ghost">Decline</TeButton>
              <TeButton onClick={() => void goTo("workspace-home")}>Accept invitation</TeButton>
            </div>
          </div>
        </TeCard>
      </div>
    </StatePreview>
  );
}
