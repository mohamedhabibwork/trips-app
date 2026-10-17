import { useEffect, useState } from "react";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { useAuth } from "@/auth/auth-context";
import { getSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { client } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel } from "../common/admin-shared";

export function RejectWithReasonDecision() {
  const { status: authStatus } = useAuth();
  const [applicantName, setApplicantName] = useState("[Applicant name]");
  const [applicationType, setApplicationType] = useState("[Application type]");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const goTo = useAdminNavigate();

  useEffect(() => {
    const appId = getSelectedAdminApplicationId();
    if (authStatus !== "authenticated" || !appId || appId.startsWith("app-")) return;
    let cancelled = false;
    void client.onboarding
      .getApplicationDetail({ applicationId: appId })
      .then((detail) => {
        if (cancelled) return;
        setApplicantName(detail.applicant?.fullName ?? "[Applicant name]");
        setApplicationType(detail.application.applicationType);
      })
      .catch(() => {
        // Ignore when previewed without session
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  async function handleConfirm(reason: string) {
    const appId = getSelectedAdminApplicationId();
    if (authStatus === "authenticated" && appId && !appId.startsWith("app-")) {
      setErrorMsg(null);
      try {
        await client.onboarding.rejectApplication({
          applicationId: appId,
          decisionReasonCode: "rejected_by_admin",
          decisionNotes: reason.length >= 5 ? reason : `${reason} (rejected by admin)`,
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not reject application.");
        return;
      }
    }
    await goTo("application-queue");
  }

  return (
    <AdminPage>
      <TePageHeader
        title="Reject with reason (decision)"
        description="Reject this application. The applicant is told the reason."
      />
      <StatePreview
        emptyTitle="No reason entered"
        emptyDescription="Enter a reason before you reject the application."
        loadingLabel="Loading the application."
      >
        <AdminPanel title="Applicant">
          <AdminFacts
            items={[
              { label: "Applicant name", value: applicantName },
              { label: "Application type", value: applicationType },
            ]}
          />
        </AdminPanel>
        {errorMsg ? (
          <TeInlineAlert tone="error" title="Could not reject application">
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title="Reason">
          <AdminDecisionForm
            reasonLabel="Reason for rejection (required)"
            reasonHelp="Reason codes are proposed (D-234). This text is sent to the applicant."
            submitLabel="Reject application"
            dialogTitle="Reject this application?"
            dialogDescription="The applicant is told the reason. They can re-apply after 30 days, or appeal."
            confirmLabel="Reject application"
            tone="danger"
            cancel={{ slug: "application-review-detail", label: "Cancel" }}
            onConfirm={(reason) => handleConfirm(reason)}
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="What the applicant can do next">
          The applicant can re-apply after 30 days. The applicant can also appeal this decision.
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
