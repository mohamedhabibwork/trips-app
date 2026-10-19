// SCR-ORG-02 Employee invitation acceptance: an invited person joins the organization.
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { usePathname } from "@/components/shells/shell-content";
import { orpc } from "@/utils/orpc";

import { OrgInput } from "../common/org-form";
import { OrgButtonLink, useOrgNavigate, useOrgParams } from "../common/org-link";
import {
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgPage,
  OrgPageHeader,
  orgButtonClass,
} from "../common/org-ui";

import { AreaBadges, grantedAreas } from "./people-parts";

const MIN_TOKEN_LENGTH = 8;
const SIGNED_OUT_HINT_ID = "invitation-signed-out-hint";

export function EmployeeInvitationAcceptance() {
  const goTo = useOrgNavigate();
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const tokenParam = useOrgParams().token;
  const [typedToken, setTypedToken] = useState("");
  const inviteToken = (tokenParam ?? typedToken).trim();
  const signedIn = authStatus === "authenticated";
  // Sign-in and sign-up come back to this invitation, so the person can accept it right away.
  const returnTo = usePathname();

  const acceptMutation = useMutation(
    orpc.employees.acceptInvite.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
      },
    }),
  );

  const accepted = acceptMutation.data?.employee ?? null;
  const canAccept = signedIn && inviteToken.length >= MIN_TOKEN_LENGTH && !acceptMutation.isPending;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.people.employeeInvitationAcceptance.title")}
        caption={
          accepted
            ? t("screen.organization.people.employeeInvitationAcceptance.invitationSentTo", {
                email: accepted.invitedEmail,
              })
            : t("screen.organization.people.employeeInvitationAcceptance.caption")
        }
      />
      {accepted ? (
        <OrgAlert
          tone="ok"
          title={t("screen.organization.people.employeeInvitationAcceptance.joinedTitle")}
        >
          {t("screen.organization.people.employeeInvitationAcceptance.joinedBody")}
        </OrgAlert>
      ) : (
        <OrgAlert
          tone="info"
          title={t("screen.organization.people.employeeInvitationAcceptance.checkYourEmail")}
        >
          {t("screen.organization.people.employeeInvitationAcceptance.checkYourEmailBody")}
        </OrgAlert>
      )}
      {acceptMutation.isError ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.people.employeeInvitationAcceptance.notAcceptedTitle")}
        >
          {t("screen.organization.people.employeeInvitationAcceptance.notAcceptedBody")}
        </OrgAlert>
      ) : null}
      <OrgCard
        title={t("screen.organization.people.employeeInvitationAcceptance.permissionAreasGranted")}
        className="max-w-[720px]"
      >
        <p className="m-0">
          {t("screen.organization.people.employeeInvitationAcceptance.permissionAreasIntro")}
        </p>
        <AreaBadges
          areas={grantedAreas(accepted?.permissions)}
          tone="ok"
          emptyLabel={t("screen.organization.people.employeeInvitationAcceptance.areasAfterAccept")}
        />
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">
          {t("screen.organization.people.employeeInvitationAcceptance.areasSetByOwner")}
        </p>
        {!tokenParam && !accepted ? (
          <OrgInput
            label={t("screen.organization.people.employeeInvitationAcceptance.invitationCode")}
            hint={t("screen.organization.people.employeeInvitationAcceptance.invitationCodeHint")}
            value={typedToken}
            onChange={(event) => setTypedToken(event.target.value)}
            autoComplete="off"
          />
        ) : null}
        {!signedIn && !accepted ? (
          <div className="flex flex-col gap-3">
            <p id={SIGNED_OUT_HINT_ID} className="te-caption m-0 text-[var(--te-ink-muted)]">
              {t("screen.organization.people.employeeInvitationAcceptance.signInToAccept")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/sign-in" search={{ returnTo }} className={orgButtonClass("secondary")}>
                {t("screen.organization.people.employeeInvitationAcceptance.signIn")}
              </Link>
              <Link to="/sign-up" search={{ returnTo }} className={orgButtonClass("text")}>
                {t("screen.organization.people.employeeInvitationAcceptance.createAccount")}
              </Link>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          {accepted ? (
            <OrgButtonLink slug="workspace-home">
              {t("screen.organization.people.employeeInvitationAcceptance.openWorkspace")}
            </OrgButtonLink>
          ) : (
            <>
              <OrgButton variant="secondary" onClick={() => void goTo("workspace-home")}>
                {t("screen.organization.people.employeeInvitationAcceptance.decline")}
              </OrgButton>
              <OrgButton
                disabled={!canAccept}
                aria-describedby={signedIn ? undefined : SIGNED_OUT_HINT_ID}
                onClick={() => acceptMutation.mutate({ inviteToken })}
              >
                {t("screen.organization.people.employeeInvitationAcceptance.acceptInvitation")}
              </OrgButton>
            </>
          )}
        </div>
      </OrgCard>
    </OrgPage>
  );
}
