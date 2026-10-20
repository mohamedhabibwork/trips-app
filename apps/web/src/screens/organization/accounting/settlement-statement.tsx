// SCR-ORG-70 Settlement statement: what a payout run paid, trip by trip
// (docs/design/web/OrgSettlement.dc.html). The statement is the payout_settlement ledger entry the
// URL names, and the per-trip table derives from the organization's booking_revenue, refund_debit
// and platform_commission entries; gateway fees, fee VAT and provider deals are not recorded in
// the ledger and disputing a line has no procedure yet — both say so.
import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgChips, OrgTextarea } from "../common/org-form";
import { OrgButtonLink, useOrgParams } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { downloadCsv, formatDate, formatMinor, rowsOf } from "../accounting/finance-format";
import { tripTitle } from "../common/org-shared";

const K = "screen.organization.accounting.settlementStatement";

interface StatementEntry {
  id: string;
  tripId: string | null;
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

/** A trip's money: gross revenue, refunds, commission and the net paid. */
interface TripLine {
  tripId: string;
  title: string;
  currency: string;
  gross: number;
  refunds: number;
  commission: number;
  net: number;
  occurredAt: string | Date;
}

interface AdjustmentRow {
  id: string;
  label: string;
  minor: number;
  currency: string;
  detail: string;
}

export function SettlementStatement(): ReactNode {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const settlementId = useOrgParams().settlementId ?? "";
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeTripId, setDisputeTripId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSent, setDisputeSent] = useState(false);

  const ledgerQuery = useQuery({
    ...serverQueryOptions(orpc.accounting.listLedgerEntries, "accounting/listLedgerEntries", {
      input: {},
    }),
    enabled,
  });
  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });

  const entries = rowsOf<StatementEntry>(ledgerQuery.data);
  const settlement =
    entries.find((item) => item.id === settlementId && item.entryType === "payout_settlement") ??
    entries.find(
      (item) => item.invoiceNumber === settlementId && item.entryType === "payout_settlement",
    ) ??
    null;

  const tripNames = new Map(
    (tripsQuery.data?.items ?? []).map((trip) => [trip.id, tripTitle(trip, locale)]),
  );

  // Per-trip money: gross revenue and commission are credits, refunds are debits.
  const tripLines: readonly TripLine[] = (() => {
    const byTrip = new Map<string, TripLine>();
    for (const entry of entries) {
      if (!entry.tripId) continue;
      if (!["booking_revenue", "refund_debit", "platform_commission"].includes(entry.entryType)) {
        continue;
      }
      const line = byTrip.get(entry.tripId) ?? {
        tripId: entry.tripId,
        title: tripNames.get(entry.tripId) ?? entry.tripId,
        currency: entry.currencyCode,
        gross: 0,
        refunds: 0,
        commission: 0,
        net: 0,
        occurredAt: entry.occurredAt,
      };
      if (entry.entryType === "booking_revenue") {
        line.gross += entry.grossAmountMinor;
        line.commission += entry.commissionAmountMinor;
        line.net += entry.grossAmountMinor - entry.commissionAmountMinor;
      } else if (entry.entryType === "refund_debit") {
        line.refunds += Math.abs(entry.netAmountMinor);
        line.net -= Math.abs(entry.netAmountMinor);
      } else {
        line.commission += entry.netAmountMinor;
        line.net -= entry.netAmountMinor;
      }
      byTrip.set(entry.tripId, line);
    }
    return [...byTrip.values()].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  })();

  const visibleLines = tripLines.filter((line) => line.net !== 0 || line.gross !== 0);
  const totals = visibleLines.reduce(
    (sum, line) => ({
      gross: sum.gross + line.gross,
      refunds: sum.refunds + line.refunds,
      commission: sum.commission + line.commission,
      net: sum.net + line.net,
    }),
    { gross: 0, refunds: 0, commission: 0, net: 0 },
  );
  const currency = settlement?.currencyCode ?? visibleLines[0]?.currency ?? "EGP";

  const adjustments: readonly AdjustmentRow[] = entries
    .filter(
      (entry) => ["supplier_payout", "refund_debit"].includes(entry.entryType) && !entry.tripId,
    )
    .map((entry) => ({
      id: entry.id,
      label:
        entry.entryType === "supplier_payout"
          ? t(`${K}.adjustmentSupplier`)
          : t(`${K}.adjustmentRefund`),
      minor: entry.direction === "debit" ? -Math.abs(entry.netAmountMinor) : entry.netAmountMinor,
      currency: entry.currencyCode,
      detail: entry.description || NO_VALUE,
    }));

  const columns: readonly OrgColumn<TripLine>[] = [
    {
      key: "trip",
      header: t(`${K}.colTrip`),
      render: (row) => <b className="font-semibold">{row.title}</b>,
    },
    {
      key: "gross",
      header: t(`${K}.colGross`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinor(row.gross, row.currency, locale),
    },
    {
      key: "refunds",
      header: t(`${K}.colRefunds`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) =>
        row.refunds > 0
          ? `−${formatMinor(row.refunds, row.currency, locale)}`
          : formatMinor(0, row.currency, locale),
    },
    {
      key: "commission",
      header: t(`${K}.colCommission`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) =>
        row.commission > 0
          ? `−${formatMinor(row.commission, row.currency, locale)}`
          : formatMinor(0, row.currency, locale),
    },
    {
      key: "gateway",
      header: t(`${K}.colGateway`),
      align: "end",
      render: () => <span className="text-[var(--te-ink-muted)]">{NO_VALUE}</span>,
    },
    {
      key: "net",
      header: t(`${K}.colNet`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinor(row.net, row.currency, locale),
    },
    {
      key: "actions",
      header: t(`${K}.colActions`),
      hiddenHeader: true,
      align: "end",
      render: (row) => (
        <OrgButton
          variant="text"
          className="-mx-2"
          onClick={() => {
            setDisputeTripId(row.tripId);
            setDisputeOpen(true);
          }}
        >
          {t(`${K}.dispute`)}
        </OrgButton>
      ),
    },
  ];

  const exportCsv = () =>
    downloadCsv("settlement-statement.csv", [
      [
        t(`${K}.colTrip`),
        t(`${K}.colGross`),
        t(`${K}.colRefunds`),
        t(`${K}.colCommission`),
        t(`${K}.colNet`),
      ],
      ...visibleLines.map((line) => [
        line.title,
        formatMinor(line.gross, line.currency, locale),
        formatMinor(line.refunds, line.currency, locale),
        formatMinor(line.commission, line.currency, locale),
        formatMinor(line.net, line.currency, locale),
      ]),
    ]);

  // Disputes have no procedure yet; the message stays on screen and the alert says so.
  function sendDispute(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (disputeReason.trim().length === 0) return;
    setDisputeSent(true);
  }

  const disputedLine = tripLines.find((line) => line.tripId === disputeTripId) ?? null;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`, {
          reference: settlement?.invoiceNumber ?? settlementId,
          date: settlement ? formatDate(settlement.occurredAt, locale) : NO_VALUE,
        })}
        actions={
          <div className="flex flex-wrap gap-3">
            <OrgButton variant="secondary" disabled={visibleLines.length === 0} onClick={exportCsv}>
              {t(`${K}.exportCsv`)}
            </OrgButton>
          </div>
        }
      />
      {ledgerQuery.isError || tripsQuery.isError ? (
        <OrgError
          onRetry={() => {
            void ledgerQuery.refetch();
            void tripsQuery.refetch();
          }}
        />
      ) : null}
      {ledgerQuery.isLoading || tripsQuery.isLoading ? (
        <OrgLoading rows={6} />
      ) : !settlement ? (
        <OrgCard title={t(`${K}.notFoundTitle`)}>
          <OrgEmpty title={t(`${K}.notFoundTitle`)}>{t(`${K}.notFoundBody`)}</OrgEmpty>
        </OrgCard>
      ) : (
        <>
          <OrgKpiRow>
            <OrgKpi
              label={t(`${K}.kpiPayout`)}
              value={formatMinor(
                Math.abs(settlement.netAmountMinor),
                settlement.currencyCode,
                locale,
              )}
              hint={settlement.description || undefined}
            />
            <OrgKpi
              label={t(`${K}.kpiTrips`)}
              value={visibleLines.length}
              hint={t(`${K}.kpiTripsHint`)}
            />
            <OrgKpi
              label={t(`${K}.kpiStatus`)}
              value={settlement.status === "settled" ? t(`${K}.settled`) : t(`${K}.open`)}
            />
          </OrgKpiRow>
          <OrgCard title={t(`${K}.tripsTitle`)}>
            <OrgTable
              columns={columns}
              rows={visibleLines}
              rowKey={(row) => row.tripId}
              caption={t(`${K}.tripsTitle`)}
              empty={<OrgEmpty title={t(`${K}.noTripsTitle`)}>{t(`${K}.noTripsBody`)}</OrgEmpty>}
            />
            <div className="flex flex-col gap-2 lg:ms-auto lg:max-w-md">
              <TotalRowLocal
                label={t(`${K}.totalGross`)}
                value={formatMinor(totals.gross, currency, locale)}
              />
              <TotalRowLocal
                label={t(`${K}.totalRefunds`)}
                value={`−${formatMinor(totals.refunds, currency, locale)}`}
              />
              <TotalRowLocal
                label={t(`${K}.totalCommission`)}
                value={`−${formatMinor(totals.commission, currency, locale)}`}
              />
              <TotalRowLocal
                label={t(`${K}.totalNet`)}
                value={formatMinor(totals.net, currency, locale)}
                strong
              />
            </div>
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.columnsNote`)}</p>
          </OrgCard>
          {adjustments.length > 0 ? (
            <OrgCard title={t(`${K}.adjustmentsTitle`)}>
              <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm leading-5">
                {adjustments.map((row) => (
                  <li key={row.id} className="flex flex-wrap justify-between gap-3">
                    <span>
                      <b>{row.label}</b> · {row.detail}
                    </span>
                    <span>{formatMinor(row.minor, row.currency, locale)}</span>
                  </li>
                ))}
              </ul>
            </OrgCard>
          ) : null}
          <OrgRow align="start">
            <OrgCard title={t(`${K}.disputeTitle`)} className="lg:flex-[2]">
              {!disputeOpen ? (
                <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
                  {t(`${K}.disputeIntro`)}
                </p>
              ) : (
                <form onSubmit={sendDispute} className="flex flex-col gap-4" noValidate>
                  <p className="m-0 text-sm leading-5">
                    {disputedLine
                      ? t(`${K}.disputeLine`, { trip: disputedLine.title })
                      : t(`${K}.disputeStatement`)}
                  </p>
                  <OrgChips
                    label={t(`${K}.disputeWhatLabel`)}
                    options={[
                      { value: "refund", label: t(`${K}.disputeWhat.refund`) },
                      { value: "fees", label: t(`${K}.disputeWhat.fees`) },
                      {
                        value: "missing",
                        label: t(`${K}.disputeWhat.missing`),
                      },
                      { value: "other", label: t(`${K}.disputeWhat.other`) },
                    ]}
                    value="refund"
                    onValueChange={() => {
                      // The reason chips are part of the design; the free-text field carries it.
                    }}
                  />
                  <OrgTextarea
                    label={t(`${K}.disputeDetailsLabel`)}
                    rows={3}
                    value={disputeReason}
                    onChange={(change) => setDisputeReason(change.target.value)}
                  />
                  {disputeSent ? (
                    <OrgAlert tone="info" title={t(`${K}.disputeUnavailableTitle`)}>
                      {t(`${K}.disputeUnavailableBody`)}
                    </OrgAlert>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    <OrgButton type="submit" disabled={disputeReason.trim().length === 0}>
                      {t(`${K}.sendDispute`)}
                    </OrgButton>
                    <OrgButton variant="text" onClick={() => setDisputeOpen(false)}>
                      {t(`${K}.cancel`)}
                    </OrgButton>
                  </div>
                </form>
              )}
            </OrgCard>
            <OrgCard title={t(`${K}.linksTitle`)} className="lg:flex-1">
              <div className="flex flex-col gap-3">
                <OrgButtonLink slug="settlements" variant="secondary">
                  {t(`${K}.allSettlements`)}
                </OrgButtonLink>
                <OrgButtonLink slug="ledger-and-exports" variant="secondary">
                  {t(`${K}.openLedger`)}
                </OrgButtonLink>
              </div>
            </OrgCard>
          </OrgRow>
        </>
      )}
    </OrgPage>
  );
}

function TotalRowLocal({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}): ReactNode {
  return (
    <div
      className={
        strong
          ? "flex justify-between gap-3 text-base leading-6 font-semibold"
          : "flex justify-between gap-3 text-sm leading-5"
      }
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
