// SCR-ADM-13 Lab test detail and decision (docs/design/web/admin/SCR-ADM-13.dc.html): the test, its
// result file and consent record, with Mark passed / Mark failed and what each decision does.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink, useAdminNavigate, useAdminParam } from "../common/admin-actions";
import { getSelectedAdminLabTestId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminRow,
  AdminSplit,
} from "../common/admin-ui";
import { LabStateBadge, labStateOf } from "./lab-test-state";

type Decision = "verified_pass" | "verified_fail";

const REVIEW_NOTES: Record<Decision, string> = {
  verified_pass: "Passed review",
  verified_fail: "Failed review",
};

function EffectLine({ lead, body }: { lead: string; body: string }) {
  return (
    <p className="te-body">
      <strong>{lead}</strong> {body}
    </p>
  );
}

function DecisionEffect() {
  return (
    <>
      <AdminCard title={t("screen.admin.labTests.labTestDetailAndDecision.decisionEffect")}>
        <EffectLine
          lead={t("screen.admin.labTests.labTestDetailAndDecision.markPassedLead")}
          body={t("screen.admin.labTests.labTestDetailAndDecision.markPassedEffect")}
        />
        <EffectLine
          lead={t("screen.admin.labTests.labTestDetailAndDecision.markFailedLead")}
          body={t("screen.admin.labTests.labTestDetailAndDecision.markFailedEffect")}
        />
      </AdminCard>
      <AdminAlert tone="info">
        {t("screen.admin.labTests.labTestDetailAndDecision.missedTestRule")}
      </AdminAlert>
    </>
  );
}

export function LabTestDetailAndDecision() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const labTestId = useAdminParam("labTestId", getSelectedAdminLabTestId);

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: { applicationType: "platform_driver" },
    }),
    enabled: authStatus === "authenticated",
  });
  const found = (queueQuery.data ?? []).find((item) => item.id === labTestId);

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: found?.id ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(found),
  });

  const reviewMutation = useMutation(
    orpc.driver.adminReviewLabTest.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.driver.key() });
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const decide = (decision: Decision) => {
    if (!found) return;
    reviewMutation.mutate(
      { labTestId: found.id, decision, reviewNotes: REVIEW_NOTES[decision] },
      { onSuccess: () => void goTo("SCR-ADM-12") },
    );
  };

  const driverName = found?.applicant?.fullName ?? found?.applicantAccountId ?? "—";
  const detail = detailQuery.data;
  const labDocument =
    detail?.documents.find((document) => document.documentType.includes("lab")) ??
    detail?.documents[0];
  const labConsent = detail?.consents.find((consent) => consent.consentType === "driver_lab_test");
  const canDecide = Boolean(found) && !reviewMutation.isPending;

  return (
    <AdminPage
      title={t("screen.admin.labTests.labTestDetailAndDecision.title", { driver: driverName })}
      description={t("screen.admin.labTests.labTestDetailAndDecision.description")}
      actions={
        <>
          <AdminButton
            variant="danger-outline"
            disabled={!canDecide}
            onClick={() => decide("verified_fail")}
          >
            {t("screen.admin.labTests.labTestDetailAndDecision.markFailed")}
          </AdminButton>
          <AdminButton
            variant="primary"
            disabled={!canDecide}
            onClick={() => decide("verified_pass")}
          >
            {t("screen.admin.labTests.labTestDetailAndDecision.markPassed")}
          </AdminButton>
        </>
      }
    >
      {reviewMutation.isError ? (
        <AdminAlert
          tone="danger"
          title={t("screen.admin.labTests.labTestDetailAndDecision.decisionFailedTitle")}
        >
          {t("screen.admin.labTests.labTestDetailAndDecision.decisionFailedBody")}
        </AdminAlert>
      ) : null}
      <AdminQueryState
        query={queueQuery}
        loadingLabel={t("screen.admin.labTests.labTestDetailAndDecision.loading")}
      >
        {found ? (
          <AdminSplit
            main={
              <>
                <AdminCard title={t("screen.admin.labTests.labTestDetailAndDecision.test")}>
                  <div>
                    <AdminRow label={t("screen.admin.labTests.labTestDetailAndDecision.track")}>
                      —
                    </AdminRow>
                    <AdminRow label={t("screen.admin.labTests.labTestDetailAndDecision.requested")}>
                      {new Date(found.createdAt).toLocaleString(locale)}
                    </AdminRow>
                    <AdminRow label={t("screen.admin.labTests.labTestDetailAndDecision.deadline")}>
                      —
                    </AdminRow>
                    <AdminRow
                      label={t("screen.admin.labTests.labTestDetailAndDecision.state")}
                      last
                    >
                      <LabStateBadge
                        state={labStateOf(found.state)}
                        overdue={Boolean(found.isSlaOverdue)}
                        label={
                          labStateOf(found.state) === "result-uploaded"
                            ? t("screen.admin.labTests.labTestDetailAndDecision.decisionNeeded")
                            : undefined
                        }
                      />
                    </AdminRow>
                  </div>
                </AdminCard>
                <AdminCard title={t("screen.admin.labTests.labTestDetailAndDecision.resultFile")}>
                  <AdminRow
                    strong
                    last
                    label={t("screen.admin.labTests.labTestDetailAndDecision.fileReference", {
                      reference: labDocument?.storageKey ?? "—",
                    })}
                  >
                    {/* No endpoint opens a lab partner file from the admin console yet. */}
                    <AdminButton small disabled>
                      {t("screen.admin.labTests.labTestDetailAndDecision.viewFile")}
                    </AdminButton>
                  </AdminRow>
                </AdminCard>
                <AdminCard
                  title={t("screen.admin.labTests.labTestDetailAndDecision.consentRecord")}
                >
                  <AdminRow
                    strong
                    last
                    label={t("screen.admin.labTests.labTestDetailAndDecision.labConsentRecorded")}
                  >
                    {labConsent ? (
                      <AdminBadge tone="ok">
                        {t("screen.admin.labTests.labTestDetailAndDecision.onFile", {
                          date: new Date(labConsent.signedAt).toLocaleDateString(locale),
                        })}
                      </AdminBadge>
                    ) : (
                      <AdminBadge tone="warn">
                        {t("screen.admin.labTests.labTestDetailAndDecision.notOnFile")}
                      </AdminBadge>
                    )}
                  </AdminRow>
                </AdminCard>
              </>
            }
            side={<DecisionEffect />}
          />
        ) : (
          <AdminCard>
            <AdminEmpty
              title={t("screen.admin.labTests.labTestDetailAndDecision.notFoundTitle")}
              description={t("screen.admin.labTests.labTestDetailAndDecision.notFoundBody")}
            />
            <AdminLink screen="SCR-ADM-12">
              {t("screen.admin.labTests.labTestDetailAndDecision.backToLabTests")}
            </AdminLink>
          </AdminCard>
        )}
      </AdminQueryState>
    </AdminPage>
  );
}
