// SCR-ADM-10 Deletion and data requests (docs/design/web/admin/SCR-ADM-10.dc.html): account
// deletion and data copy requests in one table, tabbed by type, with overdue data copies flagged
// first. No API procedure lists these requests yet, so the table shows its empty state until one
// exists; the page never shows invented rows.
import { useState } from "react";
import { t } from "@trips-app/i18n";

import { AdminLink } from "../common/admin-actions";
import { AdminTabs, type AdminTab } from "../common/admin-form";
import { setSelectedAdminEntityId } from "../common/admin-selection";
import { AdminEmpty } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

type RequestType = "deletion" | "dataCopy";
type RequestState = "grace" | "overdue" | "inProgress";

interface RequestRow {
  id: string;
  entityId: string;
  type: RequestType;
  account: string;
  requested: string;
  dueDate: string;
  state: RequestState;
}

/** Rows come from a request list procedure once the API serves one. */
const REQUESTS: readonly RequestRow[] = [];

const requestTabs = (): readonly AdminTab[] => [
  { id: "all", label: t("screen.admin.directory.deletionAndDataRequests.all") },
  { id: "deletion", label: t("screen.admin.directory.deletionAndDataRequests.accountDeletion") },
  { id: "dataCopy", label: t("screen.admin.directory.deletionAndDataRequests.dataCopy") },
];

function typeLabel(type: RequestType): string {
  return type === "deletion"
    ? t("screen.admin.directory.deletionAndDataRequests.accountDeletion")
    : t("screen.admin.directory.deletionAndDataRequests.dataCopy");
}

function dueLabel(row: RequestRow): string {
  return row.type === "deletion"
    ? t("screen.admin.directory.deletionAndDataRequests.graceEnds", { date: row.dueDate })
    : t("screen.admin.directory.deletionAndDataRequests.due", { date: row.dueDate });
}

function StateBadge({ state }: { state: RequestState }) {
  if (state === "overdue") {
    return (
      <AdminBadge tone="bad">
        {t("screen.admin.directory.deletionAndDataRequests.overdue")}
      </AdminBadge>
    );
  }
  if (state === "grace") {
    return (
      <AdminBadge tone="warn">
        {t("screen.admin.directory.deletionAndDataRequests.gracePeriod")}
      </AdminBadge>
    );
  }
  return (
    <AdminBadge icon={false}>
      {t("screen.admin.directory.deletionAndDataRequests.inProgress")}
    </AdminBadge>
  );
}

const columns = (): readonly AdminColumn<RequestRow>[] => [
  {
    key: "type",
    header: t("screen.admin.directory.deletionAndDataRequests.requestType"),
    render: (row) => typeLabel(row.type),
  },
  {
    key: "account",
    header: t("screen.admin.directory.deletionAndDataRequests.account"),
    render: (row) => row.account,
    wrap: true,
  },
  {
    key: "requested",
    header: t("screen.admin.directory.deletionAndDataRequests.requested"),
    render: (row) => row.requested,
  },
  {
    key: "due",
    header: t("screen.admin.directory.deletionAndDataRequests.graceEndOrDueDate"),
    render: dueLabel,
  },
  {
    key: "state",
    header: t("screen.admin.directory.deletionAndDataRequests.status"),
    render: (row) => <StateBadge state={row.state} />,
  },
  {
    key: "action",
    header: (
      <span className="te-caption">
        {t("screen.admin.directory.deletionAndDataRequests.action")}
      </span>
    ),
    render: (row) => (
      <AdminLink
        screen="SCR-ADM-08"
        params={{ entityId: row.entityId }}
        ariaLabel={t("screen.admin.directory.deletionAndDataRequests.openAccountFor", {
          account: row.account,
        })}
        onClick={() => setSelectedAdminEntityId(row.entityId)}
      >
        {t("screen.admin.directory.deletionAndDataRequests.openAccount")}
      </AdminLink>
    ),
  },
];

export function DeletionAndDataRequests() {
  const [tab, setTab] = useState("all");
  const rows = tab === "all" ? REQUESTS : REQUESTS.filter((row) => row.type === tab);
  const overdueCount = REQUESTS.filter(
    (row) => row.type === "dataCopy" && row.state === "overdue",
  ).length;

  return (
    <AdminPage
      title={t("screen.admin.directory.deletionAndDataRequests.title")}
      description={t("screen.admin.directory.deletionAndDataRequests.description")}
    >
      <AdminTabs
        tabs={requestTabs()}
        activeId={tab}
        onSelect={setTab}
        label={t("screen.admin.directory.deletionAndDataRequests.requestTypes")}
      />
      {overdueCount > 0 ? (
        <AdminAlert
          tone="danger"
          title={t("screen.admin.directory.deletionAndDataRequests.overdueTitle", {
            count: String(overdueCount),
          })}
        >
          {t("screen.admin.directory.deletionAndDataRequests.overdueBody")}
        </AdminAlert>
      ) : null}
      <AdminTable
        caption={t("screen.admin.directory.deletionAndDataRequests.tableCaption")}
        columns={columns()}
        rows={rows}
        getRowKey={(row) => row.id}
        empty={
          <AdminEmpty
            title={t("screen.admin.directory.deletionAndDataRequests.emptyTitle")}
            description={t("screen.admin.directory.deletionAndDataRequests.emptyBody")}
          />
        }
      />
    </AdminPage>
  );
}
