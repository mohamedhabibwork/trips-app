// SCR-ORG-31 Ledger: every financial event with its booking or deal and gateway reference.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";
import { TeIcon } from "@trips-app/ui/components/te-icon";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgButton, OrgError, OrgPage, OrgPageHeader } from "../common/org-ui";
import { isoDay } from "../common/org-shared";
import {
  downloadCsv,
  formatDate,
  formatMinorNumber,
  periodStart,
  rowsOf,
  shortRef,
  type LedgerEntryView,
  type Period,
} from "./finance-format";

const EVENT_TYPES = [
  "booking_revenue",
  "refund_debit",
  "supplier_payout",
  "platform_commission",
  "payout_settlement",
] as const;

type EventType = (typeof EVENT_TYPES)[number];

function eventLabel(type: string): string {
  switch (type as EventType) {
    case "booking_revenue":
      return t("screen.organization.accounting.ledgerAndExports.bookingPaid");
    case "refund_debit":
      return t("screen.organization.accounting.ledgerAndExports.refundIssued");
    case "supplier_payout":
      return t("screen.organization.accounting.ledgerAndExports.supplierCost");
    case "platform_commission":
      return t("screen.organization.accounting.ledgerAndExports.platformCommission");
    case "payout_settlement":
      return t("screen.organization.accounting.ledgerAndExports.payoutSettlement");
    default:
      return type;
  }
}

interface LedgerRow {
  id: string;
  occurredAt: Date;
  eventType: string;
  signedMinor: number;
  currency: string;
  linked: string;
  linkedFull: string;
  gatewayReference: string | null;
}

export function LedgerAndExports() {
  const { status: authStatus, locale } = useAuth();
  const [period, setPeriod] = useState<Period>("all");
  const [eventType, setEventType] = useState("all");
  const [reference, setReference] = useState("");

  const ledgerQuery = useQuery(
    orpc.accounting.listLedgerEntries.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const rows: readonly LedgerRow[] = rowsOf<LedgerEntryView>(ledgerQuery.data).map((entry) => {
    const linkedFull = entry.bookingId ?? entry.tripId ?? "";
    return {
      id: entry.id,
      occurredAt: new Date(entry.occurredAt),
      eventType: entry.entryType,
      signedMinor:
        entry.direction === "debit" ? -Math.abs(entry.netAmountMinor) : entry.netAmountMinor,
      currency: entry.currencyCode,
      linked: linkedFull ? shortRef(linkedFull) : NO_VALUE,
      linkedFull,
      gatewayReference: entry.invoiceNumber,
    };
  });

  const since = periodStart(period, new Date());
  const needle = reference.trim().toLowerCase();
  const visibleRows = rows.filter((row) => {
    if (since && row.occurredAt < since) return false;
    if (eventType !== "all" && row.eventType !== eventType) return false;
    if (!needle) return true;
    return [row.linkedFull, row.linked, row.gatewayReference ?? ""].some((value) =>
      value.toLowerCase().includes(needle),
    );
  });

  const notApplicable = t("screen.organization.accounting.ledgerAndExports.notApplicable");
  const columns: readonly OrgColumn<LedgerRow>[] = [
    {
      key: "date",
      header: t("screen.organization.accounting.ledgerAndExports.date"),
      className: "whitespace-nowrap",
      render: (row) => formatDate(row.occurredAt, locale),
    },
    {
      key: "eventType",
      header: t("screen.organization.accounting.ledgerAndExports.eventType"),
      render: (row) => eventLabel(row.eventType),
    },
    {
      key: "amount",
      header: t("screen.organization.accounting.ledgerAndExports.amount"),
      align: "end",
      render: (row) => formatMinorNumber(row.signedMinor, locale),
    },
    { key: "currency", header: t("screen.organization.accounting.ledgerAndExports.currency") },
    {
      key: "linked",
      header: t("screen.organization.accounting.ledgerAndExports.linkedBookingOrDeal"),
      render: (row) => <span title={row.linkedFull || undefined}>{row.linked}</span>,
    },
    {
      key: "gatewayReference",
      header: t("screen.organization.accounting.ledgerAndExports.gatewayReference"),
      render: (row) => row.gatewayReference ?? notApplicable,
    },
  ];

  const exportCsv = () =>
    downloadCsv("ledger.csv", [
      columns.map((column) => String(column.header)),
      ...visibleRows.map((row) => [
        isoDay(row.occurredAt) ?? "",
        eventLabel(row.eventType),
        (row.signedMinor / 100).toFixed(2),
        row.currency,
        row.linkedFull,
        row.gatewayReference ?? notApplicable,
      ]),
    ]);

  const periodOptions = [
    { value: "all", label: t("screen.organization.accounting.ledgerAndExports.allTime") },
    { value: "month", label: t("screen.organization.accounting.ledgerAndExports.thisMonth") },
    { value: "30d", label: t("screen.organization.accounting.ledgerAndExports.last30Days") },
    { value: "year", label: t("screen.organization.accounting.ledgerAndExports.thisYear") },
  ];
  const eventOptions = [
    { value: "all", label: t("screen.organization.accounting.ledgerAndExports.allEvents") },
    ...EVENT_TYPES.map((type) => ({ value: type, label: eventLabel(type) })),
  ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.accounting.ledgerAndExports.title")}
        caption={t("screen.organization.accounting.ledgerAndExports.caption")}
        actions={
          <>
            <OrgButton
              variant="secondary"
              disabled={!ledgerQuery.isSuccess || visibleRows.length === 0}
              onClick={exportCsv}
            >
              {t("screen.organization.accounting.ledgerAndExports.exportCsv")}
            </OrgButton>
            <OrgButton variant="secondary" aria-disabled="true" aria-describedby="ledger-pdf-note">
              <TeIcon name="lock" className="size-4" />
              {t("screen.organization.accounting.ledgerAndExports.exportPdf")}
            </OrgButton>
          </>
        }
      />
      <p id="ledger-pdf-note" className="te-caption m-0 text-[var(--te-ink-muted)]">
        {t("screen.organization.accounting.ledgerAndExports.pdfExportIsOnEnterprise")}
      </p>
      <div className="flex flex-col gap-6 lg:flex-row lg:flex-wrap lg:items-end">
        <OrgSelect
          label={t("screen.organization.accounting.ledgerAndExports.period")}
          fieldClassName="lg:min-w-[200px]"
          options={periodOptions}
          value={period}
          onValueChange={(value) => setPeriod(value as Period)}
        />
        <OrgSelect
          label={t("screen.organization.accounting.ledgerAndExports.eventTypeFilter")}
          fieldClassName="lg:min-w-[200px]"
          options={eventOptions}
          value={eventType}
          onValueChange={setEventType}
        />
        <OrgInput
          label={t("screen.organization.accounting.ledgerAndExports.bookingOrDealReference")}
          fieldClassName="lg:min-w-[240px] lg:flex-1"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
      </div>
      {ledgerQuery.isError ? (
        <OrgError onRetry={() => void ledgerQuery.refetch()} />
      ) : (
        <OrgTable
          columns={columns}
          rows={visibleRows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.accounting.ledgerAndExports.title")}
          loading={ledgerQuery.isLoading}
          empty={
            rows.length === 0
              ? t("screen.organization.accounting.ledgerAndExports.noLedgerLines")
              : t("screen.organization.accounting.ledgerAndExports.noMatchingLines")
          }
        />
      )}
      <p className="te-caption m-0 text-[var(--te-ink-muted)]">
        {t("screen.organization.accounting.ledgerAndExports.eachEventsEntriesBalance")}
      </p>
    </OrgPage>
  );
}
