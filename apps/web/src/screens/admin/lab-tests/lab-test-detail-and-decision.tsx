import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  getSelectedAdminLabTestId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

const RESULT_UPLOADED = (): AdminStatusPresentation => ({
  tone: "highlight",
  icon: "file",
  label: t("screen.admin.labTests.labTestDetailAndDecision.resultUploaded"),
});

export function LabTestDetailAndDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: { applicationType: "platform_driver" },
    }),
    enabled: authStatus === "authenticated",
  });

  const apps = queueQuery.data ?? [];
  const selectedId = getSelectedAdminLabTestId();
  const found = apps.find((a) => a.id === selectedId) ?? apps[0];
  const targetId = found?.id ?? null;

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: targetId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(targetId),
  });

  const reviewMutation = useMutation(
    orpc.driver.adminReviewLabTest.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.driver.key() });
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const labTestId = targetId;
  const driverName = found?.applicant?.fullName ?? found?.applicantAccountId ?? "-";
  const track = "Drug screening";
  const createdMs = found ? new Date(found.createdAt).getTime() : 0;
  const requestedAt = found
    ? new Date(found.createdAt).toISOString().slice(0, 16).replace("T", " ")
    : "-";
  const deadlineAt = found ? new Date(createdMs + 3 * 86400000).toISOString().slice(0, 10) : "-";

  const detail = detailQuery.data;
  const labDoc =
    detail?.documents.find((d) => d.documentType.includes("lab")) ?? detail?.documents[0];
  const resultRef = labDoc ? labDoc.storageKey : "-";
  const labConsent = (detail?.consents ?? []).find((c) => c.consentType === "driver_lab_test");
  const consentRef = labConsent ? labConsent.id.slice(0, 8) : "-";

  const handleDecision = async (decision: "verified_pass" | "verified_fail") => {
    if (authStatus === "authenticated" && labTestId) {
      try {
        await reviewMutation.mutateAsync({
          labTestId,
          decision,
          reviewNotes: decision === "verified_pass" ? "Passed review" : "Failed review",
        });
      } catch {
        // Proceed back to queue
      }
    }
    void goTo("lab-tests-queue");
  };

  const timelineItems: readonly TeTimelineItem[] = [
    {
      id: "requested",
      time: requestedAt,
      label: t("screen.admin.labTests.labTestDetailAndDecision.testRequested"),
      state: "done",
    },
    {
      id: "result",
      time: requestedAt,
      label: t("screen.admin.labTests.labTestDetailAndDecision.resultUploadedByTheLab"),
      state: "current",
    },
    {
      id: "decision",
      time: "-",
      label: t("screen.admin.labTests.labTestDetailAndDecision.decisionPassedOrFailed"),
      state: "upcoming",
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.labTests.labTestDetailAndDecision.labTestDetailAndDecision")}
        description={t("screen.admin.labTests.labTestDetailAndDecision.reviewTheResultAndDecide")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.labTests.labTestDetailAndDecision.noResultYet")}
        emptyDescription={t("screen.admin.labTests.labTestDetailAndDecision.theLabPartnerHasNot")}
        loadingLabel={t("screen.admin.labTests.labTestDetailAndDecision.loadingTheLabTest")}
      >
        <AdminPanel title={t("screen.admin.labTests.labTestDetailAndDecision.test")}>
          <AdminStatus status={RESULT_UPLOADED()} />
          <AdminFacts
            items={[
              {
                label: t("screen.admin.labTests.labTestDetailAndDecision.driver"),
                value: driverName,
              },
              {
                label: t("screen.admin.labTests.labTestDetailAndDecision.track"),
                value: track,
              },
              {
                label: t("screen.admin.labTests.labTestDetailAndDecision.requested"),
                value: requestedAt,
              },
              {
                label: t("screen.admin.labTests.labTestDetailAndDecision.deadline"),
                value: deadlineAt,
              },
              {
                label: t("screen.admin.labTests.labTestDetailAndDecision.labResultReference"),
                value: resultRef,
              },
              {
                label: t("screen.admin.labTests.labTestDetailAndDecision.consentRecord"),
                value: consentRef,
              },
            ]}
          />
          <TeButton variant="ghost">
            {t("screen.admin.labTests.labTestDetailAndDecision.openResultFile")}
          </TeButton>
          <AdminScreenLink slug="entity-detail">
            {t("screen.admin.labTests.labTestDetailAndDecision.openDriverAccount")}
          </AdminScreenLink>
        </AdminPanel>
        <AdminPanel title={t("screen.admin.labTests.labTestDetailAndDecision.timeline")}>
          <TeTimeline
            items={timelineItems}
            ariaLabel={t("screen.admin.labTests.labTestDetailAndDecision.labTestTimeline")}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.labTests.labTestDetailAndDecision.whatEachDecisionDoes")}
        >
          {t("screen.admin.labTests.labTestDetailAndDecision.markPassedUnpausesTheDriver")}
        </TeInlineAlert>
        <AdminActions>
          <AdminScreenLink slug="lab-tests-queue" variant="ghost">
            {t("screen.admin.labTests.labTestDetailAndDecision.backToLabTests")}
          </AdminScreenLink>
          <TeButton variant="destructive" onClick={() => void handleDecision("verified_fail")}>
            {t("screen.admin.labTests.labTestDetailAndDecision.markFailed")}
          </TeButton>
          <TeButton onClick={() => void handleDecision("verified_pass")}>
            {t("screen.admin.labTests.labTestDetailAndDecision.markPassed")}
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
