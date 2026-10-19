// SCR-ORG-26 Program enrollment: who selected each program, the quantities and the revenue.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSelect } from "../common/org-form";
import { useOrgParams } from "../common/org-link";
import { getActiveWizardTripId, tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgButton,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";
import { money, toBookingRecords } from "./booking-parts";

const TOTAL_ROW_ID = "__total__";

interface EnrollmentRow {
  id: string;
  reference: string;
  quantity: number;
  revenueMinor: number;
  currency: string;
}

function columns(): readonly OrgColumn<EnrollmentRow>[] {
  return [
    {
      key: "reference",
      header: t("screen.organization.bookings.programEnrollmentReport.bookingReference"),
      render: (row) => <b>{row.reference}</b>,
    },
    {
      key: "quantity",
      header: t("screen.organization.bookings.programEnrollmentReport.quantity"),
      render: (row) => (row.id === TOTAL_ROW_ID ? <b>{row.quantity}</b> : String(row.quantity)),
    },
    {
      key: "revenue",
      header: t("screen.organization.bookings.programEnrollmentReport.revenue"),
      render: (row) => {
        const value = money(row.revenueMinor, row.currency);
        return row.id === TOTAL_ROW_ID ? <b>{value}</b> : value;
      },
    },
  ];
}

/** CSV of the table, with the same rows and totals, saved by the browser. */
function exportCsv(rows: readonly EnrollmentRow[], fileName: string) {
  const header = [
    t("screen.organization.bookings.programEnrollmentReport.bookingReference"),
    t("screen.organization.bookings.programEnrollmentReport.quantity"),
    t("screen.organization.bookings.programEnrollmentReport.revenue"),
  ];
  const lines = [
    header,
    ...rows.map((row) => [
      row.reference,
      String(row.quantity),
      money(row.revenueMinor, row.currency),
    ]),
  ];
  const csv = lines
    .map((line) => line.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export function ProgramEnrollmentReport() {
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const { tripId: routeTripId } = useOrgParams();
  const [programChoice, setProgramChoice] = useState<string | null>(null);

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled,
  });
  const trips = tripsQuery.data?.items ?? [];
  const tripId = routeTripId ?? getActiveWizardTripId() ?? trips[0]?.id ?? null;
  const trip = trips.find((item) => item.id === tripId);

  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: enabled && Boolean(tripId),
  });
  const bookingsQuery = useQuery({
    ...orpc.booking.listOrganizationBookings.queryOptions({
      input: { tripId: tripId ?? undefined },
    }),
    enabled: enabled && Boolean(tripId),
  });

  const programs = programsQuery.data?.items ?? [];
  const program = programs.find((item) => item.id === programChoice) ?? programs[0];
  const currency = program?.currencyCode ?? "";
  const rows: readonly EnrollmentRow[] = program
    ? toBookingRecords(bookingsQuery.data)
        .filter((booking) => booking.selectedProgramIds.includes(program.id))
        .map((booking) => ({
          id: booking.id,
          reference: booking.bookingReference,
          quantity: booking.passengersCount,
          revenueMinor: program.priceMinor * booking.passengersCount,
          currency,
        }))
    : [];
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const totalMinor = rows.reduce((sum, row) => sum + row.revenueMinor, 0);
  const totalRow: EnrollmentRow = {
    id: TOTAL_ROW_ID,
    reference: t("screen.organization.bookings.programEnrollmentReport.total"),
    quantity: totalQuantity,
    revenueMinor: totalMinor,
    currency,
  };
  const loaded = bookingsQuery.isSuccess && programsQuery.isSuccess;

  const programOptions =
    programs.length > 0
      ? programs.map((item) => ({ value: item.id, label: tripTitle(item, locale) || NO_VALUE }))
      : [
          {
            value: "",
            label: t("screen.organization.bookings.programEnrollmentReport.noPrograms"),
          },
        ];

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.bookings.programEnrollmentReport.title")}
        caption={t("screen.organization.bookings.programEnrollmentReport.caption", {
          trip: trip ? tripTitle(trip, locale) || NO_VALUE : NO_VALUE,
        })}
        actions={
          <div className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
            <OrgSelect
              label={t("screen.organization.bookings.programEnrollmentReport.program")}
              options={programOptions}
              value={program?.id ?? ""}
              onValueChange={setProgramChoice}
              disabled={programs.length === 0}
              fieldClassName="w-full sm:min-w-[260px]"
            />
            <OrgButton
              variant="secondary"
              disabled={rows.length === 0}
              onClick={() => exportCsv([...rows, totalRow], "program-enrollment.csv")}
            >
              {t("screen.organization.bookings.programEnrollmentReport.export")}
            </OrgButton>
          </div>
        }
      />
      <OrgKpiRow>
        <OrgKpi
          label={t("screen.organization.bookings.programEnrollmentReport.travelersEnrolled")}
          value={loaded ? String(totalQuantity) : NO_VALUE}
        />
        <OrgKpi
          label={t("screen.organization.bookings.programEnrollmentReport.totalQuantity")}
          value={loaded ? String(totalQuantity) : NO_VALUE}
        />
        <OrgKpi
          label={t("screen.organization.bookings.programEnrollmentReport.programRevenue")}
          value={loaded && program ? money(totalMinor, currency) : NO_VALUE}
        />
      </OrgKpiRow>
      {bookingsQuery.isError || programsQuery.isError ? (
        <OrgError
          onRetry={() => {
            void bookingsQuery.refetch();
            void programsQuery.refetch();
          }}
        />
      ) : null}
      <OrgTable
        columns={columns()}
        rows={rows.length > 0 ? [...rows, totalRow] : []}
        rowKey={(row) => row.id}
        caption={t("screen.organization.bookings.programEnrollmentReport.title")}
        loading={bookingsQuery.isLoading || programsQuery.isLoading}
        rowClassName={(row) => (row.id === TOTAL_ROW_ID ? "bg-[var(--te-surface)]" : undefined)}
        empty={
          <OrgEmpty title={t("screen.organization.bookings.programEnrollmentReport.emptyTitle")}>
            {t("screen.organization.bookings.programEnrollmentReport.emptyBody")}
          </OrgEmpty>
        }
      />
      <p className="te-caption m-0 text-[var(--te-ink-muted)]">
        {t("screen.organization.bookings.programEnrollmentReport.planNote")}
      </p>
    </OrgPage>
  );
}
