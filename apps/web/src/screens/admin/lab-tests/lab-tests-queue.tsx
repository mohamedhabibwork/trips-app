// SCR-ADM-12 Lab tests queue (docs/design/web/admin/SCR-ADM-12.dc.html): lab tests by state, with
// an overdue-only filter and a link to each test's detail and decision page.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminLink } from "../common/admin-actions";
import { AdminCheckbox, AdminTabs, type AdminTab } from "../common/admin-form";
import { setSelectedAdminLabTestId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminCard, AdminPage, AdminTable, type AdminColumn } from "../common/admin-ui";
import {
  LAB_STATES,
  LabStateBadge,
  labStateLabel,
  labStateOf,
  type LabState,
} from "./lab-test-state";

interface LabTestRow {
  id: string;
  driver: string;
  requested: string;
  state: LabState;
  overdue: boolean;
}

const ALL_TAB = "all";

function stateTabs(): readonly AdminTab[] {
  return [
    { id: ALL_TAB, label: t("screen.admin.labTests.labTestsQueue.all") },
    ...LAB_STATES.map((state) => ({ id: state, label: labStateLabel(state) })),
  ];
}

export function LabTestsQueue() {
  const { status: authStatus, locale } = useAuth();
  const [stateTab, setStateTab] = useState(ALL_TAB);
  const [overdueOnly, setOverdueOnly] = useState(false);

  const queueQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.listReviewQueue, "onboarding/listReviewQueue", {
      input: { applicationType: "platform_driver" },
    }),
    enabled: authStatus === "authenticated",
  });

  const allRows: readonly LabTestRow[] = (queueQuery.data ?? []).map((item) => ({
    id: item.id,
    driver: item.applicant?.fullName ?? item.applicantAccountId,
    requested: new Date(item.createdAt).toLocaleDateString(locale),
    state: labStateOf(item.state),
    overdue: Boolean(item.isSlaOverdue),
  }));

  const rows = allRows.filter(
    (row) => (stateTab === ALL_TAB || row.state === stateTab) && (!overdueOnly || row.overdue),
  );

  const columns: readonly AdminColumn<LabTestRow>[] = [
    {
      key: "driver",
      header: t("screen.admin.labTests.labTestsQueue.driver"),
      render: (row) => row.driver,
      wrap: true,
    },
    {
      key: "track",
      header: t("screen.admin.labTests.labTestsQueue.track"),
      // The review queue does not carry the test track yet.
      render: () => "—",
    },
    {
      key: "requested",
      header: t("screen.admin.labTests.labTestsQueue.requested"),
      render: (row) => row.requested,
    },
    {
      key: "deadline",
      header: t("screen.admin.labTests.labTestsQueue.deadline"),
      render: () => "—",
    },
    {
      key: "state",
      header: t("screen.admin.labTests.labTestsQueue.state"),
      render: (row) => <LabStateBadge state={row.state} overdue={row.overdue} />,
    },
    {
      key: "action",
      header: <span className="te-caption">{t("screen.admin.labTests.labTestsQueue.action")}</span>,
      render: (row) => (
        <AdminLink
          screen="SCR-ADM-13"
          params={{ labTestId: row.id }}
          ariaLabel={t("screen.admin.labTests.labTestsQueue.openTestFor", { driver: row.driver })}
          onClick={() => setSelectedAdminLabTestId(row.id)}
        >
          {t("screen.admin.labTests.labTestsQueue.openTest")}
        </AdminLink>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.labTests.labTestsQueue.title")}
      description={t("screen.admin.labTests.labTestsQueue.description")}
    >
      <AdminCard label={t("screen.admin.labTests.labTestsQueue.filters")}>
        <AdminTabs
          tabs={stateTabs()}
          activeId={stateTab}
          onSelect={setStateTab}
          label={t("screen.admin.labTests.labTestsQueue.state")}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <AdminCheckbox
            label={t("screen.admin.labTests.labTestsQueue.overdueOnly")}
            checked={overdueOnly}
            onCheckedChange={setOverdueOnly}
          />
          <span className="te-caption" aria-live="polite">
            {t("screen.admin.labTests.labTestsQueue.showingCount", { count: rows.length })}
          </span>
        </div>
      </AdminCard>
      <AdminQueryState
        query={queueQuery}
        loadingLabel={t("screen.admin.labTests.labTestsQueue.loading")}
      >
        <AdminTable
          caption={t("screen.admin.labTests.labTestsQueue.tableCaption")}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.labTests.labTestsQueue.emptyTitle")}
              description={t("screen.admin.labTests.labTestsQueue.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
