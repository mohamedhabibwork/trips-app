// SCR-ADM-14 Request lab test (docs/design/web/admin/SCR-ADM-14.dc.html): pick the driver, the test
// type and a 1-7 day deadline. Requesting a test pauses the driver at once.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink, useAdminNavigate } from "../common/admin-actions";
import { AdminRadioGroup, AdminSelect, type AdminOption } from "../common/admin-form";
import { getSelectedAdminEntityId, getSelectedAdminLabTestId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminCard, AdminPage, AdminSplit } from "../common/admin-ui";

const MIN_DEADLINE_DAYS = 1;
const MAX_DEADLINE_DAYS = 7;
const DEFAULT_DEADLINE_DAYS = 3;
const DAY_MS = 86_400_000;

function testTypeOptions() {
  return [
    {
      value: "drug_screening",
      label: t("screen.admin.labTests.requestLabTestDecision.drugScreening"),
    },
    {
      value: "medical_fitness",
      label: t("screen.admin.labTests.requestLabTestDecision.medicalFitness"),
    },
    { value: "both", label: t("screen.admin.labTests.requestLabTestDecision.both") },
  ];
}

function daysLabel(days: number): string {
  return days === 1
    ? t("screen.admin.labTests.requestLabTestDecision.oneDay")
    : t("screen.admin.labTests.requestLabTestDecision.days", { days });
}

function DeadlineStepper({ days, onChange }: { days: number; onChange: (days: number) => void }) {
  return (
    <div className="flex items-center gap-4">
      <AdminButton
        aria-label={t("screen.admin.labTests.requestLabTestDecision.decreaseDeadline")}
        disabled={days <= MIN_DEADLINE_DAYS}
        onClick={() => onChange(days - 1)}
      >
        −
      </AdminButton>
      <span className="te-h3 min-w-[5rem] text-center" aria-live="polite">
        {daysLabel(days)}
      </span>
      <AdminButton
        aria-label={t("screen.admin.labTests.requestLabTestDecision.increaseDeadline")}
        disabled={days >= MAX_DEADLINE_DAYS}
        onClick={() => onChange(days + 1)}
      >
        +
      </AdminButton>
    </div>
  );
}

function RequestEffect() {
  return (
    <>
      <AdminAlert
        tone="warning"
        title={t("screen.admin.labTests.requestLabTestDecision.effectTitle")}
      >
        <p>{t("screen.admin.labTests.requestLabTestDecision.effectPaused")}</p>
        <p>{t("screen.admin.labTests.requestLabTestDecision.effectAllowedActions")}</p>
        <p>{t("screen.admin.labTests.requestLabTestDecision.effectTrips")}</p>
      </AdminAlert>
      <AdminCard>
        <p className="te-caption">{t("screen.admin.labTests.requestLabTestDecision.auditNote")}</p>
      </AdminCard>
    </>
  );
}

export function RequestLabTestDecision() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const [pickedDriver, setPickedDriver] = useState<string | null>(null);
  const [testType, setTestType] = useState("drug_screening");
  const [days, setDays] = useState(DEFAULT_DEADLINE_DAYS);

  const queueQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.listReviewQueue, "onboarding/listReviewQueue", {
      input: { applicationType: "platform_driver" },
    }),
    enabled: authStatus === "authenticated",
  });

  const requestMutation = useMutation(
    serverMutationOptions(orpc.driver.adminRequestLabTest, "driver/adminRequestLabTest", {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.driver.key() });
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const applications = queueQuery.data ?? [];
  const driverOptions: readonly AdminOption[] = [
    ...new Map(
      applications.map((item) => [
        item.applicantAccountId,
        item.applicant?.fullName ?? item.applicantAccountId,
      ]),
    ),
  ].map(([value, label]) => ({ value, label }));
  // The driver opened on the previous page is preselected; otherwise the first in the list.
  const remembered = getSelectedAdminLabTestId() ?? getSelectedAdminEntityId();
  const rememberedDriver = applications.find((item) => item.id === remembered)?.applicantAccountId;
  const driverAccountId = pickedDriver ?? rememberedDriver ?? driverOptions[0]?.value ?? null;

  const deadline = new Date(Date.now() + days * DAY_MS);

  const submit = () => {
    if (!driverAccountId) return;
    requestMutation.mutate(
      {
        driverAccountId,
        deadlineAt: new Date(Date.now() + days * DAY_MS).toISOString(),
        testType: testType as "drug_screening" | "medical_fitness" | "both",
      },
      { onSuccess: () => void goTo("SCR-ADM-12") },
    );
  };

  return (
    <AdminPage
      title={t("screen.admin.labTests.requestLabTestDecision.title")}
      description={t("screen.admin.labTests.requestLabTestDecision.description")}
      actions={
        <>
          <AdminLink screen="SCR-ADM-12" variant="secondary">
            {t("screen.admin.labTests.requestLabTestDecision.cancel")}
          </AdminLink>
          <AdminButton
            variant="primary"
            disabled={!driverAccountId || requestMutation.isPending}
            onClick={submit}
          >
            {t("screen.admin.labTests.requestLabTestDecision.requestTest")}
          </AdminButton>
        </>
      }
    >
      {requestMutation.isError ? (
        <AdminAlert
          tone="danger"
          title={t("screen.admin.labTests.requestLabTestDecision.requestFailedTitle")}
        >
          {t("screen.admin.labTests.requestLabTestDecision.requestFailedBody")}
        </AdminAlert>
      ) : null}
      <AdminQueryState
        query={queueQuery}
        loadingLabel={t("screen.admin.labTests.requestLabTestDecision.loading")}
      >
        <AdminSplit
          main={
            <>
              <AdminCard title={t("screen.admin.labTests.requestLabTestDecision.driverAndTest")}>
                {driverOptions.length > 0 && driverAccountId ? (
                  <AdminSelect
                    label={t("screen.admin.labTests.requestLabTestDecision.driver")}
                    options={driverOptions}
                    value={driverAccountId}
                    onValueChange={setPickedDriver}
                  />
                ) : (
                  <AdminEmpty
                    title={t("screen.admin.labTests.requestLabTestDecision.noDriversTitle")}
                    description={t("screen.admin.labTests.requestLabTestDecision.noDriversBody")}
                  />
                )}
                <AdminRadioGroup
                  legend={t("screen.admin.labTests.requestLabTestDecision.testType")}
                  name="lab-test-type"
                  value={testType}
                  options={testTypeOptions()}
                  onValueChange={setTestType}
                />
              </AdminCard>
              <AdminCard
                title={t("screen.admin.labTests.requestLabTestDecision.deadline")}
                caption={t("screen.admin.labTests.requestLabTestDecision.deadlineHelp")}
              >
                <DeadlineStepper days={days} onChange={setDays} />
                <span className="te-caption">
                  {t("screen.admin.labTests.requestLabTestDecision.deadlineDate", {
                    date: deadline.toLocaleDateString(locale),
                  })}
                </span>
              </AdminCard>
            </>
          }
          side={<RequestEffect />}
        />
      </AdminQueryState>
    </AdminPage>
  );
}
