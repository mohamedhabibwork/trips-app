// SCR-ORG-32 Settlements: amounts owed between the organization, suppliers and the platform.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgChips } from "../common/org-form";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import {
  formatDate,
  formatMinor,
  formatTotals,
  rowsOf,
  sumByCurrency,
  type LedgerEntryView,
} from "./finance-format";

/** Ledger entries that are owed to or by a counterparty until settled. */
const SETTLEMENT_ENTRY_TYPES: readonly string[] = [
  "platform_commission",
  "supplier_payout",
  "payout_settlement",
];

type SettlementState = "open" | "settled";

interface SettlementRow {
  id: string;
  counterparty: string;
  minor: number;
  currency: string;
  state: SettlementState;
  occurredAt: string | Date;
}

export function Settlements() {
  const { status: authStatus, locale } = useAuth();
  const [stateFilter, setStateFilter] = useState<string>("open");

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const platform = t("screen.organization.accounting.settlements.platform");
  const rows: readonly SettlementRow[] = rowsOf<LedgerEntryView>(ledgerQuery.data)
    .filter((entry) => SETTLEMENT_ENTRY_TYPES.includes(entry.entryType))
    .map((entry) => ({
      id: entry.id,
      counterparty:
        entry.entryType === "platform_commission" ? platform : entry.description || NO_VALUE,
      minor: Math.abs(entry.netAmountMinor),
      currency: entry.currencyCode,
      state: entry.status === "settled" ? "settled" : "open",
      occurredAt: entry.occurredAt,
    }));

  const openRows = rows.filter((row) => row.state === "open");
  const loaded = ledgerQuery.isSuccess;
  const openTotals = sumByCurrency(
    openRows.map((row) => ({ minor: row.minor, currency: row.currency })),
  );
  const visibleRows = rows.filter((row) => stateFilter === "all" || row.state === stateFilter);

  const columns: readonly OrgColumn<SettlementRow>[] = [
    {
      key: "counterparty",
      header: t("screen.organization.accounting.settlements.counterparty"),
      render: (row) => <b className="font-semibold">{row.counterparty}</b>,
    },
    {
      key: "amount",
      header: t("screen.organization.accounting.settlements.amount"),
      className: "whitespace-nowrap",
      render: (row) => formatMinor(row.minor, row.currency, locale),
    },
    {
      key: "state",
      header: t("screen.organization.accounting.settlements.state"),
      render: (row) =>
        row.state === "open" ? (
          <OrgBadge tone="warn" icon="clock">
            {t("screen.organization.accounting.settlements.open")}
          </OrgBadge>
        ) : (
          <OrgBadge tone="ok">{t("screen.organization.accounting.settlements.settled")}</OrgBadge>
        ),
    },
    {
      key: "date",
      header: t("screen.organization.accounting.settlements.date"),
      className: "whitespace-nowrap",
      render: (row) => formatDate(row.occurredAt, locale),
    },
  ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.accounting.settlements.title")}
        caption={t("screen.organization.accounting.settlements.caption")}
      />
      <OrgAlert
        tone="info"
        title={t("screen.organization.accounting.settlements.providerPayoutsRunWeekly")}
      >
        {t("screen.organization.accounting.settlements.payoutsAreMadeEveryMonday")}
      </OrgAlert>
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.accounting.settlements.openAmountsOwed")}
          value={loaded ? formatTotals(openTotals, locale) : NO_VALUE}
        />
        <OrgKpi
          label={t("screen.organization.accounting.settlements.openItems")}
          value={loaded ? String(openRows.length) : NO_VALUE}
        />
      </OrgKpiRow>
      <OrgChips
        label={t("screen.organization.accounting.settlements.filterByState")}
        options={[
          { value: "open", label: t("screen.organization.accounting.settlements.open") },
          { value: "settled", label: t("screen.organization.accounting.settlements.settled") },
          { value: "all", label: t("screen.organization.accounting.settlements.all") },
        ]}
        value={stateFilter}
        onValueChange={setStateFilter}
      />
      {ledgerQuery.isError ? (
        <OrgError onRetry={() => void ledgerQuery.refetch()} />
      ) : (
        <OrgTable
          columns={columns}
          rows={visibleRows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.accounting.settlements.title")}
          loading={ledgerQuery.isLoading}
          empty={t("screen.organization.accounting.settlements.noSettlements")}
        />
      )}
    </OrgPage>
  );
}
