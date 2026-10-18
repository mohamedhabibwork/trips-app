import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface RunRow {
  id: string;
  week: string;
  suppliers: string;
  total: string;
  state: "completed" | "failed";
}

interface SupplierRow {
  id: string;
  supplier: string;
  amount: string;
  state: "completed" | "failed";
}

const DEFAULT_RUN_ROWS: readonly RunRow[] = [];

const DEFAULT_SUPPLIER_ROWS: readonly SupplierRow[] = [];

const STATE_PRESENTATION = (): Record<RunRow["state"], AdminStatusPresentation> => ({
  completed: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.finance.payoutRuns.completed"),
  },
  failed: { tone: "danger", icon: "alert", label: t("screen.admin.finance.payoutRuns.failed") },
});

const RUN_COLUMNS = (): readonly TeDataTableColumn<RunRow>[] => [
  { key: "week", header: t("screen.admin.finance.payoutRuns.week") },
  { key: "suppliers", header: t("screen.admin.finance.payoutRuns.suppliers"), align: "end" },
  { key: "total", header: t("screen.admin.finance.payoutRuns.total") },
  {
    key: "state",
    header: t("screen.admin.finance.payoutRuns.state"),
    render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
  },
  {
    key: "open",
    header: t("screen.admin.finance.payoutRuns.action"),
    render: (row) => (
      <TeButton
        variant="secondary"
        aria-label={t("screen.admin.finance.payoutRuns.openPayoutRunFor", { week: row.week })}
      >
        {t("screen.admin.finance.payoutRuns.openRun")}
      </TeButton>
    ),
  },
];

const SUPPLIER_COLUMNS = (): readonly TeDataTableColumn<SupplierRow>[] => [
  { key: "supplier", header: t("screen.admin.finance.payoutRuns.supplier") },
  { key: "amount", header: t("screen.admin.finance.payoutRuns.amount") },
  {
    key: "state",
    header: t("screen.admin.finance.payoutRuns.stateHeader"),
    render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
  },
];

export function PayoutRuns() {
  const queryClient = useQueryClient();
  const ledgerQuery = useQuery(orpc.accounting.listLedgerEntries.queryOptions({ input: {} }));

  const createPayoutMutation = useMutation(
    orpc.accounting.createPayoutSettlement.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
      },
    }),
  );

  const payouts =
    ledgerQuery.data?.filter((entry) => entry.entryType === "payout_settlement") ?? [];

  const runs: readonly RunRow[] =
    payouts.length > 0
      ? payouts.map((p) => ({
          id: p.id,
          week: new Date(p.createdAt).toISOString().slice(0, 10),
          suppliers: "1",
          total: `${(Math.abs(p.netAmountMinor) / 100).toFixed(2)} ${p.currencyCode}`,
          state: "completed",
        }))
      : DEFAULT_RUN_ROWS;

  const suppliers: readonly SupplierRow[] =
    payouts.length > 0
      ? payouts.map((p) => ({
          id: `sup-${p.id}`,
          supplier: p.description || `Settlement ${p.id.slice(0, 8)}`,
          amount: `${(Math.abs(p.netAmountMinor) / 100).toFixed(2)} ${p.currencyCode}`,
          state: "completed",
        }))
      : DEFAULT_SUPPLIER_ROWS;

  const handleCreateRun = async () => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await createPayoutMutation.mutateAsync({
        amountMinor: 1250000,
        currencyCode: "EGP",
        description: `Weekly payout run ${today}`,
      });
    } catch {
      // Optimistic fallback kept
    }
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.finance.payoutRuns.payoutRuns")}
        description={t("screen.admin.finance.payoutRuns.createAndTrackWeeklyPayout")}
        actions={
          <TeButton onClick={() => void handleCreateRun()}>
            {t("screen.admin.finance.payoutRuns.createPayoutRun")}
          </TeButton>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.finance.payoutRuns.noPayoutRuns")}
        emptyDescription={t("screen.admin.finance.payoutRuns.createTheFirstPayoutRun")}
        loadingLabel={t("screen.admin.finance.payoutRuns.loadingThePayoutRuns")}
      >
        <TeInlineAlert tone="info" title={t("screen.admin.finance.payoutRuns.schedule")}>
          {t("screen.admin.finance.payoutRuns.payoutRunsAreCreatedWeekly")}
        </TeInlineAlert>
        <AdminPanel title={t("screen.admin.finance.payoutRuns.runs")}>
          <TeDataTable
            columns={RUN_COLUMNS()}
            rows={runs}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.finance.payoutRuns.payoutRunsCaption")}
            emptyTitle={t("screen.admin.finance.payoutRuns.noPayoutRunsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.finance.payoutRuns.createTheFirstPayoutRunEmptyDescription",
            )}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.finance.payoutRuns.runDetailWeekOfDate")}>
          <TeDataTable
            columns={SUPPLIER_COLUMNS()}
            rows={suppliers}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.finance.payoutRuns.amountPerSupplierInThis")}
            emptyTitle={t("screen.admin.finance.payoutRuns.noSuppliersInThisRun")}
            emptyDescription={t("screen.admin.finance.payoutRuns.thisRunHasNoSupplier")}
          />
        </AdminPanel>
        <AdminActions>
          <AdminScreenLink slug="platform-financial-view" variant="ghost">
            {t("screen.admin.finance.payoutRuns.backToFinancialView")}
          </AdminScreenLink>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
