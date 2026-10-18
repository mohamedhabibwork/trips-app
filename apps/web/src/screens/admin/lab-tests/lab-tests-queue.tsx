import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  setSelectedAdminLabTestId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

type LabState = "requested" | "pending" | "result-uploaded" | "passed" | "failed" | "missed";

interface LabTestRow {
  id: string;
  driver: string;
  track: string;
  requested: string;
  deadline: string;
  state: LabState;
  overdue: boolean;
}

const STATE_PRESENTATION = (): Record<LabState, AdminStatusPresentation> => ({
  requested: {
    tone: "info",
    icon: "clock",
    label: t("screen.admin.labTests.labTestsQueue.requested"),
  },
  pending: { tone: "info", icon: "clock", label: t("screen.admin.labTests.labTestsQueue.pending") },
  "result-uploaded": {
    tone: "highlight",
    icon: "file",
    label: t("screen.admin.labTests.labTestsQueue.resultUploaded"),
  },
  passed: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.labTests.labTestsQueue.passed"),
  },
  failed: { tone: "danger", icon: "close", label: t("screen.admin.labTests.labTestsQueue.failed") },
  missed: { tone: "danger", icon: "alert", label: t("screen.admin.labTests.labTestsQueue.missed") },
});

const OVERDUE = (): AdminStatusPresentation => ({
  tone: "danger",
  icon: "alert",
  label: t("screen.admin.labTests.labTestsQueue.overdue"),
});

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.labTests.labTestsQueue.anyState") },
  { value: "requested", label: t("screen.admin.labTests.labTestsQueue.requestedLabel") },
  { value: "pending", label: t("screen.admin.labTests.labTestsQueue.pendingLabel") },
  { value: "result-uploaded", label: t("screen.admin.labTests.labTestsQueue.resultUploadedLabel") },
  { value: "passed", label: t("screen.admin.labTests.labTestsQueue.passedLabel") },
  { value: "failed", label: t("screen.admin.labTests.labTestsQueue.failedLabel") },
  { value: "missed", label: t("screen.admin.labTests.labTestsQueue.missedLabel") },
];

export function LabTestsQueue() {
  const { status: authStatus } = useAuth();
  const goTo = useAdminNavigate();
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [stateFilter, setStateFilter] = useState("all");

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: { applicationType: "platform_driver" },
    }),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly LabTestRow[] = (queueQuery.data ?? []).map((app) => {
    const createdMs = new Date(app.createdAt).getTime();
    const deadlineIso = new Date(createdMs + 3 * 86400000).toISOString().slice(0, 10);
    const state: LabState =
      app.state === "Approved" ? "passed" : app.state === "Rejected" ? "failed" : "result-uploaded";
    return {
      id: app.id,
      driver: app.applicant?.fullName ?? app.applicantAccountId,
      track: "Drug screening",
      requested: new Date(app.createdAt).toISOString().slice(0, 10),
      deadline: deadlineIso,
      state,
      overdue: Boolean(app.isSlaOverdue),
    };
  });

  const visibleRows = rows.filter((row) => {
    if (overdueOnly && !row.overdue) return false;
    if (stateFilter !== "all" && row.state !== stateFilter) return false;
    return true;
  });

  const columns: readonly TeDataTableColumn<LabTestRow>[] = [
    { key: "driver", header: t("screen.admin.labTests.labTestsQueue.driver") },
    { key: "track", header: t("screen.admin.labTests.labTestsQueue.track") },
    { key: "requested", header: t("screen.admin.labTests.labTestsQueue.requestedHeader") },
    { key: "deadline", header: t("screen.admin.labTests.labTestsQueue.deadline") },
    {
      key: "state",
      header: t("screen.admin.labTests.labTestsQueue.state"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    {
      key: "overdue",
      header: t("screen.admin.labTests.labTestsQueue.overdueHeader"),
      render: (row) =>
        row.overdue ? (
          <AdminStatus status={OVERDUE()} />
        ) : (
          <span>{t("screen.admin.labTests.labTestsQueue.notOverdue")}</span>
        ),
    },
    {
      key: "open",
      header: t("screen.admin.labTests.labTestsQueue.action"),
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={t("screen.admin.labTests.labTestsQueue.openLabTestFor", {
            driver: row.driver,
          })}
          onClick={() => {
            setSelectedAdminLabTestId(row.id);
            void goTo("lab-test-detail-and-decision");
          }}
        >
          {t("screen.admin.labTests.labTestsQueue.openTest")}
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.labTests.labTestsQueue.labTestsQueue")}
        description={t("screen.admin.labTests.labTestsQueue.trackLabTestsByState")}
        actions={
          <AdminActions>
            <AdminScreenLink slug="request-lab-test-decision" variant="secondary">
              {t("screen.admin.labTests.labTestsQueue.requestLabTest")}
            </AdminScreenLink>
            <AdminScreenLink slug="lab-test-detail-and-decision" variant="primary">
              {t("screen.admin.labTests.labTestsQueue.openNextDueTest")}
            </AdminScreenLink>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.labTests.labTestsQueue.noLabTests")}
        emptyDescription={t("screen.admin.labTests.labTestsQueue.noLabTestsMatchThese")}
        loadingLabel={t("screen.admin.labTests.labTestsQueue.loadingTheLabTests")}
      >
        <AdminFilters>
          <TeSwitch
            label={t("screen.admin.labTests.labTestsQueue.overdueOnly")}
            checked={overdueOnly}
            onCheckedChange={setOverdueOnly}
          />
          <TeSelect
            label={t("screen.admin.labTests.labTestsQueue.stateLabel")}
            options={STATE_OPTIONS()}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.labTests.labTestsQueue.labTests")}>
          <TeDataTable
            columns={columns}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.labTests.labTestsQueue.labTestsCaption")}
            emptyTitle={t("screen.admin.labTests.labTestsQueue.noLabTestsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.labTests.labTestsQueue.noLabTestsMatchTheseEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
