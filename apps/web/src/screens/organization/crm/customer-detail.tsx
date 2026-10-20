// SCR-ORG-51 Customer 360: one traveler's bookings, spend, coupons and programs
// (docs/design/web/OrgCustomer.dc.html). The customer is derived from the bookings list by the
// traveler account in the URL; tags, consent, notes and messaging have no procedure yet and say so.
import { useState, type FormEvent, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgButtonLink, OrgLink, useOrgParams } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
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
import { formatDateTime, formatMinor, shortRef } from "../accounting/finance-format";
import { CrmBookingStatusBadge, CrmTabs, deriveCustomers, toCrmBookings } from "./crm-parts";

const K = "screen.organization.crm.customerDetail";

interface TimelineRow {
  id: string;
  bookingReference: string;
  createdAt: string | Date;
  amountMinor: number;
  currency: string;
  status: string;
}

export function CustomerDetail(): ReactNode {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const customerId = useOrgParams().customerId ?? "";
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const bookingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.booking.listOrganizationBookings,
      "booking/listOrganizationBookings",
      { input: {} },
    ),
    enabled,
  });

  const customers = deriveCustomers(toCrmBookings(bookingsQuery.data));
  const customer = customers.find((entry) => entry.id === customerId);
  const paidBookings = (customer?.bookings ?? []).filter(
    (booking) => booking.status !== "cancelled",
  );

  const timeline: readonly TimelineRow[] = (customer?.bookings ?? []).map((booking) => ({
    id: booking.id,
    bookingReference: booking.bookingReference,
    createdAt: booking.createdAt,
    amountMinor: booking.totalAmountMinor,
    currency: booking.currencyCode,
    status: booking.status,
  }));

  const columns: readonly OrgColumn<TimelineRow>[] = [
    {
      key: "booking",
      header: t(`${K}.colBooking`),
      render: (row) => (
        <OrgLink slug="bookings-and-travelers" params={{ bookingId: row.id }}>
          {row.bookingReference || shortRef(row.id)}
        </OrgLink>
      ),
    },
    {
      key: "createdAt",
      header: t(`${K}.colDate`),
      className: "whitespace-nowrap",
      render: (row) => formatDateTime(row.createdAt, locale),
    },
    {
      key: "amount",
      header: t(`${K}.colAmount`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinor(row.amountMinor, row.currency, locale),
    },
    {
      key: "status",
      header: t(`${K}.colStatus`),
      render: (row) => <CrmBookingStatusBadge status={row.status} />,
    },
  ];

  // Notes have no procedure yet; the note stays on screen and the alert says so.
  function saveNote(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (note.trim().length === 0) return;
    setNoteSaved(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={customer?.name ?? t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        badge={
          customer ? (
            <OrgBadge tone="info">
              {customer.type === "family" ? t(`${K}.type.family`) : t(`${K}.type.traveler`)}
            </OrgBadge>
          ) : undefined
        }
        actions={
          <OrgButtonLink slug="crm-customers" variant="secondary">
            {t(`${K}.backToCustomers`)}
          </OrgButtonLink>
        }
      />
      <CrmTabs activeSlug="crm-customers" />
      {bookingsQuery.isError ? (
        <OrgError onRetry={() => void bookingsQuery.refetch()} />
      ) : bookingsQuery.isLoading ? (
        <OrgLoading rows={4} />
      ) : !customer ? (
        <OrgCard title={t(`${K}.notFoundTitle`)}>
          <OrgEmpty title={t(`${K}.notFoundTitle`)}>{t(`${K}.notFoundBody`)}</OrgEmpty>
        </OrgCard>
      ) : (
        <>
          <OrgKpiRow>
            <OrgKpi label={t(`${K}.kpiTrips`)} value={customer.bookings.length} />
            <OrgKpi
              label={t(`${K}.kpiLifetimeSpend`)}
              value={formatMinor(customer.lifetimeMinor, customer.lifetimeCurrency, locale)}
              hint={t(`${K}.kpiPaidOnly`)}
            />
            <OrgKpi
              label={t(`${K}.kpiLastBooking`)}
              value={customer.lastTripAt ? formatDateTime(customer.lastTripAt, locale) : NO_VALUE}
            />
          </OrgKpiRow>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.couponsTitle`)} className="lg:flex-1">
              {customer.coupons.length > 0 ? (
                <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                  {customer.coupons.map((code) => (
                    <li key={code}>
                      <OrgBadge tone="acc" icon={false}>
                        {code}
                      </OrgBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <OrgEmpty title={t(`${K}.noCoupons`)}>{t(`${K}.noCouponsBody`)}</OrgEmpty>
              )}
            </OrgCard>
            <OrgCard title={t(`${K}.programsTitle`)} className="lg:flex-1">
              <p className="m-0 text-sm leading-5">
                {t(`${K}.nProgramsBought`, {
                  n: paidBookings.reduce(
                    (sum, booking) => sum + (booking.selectedProgramIds?.length ?? 0),
                    0,
                  ),
                })}
              </p>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.programsNote`)}</p>
            </OrgCard>
          </OrgRow>
          <OrgCard title={t(`${K}.timelineTitle`)}>
            <OrgTable
              columns={columns}
              rows={timeline}
              rowKey={(row) => row.id}
              caption={t(`${K}.timelineTitle`)}
              empty={<OrgEmpty title={t(`${K}.noBookings`)}>{t(`${K}.noBookingsBody`)}</OrgEmpty>}
            />
          </OrgCard>
          <OrgRow align="start">
            <OrgCard title={t(`${K}.notesTitle`)} className="lg:flex-[2]">
              <form onSubmit={saveNote} className="flex flex-col gap-3" noValidate>
                <label className="flex flex-col gap-1 text-sm leading-5">
                  <span className="font-semibold">{t(`${K}.noteLabel`)}</span>
                  <textarea
                    rows={3}
                    value={note}
                    onChange={(change) => setNote(change.target.value)}
                    placeholder={t(`${K}.notePlaceholder`)}
                    className="min-h-11 w-full rounded-lg border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3 py-2 text-base leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-ink)]"
                  />
                </label>
                <div>
                  <OrgButton type="submit" disabled={note.trim().length === 0}>
                    {t(`${K}.saveNote`)}
                  </OrgButton>
                </div>
                {noteSaved ? (
                  <OrgAlert tone="info" title={t(`${K}.notesNotSavedTitle`)}>
                    {t(`${K}.notesNotSavedBody`)}
                  </OrgAlert>
                ) : null}
              </form>
            </OrgCard>
            <OrgCard title={t(`${K}.unknownTitle`)} className="lg:flex-1">
              <ul className="m-0 flex list-none flex-col gap-2 p-0 text-sm leading-5">
                <li>{t(`${K}.unknownConsent`)}</li>
                <li>{t(`${K}.unknownPlan`)}</li>
                <li>{t(`${K}.unknownContact`)}</li>
              </ul>
              <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.unknownNote`)}</p>
            </OrgCard>
          </OrgRow>
        </>
      )}
    </OrgPage>
  );
}
