// SCR-ORG-69 B2B tax invoice: the bilingual ZATCA-style layout of one issued invoice
// (docs/design/web/OrgInvoice.dc.html). The invoice is the matching ledger entry
// (accounting.listLedgerEntries by invoice number or id) plus the seller block from the
// organization settings; the ledger does not split VAT or record ZATCA clearance yet, so those
// show as not recorded instead of invented.
import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgButtonLink, useOrgParams } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  formatDateTime,
  formatMinor,
  formatMinorNumber,
  rowsOf,
} from "../accounting/finance-format";
import { TotalRow } from "./billing-parts";

const K = "screen.organization.billing.b2bInvoice";

/** The ledger fields the invoice reads; commission rides on the same rows. */
interface InvoiceEntry {
  id: string;
  entryType: string;
  direction: string;
  grossAmountMinor: number;
  commissionAmountMinor: number;
  netAmountMinor: number;
  currencyCode: string;
  status: string;
  invoiceNumber: string | null;
  description: string;
  occurredAt: string | Date;
}

/** "B2B: Buyer (tax number)" — how the invoices list parses the description. */
function buyerOf(description: string): string {
  const match = /^(B2B|B2C):\s*(.*)$/i.exec(description);
  return (match ? match[2] : description) || NO_VALUE;
}

/** Ledger status names the badge knows; anything else prints the raw value. */
const LEDGER_STATUS_KEYS: ReadonlySet<string> = new Set(["posted", "pending", "settled"]);

interface LineRow {
  id: string;
  description: string;
  qty: string;
  unitMinor: number;
  taxableMinor: number;
  currency: string;
}

export function B2bInvoice(): ReactNode {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const invoiceId = useOrgParams().invoiceId ?? "";
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMarked, setPaymentMarked] = useState(false);

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled,
  });
  const settingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.organization.getOrganizationSettings,
      "organization/getOrganizationSettings",
      {
        input: {},
      },
    ),
    enabled,
  });

  const entries = rowsOf<InvoiceEntry>(ledgerQuery.data);
  const entry =
    entries.find((item) => item.id === invoiceId || item.invoiceNumber === invoiceId) ?? null;
  const organization = settingsQuery.data?.organization;
  const settings = settingsQuery.data?.settings;
  const sellerName =
    (locale === "ar"
      ? organization?.displayNameAr || organization?.displayNameEn
      : organization?.displayNameEn || organization?.displayNameAr) ??
    organization?.legalEntityName ??
    NO_VALUE;

  const lines: readonly LineRow[] = entry
    ? [
        {
          id: entry.id,
          description: buyerOf(entry.description),
          qty: "1",
          unitMinor: Math.abs(entry.grossAmountMinor),
          taxableMinor: Math.abs(entry.grossAmountMinor),
          currency: entry.currencyCode,
        },
      ]
    : [];
  const totalMinor = entry ? Math.abs(entry.grossAmountMinor) : 0;

  const columns: readonly OrgColumn<LineRow>[] = [
    { key: "n", header: "#", render: () => "1" },
    {
      key: "description",
      header: (
        <span>
          {t(`${K}.colDescription`)} <span dir="rtl">{t(`${K}.colDescriptionAr`)}</span>
        </span>
      ),
      render: (row) => row.description,
    },
    { key: "qty", header: t(`${K}.colQty`), align: "end" },
    {
      key: "unit",
      header: t(`${K}.colUnit`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinorNumber(row.unitMinor, locale),
    },
    {
      key: "taxable",
      header: t(`${K}.colTaxable`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinorNumber(row.taxableMinor, locale),
    },
    {
      key: "vat",
      header: t(`${K}.colVat`),
      align: "end",
      render: () => <span className="text-[var(--te-ink-muted)]">{t(`${K}.vatNotRecorded`)}</span>,
    },
    {
      key: "total",
      header: t(`${K}.colTotal`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinorNumber(row.taxableMinor, locale),
    },
  ];

  // No payment procedure exists yet; the recorded amount stays on screen and the alert says so.
  function recordPayment(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (amountReceived.trim().length === 0) return;
    setPaymentMarked(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={entry?.invoiceNumber ?? invoiceId}
        caption={t(`${K}.caption`)}
        badge={
          entry ? (
            <OrgBadge tone={entry.status === "posted" ? "ok" : "warn"}>
              {LEDGER_STATUS_KEYS.has(entry.status)
                ? t(`${K}.status.${entry.status}`)
                : entry.status}
            </OrgBadge>
          ) : undefined
        }
        actions={
          <OrgButtonLink slug="invoices-list" variant="secondary">
            {t(`${K}.backToInvoices`)}
          </OrgButtonLink>
        }
      />
      {ledgerQuery.isError ? <OrgError onRetry={() => void ledgerQuery.refetch()} /> : null}
      {ledgerQuery.isLoading || settingsQuery.isLoading ? (
        <OrgLoading rows={6} />
      ) : !entry ? (
        <OrgCard title={t(`${K}.notFoundTitle`)}>
          <OrgEmpty title={t(`${K}.notFoundTitle`)}>{t(`${K}.notFoundBody`)}</OrgEmpty>
        </OrgCard>
      ) : (
        <>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.sellerTitle`)} className="lg:flex-1">
              <div className="flex flex-col gap-1 text-sm leading-5">
                <b>{sellerName}</b>
                <span dir="rtl">{organization?.displayNameAr ?? ""}</span>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {t(`${K}.vatNo`)}: {settings?.taxNumber ?? t(`${K}.notRecordedShort`)}
                </span>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {settings?.billingAddress ?? organization?.headquartersAddress ?? ""}
                </span>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {settings?.billingContactEmail ?? ""}
                </span>
              </div>
            </OrgCard>
            <OrgCard title={t(`${K}.buyerTitle`)} className="lg:flex-1">
              <div className="flex flex-col gap-1 text-sm leading-5">
                <b>{buyerOf(entry.description)}</b>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {t(`${K}.issuedAt`)}: {formatDateTime(entry.occurredAt, locale)}
                </span>
                <span className="te-caption text-[var(--te-ink-muted)]">
                  {t(`${K}.ledgerRef`)}: {entry.id}
                </span>
              </div>
            </OrgCard>
          </OrgRow>
          <OrgCard title={t(`${K}.linesTitle`)}>
            <OrgTable
              columns={columns}
              rows={lines}
              rowKey={(row) => row.id}
              caption={t(`${K}.linesTitle`)}
            />
            <div className="flex flex-col gap-2 lg:ms-auto lg:max-w-sm">
              <TotalRow
                label={t(`${K}.subtotal`)}
                value={formatMinor(totalMinor, entry.currencyCode, locale)}
              />
              <TotalRow
                label={t(`${K}.vatRow`, { percent: "15%" })}
                value={t(`${K}.vatNotRecorded`)}
              />
              <TotalRow
                label={t(`${K}.total`)}
                value={formatMinor(totalMinor, entry.currencyCode, locale)}
                strong
              />
            </div>
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.vatSplitNote`)}</p>
          </OrgCard>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.paymentTitle`)} className="lg:flex-[2]">
              {paymentOpen ? (
                <form onSubmit={recordPayment} className="flex flex-col gap-3" noValidate>
                  <OrgInputInline
                    label={t(`${K}.amountReceivedLabel`)}
                    value={amountReceived}
                    onChange={setAmountReceived}
                  />
                  {paymentMarked ? (
                    <OrgAlert tone="info" title={t(`${K}.paymentUnavailableTitle`)}>
                      {t(`${K}.paymentUnavailableBody`)}
                    </OrgAlert>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <OrgButton type="submit" disabled={amountReceived.trim().length === 0}>
                      {t(`${K}.markAsPaid`)}
                    </OrgButton>
                    <OrgButton variant="text" onClick={() => setPaymentOpen(false)}>
                      {t(`${K}.cancel`)}
                    </OrgButton>
                  </div>
                </form>
              ) : (
                <div>
                  <OrgButton onClick={() => setPaymentOpen(true)}>
                    {t(`${K}.recordPayment`)}
                  </OrgButton>
                </div>
              )}
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.reconcileNote`)}</p>
            </OrgCard>
            <OrgCard title={t(`${K}.downloadsTitle`)} className="lg:flex-1">
              <OrgEmpty title={t(`${K}.downloadsUnavailableTitle`)}>
                {t(`${K}.downloadsUnavailableBody`)}
              </OrgEmpty>
            </OrgCard>
          </OrgRow>
          <OrgAlert tone="info" title={t(`${K}.zatcaTitle`)}>
            {t(`${K}.zatcaBody`)}
          </OrgAlert>
        </>
      )}
    </OrgPage>
  );
}

function OrgInputInline({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}): ReactNode {
  return (
    <label className="flex max-w-[280px] flex-col gap-1 text-sm leading-5">
      <span className="font-semibold">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(change) => onChange(change.target.value)}
        className="min-h-11 w-full rounded-lg border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3 py-2 text-base leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]"
      />
    </label>
  );
}
