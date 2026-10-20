// SCR-ORG-19 Staffing board: one row per vehicle of the selected trip, with each role's state.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgButtonLink } from "../common/org-link";
import {
  getSelectedTripId,
  setSelectedTripId as rememberSelectedTripId,
  setSelectedNegotiationId,
  setSelectedVehicleId,
  tripTitle,
} from "../common/org-shared";
import { OrgSelect } from "../common/org-form";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgEmpty,
  OrgError,
  OrgPage,
  OrgPageHeader,
  type OrgTone,
} from "../common/org-ui";

type StaffSource = "unassigned" | "org_staff" | "platform_supplier";
type StaffRole = "driver" | "moderator" | "photographer";

interface StaffCell {
  tone: OrgTone;
  label: string;
  missing: boolean;
}

interface StaffingRow {
  id: string;
  plate: string;
  driver: StaffCell;
  moderator: StaffCell;
  photographer: StaffCell;
  negotiationId?: string;
}

function staffCell(role: StaffRole, source: StaffSource, accountId: string | null): StaffCell {
  if (source === "platform_supplier") {
    return accountId
      ? {
          tone: "ok",
          label: t("screen.organization.staffing.staffingBoard.platformFinalized"),
          missing: false,
        }
      : {
          tone: "warn",
          label: t("screen.organization.staffing.staffingBoard.platformNegotiating"),
          missing: false,
        };
  }
  if (source === "org_staff") {
    if (role === "moderator") {
      return {
        tone: "ok",
        label: t("screen.organization.staffing.staffingBoard.assigned"),
        missing: false,
      };
    }
    if (role === "photographer") {
      return {
        tone: "neu",
        label: t("screen.organization.staffing.staffingBoard.ownStaff"),
        missing: false,
      };
    }
    return {
      tone: "ok",
      label: t("screen.organization.staffing.staffingBoard.acceptedOwnStaff"),
      missing: false,
    };
  }
  if (role === "photographer") {
    return {
      tone: "neu",
      label: t("screen.organization.staffing.staffingBoard.notAssigned"),
      missing: false,
    };
  }
  return {
    tone: "err",
    label: t("screen.organization.staffing.staffingBoard.missing"),
    missing: true,
  };
}

function CellBadge({ cell }: { cell: StaffCell }) {
  return <OrgBadge tone={cell.tone}>{cell.label}</OrgBadge>;
}

function hasGap(row: StaffingRow): boolean {
  return row.driver.missing || row.moderator.missing;
}

function columns(): readonly OrgColumn<StaffingRow>[] {
  return [
    {
      key: "plate",
      header: t("screen.organization.staffing.staffingBoard.vehicle"),
      render: (row) => <b>{row.plate}</b>,
    },
    {
      key: "driver",
      header: t("screen.organization.staffing.staffingBoard.driver"),
      render: (row) => <CellBadge cell={row.driver} />,
    },
    {
      key: "moderator",
      header: t("screen.organization.staffing.staffingBoard.moderator"),
      render: (row) => <CellBadge cell={row.moderator} />,
    },
    {
      key: "photographer",
      header: t("screen.organization.staffing.staffingBoard.photographer"),
      render: (row) => <CellBadge cell={row.photographer} />,
    },
    {
      key: "action",
      header: t("screen.organization.staffing.staffingBoard.action"),
      render: (row) =>
        row.negotiationId ? (
          <OrgButtonLink
            slug="deal-detail-and-negotiation"
            params={{ dealId: row.negotiationId }}
            variant="text"
            onClick={() => {
              setSelectedVehicleId(row.id);
              setSelectedNegotiationId(row.negotiationId ?? null);
            }}
          >
            {t("screen.organization.staffing.staffingBoard.openDeal")}
          </OrgButtonLink>
        ) : (
          <OrgButtonLink
            slug="organization-owned-drivers-and-photographers"
            variant="text"
            onClick={() => setSelectedVehicleId(row.id)}
          >
            {t("screen.organization.staffing.staffingBoard.openStaff")}
          </OrgButtonLink>
        ),
    },
  ];
}

/** "Missing driver on X. Missing moderator on Y." for every gap, in table order. */
function gapSentences(rows: readonly StaffingRow[]): string {
  const sentences: string[] = [];
  for (const row of rows) {
    if (row.driver.missing) {
      sentences.push(
        t("screen.organization.staffing.staffingBoard.missingDriverOn", { plate: row.plate }),
      );
    }
    if (row.moderator.missing) {
      sentences.push(
        t("screen.organization.staffing.staffingBoard.missingModeratorOn", { plate: row.plate }),
      );
    }
  }
  return sentences.join(" ");
}

export function StaffingBoard() {
  const { status: authStatus, actor, locale } = useAuth();
  const [selectedTripId, setSelectedTripId] = useState<string | null>(getSelectedTripId());
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const tripsQuery = useQuery({
    ...serverQueryOptions(orpc.trips.listOrganizationTrips, "trips/listOrganizationTrips", {
      input: {},
    }),
    enabled,
  });
  const trips = tripsQuery.data?.items ?? [];
  const tripId = selectedTripId || trips[0]?.id || null;

  const staffingQuery = useQuery({
    ...serverQueryOptions(orpc.staffing.listTripStaffing, "staffing/listTripStaffing", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: enabled && Boolean(tripId),
  });
  const dealsQuery = useQuery({
    ...serverQueryOptions(
      orpc.negotiation.listOrganizationNegotiations,
      "negotiation/listOrganizationNegotiations",
      {
        input: { tripId: tripId ?? "" },
      },
    ),
    enabled: enabled && Boolean(tripId),
  });

  const deals = dealsQuery.data?.items ?? [];
  const rows: readonly StaffingRow[] =
    staffingQuery.data?.vehicles.map((vehicle) => ({
      id: vehicle.vehicleId,
      plate: vehicle.plateNumber ?? NO_VALUE,
      driver: staffCell("driver", vehicle.driverSource, vehicle.driverAccountId),
      moderator: staffCell("moderator", vehicle.moderatorSource, vehicle.moderatorAccountId),
      photographer: staffCell(
        "photographer",
        vehicle.photographerSource,
        vehicle.photographerAccountId,
      ),
      negotiationId: deals.find((deal) => deal.vehicleId === vehicle.vehicleId)?.id,
    })) ?? [];

  const gapCount = rows.reduce(
    (count, row) => count + Number(row.driver.missing) + Number(row.moderator.missing),
    0,
  );

  const tripOptions =
    trips.length > 0
      ? trips.map((trip) => ({ value: trip.id, label: tripTitle(trip, locale) || NO_VALUE }))
      : [{ value: "", label: t("screen.organization.staffing.staffingBoard.noTrips") }];

  const selectTrip = (id: string) => {
    if (!id) return;
    rememberSelectedTripId(id);
    setSelectedTripId(id);
  };

  const loading = tripsQuery.isLoading || staffingQuery.isLoading;
  const failed = tripsQuery.isError || staffingQuery.isError;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.staffing.staffingBoard.title")}
        caption={t("screen.organization.staffing.staffingBoard.caption")}
        actions={
          <OrgSelect
            label={t("screen.organization.staffing.staffingBoard.trip")}
            options={tripOptions}
            value={tripId ?? ""}
            onValueChange={selectTrip}
            disabled={trips.length === 0}
            fieldClassName="w-full sm:min-w-[320px]"
          />
        }
      />
      {gapCount > 0 ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.staffing.staffingBoard.readyBlockedByGaps", {
            n: gapCount,
          })}
        >
          {gapSentences(rows)} {t("screen.organization.staffing.staffingBoard.eachGapHighlighted")}
        </OrgAlert>
      ) : null}
      {failed ? (
        <OrgError
          onRetry={() => {
            void tripsQuery.refetch();
            void staffingQuery.refetch();
          }}
        />
      ) : null}
      <OrgTable
        columns={columns()}
        rows={rows}
        rowKey={(row) => row.id}
        caption={t("screen.organization.staffing.staffingBoard.tableCaption")}
        loading={loading}
        rowClassName={(row) => (hasGap(row) ? "bg-[var(--te-danger-soft)]" : undefined)}
        empty={
          failed ? undefined : (
            <OrgEmpty title={t("screen.organization.staffing.staffingBoard.emptyTitle")}>
              {t("screen.organization.staffing.staffingBoard.emptyBody")}
            </OrgEmpty>
          )
        }
      />
      <div className="flex flex-wrap items-center gap-4">
        <span className="te-caption text-[var(--te-ink-muted)]">
          {t("screen.organization.staffing.staffingBoard.readyNeedsDriverAndModerator")}
        </span>
        <span className="hidden flex-1 sm:block" />
        <OrgButtonLink slug="organization-owned-drivers-and-photographers" variant="secondary">
          {t("screen.organization.staffing.staffingBoard.openOrganizationOwnedStaff")}
        </OrgButtonLink>
      </div>
    </OrgPage>
  );
}
