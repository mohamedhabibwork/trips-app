// SCR-ORG-02 Employee invitation acceptance: an invited person joins the organization.
// Opened from the email link, often before sign-in: the invitation itself is read by its token
// (employees.previewInvite) and can be declined without a session; accepting needs one.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { usePathname } from "@/components/shells/shell-content";
import { orpc } from "@/utils/orpc";

import { OrgInput } from "../common/org-form";
import { OrgButtonLink, useOrgParams } from "../common/org-link";
import { isoDay } from "../common/org-shared";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  orgButtonClass,
} from "../common/org-ui";

import { AreaBadges, grantedAreas } from "./people-parts";

const MIN_TOKEN_LENGTH = 8;
const SIGNED_OUT_HINT_ID = "invitation-signed-out-hint";
const K = "screen.organization.people.employeeInvitationAcceptance";

export function EmployeeInvitationAcceptance() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const tokenParam = useOrgParams().token;
  const [typedToken, setTypedToken] = useState("");
  const inviteToken = (tokenParam ?? typedToken).trim();
  const hasToken = inviteToken.length >= MIN_TOKEN_LENGTH;
  const signedIn = authStatus === "authenticated";
  // Sign-in and sign-up come back to this invitation, so the person can accept it right away.
  const returnTo = usePathname();

  const previewQuery = useQuery({
    ...orpc.employees.previewInvite.queryOptions({ input: { inviteToken } }),
    enabled: hasToken,
    retry: false,
  });
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.employees.key() });
  };
  const acceptMutation = useMutation(
    orpc.employees.acceptInvite.mutationOptions({ onSuccess: invalidate }),
  );
  const declineMutation = useMutation(
    orpc.employees.declineInvite.mutationOptions({ onSuccess: invalidate }),
  );

  const invite = previewQuery.data;
  const accepted = acceptMutation.data?.employee ?? null;
  const state = accepted
    ? "accepted"
    : declineMutation.isSuccess
      ? "withdrawn"
      : (invite?.state ?? null);
  const pending = state === "pending";
  const busy = acceptMutation.isPending || declineMutation.isPending;
  const canAccept = signedIn && pending && !busy;
  const orgName = invite
    ? (locale === "ar" ? invite.organizationNameAr : invite.organizationNameEn) ||
      invite.organizationNameEn
    : null;
  const areas = grantedAreas(accepted?.permissions ?? invite?.permissions);

  if (hasToken && previewQuery.isLoading) return <OrgLoading rows={5} />;

  return (
    <OrgPage>
      <OrgPageHeader
        title={orgName ? t(`${K}.joinOrganization`, { name: orgName }) : t(`${K}.title`)}
        caption={
          invite ? t(`${K}.invitationSentTo`, { email: invite.invitedEmail }) : t(`${K}.caption`)
        }
      />
      {previewQuery.isError ? (
        <OrgAlert tone="err" title={t(`${K}.notFoundTitle`)}>
          {t(`${K}.notFoundBody`)}
        </OrgAlert>
      ) : null}
      {state === "accepted" ? (
        <OrgAlert tone="ok" title={t(`${K}.joinedTitle`)}>
          {t(`${K}.joinedBody`)}
        </OrgAlert>
      ) : null}
      {state === "withdrawn" ? (
        <OrgAlert tone="warn" title={t(`${K}.declinedTitle`)}>
          {t(`${K}.declinedBody`)}
        </OrgAlert>
      ) : null}
      {state === "expired" ? (
        <OrgAlert tone="warn" title={t(`${K}.expiredTitle`)}>
          {t(`${K}.expiredBody`)}
        </OrgAlert>
      ) : null}
      {pending && invite ? (
        <OrgAlert tone="info" title={t(`${K}.checkYourEmail`)}>
          {t(`${K}.validUntil`, { date: isoDay(invite.inviteExpiresAt) ?? NO_VALUE })}{" "}
          {t(`${K}.checkYourEmailBody`)}
        </OrgAlert>
      ) : null}
      {acceptMutation.isError || declineMutation.isError ? (
        <OrgAlert tone="err" title={t(`${K}.notAcceptedTitle`)}>
          {t(`${K}.notAcceptedBody`)}
        </OrgAlert>
      ) : null}
      <OrgCard title={t(`${K}.permissionAreasGranted`)} className="max-w-[720px]">
        <p className="m-0">{t(`${K}.permissionAreasIntro`)}</p>
        <AreaBadges areas={areas} tone="ok" emptyLabel={t(`${K}.areasAfterAccept`)} />
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.areasSetByOwner`)}</p>
        {!tokenParam && !accepted ? (
          <OrgInput
            label={t(`${K}.invitationCode`)}
            hint={t(`${K}.invitationCodeHint`)}
            value={typedToken}
            onChange={(event) => setTypedToken(event.target.value)}
            autoComplete="off"
          />
        ) : null}
        {!signedIn && pending ? (
          <div className="flex flex-col gap-3">
            <p id={SIGNED_OUT_HINT_ID} className="te-caption m-0 text-[var(--te-ink-muted)]">
              {t(`${K}.signInToAccept`)}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/sign-in" search={{ returnTo }} className={orgButtonClass("secondary")}>
                {t(`${K}.signIn`)}
              </Link>
              <Link to="/sign-up" search={{ returnTo }} className={orgButtonClass("text")}>
                {t(`${K}.createAccount`)}
              </Link>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          {state === "accepted" ? (
            <OrgButtonLink slug="workspace-home">{t(`${K}.openWorkspace`)}</OrgButtonLink>
          ) : (
            <>
              <OrgButton
                variant="secondary"
                disabled={!pending || busy}
                onClick={() => declineMutation.mutate({ inviteToken })}
              >
                {t(`${K}.decline`)}
              </OrgButton>
              <OrgButton
                disabled={!canAccept}
                aria-describedby={signedIn ? undefined : SIGNED_OUT_HINT_ID}
                onClick={() => acceptMutation.mutate({ inviteToken })}
              >
                {t(`${K}.acceptInvitation`)}
              </OrgButton>
            </>
          )}
        </div>
      </OrgCard>
    </OrgPage>
  );
}
