// D5: shows the contact the applicant gave, plus live onboarding application status and actions
// when the supplier has an authenticated session.
import { useEffect, useState } from "react";

import { ActionRow, FactBox } from "@/components/kit/layout";
import { Notice, StatusPill, TextLink } from "@/components/kit/controls";
import { pathFor } from "@/navigation/web-routes";
import { getApplicantRole, setApplicantApplicationId } from "@/screens/onboarding-state";
import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthShell } from "../components/auth-shell";

interface LiveApplicationSummary {
  id: string;
  applicationType: string;
  state: string;
  decisionNotes?: string | null;
}

function signUpScreenForRole(role?: string | null): string {
  if (role === "organization_owner") return "SCR-PUB-06";
  if (role === "platform_photographer") return "SCR-PUB-05";
  return "SCR-PUB-04";
}

export function PendingApprovalScreen({ contact, role }: { contact: string; role?: string }) {
  const { t, status: authStatus } = useAuth();
  const [app, setApp] = useState<LiveApplicationSummary | null>(null);
  const [checkedStatus, setCheckedStatus] = useState(false);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    void client.onboarding
      .getApplicationStatus({})
      .then((res) => {
        if (cancelled) return;
        setCheckedStatus(true);
        if (res.application) {
          const summary = res.application as unknown as LiveApplicationSummary;
          setApp(summary);
          setApplicantApplicationId(summary.id);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckedStatus(true);
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  const effectiveRole = role ?? getApplicantRole();
  const signUpPath = pathFor(signUpScreenForRole(effectiveRole));

  return (
    <AuthShell
      width={560}
      badge={
        <StatusPill tone="success" icon="check">
          {t("screen.auth.pending.badge")}
        </StatusPill>
      }
      title={t("auth.pending.title")}
      subtitle={t("auth.pending.body", { contact })}
      footer={
        <ActionRow>
          <TextLink to={pathFor("SCR-PUB-17")}>
            {t("screen.pendingApprovalScreen.trackApplicationStatus")}
          </TextLink>
          <TextLink to={pathFor("SCR-PUB-08")} tone="ink">
            {t("auth.pending.backToSignIn")}
          </TextLink>
        </ActionRow>
      }
    >
      <Notice tone="info">{t("auth.error.pendingApproval")}</Notice>

      {checkedStatus && !app ? (
        <FactBox label={t("screen.pendingApprovalScreen.completeYourSupplierApplication")}>
          <span className="flex flex-col gap-2">
            <span className="text-[var(--te-ink-muted)]">
              {t("screen.pendingApprovalScreen.submitYourDocumentsAndDetails")}
            </span>
            <TextLink to={signUpPath}>
              {t("screen.pendingApprovalScreen.openApplicationForm")}
            </TextLink>
          </span>
        </FactBox>
      ) : null}

      {app ? (
        <FactBox label={t("screen.pendingApprovalScreen.applicationStatus")}>
          <span className="flex flex-col gap-2">
            <span className="font-semibold">{app.state}</span>
            {app.decisionNotes ? (
              <span className="text-[var(--te-danger)]">
                {t("screen.pendingApprovalScreen.notes")} {app.decisionNotes}
              </span>
            ) : null}
            <span className="flex flex-wrap gap-4">
              <TextLink to={pathFor("SCR-PUB-17")}>
                {t("screen.pendingApprovalScreen.viewStatusRespondToChanges")}
              </TextLink>
              {app.state === "Rejected" ? (
                <TextLink to={pathFor("SCR-PUB-18")}>
                  {t("screen.pendingApprovalScreen.appealRejection")}
                </TextLink>
              ) : null}
            </span>
          </span>
        </FactBox>
      ) : null}
    </AuthShell>
  );
}
