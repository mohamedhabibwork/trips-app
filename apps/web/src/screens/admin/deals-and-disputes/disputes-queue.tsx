// SCR-ADM-23 Disputes queue (docs/design/web/admin/SCR-ADM-23.dc.html): disputes between parties,
// filtered by type, state and age. A dispute is acknowledged within 2 working days and resolved
// within 10; an open dispute past the first deadline shows as acknowledgement overdue.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminLink } from "../common/admin-actions";
import { AdminSelect, type AdminOption } from "../common/admin-form";
import { setSelectedAdminDisputeId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminFilterBar,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { ACKNOWLEDGE_WITHIN_WORKING_DAYS, RESOLVE_WITHIN_WORKING_DAYS } from "./deals-format";
import { toDispute, type Dispute, type DisputeState } from "./dispute-model";

const STATE_FILTER: Record<string, readonly DisputeState[]> = {
  open: ["open", "openOverdue"],
  acknowledged: ["acknowledged"],
  resolved: ["resolved"],
};

const AGE_FILTER: Record<string, number> = {
  overAcknowledge: ACKNOWLEDGE_WITHIN_WORKING_DAYS,
  overResolve: RESOLVE_WITHIN_WORKING_DAYS,
};

const stateOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.dealsAndDisputes.disputesQueue.allStates") },
  { value: "open", label: t("screen.admin.dealsAndDisputes.disputesQueue.open") },
  { value: "acknowledged", label: t("screen.admin.dealsAndDisputes.disputesQueue.acknowledged") },
  { value: "resolved", label: t("screen.admin.dealsAndDisputes.disputesQueue.resolved") },
];

const ageOptions = (): readonly AdminOption[] => [
  { value: "any", label: t("screen.admin.dealsAndDisputes.disputesQueue.anyAge") },
  {
    value: "overAcknowledge",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.moreThanDays", {
      days: ACKNOWLEDGE_WITHIN_WORKING_DAYS,
    }),
  },
  {
    value: "overResolve",
    label: t("screen.admin.dealsAndDisputes.disputesQueue.moreThanDays", {
      days: RESOLVE_WITHIN_WORKING_DAYS,
    }),
  },
];

function DisputeStateBadge({ state }: { state: DisputeState }) {
  if (state === "openOverdue") {
    return (
      <AdminBadge tone="bad" icon="alert">
        {t("screen.admin.dealsAndDisputes.disputesQueue.openAcknowledgementOverdue")}
      </AdminBadge>
    );
  }
  if (state === "open") {
    return (
      <AdminBadge tone="warn" icon={false}>
        {t("screen.admin.dealsAndDisputes.disputesQueue.open")}
      </AdminBadge>
    );
  }
  if (state === "acknowledged") {
    return (
      <AdminBadge tone="info" icon={false}>
        {t("screen.admin.dealsAndDisputes.disputesQueue.acknowledged")}
      </AdminBadge>
    );
  }
  return (
    <AdminBadge tone="ok">{t("screen.admin.dealsAndDisputes.disputesQueue.resolved")}</AdminBadge>
  );
}

function partiesLabel(dispute: Dispute): string {
  return t("screen.admin.dealsAndDisputes.disputesQueue.organizationRef", {
    reference: dispute.organization,
  });
}

function referenceLabel(dispute: Dispute): string {
  return dispute.isBooking
    ? t("screen.admin.dealsAndDisputes.disputesQueue.bookingRef", { reference: dispute.reference })
    : t("screen.admin.dealsAndDisputes.disputesQueue.tripRef", { reference: dispute.reference });
}

const columns = (): readonly AdminColumn<Dispute>[] => [
  {
    key: "parties",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.parties"),
    render: partiesLabel,
    wrap: true,
  },
  {
    key: "reference",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.bookingOrTrip"),
    render: referenceLabel,
  },
  {
    key: "type",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.type"),
    render: (row) => row.type,
    wrap: true,
  },
  {
    key: "age",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.age"),
    render: (row) =>
      t("screen.admin.dealsAndDisputes.disputesQueue.workingDays", { days: row.ageWorkingDays }),
  },
  {
    key: "state",
    header: t("screen.admin.dealsAndDisputes.disputesQueue.state"),
    render: (row) => <DisputeStateBadge state={row.state} />,
  },
  {
    key: "action",
    header: (
      <span className="te-caption">{t("screen.admin.dealsAndDisputes.disputesQueue.action")}</span>
    ),
    render: (row) => (
      <AdminLink
        screen="SCR-ADM-24"
        params={{ disputeId: row.id }}
        ariaLabel={t("screen.admin.dealsAndDisputes.disputesQueue.openDisputeFor", {
          reference: referenceLabel(row),
        })}
        onClick={() => setSelectedAdminDisputeId(row.id)}
      >
        {t("screen.admin.dealsAndDisputes.disputesQueue.openDispute")}
      </AdminLink>
    ),
  },
];

export function DisputesQueue() {
  const { status: authStatus } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("any");

  const exceptionsQuery = useQuery({
    ...orpc.accounting.listAdminReconciliationExceptions.queryOptions(),
    enabled: authStatus === "authenticated",
  });

  const disputes = (exceptionsQuery.data ?? []).map((source) => toDispute(source));
  const types = [...new Set(disputes.map((dispute) => dispute.type))].sort();
  const typeOptions: readonly AdminOption[] = [
    { value: "all", label: t("screen.admin.dealsAndDisputes.disputesQueue.allTypes") },
    ...types.map((type) => ({ value: type, label: type })),
  ];
  const minAge = AGE_FILTER[ageFilter];
  const allowedStates = STATE_FILTER[stateFilter];
  const rows = disputes.filter(
    (dispute) =>
      (typeFilter === "all" || dispute.type === typeFilter) &&
      (!allowedStates || allowedStates.includes(dispute.state)) &&
      (minAge === undefined || dispute.ageWorkingDays > minAge),
  );

  return (
    <AdminPage
      title={t("screen.admin.dealsAndDisputes.disputesQueue.title")}
      description={t("screen.admin.dealsAndDisputes.disputesQueue.description")}
    >
      <AdminAlert tone="info">
        {t("screen.admin.dealsAndDisputes.disputesQueue.deadlines", {
          acknowledge: ACKNOWLEDGE_WITHIN_WORKING_DAYS,
          resolve: RESOLVE_WITHIN_WORKING_DAYS,
        })}
      </AdminAlert>
      <AdminFilterBar label={t("screen.admin.dealsAndDisputes.disputesQueue.filters")}>
        <AdminSelect
          label={t("screen.admin.dealsAndDisputes.disputesQueue.type")}
          options={typeOptions}
          value={typeFilter}
          onValueChange={setTypeFilter}
        />
        <AdminSelect
          label={t("screen.admin.dealsAndDisputes.disputesQueue.state")}
          options={stateOptions()}
          value={stateFilter}
          onValueChange={setStateFilter}
        />
        <AdminSelect
          label={t("screen.admin.dealsAndDisputes.disputesQueue.age")}
          options={ageOptions()}
          value={ageFilter}
          onValueChange={setAgeFilter}
        />
      </AdminFilterBar>
      <AdminQueryState
        query={exceptionsQuery}
        loadingLabel={t("screen.admin.dealsAndDisputes.disputesQueue.loading")}
      >
        <AdminTable
          caption={t("screen.admin.dealsAndDisputes.disputesQueue.tableCaption")}
          columns={columns()}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.dealsAndDisputes.disputesQueue.emptyTitle")}
              description={t("screen.admin.dealsAndDisputes.disputesQueue.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
