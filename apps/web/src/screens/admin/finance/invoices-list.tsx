// SCR-ADM-43 Invoices (docs/design/web/AdmInvoices.dc.html): every invoice issued on the platform
// with ZATCA-style columns, filters, and a rejected-by-ZATCA queue. Ledger entries are the invoice
// source admins can reach, so each entry renders as one invoice row: number, issuer side, total
// and payment state come from the entry; buyer, VAT and ZATCA clearance are not recorded on
// entries and show as not recorded. There is no rejection data, so the rejected section renders
// only when the API exposes it (it never renders a fabricated count).
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { setSelectedAdminInvoiceId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminFilterBar,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminTable,
  type AdminColumn,
  type AdminTone,
} from "../common/admin-ui";
import { formatDate, formatMinor, totalsByCurrency } from "../finance/finance-format";

const K = "screen.admin.money.invoicesList";

const ISSUER_OPTIONS = (): readonly AdminOption[] => [
  { value: "all", label: t(`${K}.issuerAll`) },
  { value: "platform", label: t(`${K}.issuerPlatform`) },
  { value: "organization", label: t(`${K}.issuerOrganization`) },
];

const TYPE_OPTIONS = (): readonly AdminOption[] => [
  { value: "all", label: t(`${K}.typeAll`) },
  { value: "booking_revenue", label: t(`${K}.typeBookingRevenue`) },
  { value: "platform_commission", label: t(`${K}.typeCommission`) },
  { value: "supplier_payout", label: t(`${K}.typePayout`) },
  { value: "refund_debit", label: t(`${K}.typeRefund`) },
  { value: "payout_settlement", label: t(`${K}.typeSettlement`) },
];

const ZATCA_OPTIONS = (): readonly AdminOption[] => [
  { value: "all", label: t(`${K}.zatcaAny`) },
  { value: "not_recorded", label: t(`${K}.zatcaNotRecorded`) },
];

const CREATED_OPTIONS = (): readonly AdminOption[] => [
  { value: "all", label: t(`${K}.createdAll`) },
  { value: "7d", label: t(`${K}.created7d`) },
  { value: "30d", label: t(`${K}.created30d`) },
  { value: "90d", label: t(`${K}.created90d`) },
];

const STATUS_TONE: Record<string, AdminTone> = {
  posted: "info",
  settled: "ok",
  reconciliation_exception: "bad",
};

interface InvoiceRow {
  id: string;
  number: string;
  issuer: "platform" | "organization";
  type: string;
  total: string;
  payment: string;
  status: string;
  createdOn: string;
  occurredMs: number;
}

export function InvoicesList() {
  const { status: authStatus, locale } = useAuth();
  const [issuer, setIssuer] = useState("all");
  const [type, setType] = useState("all");
  const [zatca] = useState("all");
  const [created, setCreated] = useState("all");
  const [search, setSearch] = useState("");

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled: authStatus === "authenticated",
  });

  const allRows: readonly InvoiceRow[] = useMemo(
    () =>
      (ledgerQuery.data ?? []).map((entry) => ({
        id: entry.id,
        number: entry.invoiceNumber || entry.id,
        issuer: entry.direction === "credit" ? "platform" : "organization",
        type: entry.entryType,
        total: formatMinor(Math.abs(entry.grossAmountMinor), entry.currencyCode, locale),
        payment:
          entry.status === "settled"
            ? t(`${K}.paid`)
            : entry.status === "reconciliation_exception"
              ? t(`${K}.onHold`)
              : t(`${K}.pending`),
        status: entry.status,
        createdOn: formatDate(entry.occurredAt, locale),
        occurredMs: new Date(entry.occurredAt).getTime(),
      })),
    [ledgerQuery.data, locale],
  );

  const cutoff = created === "all" ? 0 : Date.now() - Number(created) * 24 * 60 * 60 * 1000;
  const rows = allRows.filter((row) => {
    if (issuer !== "all" && row.issuer !== issuer) return false;
    if (type !== "all" && row.type !== type) return false;
    if (row.occurredMs < cutoff) return false;
    if (search.trim() && !row.number.toLowerCase().includes(search.trim().toLowerCase()))
      return false;
    return true;
  });

  const grandTotals = totalsByCurrency(
    (ledgerQuery.data ?? [])
      .filter((entry) => entry.entryType === "booking_revenue" && entry.direction === "credit")
      .map((entry) => ({ currency: entry.currencyCode, amountMinor: entry.grossAmountMinor })),
  );

  const columns: readonly AdminColumn<InvoiceRow>[] = [
    { key: "number", header: t(`${K}.number`), render: (row) => row.number, wrap: true },
    {
      key: "issuer",
      header: t(`${K}.issuer`),
      render: (row) =>
        row.issuer === "platform" ? t(`${K}.issuerPlatform`) : t(`${K}.issuerOrganization`),
    },
    {
      key: "buyer",
      header: t(`${K}.buyer`),
      render: () => t(`${K}.notRecorded`),
      wrap: true,
    },
    { key: "type", header: t(`${K}.type`), render: (row) => t(`${K}.type.${row.type}`) },
    { key: "total", header: t(`${K}.total`), render: (row) => row.total, align: "end" },
    {
      key: "vat",
      header: t(`${K}.vat`),
      render: () => t(`${K}.notRecorded`),
      align: "end",
      headerWrap: true,
    },
    {
      key: "payment",
      header: t(`${K}.payment`),
      render: (row) => (
        <AdminBadge tone={STATUS_TONE[row.status] ?? "info"} icon={false}>
          {row.payment}
        </AdminBadge>
      ),
    },
    {
      key: "zatca",
      header: t(`${K}.zatca`),
      render: () => t(`${K}.notRecorded`),
      headerWrap: true,
    },
    { key: "created", header: t(`${K}.created`), render: (row) => row.createdOn },
    {
      key: "action",
      header: <span className="te-caption">{t(`${K}.action`)}</span>,
      render: (row) => (
        <AdminLink
          screen="SCR-ADM-44"
          params={{ invoiceId: row.id }}
          onClick={() => setSelectedAdminInvoiceId(row.id)}
        >
          {t(`${K}.open`)}
        </AdminLink>
      ),
    },
  ];

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`)}
      actions={
        <>
          {/* No export procedure exists yet. */}
          <AdminButton variant="secondary" disabled title={t(`${K}.exportUnavailable`)}>
            {t(`${K}.exportCsv`)}
          </AdminButton>
          {/* No ZATCA rejection data exists, so there is nothing to fix and no counter shows. */}
        </>
      }
    >
      <AdminGrid columns={3}>
        <AdminKpi
          label={t(`${K}.kpiInvoices`)}
          value={ledgerQuery.isSuccess ? allRows.length : "—"}
          caption={t(`${K}.kpiInvoicesCaption`)}
        />
        <AdminKpi
          label={t(`${K}.kpiRevenue`)}
          value={
            grandTotals.length > 0
              ? grandTotals
                  .map((total) => formatMinor(total.amountMinor, total.currency, locale))
                  .join(" · ")
              : "—"
          }
          caption={t(`${K}.kpiRevenueCaption`)}
        />
        <AdminKpi label={t(`${K}.kpiRejected`)} value="—" caption={t(`${K}.kpiRejectedCaption`)} />
      </AdminGrid>

      <AdminCard title={t(`${K}.zatcaHealthTitle`)}>
        <AdminAlert tone="info" title={t(`${K}.zatcaHealthTitle`)}>
          {t(`${K}.zatcaHealthBody`)}
        </AdminAlert>
      </AdminCard>

      <AdminFilterBar label={t(`${K}.filtersLabel`)}>
        <AdminInput
          type="search"
          label={t(`${K}.searchLabel`)}
          placeholder={t(`${K}.searchPlaceholder`)}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <AdminSelect
          label={t(`${K}.issuer`)}
          options={ISSUER_OPTIONS()}
          value={issuer}
          onValueChange={setIssuer}
        />
        <AdminSelect
          label={t(`${K}.type`)}
          options={TYPE_OPTIONS()}
          value={type}
          onValueChange={setType}
        />
        <AdminSelect
          label={t(`${K}.zatca`)}
          help={t(`${K}.zatcaFilterHelp`)}
          options={ZATCA_OPTIONS()}
          value={zatca}
          disabled
          onValueChange={() => undefined}
        />
        <AdminSelect
          label={t(`${K}.created`)}
          options={CREATED_OPTIONS()}
          value={created}
          onValueChange={setCreated}
        />
      </AdminFilterBar>

      <AdminQueryState query={ledgerQuery} loadingLabel={t(`${K}.loading`)}>
        <AdminTable
          caption={t(`${K}.tableCaption`)}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={<AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />}
        />
      </AdminQueryState>
    </AdminPage>
  );
}
