import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface InvoiceRow {
  id: string;
  number: string;
  type: "B2B" | "B2C";
  buyer: string;
  amount: string;
}

const COLUMNS = (): readonly TeDataTableColumn<InvoiceRow>[] => [
  { key: "number", header: t("screen.organization.billing.invoicesList.number") },
  { key: "type", header: t("screen.organization.billing.invoicesList.type") },
  { key: "buyer", header: t("screen.organization.billing.invoicesList.buyer") },
  { key: "amount", header: t("screen.organization.billing.invoicesList.amount"), align: "end" },
  {
    key: "status",
    header: t("screen.organization.billing.invoicesList.status"),
    render: () => (
      <StateBadge
        tone="success"
        icon="check"
        label={t("screen.organization.billing.invoicesList.issued")}
      />
    ),
  },
  {
    key: "open",
    header: t("screen.organization.billing.invoicesList.open"),
    align: "end",
    render: () => (
      <OrgButtonLink slug="issue-invoice-b2b-or-b2c" variant="ghost">
        {t("screen.organization.billing.invoicesList.openInvoice")}
      </OrgButtonLink>
    ),
  },
];

export function InvoicesList() {
  const { status: authStatus } = useAuth();
  const [query, setQuery] = useState("");

  const ledgerQuery = useQuery(
    orpc.accounting.listLedgerEntries.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const rows = useMemo<readonly InvoiceRow[]>(() => {
    if (!ledgerQuery.data) return [];
    return ledgerQuery.data.map((entry, idx) => ({
      id: entry.id,
      number: entry.invoiceNumber || `INV-${String(idx + 1).padStart(4, "0")}`,
      type: entry.entryType === "payout_settlement" ? "B2B" : "B2C",
      buyer: entry.description || entry.bookingId || entry.entryType,
      amount: `${(Math.abs(entry.grossAmountMinor) / 100).toFixed(2)} ${entry.currencyCode}`,
    }));
  }, [ledgerQuery.data]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) =>
      row.number.toLowerCase().includes(normalizedQuery) ||
      row.buyer.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.billing.invoicesList.invoicesList")}
          actions={
            <OrgButtonLink slug="issue-invoice-b2b-or-b2c">
              {t("screen.organization.billing.invoicesList.issueInvoice")}
            </OrgButtonLink>
          }
        />
        <TeSearchField
          label={t("screen.organization.billing.invoicesList.searchInvoices")}
          value={query}
          onValueChange={setQuery}
          clearLabel={t("screen.organization.billing.invoicesList.clearSearch")}
        />
        <TeDataTable
          columns={COLUMNS()}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.billing.invoicesList.issuedInvoices")}
          emptyTitle={t("screen.organization.billing.invoicesList.noInvoicesYet")}
          emptyDescription={t("screen.organization.billing.invoicesList.issueAnInvoiceForA")}
        />
      </div>
    </StatePreview>
  );
}
