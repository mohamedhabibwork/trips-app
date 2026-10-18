// SCR-ADM-21 Deal audit list (docs/design/web/admin/SCR-ADM-21.dc.html): find deals by
// organization, supplier or reference, state and date, and see their state, counter count and
// final amount. A deal can be opened or flagged for review.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { setSelectedAdminDealId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminFilterBar,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { DealStateBadge, dealState, type DealState } from "./deal-state";
import { formatMinor, shortId } from "./deals-format";

interface DealRow {
  id: string;
  organization: string;
  supplier: string;
  vehicleOrTrip: string;
  state: DealState;
  counters: number;
  finalAmount: string;
  createdOn: string;
}

const stateOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.dealsAndDisputes.dealAuditList.allStates") },
  { value: "open", label: t("screen.admin.dealsAndDisputes.dealAuditList.open") },
  { value: "finalized", label: t("screen.admin.dealsAndDisputes.dealAuditList.finalized") },
  { value: "rejected", label: t("screen.admin.dealsAndDisputes.dealAuditList.rejected") },
];

function matchesSearch(row: DealRow, search: string): boolean {
  const needle = search.trim().toLowerCase();
  if (!needle) return true;
  return [row.id, row.organization, row.supplier, row.vehicleOrTrip].some((value) =>
    value.toLowerCase().includes(needle),
  );
}

export function DealAuditList() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");

  const dealsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const flagMutation = useMutation(
    orpc.accounting.flagReconciliationException.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
      },
    }),
  );

  const allRows: readonly DealRow[] = (dealsQuery.data?.items ?? []).map((deal) => {
    const state = dealState(deal.status);
    return {
      id: deal.id,
      organization: shortId(deal.tenantId),
      supplier: shortId(deal.supplierAccountId),
      vehicleOrTrip: deal.vehicleId
        ? t("screen.admin.dealsAndDisputes.dealAuditList.vehicleRef", {
            reference: shortId(deal.vehicleId),
          })
        : t("screen.admin.dealsAndDisputes.dealAuditList.tripRef", {
            reference: shortId(deal.tripId),
          }),
      state,
      counters: Math.max(0, deal.roundsCount - 1),
      finalAmount:
        state === "finalized" && deal.agreedPriceMinor !== null
          ? formatMinor(deal.agreedPriceMinor, deal.currencyCode, locale)
          : state === "rejected"
            ? t("screen.admin.dealsAndDisputes.dealAuditList.notApplicable")
            : "—",
      createdOn: new Date(deal.createdAt).toISOString().slice(0, 10),
    };
  });

  const rows = allRows.filter(
    (row) =>
      matchesSearch(row, search) &&
      (stateFilter === "all" || row.state === stateFilter) &&
      (!dateFilter || row.createdOn === dateFilter),
  );

  const flag = (row: DealRow) => {
    flagMutation.mutate({
      entryId: row.id,
      reason: t("screen.admin.dealsAndDisputes.dealAuditList.flagReason", {
        reference: shortId(row.id),
      }),
    });
  };

  const columns: readonly AdminColumn<DealRow>[] = [
    {
      key: "organization",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.organization"),
      render: (row) => row.organization,
    },
    {
      key: "supplier",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.supplier"),
      render: (row) => row.supplier,
    },
    {
      key: "vehicleOrTrip",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.vehicleOrTrip"),
      render: (row) => row.vehicleOrTrip,
    },
    {
      key: "state",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.state"),
      render: (row) => <DealStateBadge state={row.state} />,
    },
    {
      key: "counters",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.counterCount"),
      render: (row) => row.counters,
      align: "end",
    },
    {
      key: "finalAmount",
      header: t("screen.admin.dealsAndDisputes.dealAuditList.finalAmount"),
      render: (row) => row.finalAmount,
    },
    {
      key: "actions",
      header: (
        <span className="te-caption">
          {t("screen.admin.dealsAndDisputes.dealAuditList.actions")}
        </span>
      ),
      render: (row) => (
        <span className="flex flex-wrap items-center gap-4">
          <AdminLink
            screen="SCR-ADM-22"
            params={{ dealId: row.id }}
            ariaLabel={t("screen.admin.dealsAndDisputes.dealAuditList.openDealFor", {
              reference: shortId(row.id),
            })}
            onClick={() => setSelectedAdminDealId(row.id)}
          >
            {t("screen.admin.dealsAndDisputes.dealAuditList.openDeal")}
          </AdminLink>
          <AdminButton variant="link" disabled={flagMutation.isPending} onClick={() => flag(row)}>
            {t("screen.admin.dealsAndDisputes.dealAuditList.flagForReview")}
          </AdminButton>
        </span>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.dealsAndDisputes.dealAuditList.title")}
      description={t("screen.admin.dealsAndDisputes.dealAuditList.description")}
    >
      <AdminFilterBar label={t("screen.admin.dealsAndDisputes.dealAuditList.filters")}>
        <AdminInput
          type="search"
          label={t("screen.admin.dealsAndDisputes.dealAuditList.organizationOrSupplier")}
          placeholder={t("screen.admin.dealsAndDisputes.dealAuditList.searchPlaceholder")}
          value={search}
          className="lg:flex-[2]"
          onChange={(event) => setSearch(event.target.value)}
        />
        <AdminSelect
          label={t("screen.admin.dealsAndDisputes.dealAuditList.state")}
          options={stateOptions()}
          value={stateFilter}
          onValueChange={setStateFilter}
        />
        <AdminInput
          type="date"
          label={t("screen.admin.dealsAndDisputes.dealAuditList.date")}
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
        />
      </AdminFilterBar>
      {flagMutation.isSuccess ? (
        <AdminAlert tone="success">
          {t("screen.admin.dealsAndDisputes.dealAuditList.flagged")}
        </AdminAlert>
      ) : null}
      {flagMutation.isError ? (
        <AdminAlert
          tone="danger"
          title={t("screen.admin.dealsAndDisputes.dealAuditList.flagFailed")}
        >
          {t("screen.admin.dealsAndDisputes.dealAuditList.flagFailedBody")}
        </AdminAlert>
      ) : null}
      <AdminQueryState
        query={dealsQuery}
        loadingLabel={t("screen.admin.dealsAndDisputes.dealAuditList.loading")}
      >
        <AdminTable
          caption={t("screen.admin.dealsAndDisputes.dealAuditList.tableCaption")}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.dealsAndDisputes.dealAuditList.emptyTitle")}
              description={t("screen.admin.dealsAndDisputes.dealAuditList.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
