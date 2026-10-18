import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminSearch,
} from "../common/admin-shared";

interface AuditRow {
  id: string;
  time: string;
  actor: string;
  action: string;
  target: string;
  before: string;
  after: string;
  requestId: string;
}

const DEFAULT_AUDIT_ROWS: readonly AuditRow[] = [];

const RANGE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "24h", label: t("screen.admin.platform.auditLog.last24Hours") },
  { value: "7d", label: t("screen.admin.platform.auditLog.last7Days") },
  { value: "30d", label: t("screen.admin.platform.auditLog.last30Days") },
  { value: "custom", label: t("screen.admin.platform.auditLog.customRange") },
];
const ACTION_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.platform.auditLog.anyAction") },
];

const COLUMNS = (): readonly TeDataTableColumn<AuditRow>[] => [
  { key: "time", header: t("screen.admin.platform.auditLog.time") },
  { key: "actor", header: t("screen.admin.platform.auditLog.actor") },
  { key: "action", header: t("screen.admin.platform.auditLog.action") },
  { key: "target", header: t("screen.admin.platform.auditLog.target") },
  { key: "before", header: t("screen.admin.platform.auditLog.before") },
  { key: "after", header: t("screen.admin.platform.auditLog.after") },
  { key: "requestId", header: t("screen.admin.platform.auditLog.requestId") },
];

export function AuditLog() {
  const queueQuery = useQuery(orpc.onboarding.listReviewQueue.queryOptions({ input: {} }));

  const rows: readonly AuditRow[] =
    queueQuery.data && queueQuery.data.length > 0
      ? queueQuery.data.map((entry) => ({
          id: entry.id,
          time: new Date(entry.updatedAt).toISOString().slice(0, 16).replace("T", " "),
          actor: entry.applicantAccountId.slice(0, 8) || "System",
          action: `onboarding.${entry.state.toLowerCase().replace(/\s+/g, "_")}`,
          target: `${entry.applicationType}:${entry.id.slice(0, 8)}`,
          before: "Submitted",
          after: entry.state,
          requestId: entry.id.slice(0, 8),
        }))
      : DEFAULT_AUDIT_ROWS;

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.platform.auditLog.auditLog")}
        description={t("screen.admin.platform.auditLog.everyAdminActionAndPermission")}
      />
      <StatePreview
        emptyTitle={t("screen.admin.platform.auditLog.noEntries")}
        emptyDescription={t("screen.admin.platform.auditLog.noAuditEntriesMatchThese")}
        loadingLabel={t("screen.admin.platform.auditLog.loadingTheAuditEntries")}
      >
        <TeInlineAlert tone="info" title={t("screen.admin.platform.auditLog.readOnly")}>
          {t("screen.admin.platform.auditLog.entriesCannotBeEditedOr")}
        </TeInlineAlert>
        <AdminFilters>
          <AdminSearch
            label={t("screen.admin.platform.auditLog.actorLabel")}
            placeholder={t("screen.admin.platform.auditLog.nameOrEmail")}
            clearLabel={t("screen.admin.platform.auditLog.clearActor")}
          />
          <AdminFilterSelect
            label={t("screen.admin.platform.auditLog.actionLabel")}
            options={ACTION_OPTIONS()}
          />
          <AdminSearch
            label={t("screen.admin.platform.auditLog.targetLabel")}
            placeholder={t("screen.admin.platform.auditLog.nameOrReference")}
            clearLabel={t("screen.admin.platform.auditLog.clearTarget")}
          />
          <AdminFilterSelect
            label={t("screen.admin.platform.auditLog.timeRange")}
            options={RANGE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.platform.auditLog.entries")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.platform.auditLog.auditLogEntries")}
            emptyTitle={t("screen.admin.platform.auditLog.noEntriesEmptyTitle")}
            emptyDescription={t(
              "screen.admin.platform.auditLog.noAuditEntriesMatchTheseEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
