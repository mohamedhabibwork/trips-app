import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { StatePreview } from "../common/organization-state-preview";

export function EmployeeInvitationAcceptance() {
  const goTo = useOrgNavigate();
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [inviteToken, setInviteToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const acceptMutation = useMutation(
    orpc.employees.acceptInvite.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  async function handleAccept() {
    if (authStatus === "authenticated" && inviteToken.trim()) {
      setBusy(true);
      setErrorMsg(null);
      try {
        await acceptMutation.mutateAsync({ inviteToken: inviteToken.trim() });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not accept invitation.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    void goTo("workspace-home");
  }

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title={t(
            "screen.organization.people.employeeInvitationAcceptance.employeeInvitationAcceptance",
          )}
          description={t(
            "screen.organization.people.employeeInvitationAcceptance.youHaveBeenInvitedTo",
          )}
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <TeInlineAlert tone="info">
          {t("screen.organization.people.employeeInvitationAcceptance.acceptOnlyIfTheInvitation")}
        </TeInlineAlert>
        <TeCard>
          <div className="flex flex-col gap-4">
            <h2 className="te-h2">
              {t("screen.organization.people.employeeInvitationAcceptance.organizationName")}
            </h2>
            <p className="te-body">
              {t("screen.organization.people.employeeInvitationAcceptance.permissionAreasGranted")}
            </p>
            <ul className="flex flex-wrap gap-2">
              <li>
                <TeBadge tone="neutral">
                  {t("screen.organization.people.employeeInvitationAcceptance.permissionArea")}
                </TeBadge>
              </li>
            </ul>
            <TeInput
              label={t("screen.organization.people.employeeInvitationAcceptance.invitationToken")}
              placeholder={t(
                "screen.organization.people.employeeInvitationAcceptance.pasteInvitationToken",
              )}
              value={inviteToken}
              onChange={(event) => setInviteToken(event.target.value)}
            />
            <div className="flex flex-wrap justify-end gap-3">
              <TeButton variant="ghost" onClick={() => void goTo("workspace-home")}>
                {t("screen.organization.people.employeeInvitationAcceptance.decline")}
              </TeButton>
              <TeButton disabled={busy} onClick={() => void handleAccept()}>
                {t("screen.organization.people.employeeInvitationAcceptance.acceptInvitation")}
              </TeButton>
            </div>
          </div>
        </TeCard>
      </div>
    </StatePreview>
  );
}
