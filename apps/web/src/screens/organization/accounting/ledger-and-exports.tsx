import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface LedgerRow {
  id: string;
  eventType: string;
  amount: string;
  linked: string;
  gatewayReference: string;
  date: string;
}

const COLUMNS = (): readonly TeDataTableColumn<LedgerRow>[] => [
  { key: "eventType", header: t("screen.organization.accounting.ledgerAndExports.event") },
  {
    key: "amount",
    header: t("screen.organization.accounting.ledgerAndExports.amount"),
    align: "end",
  },
  { key: "linked", header: t("screen.organization.accounting.ledgerAndExports.bookingOrDeal") },
  {
    key: "gatewayReference",
    header: t("screen.organization.accounting.ledgerAndExports.gatewayReference"),
  },
  { key: "date", header: t("screen.organization.accounting.ledgerAndExports.date") },
];

export function LedgerAndExports() {
  const { status: authStatus } = useAuth();
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const ledgerQuery = useQuery(
    orpc.accounting.listLedgerEntries.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const rows = useMemo<readonly LedgerRow[]>(() => {
    if (!ledgerQuery.data) return [];
    return ledgerQuery.data.map((entry) => ({
      id: entry.id,
      eventType: entry.entryType,
      amount: `${(entry.netAmountMinor / 100).toFixed(2)} ${entry.currencyCode}`,
      linked: entry.bookingId ?? entry.tripId ?? "-",
      gatewayReference: entry.invoiceNumber ?? "-",
      date: new Date(entry.createdAt).toISOString().slice(0, 10),
    }));
  }, [ledgerQuery.data]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter((row) => {
    if (normalizedQuery && !row.eventType.toLowerCase().includes(normalizedQuery)) return false;
    if (fromDate.trim() && row.date < fromDate.trim()) return false;
    if (toDate.trim() && row.date > toDate.trim()) return false;
    return true;
  });

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "trip-accounting",
            label: t("screen.organization.accounting.ledgerAndExports.backToTripAccounting"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.accounting.ledgerAndExports.ledgerAndExports")}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <TeInput
            label={t("screen.organization.accounting.ledgerAndExports.from")}
            placeholder={t("screen.organization.accounting.ledgerAndExports.yyyyMmDd")}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <TeInput
            label={t("screen.organization.accounting.ledgerAndExports.to")}
            placeholder={t("screen.organization.accounting.ledgerAndExports.yyyyMmDdPlaceholder")}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <TeSearchField
            label={t("screen.organization.accounting.ledgerAndExports.filterByEvent")}
            value={query}
            onValueChange={setQuery}
            clearLabel={t("screen.organization.accounting.ledgerAndExports.clearFilter")}
          />
        </div>
        <OrgSection title={t("screen.organization.accounting.ledgerAndExports.ledgerLines")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={visibleRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.accounting.ledgerAndExports.ledgerLinesCaption")}
            emptyTitle={t("screen.organization.accounting.ledgerAndExports.noLedgerLines")}
            emptyDescription={t(
              "screen.organization.accounting.ledgerAndExports.linesAppearHereAsPayments",
            )}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.accounting.ledgerAndExports.export")}>
          <TePlanGate
            plan="Enterprise"
            lockedLabel={t("screen.organization.accounting.ledgerAndExports.csvAndPdfExportsThat")}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
