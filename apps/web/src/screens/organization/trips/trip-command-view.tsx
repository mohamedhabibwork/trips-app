import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import {
  OrgSection,
  StateBadge,
  TRIP_STATES,
  TripStateBadge,
  getActiveWizardTripId,
  setActiveWizardTripId,
  toTripState,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface VehicleGapRow {
  id: string;
  vehicle: string;
  driver: string;
  moderator: string;
  openDeal: string;
}

interface SectionLink {
  slug: OrgSlug;
  label: string;
}

const GAP_COLUMNS = (): readonly TeDataTableColumn<VehicleGapRow>[] => [
  { key: "vehicle", header: t("screen.organization.trips.tripCommandView.vehicle") },
  {
    key: "driver",
    header: t("screen.organization.trips.tripCommandView.driver"),
    render: (row) =>
      row.driver === "Missing" ? (
        <StateBadge
          tone="danger"
          icon="alert"
          label={t("screen.organization.trips.tripCommandView.missing")}
        />
      ) : (
        <StateBadge
          tone="success"
          icon="check"
          label={t("screen.organization.trips.tripCommandView.assigned")}
        />
      ),
  },
  {
    key: "moderator",
    header: t("screen.organization.trips.tripCommandView.moderator"),
    render: (row) =>
      row.moderator === "Missing" ? (
        <StateBadge
          tone="danger"
          icon="alert"
          label={t("screen.organization.trips.tripCommandView.missingLabel")}
        />
      ) : (
        <StateBadge
          tone="success"
          icon="check"
          label={t("screen.organization.trips.tripCommandView.assignedLabel")}
        />
      ),
  },
  { key: "openDeal", header: t("screen.organization.trips.tripCommandView.openDeal") },
];

const SECTION_LINKS = (): readonly SectionLink[] => [
  { slug: "staffing-board", label: t("screen.organization.trips.tripCommandView.staffing") },
  {
    slug: "seat-map-and-seat-assignment",
    label: t("screen.organization.trips.tripCommandView.seatMap"),
  },
  {
    slug: "bookings-and-travelers",
    label: t("screen.organization.trips.tripCommandView.bookings"),
  },
  { slug: "program-editor", label: t("screen.organization.trips.tripCommandView.programs") },
  {
    slug: "program-enrollment-report",
    label: t("screen.organization.trips.tripCommandView.enrollmentReport"),
  },
  { slug: "live-operations", label: t("screen.organization.trips.tripCommandView.liveOperations") },
  { slug: "trip-accounting", label: t("screen.organization.trips.tripCommandView.accounting") },
  { slug: "trip-report-review", label: t("screen.organization.trips.tripCommandView.tripReports") },
];

export function TripCommandView() {
  const { status: authStatus } = useAuth();
  const [tripId, setTripId] = useState<string | null>(getActiveWizardTripId());
  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated" && !tripId,
  });

  const effectiveTripId = tripId || tripsQuery.data?.items[0]?.id || null;

  useEffect(() => {
    if (!tripId && tripsQuery.data?.items[0]?.id) {
      setActiveWizardTripId(tripsQuery.data.items[0].id);
      setTripId(tripsQuery.data.items[0].id);
    }
  }, [tripId, tripsQuery.data]);

  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
  });

  const detail = tripQuery.data;
  const tripName = detail ? detail.titleEn || detail.titleAr : "";
  const currentState = detail ? toTripState(detail.state) : "Published";
  const seatsSold = detail ? String(detail.confirmedSeatsCount) : "0";
  const seatsHeld = detail ? String(detail.heldSeatsCount) : "0";
  const occupancy = detail
    ? `${detail.totalCapacity > 0 ? Math.round((detail.confirmedSeatsCount / detail.totalCapacity) * 100) : 0}%`
    : "0%";
  const gapRows: readonly VehicleGapRow[] = detail
    ? detail.vehicles.map((v) => ({
        id: v.id,
        vehicle: v.plateNumber ?? v.vehicleId,
        driver: v.driverAccountId || v.driverSource === "org_staff" ? "Assigned" : "Missing",
        moderator:
          v.moderatorAccountId || v.moderatorSource === "org_staff" ? "Assigned" : "Missing",
        openDeal:
          v.driverSource === "platform_supplier" || v.photographerSource === "platform_supplier"
            ? "Open"
            : "None",
      }))
    : [];

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.trips.tripCommandView.tripCommandView")}
          description={tripName}
          actions={
            <OrgButtonLink slug="cancel-trip-decision" variant="ghost">
              {t("screen.organization.trips.tripCommandView.cancelTrip")}
            </OrgButtonLink>
          }
        />
        <OrgSection title={t("screen.organization.trips.tripCommandView.lifecycle")}>
          <ol className="flex flex-wrap gap-2">
            {TRIP_STATES.map((state) => (
              <li key={state} aria-current={state === currentState ? "step" : undefined}>
                <TripStateBadge state={state} />
              </li>
            ))}
          </ol>
        </OrgSection>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <TeKpiTile
            label={t("screen.organization.trips.tripCommandView.seatsSold")}
            value={seatsSold}
          />
          <TeKpiTile
            label={t("screen.organization.trips.tripCommandView.seatsHeld")}
            value={seatsHeld}
          />
          <TeKpiTile
            label={t("screen.organization.trips.tripCommandView.seatsReserved")}
            value="0"
          />
          <TeKpiTile
            label={t("screen.organization.trips.tripCommandView.occupancy")}
            value={occupancy}
          />
        </div>
        <OrgSection title={t("screen.organization.trips.tripCommandView.readyGaps")}>
          <TeDataTable
            columns={GAP_COLUMNS()}
            rows={gapRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.trips.tripCommandView.readyGapsPerVehicle")}
            emptyTitle={t("screen.organization.trips.tripCommandView.noGaps")}
            emptyDescription={t("screen.organization.trips.tripCommandView.everyVehicleHasADriver")}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.trips.tripCommandView.goTo")}>
          <ul className="flex flex-wrap gap-2">
            {SECTION_LINKS().map((link) => (
              <li key={link.slug}>
                <OrgButtonLink slug={link.slug} variant="secondary">
                  {link.label}
                </OrgButtonLink>
              </li>
            ))}
          </ul>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
