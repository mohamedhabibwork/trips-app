// SCR-ORG-30 Trip accounting: the five accounting lines of one trip and their reconciliation.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSelect } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import { getSelectedTripId, setSelectedTripId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import { formatMinor, rowsOf, type BookingView, type LedgerEntryView } from "./finance-format";

const PAID_BOOKING_STATES: readonly string[] = ["confirmed", "checked_in", "completed"];

type LineId = "base" | "program" | "coupon" | "supplier" | "gateway";

interface AccountingLine {
  id: LineId;
  label: string;
  /** Total from the trip's bookings, null when the trip has no source for it. */
  tripMinor: number | null;
  /** Total from the trip's ledger entries, null when no ledger entry type carries it. */
  ledgerMinor: number | null;
}

function lineLabel(id: LineId): string {
  switch (id) {
    case "base":
      return t("screen.organization.accounting.tripAccounting.baseRevenue");
    case "program":
      return t("screen.organization.accounting.tripAccounting.programRevenue");
    case "coupon":
      return t("screen.organization.accounting.tripAccounting.couponImpact");
    case "supplier":
      return t("screen.organization.accounting.tripAccounting.supplierCosts");
    case "gateway":
      return t("screen.organization.accounting.tripAccounting.gatewayFees");
  }
}

function difference(line: AccountingLine): number | null {
  if (line.tripMinor === null || line.ledgerMinor === null) return null;
  return line.tripMinor - line.ledgerMinor;
}

export function TripAccounting() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [chosenTripId, setChosenTripId] = useState<string | null>(() => getSelectedTripId());

  const summaryQuery = useQuery(
    orpc.accounting.getOrganizationSummary.queryOptions({ input: undefined, enabled }),
  );
  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({ input: {}, enabled }),
  );

  const trips = tripsQuery.data?.items ?? [];
  const trip = trips.find((item) => item.id === chosenTripId) ?? trips[0];
  const tripId = trip?.id;

  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: { tripId },
      enabled: enabled && Boolean(tripId),
    }),
  );
  const ledgerQuery = useQuery(
    orpc.accounting.listLedgerEntries.queryOptions({
      input: { tripId },
      enabled: enabled && Boolean(tripId),
    }),
  );

  const currency = trip?.currencyCode ?? summaryQuery.data?.currencyCode;
  const bookings = rowsOf<BookingView>(bookingsQuery.data).filter(
    (booking) => booking.currencyCode === currency && PAID_BOOKING_STATES.includes(booking.status),
  );
  const entries = rowsOf<LedgerEntryView>(ledgerQuery.data).filter(
    (entry) => entry.currencyCode === currency,
  );
  const tripLoaded = bookingsQuery.isSuccess;
  const ledgerLoaded = ledgerQuery.isSuccess;

  const sumBookings = (pick: (booking: BookingView) => number) =>
    tripLoaded ? bookings.reduce((sum, booking) => sum + pick(booking), 0) : null;
  const sumLedger = (entryType: string) =>
    ledgerLoaded
      ? entries
          .filter((entry) => entry.entryType === entryType)
          .reduce((sum, entry) => sum + Math.abs(entry.grossAmountMinor), 0)
      : null;

  const lines: readonly AccountingLine[] = [
    {
      id: "base",
      label: lineLabel("base"),
      tripMinor: sumBookings((booking) => booking.subtotalMinor),
      ledgerMinor: sumLedger("booking_revenue"),
    },
    {
      id: "program",
      label: lineLabel("program"),
      tripMinor: sumBookings((booking) => booking.programsTotalMinor),
      ledgerMinor: null,
    },
    {
      id: "coupon",
      label: lineLabel("coupon"),
      tripMinor: sumBookings((booking) => booking.discountMinor),
      ledgerMinor: null,
    },
    {
      id: "supplier",
      label: lineLabel("supplier"),
      tripMinor: null,
      ledgerMinor: sumLedger("supplier_payout"),
    },
    { id: "gateway", label: lineLabel("gateway"), tripMinor: null, ledgerMinor: null },
  ];

  const money = (minor: number | null) =>
    minor === null || !currency ? NO_VALUE : formatMinor(minor, currency, locale);
  const tileValue = (line: AccountingLine) => money(line.tripMinor ?? line.ledgerMinor);

  const differences = lines.map(difference).filter((value): value is number => value !== null);
  const reconciled = tripLoaded && ledgerLoaded && differences.every((value) => value === 0);

  const columns: readonly OrgColumn<AccountingLine>[] = [
    { key: "label", header: t("screen.organization.accounting.tripAccounting.line") },
    {
      key: "trip",
      header: t("screen.organization.accounting.tripAccounting.tripTotal"),
      render: (line) => money(line.tripMinor),
    },
    {
      key: "ledger",
      header: t("screen.organization.accounting.tripAccounting.ledgerTotal"),
      render: (line) => money(line.ledgerMinor),
    },
    {
      key: "difference",
      header: t("screen.organization.accounting.tripAccounting.difference"),
      render: (line) => money(difference(line)),
    },
  ];

  const tripOptions = trips.map((item) => ({
    value: item.id,
    label: tripTitle(item, locale) || item.id,
  }));
  const failed = tripsQuery.isError || bookingsQuery.isError || ledgerQuery.isError;
  const retry = () => {
    void tripsQuery.refetch();
    void bookingsQuery.refetch();
    void ledgerQuery.refetch();
  };

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.accounting.tripAccounting.title")}
        caption={t("screen.organization.accounting.tripAccounting.caption", {
          trip: trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE,
        })}
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <OrgSelect
              label={t("screen.organization.accounting.tripAccounting.trip")}
              fieldClassName="w-full sm:w-auto sm:min-w-[300px]"
              options={
                tripOptions.length > 0
                  ? tripOptions
                  : [
                      {
                        value: "",
                        label: t("screen.organization.accounting.tripAccounting.noTrips"),
                      },
                    ]
              }
              value={trip?.id ?? ""}
              disabled={tripOptions.length === 0}
              onValueChange={(value) => {
                setChosenTripId(value);
                setSelectedTripId(value);
              }}
            />
            <OrgButtonLink slug="ledger-and-exports" variant="secondary">
              {t("screen.organization.accounting.tripAccounting.openLedger")}
            </OrgButtonLink>
          </div>
        }
      />
      <OrgKpiRow>
        {lines.map((line) => (
          <OrgKpi key={line.id} size="sm" label={line.label} value={tileValue(line)} />
        ))}
      </OrgKpiRow>
      <OrgCard
        title={t("screen.organization.accounting.tripAccounting.reconciliationWithTheLedger")}
        actions={
          tripLoaded && ledgerLoaded ? (
            reconciled ? (
              <OrgBadge tone="ok">
                {t("screen.organization.accounting.tripAccounting.reconciled")}
              </OrgBadge>
            ) : (
              <OrgBadge tone="warn">
                {t("screen.organization.accounting.tripAccounting.differencesFound")}
              </OrgBadge>
            )
          ) : null
        }
      >
        {failed ? (
          <OrgError onRetry={retry} />
        ) : (
          <OrgTable
            columns={columns}
            rows={lines}
            rowKey={(line) => line.id}
            caption={t("screen.organization.accounting.tripAccounting.reconciliationWithTheLedger")}
            loading={tripsQuery.isLoading || bookingsQuery.isLoading || ledgerQuery.isLoading}
          />
        )}
      </OrgCard>
      <OrgAlert
        tone="info"
        title={t("screen.organization.accounting.tripAccounting.growthShowsAdvancedAccounting")}
      >
        {t("screen.organization.accounting.tripAccounting.enterpriseShowsTheFullDetail")}
      </OrgAlert>
    </OrgPage>
  );
}
