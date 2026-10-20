// SCR-ORG-37 Invoices: the invoices the organization has issued, filtered by buyer type.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgChips } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgBadge, OrgEmpty, OrgError, OrgPage, OrgPageHeader } from "../common/org-ui";
import { formatMinor, rowsOf, type LedgerEntryView } from "../accounting/finance-format";

type BuyerType = "b2b" | "b2c";

interface InvoiceRow {
  id: string;
  number: string;
  type: BuyerType;
  buyer: string;
  minor: number;
  currency: string;
}

/** Issued invoices are written as "B2B: Buyer (tax number)"; older entries fall back on their type. */
function parseInvoice(entry: LedgerEntryView): InvoiceRow {
  const match = /^(B2B|B2C):\s*(.*)$/i.exec(entry.description);
  const type: BuyerType = match
    ? (match[1]?.toLowerCase() as BuyerType)
    : entry.entryType === "payout_settlement"
      ? "b2b"
      : "b2c";
  return {
    id: entry.id,
    number: entry.invoiceNumber ?? NO_VALUE,
    type,
    buyer: (match ? match[2] : entry.description) || NO_VALUE,
    minor: Math.abs(entry.grossAmountMinor),
    currency: entry.currencyCode,
  };
}

export function InvoicesList() {
  const { status: authStatus, locale } = useAuth();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const rows = rowsOf<LedgerEntryView>(ledgerQuery.data)
    .filter((entry) => Boolean(entry.invoiceNumber))
    .map(parseInvoice);
  const visibleRows = rows.filter((row) => typeFilter === "all" || row.type === typeFilter);

  const columns: readonly OrgColumn<InvoiceRow>[] = [
    {
      key: "number",
      header: t("screen.organization.billing.invoicesList.number"),
      render: (row) => <b className="font-semibold">{row.number}</b>,
    },
    {
      key: "type",
      header: t("screen.organization.billing.invoicesList.type"),
      render: (row) => (
        <OrgBadge tone="info">
          {row.type === "b2b"
            ? t("screen.organization.billing.invoicesList.b2b")
            : t("screen.organization.billing.invoicesList.b2c")}
        </OrgBadge>
      ),
    },
    { key: "buyer", header: t("screen.organization.billing.invoicesList.buyer") },
    {
      key: "amount",
      header: t("screen.organization.billing.invoicesList.amount"),
      className: "whitespace-nowrap",
      render: (row) => formatMinor(row.minor, row.currency, locale),
    },
    {
      key: "status",
      header: t("screen.organization.billing.invoicesList.status"),
      render: () => (
        <OrgBadge tone="ok">{t("screen.organization.billing.invoicesList.issued")}</OrgBadge>
      ),
    },
  ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.billing.invoicesList.title")}
        caption={t("screen.organization.billing.invoicesList.caption")}
        actions={
          <OrgButtonLink slug="issue-invoice-b2b-or-b2c">
            {t("screen.organization.billing.invoicesList.issueInvoice")}
          </OrgButtonLink>
        }
      />
      <OrgChips
        label={t("screen.organization.billing.invoicesList.filterByBuyerType")}
        options={[
          { value: "all", label: t("screen.organization.billing.invoicesList.all") },
          { value: "b2b", label: t("screen.organization.billing.invoicesList.businessB2b") },
          { value: "b2c", label: t("screen.organization.billing.invoicesList.consumerB2c") },
        ]}
        value={typeFilter}
        onValueChange={setTypeFilter}
      />
      {ledgerQuery.isError ? (
        <OrgError onRetry={() => void ledgerQuery.refetch()} />
      ) : (
        <OrgTable
          columns={columns}
          rows={visibleRows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.billing.invoicesList.title")}
          loading={ledgerQuery.isLoading}
          empty={
            <OrgEmpty
              title={
                rows.length === 0
                  ? t("screen.organization.billing.invoicesList.noInvoicesYet")
                  : t("screen.organization.billing.invoicesList.noMatchingInvoices")
              }
              action={
                rows.length === 0 ? (
                  <OrgButtonLink slug="issue-invoice-b2b-or-b2c" variant="secondary">
                    {t("screen.organization.billing.invoicesList.issueInvoice")}
                  </OrgButtonLink>
                ) : undefined
              }
            >
              {rows.length === 0
                ? t("screen.organization.billing.invoicesList.issueAnInvoiceForA")
                : undefined}
            </OrgEmpty>
          }
        />
      )}
    </OrgPage>
  );
}
