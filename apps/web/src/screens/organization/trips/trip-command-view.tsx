// SCR-ORG-14 Trip command view: one trip's seats, state, Ready gaps and its other sections.
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgNavTabs } from "../common/org-form";
import { OrgButtonLink, useOrgParams } from "../common/org-link";
import { orgHref, type OrgSlug } from "../common/org-routes";
import {
  TripStateBadge,
  getSelectedTripId,
  isoDay,
  setSelectedTripId,
  toTripState,
  tripTitle,
} from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { TripStateFlow, VehicleGapBadge } from "./trip-command-parts";

interface VehicleGapRow {
  id: string;
  plate: string;
  driverAssigned: boolean;
  moderatorAssigned: boolean;
  openDeal: boolean;
}

interface Section {
  id: string;
  slug: OrgSlug;
  key: string;
}

/** Trip sections, in the artboard's tab order; Overview is this page. */
const SECTIONS: readonly Section[] = [
  {
    id: "overview",
    slug: "trip-command-view",
    key: "screen.organization.trips.tripCommandView.overview",
  },
  {
    id: "staffing",
    slug: "staffing-board",
    key: "screen.organization.trips.tripCommandView.staffing",
  },
  {
    id: "seats",
    slug: "seat-map-and-seat-assignment",
    key: "screen.organization.trips.tripCommandView.seats",
  },
  {
    id: "bookings",
    slug: "bookings-and-travelers",
    key: "screen.organization.trips.tripCommandView.bookings",
  },
  {
    id: "programs",
    slug: "program-enrollment-report",
    key: "screen.organization.trips.tripCommandView.programs",
  },
  {
    id: "live",
    slug: "live-operations",
    key: "screen.organization.trips.tripCommandView.liveOperations",
  },
  {
    id: "accounting",
    slug: "trip-accounting",
    key: "screen.organization.trips.tripCommandView.accounting",
  },
];

/** The "Go to" card links to every section except this page and the seat map. */
const GO_TO_IDS = ["staffing", "bookings", "programs", "live", "accounting"];

const CANCEL_BLOCKED_ID = "trip-cancel-blocked";

function gapColumns(): readonly OrgColumn<VehicleGapRow>[] {
  return [
    {
      key: "plate",
      header: t("screen.organization.trips.tripCommandView.vehicle"),
      render: (row) => <b>{row.plate}</b>,
    },
    {
      key: "driver",
      header: t("screen.organization.trips.tripCommandView.driver"),
      render: (row) => <VehicleGapBadge assigned={row.driverAssigned} />,
    },
    {
      key: "moderator",
      header: t("screen.organization.trips.tripCommandView.moderator"),
      render: (row) => <VehicleGapBadge assigned={row.moderatorAssigned} />,
    },
    {
      key: "openDeal",
      header: t("screen.organization.trips.tripCommandView.openDeal"),
      render: (row) => <VehicleGapBadge assigned={row.openDeal} deal />,
    },
  ];
}

export function TripCommandView() {
  const { status: authStatus, locale } = useAuth();
  const params = useOrgParams();
  const signedIn = authStatus === "authenticated";
  const knownTripId = params.tripId ?? getSelectedTripId();

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: signedIn && !knownTripId,
  });
  const tripId = knownTripId || tripsQuery.data?.items[0]?.id || null;

  // Sections without a trip id in their URL read the trip from here.
  useEffect(() => {
    if (tripId) setSelectedTripId(tripId);
  }, [tripId]);

  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: signedIn && Boolean(tripId),
  });

  const detail = tripQuery.data;
  const state = detail ? toTripState(detail.state) : null;
  const start = isoDay(detail?.startsAt);
  const end = isoDay(detail?.endsAt);
  const departs = detail?.startsAt ? new Date(detail.startsAt).toISOString().slice(11, 16) : null;
  const origin = detail?.origin
    ? locale === "ar"
      ? detail.origin.nameAr
      : detail.origin.nameEn
    : null;
  const caption = [
    start && end ? t("screen.organization.trips.tripCommandView.dateRange", { start, end }) : start,
    departs && origin
      ? t("screen.organization.trips.tripCommandView.departsFrom", { time: departs, origin })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const occupancy =
    detail && detail.totalCapacity > 0
      ? t("screen.organization.trips.tripCommandView.percent", {
          n: Math.round((detail.confirmedSeatsCount / detail.totalCapacity) * 100),
        })
      : NO_VALUE;
  const gapRows: readonly VehicleGapRow[] =
    detail?.vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plateNumber ?? vehicle.vehicleId,
      driverAssigned: Boolean(vehicle.driverAccountId) || vehicle.driverSource === "org_staff",
      moderatorAssigned:
        Boolean(vehicle.moderatorAccountId) || vehicle.moderatorSource === "org_staff",
      openDeal:
        vehicle.driverSource === "platform_supplier" ||
        vehicle.photographerSource === "platform_supplier",
    })) ?? [];

  const tabs = SECTIONS.map((section) => ({
    id: section.id,
    label: t(section.key),
    href: orgHref(section.slug, { tripId }),
  }));
  const cancelBlocked = state === "In Progress";
  const cancelAction = cancelBlocked ? (
    <OrgButton variant="danger" disabled aria-describedby={CANCEL_BLOCKED_ID}>
      {t("screen.organization.trips.tripCommandView.cancelTrip")}
    </OrgButton>
  ) : (
    <OrgButtonLink slug="cancel-trip-decision" params={{ tripId }} variant="danger">
      {t("screen.organization.trips.tripCommandView.cancelTrip")}
    </OrgButtonLink>
  );

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={
          detail
            ? tripTitle(detail, locale) || NO_VALUE
            : t("screen.organization.trips.tripCommandView.trip")
        }
        badge={state ? <TripStateBadge state={state} /> : null}
        caption={caption || undefined}
        actions={cancelAction}
      />
      <OrgNavTabs
        label={t("screen.organization.trips.tripCommandView.tripSections")}
        tabs={tabs}
        activeId="overview"
      />
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
      {tripQuery.isLoading ? (
        <OrgLoading rows={4} />
      ) : (
        <>
          <OrgKpiRow>
            <OrgKpi
              label={t("screen.organization.trips.tripCommandView.seatsSold")}
              value={
                detail
                  ? t("screen.organization.trips.tripCommandView.nOfCapacity", {
                      n: detail.confirmedSeatsCount,
                      capacity: detail.totalCapacity,
                    })
                  : NO_VALUE
              }
            />
            <OrgKpi
              label={t("screen.organization.trips.tripCommandView.seatsHeld")}
              value={detail ? String(detail.heldSeatsCount) : NO_VALUE}
            />
            <OrgKpi
              label={t("screen.organization.trips.tripCommandView.seatsReserved")}
              value={NO_VALUE}
            />
            <OrgKpi
              label={t("screen.organization.trips.tripCommandView.occupancy")}
              value={occupancy}
            />
          </OrgKpiRow>
          <OrgCard title={t("screen.organization.trips.tripCommandView.tripState")}>
            {state ? <TripStateFlow current={state} /> : <span>{NO_VALUE}</span>}
            {cancelBlocked ? (
              <div id={CANCEL_BLOCKED_ID}>
                <OrgAlert
                  tone="warn"
                  title={t("screen.organization.trips.tripCommandView.cancelBlockedTitle")}
                >
                  {t("screen.organization.trips.tripCommandView.cancelBlockedBody")}
                </OrgAlert>
              </div>
            ) : null}
          </OrgCard>
          <OrgRow align="start">
            <OrgCard
              title={t("screen.organization.trips.tripCommandView.readyGaps")}
              className="flex-1"
            >
              <OrgTable
                columns={gapColumns()}
                rows={gapRows}
                rowKey={(row) => row.id}
                caption={t("screen.organization.trips.tripCommandView.readyGaps")}
                empty={t("screen.organization.trips.tripCommandView.noVehicles")}
              />
            </OrgCard>
            <OrgCard title={t("screen.organization.trips.tripCommandView.goTo")} className="flex-1">
              <div className="flex flex-wrap gap-3">
                {SECTIONS.filter((section) => GO_TO_IDS.includes(section.id)).map((section) => (
                  <OrgButtonLink
                    key={section.id}
                    slug={section.slug}
                    params={{ tripId }}
                    variant="secondary"
                  >
                    {t(section.key)}
                  </OrgButtonLink>
                ))}
              </div>
            </OrgCard>
          </OrgRow>
        </>
      )}
    </OrgPage>
  );
}
