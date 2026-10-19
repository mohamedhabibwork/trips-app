// SCR-ORG-38 Issue invoice: a business (B2B) or consumer (B2C) invoice for a trip's bookings.
import { useId, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgChoice, OrgInput, OrgTextarea } from "../common/org-form";
import { useOrgNavigate } from "../common/org-link";
import { getSelectedTripId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  formatMinor,
  formatMinorNumber,
  rowsOf,
  type BookingView,
} from "../accounting/finance-format";
import { TotalRow } from "./billing-parts";

const INVOICE_CURRENCIES = ["EGP", "SAR", "AED"] as const;
type InvoiceCurrency = (typeof INVOICE_CURRENCIES)[number];
/** The smallest amount a settlement accepts (accounting.createPayoutSettlement). */
const MIN_INVOICE_MINOR = 100;
const INVOICE_NUMBER_DIGITS = 6;

type InvoiceType = "b2b" | "b2c";

interface InvoiceLine {
  id: string;
  label: string;
  quantity: number;
  unitMinor: number;
  totalMinor: number;
}

function invoiceLines(bookings: readonly BookingView[]): readonly InvoiceLine[] {
  return bookings.flatMap((booking) => {
    const quantity = Math.max(1, booking.passengersCount);
    const lines: InvoiceLine[] = [
      {
        id: `${booking.id}-trip`,
        label: booking.bookingReference,
        quantity,
        unitMinor: Math.round(booking.subtotalMinor / quantity),
        totalMinor: booking.subtotalMinor,
      },
    ];
    if (booking.programsTotalMinor > 0) {
      lines.push({
        id: `${booking.id}-programs`,
        label: t("screen.organization.billing.issueInvoiceB2bOrB2c.programsOf", {
          reference: booking.bookingReference,
        }),
        quantity: 1,
        unitMinor: booking.programsTotalMinor,
        totalMinor: booking.programsTotalMinor,
      });
    }
    return lines;
  });
}

export function IssueInvoiceB2bOrB2c() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const blockedId = useId();
  const [invoiceType, setInvoiceType] = useState<InvoiceType>("b2b");
  const [buyerName, setBuyerName] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({ input: {}, enabled }),
  );
  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({ input: {}, enabled }),
  );

  const createPayoutSettlementMutation = useMutation(
    orpc.accounting.createPayoutSettlement.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.accounting.key() });
      },
    }),
  );

  const trips = tripsQuery.data?.items ?? [];
  const selectedId = getSelectedTripId();
  const trip = trips.find((item) => item.id === selectedId) ?? trips[0];
  const allBookings = rowsOf<BookingView>(bookingsQuery.data);
  const tripBookings = trip ? allBookings.filter((booking) => booking.tripId === trip.id) : [];
  const bookings = tripBookings.length > 0 ? tripBookings : allBookings;
  const currency = bookings[0]?.currencyCode;
  const lines = invoiceLines(bookings.filter((booking) => booking.currencyCode === currency));
  const subtotalMinor = lines.reduce((sum, line) => sum + line.totalMinor, 0);
  const money = (minor: number) => (currency ? formatMinor(minor, currency, locale) : NO_VALUE);

  const invoiceCurrency = INVOICE_CURRENCIES.find((code) => code === currency) as
    | InvoiceCurrency
    | undefined;
  const missingBuyer = buyerName.trim().length === 0;
  const missingTax = invoiceType === "b2b" && taxNumber.trim().length === 0;
  const tooSmall = subtotalMinor < MIN_INVOICE_MINOR || !invoiceCurrency;
  const blockedReason = missingBuyer
    ? t("screen.organization.billing.issueInvoiceB2bOrB2c.addTheBuyerName")
    : missingTax
      ? t("screen.organization.billing.issueInvoiceB2bOrB2c.addTheBuyerTaxNumber")
      : tooSmall
        ? t("screen.organization.billing.issueInvoiceB2bOrB2c.addLinesFromABooking")
        : null;
  const canIssue = enabled && !blockedReason && !createPayoutSettlementMutation.isPending;

  const handleIssue = async () => {
    if (!canIssue || !invoiceCurrency) return;
    const tax = invoiceType === "b2b" ? ` (${taxNumber.trim()})` : "";
    try {
      await createPayoutSettlementMutation.mutateAsync({
        amountMinor: subtotalMinor,
        currencyCode: invoiceCurrency,
        invoiceNumber: `INV-${Date.now().toString().slice(-INVOICE_NUMBER_DIGITS)}`,
        description: `${invoiceType.toUpperCase()}: ${buyerName.trim()}${tax}`,
      });
      void goTo("invoices-list");
    } catch {
      // The mutation's error state shows the failure below; the form keeps what was typed.
    }
  };

  const columns: readonly OrgColumn<InvoiceLine>[] = [
    { key: "label", header: t("screen.organization.billing.issueInvoiceB2bOrB2c.line") },
    { key: "quantity", header: t("screen.organization.billing.issueInvoiceB2bOrB2c.qty") },
    {
      key: "unit",
      header: t("screen.organization.billing.issueInvoiceB2bOrB2c.unitPrice"),
      render: (line) => formatMinorNumber(line.unitMinor, locale),
    },
    {
      key: "tax",
      header: t("screen.organization.billing.issueInvoiceB2bOrB2c.tax"),
      render: () => NO_VALUE,
    },
    {
      key: "total",
      header: t("screen.organization.billing.issueInvoiceB2bOrB2c.total"),
      render: (line) => formatMinorNumber(line.totalMinor, locale),
    },
  ];

  const typeLabel = t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceType");
  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.billing.issueInvoiceB2bOrB2c.title")}
        caption={t("screen.organization.billing.issueInvoiceB2bOrB2c.caption", {
          trip: trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE,
        })}
        actions={
          <OrgButton
            disabled={!canIssue}
            aria-describedby={blockedReason ? blockedId : undefined}
            onClick={() => void handleIssue()}
          >
            {t("screen.organization.billing.issueInvoiceB2bOrB2c.issueInvoice")}
          </OrgButton>
        }
      />
      {blockedReason ? (
        <p id={blockedId} className="te-caption m-0 text-[var(--te-ink-muted)]">
          {blockedReason}
        </p>
      ) : null}
      {createPayoutSettlementMutation.isError ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.billing.issueInvoiceB2bOrB2c.issueFailed")}
        >
          {t("screen.organization.billing.issueInvoiceB2bOrB2c.issueFailedBody")}
        </OrgAlert>
      ) : null}
      <OrgRow align="start">
        <OrgCard
          className="flex-1"
          title={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyer")}
        >
          <fieldset className="m-0 flex flex-wrap gap-x-6 border-0 p-0">
            <legend className="mb-2 p-0 text-sm leading-5 font-semibold">{typeLabel}</legend>
            <OrgChoice
              type="radio"
              name="invoice-type"
              checked={invoiceType === "b2b"}
              onChange={() => setInvoiceType("b2b")}
            >
              {t("screen.organization.billing.issueInvoiceB2bOrB2c.businessB2b")}
            </OrgChoice>
            <OrgChoice
              type="radio"
              name="invoice-type"
              checked={invoiceType === "b2c"}
              onChange={() => setInvoiceType("b2c")}
            >
              {t("screen.organization.billing.issueInvoiceB2bOrB2c.consumerB2c")}
            </OrgChoice>
          </fieldset>
          <OrgInput
            label={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyerName")}
            dir="auto"
            value={buyerName}
            onChange={(event) => setBuyerName(event.target.value)}
          />
          <OrgInput
            label={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyerTaxNumber")}
            hint={t("screen.organization.billing.issueInvoiceB2bOrB2c.requiredForBusinessBuyers")}
            required={invoiceType === "b2b"}
            value={taxNumber}
            onChange={(event) => setTaxNumber(event.target.value)}
          />
          <OrgTextarea
            label={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyerAddress")}
            rows={2}
            dir="auto"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <OrgInput
            label={t("screen.organization.billing.issueInvoiceB2bOrB2c.buyerEmail")}
            type="email"
            dir="ltr"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </OrgCard>
        <OrgCard
          className="lg:flex-[1.5]"
          title={t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines")}
        >
          {bookingsQuery.isError ? (
            <OrgError onRetry={() => void bookingsQuery.refetch()} />
          ) : (
            <OrgTable
              columns={columns}
              rows={lines}
              rowKey={(line) => line.id}
              caption={t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceLines")}
              loading={bookingsQuery.isLoading}
              empty={t("screen.organization.billing.issueInvoiceB2bOrB2c.noLines")}
            />
          )}
          <div className="flex w-full flex-col gap-2 self-end sm:w-auto sm:min-w-[280px]">
            <TotalRow
              label={t("screen.organization.billing.issueInvoiceB2bOrB2c.subtotal")}
              value={money(subtotalMinor)}
            />
            <TotalRow
              label={t("screen.organization.billing.issueInvoiceB2bOrB2c.tax")}
              value={NO_VALUE}
            />
            <TotalRow
              strong
              label={t("screen.organization.billing.issueInvoiceB2bOrB2c.total")}
              value={money(subtotalMinor)}
            />
          </div>
          <div className="flex max-w-[320px] flex-col gap-1">
            <span className="text-sm leading-5 font-semibold">
              {t("screen.organization.billing.issueInvoiceB2bOrB2c.invoiceNumber")}
            </span>
            <span className="te-caption text-[var(--te-ink-muted)]">
              {t("screen.organization.billing.issueInvoiceB2bOrB2c.assignedWhenIssued")}
            </span>
          </div>
        </OrgCard>
      </OrgRow>
      <OrgAlert
        tone="info"
        title={t("screen.organization.billing.issueInvoiceB2bOrB2c.saudiEInvoicingScope")}
      >
        {t("screen.organization.billing.issueInvoiceB2bOrB2c.issuingInSaudiArabiaWaits")}
      </OrgAlert>
    </OrgPage>
  );
}
