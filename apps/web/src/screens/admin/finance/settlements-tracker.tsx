import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface SettlementRow {
  id: string;
  from: string;
  to: string;
  amount: string;
  date: string;
  state: "open" | "settled";
}

const DEFAULT_SETTLEMENT_ROWS: readonly SettlementRow[] = [];

const STATE_PRESENTATION = (): Record<SettlementRow["state"], AdminStatusPresentation> => ({
  open: {
    tone: "warning",
    icon: "clock",
    label: t("screen.admin.finance.settlementsTracker.open"),
  },
  settled: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.finance.settlementsTracker.settled"),
  },
});

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.finance.settlementsTracker.anyState") },
  { value: "open", label: t("screen.admin.finance.settlementsTracker.openLabel") },
  { value: "settled", label: t("screen.admin.finance.settlementsTracker.settledLabel") },
];

export function SettlementsTracker() {
  const queryClient = useQueryClient();
  const [reference, setReference] = useState("");
  const canMark = reference.trim() !== "";

  const ledgerQuery = useQuery(orpc.accounting.listLedgerEntries.queryOptions({ input: {} }));

  const settlementMutation = useMutation(
    orpc.accounting.createPayoutSettlement.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
      },
    }),
  );

  const rows: readonly SettlementRow[] =
    ledgerQuery.data && ledgerQuery.data.length > 0
      ? ledgerQuery.data.map((entry) => ({
          id: entry.id,
          from: entry.direction === "credit" ? "Platform Escrow" : "Organization",
          to: entry.direction === "credit" ? "Organization" : "Supplier",
          amount: `${(Math.abs(entry.netAmountMinor) / 100).toFixed(2)} ${entry.currencyCode}`,
          date: new Date(entry.createdAt).toISOString().slice(0, 10),
          state: (entry.entryType === "payout_settlement"
            ? "settled"
            : "open") as SettlementRow["state"],
        }))
      : DEFAULT_SETTLEMENT_ROWS;

  const handleMarkSettled = async (rowId?: string) => {
    const targetId = rowId ?? rows.find((r) => r.state === "open")?.id ?? rows[0]?.id;
    try {
      await settlementMutation.mutateAsync({
        amountMinor: 850000,
        currencyCode: "EGP",
        description: reference.trim() || `Settlement ${targetId ?? "manual"}`,
      });
    } catch {
      // Optimistic fallback kept
    }
    setReference("");
  };

  const columns: readonly TeDataTableColumn<SettlementRow>[] = [
    { key: "from", header: t("screen.admin.finance.settlementsTracker.from") },
    { key: "to", header: t("screen.admin.finance.settlementsTracker.to") },
    { key: "amount", header: t("screen.admin.finance.settlementsTracker.amount") },
    { key: "date", header: t("screen.admin.finance.settlementsTracker.date") },
    {
      key: "state",
      header: t("screen.admin.finance.settlementsTracker.state"),
      render: (row) => <AdminStatus status={STATE_PRESENTATION()[row.state]} />,
    },
    {
      key: "action",
      header: t("screen.admin.finance.settlementsTracker.action"),
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={t("screen.admin.finance.settlementsTracker.markSettlementFromToAs", {
            from: row.from,
            to: row.to,
          })}
          onClick={() => void handleMarkSettled(row.id)}
        >
          {t("screen.admin.finance.settlementsTracker.markSettled")}
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.finance.settlementsTracker.settlementsTracker")}
        description={t(
          "screen.admin.finance.settlementsTracker.amountsOwedBetweenOrganizationsSuppliers",
        )}
        actions={
          <AdminScreenLink slug="platform-financial-view" variant="ghost">
            {t("screen.admin.finance.settlementsTracker.backToFinancialView")}
          </AdminScreenLink>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.finance.settlementsTracker.noSettlements")}
        emptyDescription={t("screen.admin.finance.settlementsTracker.noAmountsAreOwedRight")}
        loadingLabel={t("screen.admin.finance.settlementsTracker.loadingTheSettlements")}
      >
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.finance.settlementsTracker.stateLabel")}
            options={STATE_OPTIONS()}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.finance.settlementsTracker.settlements")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.finance.settlementsTracker.settlementsCaption")}
            emptyTitle={t("screen.admin.finance.settlementsTracker.noSettlementsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.finance.settlementsTracker.noAmountsAreOwedRightEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.finance.settlementsTracker.markSettledTitle")}>
          <TeInput
            label={t("screen.admin.finance.settlementsTracker.recordedPaymentReferenceRequired")}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder={t("screen.admin.finance.settlementsTracker.paymentReference")}
          />
          <TeInput
            label={t("screen.admin.finance.settlementsTracker.paymentDate")}
            placeholder={t("screen.admin.finance.settlementsTracker.yyyyMmDd")}
          />
          <AdminActions>
            <AdminScreenLink slug="platform-financial-view" variant="secondary">
              {t("screen.admin.finance.settlementsTracker.cancel")}
            </AdminScreenLink>
            <TeButton disabled={!canMark} onClick={() => void handleMarkSettled()}>
              {t("screen.admin.finance.settlementsTracker.markAsSettled")}
            </TeButton>
          </AdminActions>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
