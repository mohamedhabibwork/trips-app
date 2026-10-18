import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type SettlementState = "open" | "settled";

interface SettlementRow {
  id: string;
  counterparty: string;
  amount: string;
  state: SettlementState;
  date: string;
}

const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.organization.accounting.settlements.allSettlements") },
  { value: "open", label: t("screen.organization.accounting.settlements.open") },
  { value: "settled", label: t("screen.organization.accounting.settlements.settled") },
];

const COLUMNS = (): readonly TeDataTableColumn<SettlementRow>[] => [
  { key: "counterparty", header: t("screen.organization.accounting.settlements.counterparty") },
  { key: "amount", header: t("screen.organization.accounting.settlements.amount"), align: "end" },
  {
    key: "state",
    header: t("screen.organization.accounting.settlements.state"),
    render: (row) =>
      row.state === "open" ? (
        <StateBadge
          tone="warning"
          icon="clock"
          label={t("screen.organization.accounting.settlements.openLabel")}
        />
      ) : (
        <StateBadge
          tone="success"
          icon="check"
          label={t("screen.organization.accounting.settlements.settledLabel")}
        />
      ),
  },
  { key: "date", header: t("screen.organization.accounting.settlements.date") },
];

export function Settlements() {
  const { status: authStatus } = useAuth();
  const [stateFilter, setStateFilter] = useState("all");

  const ledgerQuery = useQuery(
    orpc.accounting.listLedgerEntries.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const rows = useMemo<readonly SettlementRow[]>(() => {
    if (!ledgerQuery.data) return [];
    return ledgerQuery.data.map((entry) => ({
      id: entry.id,
      counterparty: entry.description || entry.entryType,
      amount: `${(Math.abs(entry.netAmountMinor) / 100).toFixed(2)} ${entry.currencyCode}`,
      state: entry.status === "settled" ? "settled" : "open",
      date: new Date(entry.createdAt).toISOString().slice(0, 10),
    }));
  }, [ledgerQuery.data]);

  const visibleRows = rows.filter((row) => stateFilter === "all" || row.state === stateFilter);

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink
          parent={{
            slug: "trip-accounting",
            label: t("screen.organization.accounting.settlements.backToTripAccounting"),
          }}
        />
        <TePageHeader title={t("screen.organization.accounting.settlements.settlements")} />
        <TeInlineAlert tone="info">
          {t("screen.organization.accounting.settlements.providerPayoutsAreMadeWeekly")}
        </TeInlineAlert>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeSelect
            label={t("screen.organization.accounting.settlements.stateLabel")}
            options={STATE_OPTIONS()}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </div>
        <TeDataTable
          columns={COLUMNS()}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.accounting.settlements.settlementsCaption")}
          emptyTitle={t("screen.organization.accounting.settlements.noSettlements")}
          emptyDescription={t(
            "screen.organization.accounting.settlements.amountsOwedBetweenTheOrganization",
          )}
        />
      </div>
    </StatePreview>
  );
}
