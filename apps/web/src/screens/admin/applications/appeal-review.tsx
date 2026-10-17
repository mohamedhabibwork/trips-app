import { useEffect, useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { useAuth } from "@/auth/auth-context";
import {
  getSelectedAdminApplicationId,
  setSelectedAdminApplicationId,
} from "@/screens/onboarding-state";
import { client } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

const APPEALED: AdminStatusPresentation = {
  tone: "warning",
  icon: "clock",
  label: "Appealed (pending)",
};

const DECISION_OPTIONS: readonly TeSelectOption[] = [
  { value: "", label: "Select a decision" },
  { value: "uphold-appeal", label: "Uphold appeal (application becomes Approved)" },
  { value: "uphold-rejection", label: "Uphold rejection (application stays Rejected)" },
];

export function AppealReview() {
  const { status: authStatus } = useAuth();
  const [applicationId, setApplicationId] = useState<string | null>(() =>
    getSelectedAdminApplicationId(),
  );
  const [applicantName, setApplicantName] = useState("[Applicant name]");
  const [applicationType, setApplicationType] = useState("[Application type]");
  const [rejectedOn, setRejectedOn] = useState("[Date]");
  const [rejectionReason, setRejectionReason] = useState("[Reason code]");
  const [appealStatement, setAppealStatement] = useState("[Appeal statement from the applicant]");
  const [appealReceived, setAppealReceived] = useState("[Date]");
  const [appealWindowCloses, setAppealWindowCloses] = useState("[Date]");
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const goTo = useAdminNavigate();
  const canSave = decision !== "" && reason.trim() !== "" && !busy;

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;

    async function load() {
      let targetId = getSelectedAdminApplicationId();
      if (!targetId || targetId.startsWith("app-")) {
        const appeals = await client.onboarding.listReviewQueue({
          state: "Appealed",
        });
        targetId = appeals[0]?.id ?? null;
        if (targetId) setSelectedAdminApplicationId(targetId);
      }
      if (!targetId) return;

      const detail = await client.onboarding.getApplicationDetail({ applicationId: targetId });
      if (cancelled) return;
      setApplicationId(detail.application.id);
      setApplicantName(detail.applicant?.fullName ?? "[Applicant name]");
      setApplicationType(detail.application.applicationType);
      if (detail.application.reviewedAt) {
        setRejectedOn(new Date(detail.application.reviewedAt).toLocaleDateString());
      }
      if (detail.application.decisionNotes) {
        setRejectionReason(detail.application.decisionNotes);
      }
      if (detail.application.appealStatement) {
        setAppealStatement(detail.application.appealStatement);
      }
      if (detail.application.appealedAt) {
        setAppealReceived(new Date(detail.application.appealedAt).toLocaleDateString());
      }
      if (detail.application.reapplyBlockedUntil) {
        setAppealWindowCloses(
          new Date(detail.application.reapplyBlockedUntil).toLocaleDateString(),
        );
      }
    }

    void load().catch(() => {
      // Ignore when previewed without session
    });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  async function handleSaveDecision() {
    if (!canSave) return;
    if (authStatus === "authenticated" && applicationId && !applicationId.startsWith("app-")) {
      setBusy(true);
      setErrorMsg(null);
      try {
        await client.onboarding.decideAppeal({
          applicationId,
          decision: decision === "uphold-appeal" ? "approve" : "uphold_rejection",
          decisionReasonCode:
            decision === "uphold-appeal" ? "appeal_upheld" : "appeal_denied_uphold_rejection",
          decisionNotes: reason.trim().length >= 5 ? reason.trim() : `${reason.trim()} (decided)`,
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not save appeal decision.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    await goTo("application-review-detail");
  }

  return (
    <AdminPage>
      <TePageHeader
        title="Appeal review"
        description="Decide an appeal from a rejected applicant."
      />
      <StatePreview
        emptyTitle="No appeal statement"
        emptyDescription="The applicant has not added a statement to this appeal."
        loadingLabel="Loading the appeal."
      >
        <AdminPanel title="Original application">
          <AdminStatus status={APPEALED} />
          <AdminFacts
            items={[
              { label: "Applicant name", value: applicantName },
              { label: "Application type", value: applicationType },
              { label: "Rejected on", value: rejectedOn },
              { label: "Rejection reason", value: rejectionReason },
            ]}
          />
          <AdminScreenLink slug="application-review-detail">
            Open original application
          </AdminScreenLink>
        </AdminPanel>
        <AdminPanel title="Appeal statement">
          <p>{appealStatement}</p>
          <AdminFacts
            items={[
              { label: "Appeal received", value: appealReceived },
              { label: "Appeal window closes", value: appealWindowCloses },
            ]}
          />
        </AdminPanel>
        {errorMsg ? (
          <TeInlineAlert tone="error" title="Could not save decision">
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title="Decision">
          <TeSelect
            label="Decision (required)"
            options={DECISION_OPTIONS}
            value={decision}
            onValueChange={setDecision}
          />
          <TeInput
            label="Reason (required)"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="[Reason for the decision]"
            supportingText="Recorded with the decision in the audit log."
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="Appeal window">
          A decision can be saved only while the appeal window is open.
        </TeInlineAlert>
        <AdminActions>
          <AdminScreenLink slug="application-review-detail" variant="secondary">
            Cancel
          </AdminScreenLink>
          <TeButton disabled={!canSave} onClick={() => void handleSaveDecision()}>
            {busy ? "Saving..." : "Save decision"}
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
