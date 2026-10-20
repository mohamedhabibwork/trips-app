// SCR-ADM-26 Payout runs (docs/design/web/admin/SCR-ADM-26.dc.html): the weekly runs that pay
// suppliers, one row per week, and the per-supplier amounts of the selected run. Runs are built
// from the payout settlement entries of the ledger, grouped by the week they occurred in.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { CreatePayoutRunForm, type NewPayoutRun } from "./payout-run-form";
import {
  formatDate,
  formatMinor,
  formatTotals,
  totalsByCurrency,
  weekStart,
} from "./finance-format";

interface PayoutEntry {
  id: string;
  supplier: string;
  amountMinor: number;
  currency: string;
  failed: boolean;
}

interface RunRow {
  week: string;
  weekLabel: string;
  entries: readonly PayoutEntry[];
  total: string;
  failed: boolean;
}

function RunStateBadge({ failed }: { failed: boolean }) {
  return failed ? (
    <AdminBadge tone="bad" icon="alert">
      {t("screen.admin.finance.payoutRuns.failed")}
    </AdminBadge>
  ) : (
    <AdminBadge tone="ok" icon={false}>
      {t("screen.admin.finance.payoutRuns.completed")}
    </AdminBadge>
  );
}

export function PayoutRuns() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });
  const createPayoutMutation = useMutation(
    serverMutationOptions(
      orpc.accounting.createPayoutSettlement,
      "accounting/createPayoutSettlement",
      {
        onSuccess: () => {
          trackEvent("payout_settlement_created", { surface: "admin" });
          setIsCreating(false);
          void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
        },
        onError: () => trackEvent("payout_settlement_create_failed", { surface: "admin" }),
      },
    ),
  );

  const payouts = (ledgerQuery.data ?? []).filter(
    (entry) => entry.entryType === "payout_settlement",
  );
  const byWeek = payouts.reduce<ReadonlyMap<string, readonly PayoutEntry[]>>((acc, entry) => {
    const week = weekStart(entry.occurredAt);
    const item: PayoutEntry = {
      id: entry.id,
      supplier: entry.description,
      amountMinor: Math.abs(entry.netAmountMinor),
      currency: entry.currencyCode,
      failed: entry.status === "reconciliation_exception",
    };
    return new Map(acc).set(week, [...(acc.get(week) ?? []), item]);
  }, new Map());
  const runs: readonly RunRow[] = [...byWeek.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([week, entries]) => ({
      week,
      weekLabel: t("screen.admin.finance.payoutRuns.weekOf", { date: formatDate(week, locale) }),
      entries,
      total: formatTotals(
        totalsByCurrency(
          entries.map((e) => ({ amountMinor: e.amountMinor, currency: e.currency })),
        ),
        locale,
      ),
      failed: entries.some((e) => e.failed),
    }));
  const selectedRun = runs.find((run) => run.week === selectedWeek) ?? runs[0];

  const handleCreate = (run: NewPayoutRun) => {
    createPayoutMutation.mutate({
      amountMinor: run.amountMinor,
      currencyCode: run.currency,
      description: t("screen.admin.finance.payoutRuns.runDescription", {
        date: new Date().toISOString().slice(0, 10),
      }),
    });
  };

  const runColumns: readonly AdminColumn<RunRow>[] = [
    {
      key: "week",
      header: t("screen.admin.finance.payoutRuns.week"),
      render: (row) => row.weekLabel,
    },
    {
      key: "suppliers",
      header: t("screen.admin.finance.payoutRuns.suppliers"),
      render: (row) => row.entries.length.toLocaleString(locale),
      align: "end",
    },
    {
      key: "total",
      header: t("screen.admin.finance.payoutRuns.total"),
      render: (row) => row.total,
    },
    {
      key: "state",
      header: t("screen.admin.finance.payoutRuns.state"),
      render: (row) => <RunStateBadge failed={row.failed} />,
    },
    {
      key: "action",
      header: <span className="te-caption">{t("screen.admin.finance.payoutRuns.action")}</span>,
      render: (row) => (
        <AdminButton
          variant="link"
          aria-label={t("screen.admin.finance.payoutRuns.viewRunFor", { week: row.weekLabel })}
          aria-pressed={row.week === selectedRun?.week}
          onClick={() => setSelectedWeek(row.week)}
        >
          {t("screen.admin.finance.payoutRuns.viewRun")}
        </AdminButton>
      ),
    },
  ];

  const supplierColumns: readonly AdminColumn<PayoutEntry>[] = [
    {
      key: "supplier",
      header: t("screen.admin.finance.payoutRuns.supplier"),
      render: (row) => row.supplier,
      wrap: true,
    },
    {
      key: "amount",
      header: t("screen.admin.finance.payoutRuns.amount"),
      render: (row) => formatMinor(row.amountMinor, row.currency, locale),
    },
    {
      key: "listed",
      header: t("screen.admin.finance.payoutRuns.listedForSupplier"),
      render: () => (
        <span className="te-caption">{t("screen.admin.finance.payoutRuns.visibleToSupplier")}</span>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.finance.payoutRuns.title")}
      description={t("screen.admin.finance.payoutRuns.description")}
      actions={
        <AdminButton variant="primary" onClick={() => setIsCreating(true)}>
          {t("screen.admin.finance.payoutRuns.createRun")}
        </AdminButton>
      }
    >
      {isCreating ? (
        <CreatePayoutRunForm
          isPending={createPayoutMutation.isPending}
          hasError={createPayoutMutation.isError}
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      ) : null}
      <AdminQueryState
        query={ledgerQuery}
        loadingLabel={t("screen.admin.finance.payoutRuns.loading")}
      >
        <AdminTable
          caption={t("screen.admin.finance.payoutRuns.runsCaption")}
          columns={runColumns}
          rows={runs}
          getRowKey={(row) => row.week}
          empty={
            <AdminEmpty
              title={t("screen.admin.finance.payoutRuns.emptyTitle")}
              description={t("screen.admin.finance.payoutRuns.emptyBody")}
            />
          }
        />
        {selectedRun ? (
          <AdminTable
            caption={t("screen.admin.finance.payoutRuns.detailCaption")}
            title={t("screen.admin.finance.payoutRuns.runDetail", {
              date: formatDate(selectedRun.week, locale),
            })}
            toolbar={<RunStateBadge failed={selectedRun.failed} />}
            columns={supplierColumns}
            rows={selectedRun.entries}
            getRowKey={(row) => row.id}
          />
        ) : null}
      </AdminQueryState>
      <AdminAlert tone="info">{t("screen.admin.finance.payoutRuns.visibilityNote")}</AdminAlert>
    </AdminPage>
  );
}
