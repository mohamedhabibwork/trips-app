// D5: shows the contact the applicant gave, plus live onboarding application status and actions
// when the supplier has an authenticated session.
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

function signUpSlugForRole(role?: string | null): string {
  if (role === "organization_owner") return "organization-sign-up";
  if (role === "platform_photographer") return "photographer-sign-up";
  return "platform-driver-sign-up";
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
  const targetSignUpSlug = signUpSlugForRole(effectiveRole);

  return (
    <AuthShell title={t("auth.pending.title")} subtitle={t("auth.pending.body", { contact })}>
      <p className="text-muted-foreground text-xs">{t("auth.error.pendingApproval")}</p>

      {checkedStatus && !app ? (
        <div className="grid gap-2 rounded border p-3 text-xs">
          <p className="font-medium">Complete your supplier application</p>
          <p className="text-muted-foreground">
            Submit your documents and details so our review team can approve your account.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/screens/$surface/$slug"
              params={{ surface: "public", slug: targetSignUpSlug }}
              className="underline underline-offset-4"
            >
              Open application form
            </Link>
          </div>
        </div>
      ) : null}

      {app ? (
        <div className="grid gap-2 rounded border p-3 text-xs">
          <p className="font-medium">
            Application status: <span className="uppercase">{app.state}</span>
          </p>
          {app.decisionNotes ? (
            <p className="text-destructive">Notes: {app.decisionNotes}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/screens/$surface/$slug"
              params={{ surface: "public", slug: "application-status-and-changes-response" }}
              className="underline underline-offset-4"
            >
              View status & respond to changes
            </Link>
            {app.state === "Rejected" ? (
              <Link
                to="/screens/$surface/$slug"
                params={{ surface: "public", slug: "appeal-a-rejection" }}
                className="underline underline-offset-4"
              >
                Appeal rejection
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 text-xs">
        <Link
          to="/screens/$surface/$slug"
          params={{ surface: "public", slug: "application-status-and-changes-response" }}
          className="underline underline-offset-4"
        >
          Track application status
        </Link>
        <Link to="/sign-in" className="underline underline-offset-4">
          {t("auth.pending.backToSignIn")}
        </Link>
      </div>
    </AuthShell>
  );
}
