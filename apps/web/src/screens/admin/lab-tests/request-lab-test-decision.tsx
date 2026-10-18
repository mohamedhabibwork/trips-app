import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import {
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  getSelectedAdminEntityId,
  getSelectedAdminLabTestId,
} from "../common/admin-shared";

const MIN_DEADLINE_DAYS = 1;
const MAX_DEADLINE_DAYS = 7;
const DEFAULT_DEADLINE_DAYS = 3;

const TEST_OPTIONS = (): readonly TeSelectOption[] => [
  {
    value: "drug-screening",
    label: t("screen.admin.labTests.requestLabTestDecision.drugScreening"),
  },
  {
    value: "medical-fitness",
    label: t("screen.admin.labTests.requestLabTestDecision.medicalFitness"),
  },
  { value: "both", label: t("screen.admin.labTests.requestLabTestDecision.both") },
];

const DEADLINE_OPTIONS: readonly TeSelectOption[] = Array.from(
  { length: MAX_DEADLINE_DAYS - MIN_DEADLINE_DAYS + 1 },
  (_, index) => {
    const days = MIN_DEADLINE_DAYS + index;
    return { value: String(days), label: days === 1 ? "1 day" : `${days} days` };
  },
);

const ACTIVE = () =>
  ({
    tone: "success",
    icon: "check",
    label: t("screen.admin.labTests.requestLabTestDecision.active"),
  }) as const;

export function RequestLabTestDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [testType, setTestType] = useState("drug-screening");
  const [deadline, setDeadline] = useState(String(DEFAULT_DEADLINE_DAYS));
  const goTo = useAdminNavigate();

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: { applicationType: "platform_driver" },
    }),
    enabled: authStatus === "authenticated",
  });

  const requestMutation = useMutation(
    orpc.driver.adminRequestLabTest.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.driver.key() });
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const apps = queueQuery.data ?? [];
  const selectedId = getSelectedAdminLabTestId() ?? getSelectedAdminEntityId();
  const found = apps.find((a) => a.id === selectedId) ?? apps[0];
  const driverName = found?.applicant?.fullName ?? found?.applicantAccountId ?? "-";
  const driverAccountId = found?.applicantAccountId ?? null;

  const handleConfirm = async () => {
    if (authStatus === "authenticated" && driverAccountId) {
      const days = Number.parseInt(deadline, 10) || DEFAULT_DEADLINE_DAYS;
      const deadlineAt = new Date(Date.now() + days * 86400000).toISOString();
      try {
        await requestMutation.mutateAsync({
          driverAccountId,
          deadlineAt,
        });
      } catch {
        // Proceed back to queue
      }
    }
    void goTo("lab-tests-queue");
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.labTests.requestLabTestDecision.requestLabTestDecision")}
        description={t("screen.admin.labTests.requestLabTestDecision.requestALabTestFor")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.labTests.requestLabTestDecision.noDriverSelected")}
        emptyDescription={t("screen.admin.labTests.requestLabTestDecision.openADriverFromThe")}
        loadingLabel={t("screen.admin.labTests.requestLabTestDecision.loadingTheDriver")}
      >
        <AdminPanel title={t("screen.admin.labTests.requestLabTestDecision.driver")}>
          <AdminStatus status={ACTIVE()} />
          <AdminFacts
            items={[
              {
                label: t("screen.admin.labTests.requestLabTestDecision.driverLabel"),
                value: driverName,
              },
            ]}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.labTests.requestLabTestDecision.testRequest")}>
          <TeSelect
            label={t("screen.admin.labTests.requestLabTestDecision.testType")}
            options={TEST_OPTIONS()}
            value={testType}
            onValueChange={setTestType}
          />
          <TeSelect
            label={t("screen.admin.labTests.requestLabTestDecision.deadline")}
            options={DEADLINE_OPTIONS}
            value={deadline}
            onValueChange={setDeadline}
            supportingText={t("screen.admin.labTests.requestLabTestDecision.between1And7Days")}
          />
          <AdminDecisionForm
            reasonLabel={t("screen.admin.labTests.requestLabTestDecision.reasonForTheLabTest")}
            reasonHelp={t("screen.admin.labTests.requestLabTestDecision.recordedWithTheRequestIn")}
            submitLabel={t(
              "screen.admin.labTests.requestLabTestDecision.requestTestAndPauseDriver",
            )}
            dialogTitle={t("screen.admin.labTests.requestLabTestDecision.pauseThisDriverNow")}
            dialogDescription={t(
              "screen.admin.labTests.requestLabTestDecision.theDriverIsPausedAt",
            )}
            confirmLabel={t("screen.admin.labTests.requestLabTestDecision.requestTestAndPause")}
            tone="danger"
            dialogEffect={
              <p className="te-caption">
                {t("screen.admin.labTests.requestLabTestDecision.upcomingTripsReturnToOrganizers")}
              </p>
            }
            cancel={{
              slug: "lab-tests-queue",
              label: t("screen.admin.labTests.requestLabTestDecision.cancel"),
            }}
            onConfirm={() => void handleConfirm()}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="warning"
          title={t("screen.admin.labTests.requestLabTestDecision.effectOnTheDriver")}
        >
          {t("screen.admin.labTests.requestLabTestDecision.theDriverIsPausedAt2")}
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
