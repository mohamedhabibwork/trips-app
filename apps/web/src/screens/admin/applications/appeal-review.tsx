import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import {
  getSelectedAdminApplicationId,
  setSelectedAdminApplicationId,
} from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";
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

const APPEALED = (): AdminStatusPresentation => ({
  tone: "warning",
  icon: "clock",
  label: t("screen.admin.applications.appealReview.appealedPending"),
});

const DECISION_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "", label: t("screen.admin.applications.appealReview.selectADecision") },
  {
    value: "uphold-appeal",
    label: t("screen.admin.applications.appealReview.upholdAppealApplicationBecomesApproved"),
  },
  {
    value: "uphold-rejection",
    label: t("screen.admin.applications.appealReview.upholdRejectionApplicationStaysRejected"),
  },
];

export function AppealReview() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();

  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const appealsQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: { state: "Appealed" },
    }),
    enabled: authStatus === "authenticated",
  });

  const selectedId = getSelectedAdminApplicationId();
  const fallbackId = appealsQuery.data?.[0]?.id ?? null;
  const targetId = selectedId || fallbackId;

  if (targetId && !selectedId) {
    setSelectedAdminApplicationId(targetId);
  }

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: targetId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(targetId),
  });

  const decideAppealMutation = useMutation(
    orpc.onboarding.decideAppeal.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const detail = detailQuery.data;
  const applicationId = detail?.application.id ?? targetId;
  const applicantName =
    detail?.applicant?.fullName ?? detail?.application.applicantAccountId ?? "-";
  const applicationType = detail?.application.applicationType ?? "-";
  const rejectedOn = detail?.application.reviewedAt
    ? new Date(detail.application.reviewedAt).toLocaleDateString()
    : "-";
  const rejectionReason = detail?.application.decisionNotes ?? "-";
  const appealStatement = detail?.application.appealStatement ?? "-";
  const appealReceived = detail?.application.appealedAt
    ? new Date(detail.application.appealedAt).toLocaleDateString()
    : "-";
  const appealWindowCloses = detail?.application.reapplyBlockedUntil
    ? new Date(detail.application.reapplyBlockedUntil).toLocaleDateString()
    : "-";

  const busy = decideAppealMutation.isPending;
  const canSave = decision !== "" && reason.trim() !== "" && !busy;

  async function handleSaveDecision() {
    if (!canSave) return;
    if (authStatus === "authenticated" && applicationId && !applicationId.startsWith("app-")) {
      setErrorMsg(null);
      try {
        await decideAppealMutation.mutateAsync({
          applicationId,
          decision: decision === "uphold-appeal" ? "approve" : "uphold_rejection",
          decisionReasonCode:
            decision === "uphold-appeal" ? "appeal_upheld" : "appeal_denied_uphold_rejection",
          decisionNotes: reason.trim().length >= 5 ? reason.trim() : `${reason.trim()} (decided)`,
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not save appeal decision.");
        return;
      }
    }
    await goTo("application-review-detail");
  }

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.applications.appealReview.appealReview")}
        description={t("screen.admin.applications.appealReview.decideAnAppealFromA")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.applications.appealReview.noAppealStatement")}
        emptyDescription={t("screen.admin.applications.appealReview.theApplicantHasNotAdded")}
        loadingLabel={t("screen.admin.applications.appealReview.loadingTheAppeal")}
      >
        <AdminPanel title={t("screen.admin.applications.appealReview.originalApplication")}>
          <AdminStatus status={APPEALED()} />
          <AdminFacts
            items={[
              {
                label: t("screen.admin.applications.appealReview.applicantName"),
                value: applicantName,
              },
              {
                label: t("screen.admin.applications.appealReview.applicationType"),
                value: applicationType,
              },
              { label: t("screen.admin.applications.appealReview.rejectedOn"), value: rejectedOn },
              {
                label: t("screen.admin.applications.appealReview.rejectionReason"),
                value: rejectionReason,
              },
            ]}
          />
          <AdminScreenLink slug="application-review-detail">
            {t("screen.admin.applications.appealReview.openOriginalApplication")}
          </AdminScreenLink>
        </AdminPanel>
        <AdminPanel title={t("screen.admin.applications.appealReview.appealStatement")}>
          <p>{appealStatement}</p>
          <AdminFacts
            items={[
              {
                label: t("screen.admin.applications.appealReview.appealReceived"),
                value: appealReceived,
              },
              {
                label: t("screen.admin.applications.appealReview.appealWindowCloses"),
                value: appealWindowCloses,
              },
            ]}
          />
        </AdminPanel>
        {errorMsg ? (
          <TeInlineAlert
            tone="error"
            title={t("screen.admin.applications.appealReview.couldNotSaveDecision")}
          >
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title={t("screen.admin.applications.appealReview.decision")}>
          <TeSelect
            label={t("screen.admin.applications.appealReview.decisionRequired")}
            options={DECISION_OPTIONS()}
            value={decision}
            onValueChange={setDecision}
          />
          <TeInput
            label={t("screen.admin.applications.appealReview.reasonRequired")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("screen.admin.applications.appealReview.reasonForTheDecision")}
            supportingText={t("screen.admin.applications.appealReview.recordedWithTheDecisionIn")}
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title={t("screen.admin.applications.appealReview.appealWindow")}>
          {t("screen.admin.applications.appealReview.aDecisionCanBeSaved")}
        </TeInlineAlert>
        <AdminActions>
          <AdminScreenLink slug="application-review-detail" variant="secondary">
            {t("screen.admin.applications.appealReview.cancel")}
          </AdminScreenLink>
          <TeButton disabled={!canSave} onClick={() => void handleSaveDecision()}>
            {busy
              ? t("screen.admin.applications.appealReview.saving")
              : t("screen.admin.applications.appealReview.saveDecision")}
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
