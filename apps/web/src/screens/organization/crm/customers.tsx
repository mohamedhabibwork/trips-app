// SCR-ORG-50 Customers: travelers and corporate accounts who booked with the organization
// (docs/design/web/OrgCustomers.dc.html). The customers are derived from the bookings list, so
// trips, lifetime spend and the last trip are real; city, plan and marketing consent are not
// recorded on bookings and show as unknown instead of being invented.
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgChips, OrgInput } from "../common/org-form";
import { OrgLink } from "../common/org-link";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import { downloadCsv, formatDate, formatMinor, sumByCurrency } from "../accounting/finance-format";
import { CrmTabs, CRM_PAID_STATES, deriveCustomers, toCrmBookings } from "./crm-parts";

const K = "screen.organization.crm.customers";

type CustomerTypeFilter = "all" | "traveler" | "family";

export function Customers(): ReactNode {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CustomerTypeFilter>("all");

  const bookingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.booking.listOrganizationBookings,
      "booking/listOrganizationBookings",
      { input: {} },
    ),
    enabled,
  });

  const allCustomers = useMemo(
    () => deriveCustomers(toCrmBookings(bookingsQuery.data)),
    [bookingsQuery.data],
  );
  const loaded = bookingsQuery.isSuccess;

  const needle = search.trim().toLowerCase();
  const visible = allCustomers.filter((customer) => {
    if (typeFilter !== "all" && customer.type !== typeFilter) return false;
    if (!needle) return true;
    return customer.name.toLowerCase().includes(needle);
  });

  const paidCustomers = allCustomers.filter((customer) =>
    customer.bookings.some((booking) => CRM_PAID_STATES.includes(booking.status)),
  );
  const spendTotals = sumByCurrency(
    paidCustomers.map((customer) => ({
      minor: customer.lifetimeMinor,
      currency: customer.lifetimeCurrency,
    })),
  );
  const topSpend = [...spendTotals.values()][0] ?? 0;

  const exportCsv = () =>
    downloadCsv("customers.csv", [
      [
        t(`${K}.colCustomer`),
        t(`${K}.colType`),
        t(`${K}.colTrips`),
        t(`${K}.colLifetimeSpend`),
        t(`${K}.colLastTrip`),
      ],
      ...visible.map((customer) => [
        customer.name,
        customer.type === "family" ? t(`${K}.type.family`) : t(`${K}.type.traveler`),
        String(customer.tripCount),
        formatMinor(customer.lifetimeMinor, customer.lifetimeCurrency, locale),
        customer.lastTripAt ? formatDate(customer.lastTripAt, locale) : NO_VALUE,
      ]),
    ]);

  const columns: readonly OrgColumn<(typeof visible)[number]>[] = [
    {
      key: "name",
      header: t(`${K}.colCustomer`),
      render: (row) => (
        <OrgLink slug="crm-customer" params={{ customerId: row.id }} className="font-semibold">
          {row.name}
        </OrgLink>
      ),
    },
    {
      key: "type",
      header: t(`${K}.colType`),
      render: (row) => (row.type === "family" ? t(`${K}.type.family`) : t(`${K}.type.traveler`)),
    },
    {
      key: "city",
      header: t(`${K}.colCity`),
      render: () => <span className="text-[var(--te-ink-muted)]">{t(`${K}.notRecorded`)}</span>,
    },
    {
      key: "tripCount",
      header: t(`${K}.colTrips`),
      align: "end",
      render: (row) => row.tripCount,
    },
    {
      key: "lifetime",
      header: t(`${K}.colLifetimeSpend`),
      align: "end",
      className: "whitespace-nowrap",
      render: (row) => formatMinor(row.lifetimeMinor, row.lifetimeCurrency, locale),
    },
    {
      key: "lastTrip",
      header: t(`${K}.colLastTrip`),
      className: "whitespace-nowrap",
      render: (row) => (row.lastTripAt ? formatDate(row.lastTripAt, locale) : NO_VALUE),
    },
    {
      key: "plan",
      header: t(`${K}.colPlan`),
      render: () => <span className="text-[var(--te-ink-muted)]">{t(`${K}.notRecorded`)}</span>,
    },
    {
      key: "consent",
      header: t(`${K}.colConsent`),
      render: () => <span className="text-[var(--te-ink-muted)]">{t(`${K}.notRecorded`)}</span>,
    },
  ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <div className="flex flex-wrap gap-3">
            <OrgButton
              variant="secondary"
              disabled={!loaded || visible.length === 0}
              onClick={exportCsv}
            >
              {t(`${K}.export`)}
            </OrgButton>
          </div>
        }
      />
      <CrmTabs activeSlug="crm-customers" />
      <OrgKpiRow>
        <OrgKpi
          label={t(`${K}.kpiCustomers`)}
          value={loaded ? allCustomers.length : NO_VALUE}
          hint={t(`${K}.derivedFromBookings`)}
        />
        <OrgKpi
          label={t(`${K}.kpiTopSpend`)}
          value={
            loaded && topSpend > 0
              ? formatMinor(topSpend, [...spendTotals.keys()][0] ?? "EGP", locale)
              : loaded
                ? formatMinor(0, "EGP", locale)
                : NO_VALUE
          }
          hint={t(`${K}.kpiPaidOnly`)}
        />
      </OrgKpiRow>
      <OrgCard title={t(`${K}.listTitle`)}>
        <div className="flex flex-col gap-4">
          <OrgInput
            label={t(`${K}.searchLabel`)}
            type="search"
            placeholder={t(`${K}.searchPlaceholder`)}
            value={search}
            onChange={(change) => setSearch(change.target.value)}
            fieldClassName="max-w-[420px]"
          />
          <OrgChips
            label={t(`${K}.filterByType`)}
            options={[
              { value: "all", label: t(`${K}.typeAll`) },
              { value: "traveler", label: t(`${K}.type.traveler`) },
              { value: "family", label: t(`${K}.type.family`) },
            ]}
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as CustomerTypeFilter)}
          />
        </div>
        {bookingsQuery.isError ? (
          <OrgError onRetry={() => void bookingsQuery.refetch()} />
        ) : (
          <OrgTable
            columns={columns}
            rows={visible}
            rowKey={(row) => row.id}
            caption={t(`${K}.listTitle`)}
            loading={bookingsQuery.isLoading}
            empty={
              allCustomers.length === 0 ? (
                <OrgEmpty title={t(`${K}.noCustomersTitle`)}>{t(`${K}.noCustomersBody`)}</OrgEmpty>
              ) : (
                <OrgEmpty title={t(`${K}.noMatchTitle`)}>{t(`${K}.noMatchBody`)}</OrgEmpty>
              )
            }
          />
        )}
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.columnsNote`)}</p>
      </OrgCard>
    </OrgPage>
  );
}
