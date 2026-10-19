// SCR-ADM-30 Audit log (docs/design/web/admin/SCR-ADM-30.dc.html): every admin action and
// permission change with before and after values, filtered by actor, action, target and time range.
// Read only. No procedure returns audit entries yet, so the table shows its empty state.
import { useState } from "react";
import { t } from "@trips-app/i18n";

import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminFilterBar,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

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

const AUDIT_ROWS: readonly AuditRow[] = [];

const actionOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.platform.auditLog.allActions") },
  { value: "suspend", label: t("screen.admin.platform.auditLog.actionSuspendAccount") },
  { value: "planOverride", label: t("screen.admin.platform.auditLog.actionPlanOverride") },
  { value: "featureFlag", label: t("screen.admin.platform.auditLog.actionFeatureFlagChanged") },
  { value: "roleAssigned", label: t("screen.admin.platform.auditLog.actionRoleAssigned") },
];

const rangeOptions = (): readonly AdminOption[] => [
  { value: "24h", label: t("screen.admin.platform.auditLog.last24Hours") },
  { value: "7d", label: t("screen.admin.platform.auditLog.last7Days") },
  { value: "30d", label: t("screen.admin.platform.auditLog.last30Days") },
];

const columns = (): readonly AdminColumn<AuditRow>[] => [
  { key: "time", header: t("screen.admin.platform.auditLog.time"), render: (row) => row.time },
  {
    key: "actor",
    header: t("screen.admin.platform.auditLog.actor"),
    render: (row) => row.actor,
    wrap: true,
  },
  {
    key: "action",
    header: t("screen.admin.platform.auditLog.action"),
    render: (row) => row.action,
  },
  {
    key: "target",
    header: t("screen.admin.platform.auditLog.target"),
    render: (row) => row.target,
    wrap: true,
  },
  {
    key: "before",
    header: t("screen.admin.platform.auditLog.before"),
    render: (row) => row.before,
  },
  { key: "after", header: t("screen.admin.platform.auditLog.after"), render: (row) => row.after },
  {
    key: "requestId",
    header: t("screen.admin.platform.auditLog.requestId"),
    render: (row) => <span className="te-caption">{row.requestId}</span>,
  },
];

export function AuditLog() {
  const [actor, setActor] = useState("");
  const [action, setAction] = useState("all");
  const [target, setTarget] = useState("");
  const [range, setRange] = useState("7d");

  return (
    <AdminPage
      title={t("screen.admin.platform.auditLog.title")}
      description={t("screen.admin.platform.auditLog.description")}
      actions={
        <AdminBadge icon="lock" className="px-3.5 py-1.5 text-sm leading-5">
          {t("screen.admin.platform.auditLog.readOnly")}
        </AdminBadge>
      }
    >
      <AdminFilterBar label={t("screen.admin.platform.auditLog.filters")}>
        <AdminInput
          label={t("screen.admin.platform.auditLog.actor")}
          placeholder={t("screen.admin.platform.auditLog.actorPlaceholder")}
          value={actor}
          onChange={(event) => setActor(event.target.value)}
        />
        <AdminSelect
          label={t("screen.admin.platform.auditLog.action")}
          options={actionOptions()}
          value={action}
          onValueChange={setAction}
        />
        <AdminInput
          label={t("screen.admin.platform.auditLog.target")}
          placeholder={t("screen.admin.platform.auditLog.targetPlaceholder")}
          value={target}
          onChange={(event) => setTarget(event.target.value)}
        />
        <AdminSelect
          label={t("screen.admin.platform.auditLog.timeRange")}
          options={rangeOptions()}
          value={range}
          onValueChange={setRange}
        />
      </AdminFilterBar>
      <AdminTable
        caption={t("screen.admin.platform.auditLog.tableCaption")}
        columns={columns()}
        rows={AUDIT_ROWS}
        getRowKey={(row) => row.id}
        empty={
          <AdminEmpty
            title={t("screen.admin.platform.auditLog.emptyTitle")}
            description={t("screen.admin.platform.auditLog.emptyBody")}
          />
        }
      />
      <AdminAlert tone="info">{t("screen.admin.platform.auditLog.retentionNote")}</AdminAlert>
    </AdminPage>
  );
}
