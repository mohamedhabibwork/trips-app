import { useEffect, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { getActiveWizardTripId, OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface EnrollmentRow {
  id: string;
  reference: string;
  quantity: string;
  revenue: string;
}

const COLUMNS = (): readonly TeDataTableColumn<EnrollmentRow>[] => [
  { key: "reference", header: t("screen.organization.bookings.programEnrollmentReport.booking") },
  {
    key: "quantity",
    header: t("screen.organization.bookings.programEnrollmentReport.quantity"),
    align: "end",
  },
  {
    key: "revenue",
    header: t("screen.organization.bookings.programEnrollmentReport.revenue"),
    align: "end",
  },
];

export function ProgramEnrollmentReport() {
  const { status: authStatus } = useAuth();
  const [programId, setProgramId] = useState("all");

  const wizardTripId = getActiveWizardTripId();
  const tripsQuery = useQuery(
    orpc.trips.listOrganizationTrips.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const effectiveTripId = wizardTripId ?? tripsQuery.data?.items[0]?.id ?? null;

  const programsQuery = useQuery(
    orpc.programs.listTripPrograms.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
      enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
    }),
  );

  const bookingsQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: { tripId: effectiveTripId ?? undefined },
      enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
    }),
  );

  const programOptions = useMemo<readonly TeSelectOption[]>(() => {
    if (!programsQuery.data?.items || programsQuery.data.items.length === 0) {
      return [
        {
          value: "all",
          label: t("screen.organization.bookings.programEnrollmentReport.programName"),
        },
      ];
    }
    return programsQuery.data.items.map((p) => ({
      value: p.id,
      label: p.titleEn || p.titleAr,
    }));
  }, [programsQuery.data?.items]);

  useEffect(() => {
    if (programId === "all" && programsQuery.data?.items?.[0]) {
      setProgramId(programsQuery.data.items[0].id);
    }
  }, [programId, programsQuery.data?.items]);

  const { rows, totalQty, totalRevenue } = useMemo(() => {
    const programs = programsQuery.data?.items ?? [];
    const bookings = bookingsQuery.data ?? [];
    const activeProgram = programs.find((p) => p.id === programId) ?? programs[0];
    const filteredBookings = activeProgram
      ? bookings.filter((b) => b.selectedProgramIds.includes(activeProgram.id))
      : bookings;

    let sumQty = 0;
    let sumMinor = 0;
    const currency = activeProgram?.currencyCode ?? bookings[0]?.currencyCode ?? "SAR";
    const mapped: EnrollmentRow[] = filteredBookings.map((b) => {
      const qty = b.passengersCount;
      const revMinor = activeProgram ? activeProgram.priceMinor * qty : b.programsTotalMinor;
      sumQty += qty;
      sumMinor += revMinor;
      return {
        id: b.id,
        reference: b.bookingReference,
        quantity: String(qty),
        revenue: `${(revMinor / 100).toFixed(2)} ${b.currencyCode}`,
      };
    });
    return {
      rows: mapped,
      totalQty: String(sumQty),
      totalRevenue: `${(sumMinor / 100).toFixed(2)} ${currency}`,
    };
  }, [programsQuery.data?.items, bookingsQuery.data, programId]);

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink
          parent={{
            slug: "analytics-and-reports",
            label: t("screen.organization.bookings.programEnrollmentReport.backToAnalytics"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.bookings.programEnrollmentReport.programEnrollmentReport")}
          actions={
            <TeButton variant="secondary">
              {t("screen.organization.bookings.programEnrollmentReport.export")}
            </TeButton>
          }
        />
        <TeSelect
          label={t("screen.organization.bookings.programEnrollmentReport.program")}
          options={programOptions}
          value={programId}
          onValueChange={setProgramId}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t("screen.organization.bookings.programEnrollmentReport.totalQuantity")}
            value={totalQty}
          />
          <TeKpiTile
            label={t("screen.organization.bookings.programEnrollmentReport.totalRevenue")}
            value={totalRevenue}
          />
        </div>
        <OrgSection title={t("screen.organization.bookings.programEnrollmentReport.enrollments")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.bookings.programEnrollmentReport.enrollmentsForTheSelectedProgram",
            )}
            emptyTitle={t("screen.organization.bookings.programEnrollmentReport.noEnrollmentsYet")}
            emptyDescription={t(
              "screen.organization.bookings.programEnrollmentReport.travelersWhoSelectThisProgram",
            )}
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
