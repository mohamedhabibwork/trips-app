import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface RequestRow {
  id: string;
  type: "Account deletion" | "Data copy";
  account: string;
  requested: string;
  dueOrGrace: string;
  state: "grace" | "overdue";
}

const STATE_PRESENTATION = (): Record<RequestRow["state"], AdminStatusPresentation> => ({
  grace: {
    tone: "info",
    icon: "clock",
    label: t("screen.admin.directory.deletionAndDataRequests.gracePeriod"),
  },
  overdue: {
    tone: "danger",
    icon: "alert",
    label: t("screen.admin.directory.deletionAndDataRequests.overdue"),
  },
});

const TYPE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.directory.deletionAndDataRequests.allTypes") },
  { value: "deletion", label: t("screen.admin.directory.deletionAndDataRequests.accountDeletion") },
  { value: "data-copy", label: t("screen.admin.directory.deletionAndDataRequests.dataCopy") },
];
const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.directory.deletionAndDataRequests.anyStatus") },
  { value: "grace", label: t("screen.admin.directory.deletionAndDataRequests.gracePeriodLabel") },
  { value: "overdue", label: t("screen.admin.directory.deletionAndDataRequests.overdueLabel") },
];

const COLUMNS = (): readonly TeDataTableColumn<RequestRow>[] => [
  { key: "type", header: t("screen.admin.directory.deletionAndDataRequests.requestType") },
  { key: "account", header: t("screen.admin.directory.deletionAndDataRequests.account") },
  { key: "requested", header: t("screen.admin.directory.deletionAndDataRequests.requested") },
  {
    key: "dueOrGrace",
    header: t("screen.admin.directory.deletionAndDataRequests.graceEndOrDueDate"),
  },
  {
    key: "state",
    header: t("screen.admin.directory.deletionAndDataRequests.status"),
    render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
  },
  {
    key: "open",
    header: t("screen.admin.directory.deletionAndDataRequests.action"),
    render: (row) => (
      <AdminScreenLink
        slug="entity-detail"
        variant="secondary"
        ariaLabel={t("screen.admin.directory.deletionAndDataRequests.openAccountFor", {
          account: row.account,
        })}
      >
        {t("screen.admin.directory.deletionAndDataRequests.openAccount")}
      </AdminScreenLink>
    ),
  },
];

export function DeletionAndDataRequests() {
  const { status: authStatus } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: { state: "Closed" },
    }),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly RequestRow[] = (queueQuery.data ?? []).map((app) => {
    const createdMs = new Date(app.updatedAt).getTime();
    const graceEnd = new Date(createdMs + 30 * 86400000).toISOString().slice(0, 10);
    return {
      id: app.id,
      type: "Account deletion",
      account: app.applicant?.fullName ?? app.applicant?.email ?? app.applicantAccountId,
      requested: new Date(app.updatedAt).toISOString().slice(0, 10),
      dueOrGrace: graceEnd,
      state: app.isSlaOverdue ? "overdue" : "grace",
    };
  });

  const visibleRows = rows.filter((row) => {
    if (typeFilter === "deletion" && row.type !== "Account deletion") return false;
    if (typeFilter === "data-copy" && row.type !== "Data copy") return false;
    if (stateFilter !== "all" && row.state !== stateFilter) return false;
    return true;
  });

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.directory.deletionAndDataRequests.deletionAndDataRequests")}
        description={t("screen.admin.directory.deletionAndDataRequests.workAccountDeletionAndData")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.directory.deletionAndDataRequests.noRequests")}
        emptyDescription={t("screen.admin.directory.deletionAndDataRequests.noDeletionOrDataCopy")}
        loadingLabel={t("screen.admin.directory.deletionAndDataRequests.loadingTheRequests")}
      >
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.directory.deletionAndDataRequests.retentionRules")}
        >
          {t("screen.admin.directory.deletionAndDataRequests.accountsArePurgedOnDay")}
        </TeInlineAlert>
        <AdminFilters>
          <TeSelect
            label={t("screen.admin.directory.deletionAndDataRequests.requestTypeLabel")}
            options={TYPE_OPTIONS()}
            value={typeFilter}
            onValueChange={setTypeFilter}
          />
          <TeSelect
            label={t("screen.admin.directory.deletionAndDataRequests.statusLabel")}
            options={STATE_OPTIONS()}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.directory.deletionAndDataRequests.requests")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.admin.directory.deletionAndDataRequests.deletionAndDataRequestsCaption",
            )}
            emptyTitle={t("screen.admin.directory.deletionAndDataRequests.noRequestsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.directory.deletionAndDataRequests.noDeletionOrDataCopyEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
