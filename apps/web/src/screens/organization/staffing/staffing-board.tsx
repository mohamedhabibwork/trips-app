import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import type { OrgSlug } from "../common/org-routes";
import {
  getActiveWizardTripId,
  setActiveWizardTripId,
  setSelectedNegotiationId,
  setSelectedVehicleId,
  StateBadge,
  type StatePresentation,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

type StaffingState = "organization" | "accepted" | "negotiating" | "finalized" | "missing";

interface StaffingRow {
  id: string;
  vehicle: string;
  driver: StaffingState;
  moderator: StaffingState;
  photographer: StaffingState;
  negotiationId?: string;
}

const STAFFING_PRESENTATION = (): Record<StaffingState, StatePresentation> => ({
  organization: {
    tone: "neutral",
    icon: "user",
    label: t("screen.organization.staffing.staffingBoard.organizationOwned"),
  },
  accepted: {
    tone: "success",
    icon: "check",
    label: t("screen.organization.staffing.staffingBoard.accepted"),
  },
  negotiating: {
    tone: "warning",
    icon: "refresh",
    label: t("screen.organization.staffing.staffingBoard.platformNegotiating"),
  },
  finalized: {
    tone: "success",
    icon: "check",
    label: t("screen.organization.staffing.staffingBoard.platformFinalized"),
  },
  missing: {
    tone: "danger",
    icon: "alert",
    label: t("screen.organization.staffing.staffingBoard.missing"),
  },
});

const DEAL_STATES: readonly StaffingState[] = ["negotiating", "finalized"];

function StaffingCell({ state }: { state: StaffingState }) {
  return <StateBadge {...STAFFING_PRESENTATION()[state]} />;
}

/** Row action: a platform deal opens the negotiation, org-owned staff opens their list, gaps open supplier search. */
function manageSlugFor(row: StaffingRow): OrgSlug {
  if (DEAL_STATES.includes(row.driver) || DEAL_STATES.includes(row.photographer)) {
    return "deal-detail-and-negotiation";
  }
  if (row.driver === "organization") {
    return "organization-owned-drivers-and-photographers";
  }
  return "platform-supplier-search-and-deal-start";
}

const COLUMNS = (): readonly TeDataTableColumn<StaffingRow>[] => [
  { key: "vehicle", header: t("screen.organization.staffing.staffingBoard.vehicle") },
  {
    key: "driver",
    header: t("screen.organization.staffing.staffingBoard.driver"),
    render: (row) => <StaffingCell state={row.driver} />,
  },
  {
    key: "moderator",
    header: t("screen.organization.staffing.staffingBoard.moderator"),
    render: (row) => <StaffingCell state={row.moderator} />,
  },
  {
    key: "photographer",
    header: t("screen.organization.staffing.staffingBoard.photographer"),
    render: (row) => <StaffingCell state={row.photographer} />,
  },
  {
    key: "actions",
    header: t("screen.organization.staffing.staffingBoard.actions"),
    align: "end",
    render: (row) => (
      <OrgButtonLink
        slug={manageSlugFor(row)}
        variant="ghost"
        onClick={() => {
          setSelectedVehicleId(row.id);
          if (row.negotiationId) {
            setSelectedNegotiationId(row.negotiationId);
          }
        }}
      >
        {t("screen.organization.staffing.staffingBoard.manage")}
      </OrgButtonLink>
    ),
  },
];

function mapSourceToState(
  source: "unassigned" | "org_staff" | "platform_supplier",
  accountId: string | null,
  hasActiveDeal: boolean,
): StaffingState {
  if (source === "org_staff") return accountId ? "accepted" : "organization";
  if (source === "platform_supplier") {
    if (accountId) return "finalized";
    if (hasActiveDeal) return "negotiating";
    return "negotiating";
  }
  return "missing";
}

export function StaffingBoard() {
  const { status: authStatus, actor } = useAuth();
  const [tripId, setTripId] = useState<string | null>(getActiveWizardTripId());
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: enabled && !tripId,
  });

  const effectiveTripId = tripId || tripsQuery.data?.items[0]?.id || null;

  useEffect(() => {
    if (!tripId && tripsQuery.data?.items[0]?.id) {
      setActiveWizardTripId(tripsQuery.data.items[0].id);
      setTripId(tripsQuery.data.items[0].id);
    }
  }, [tripId, tripsQuery.data]);

  const tripDetailQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
    }),
    enabled: enabled && Boolean(effectiveTripId),
  });

  const staffingQuery = useQuery({
    ...orpc.staffing.listTripStaffing.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
    }),
    enabled: enabled && Boolean(effectiveTripId),
  });

  const dealsQuery = useQuery({
    ...orpc.negotiation.listOrganizationNegotiations.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
    }),
    enabled: enabled && Boolean(effectiveTripId),
  });

  const tripTitle = tripDetailQuery.data
    ? tripDetailQuery.data.titleEn || tripDetailQuery.data.titleAr
    : "";
  const hasGap = staffingQuery.data?.hasStaffingGap ?? false;

  const dealsRes = dealsQuery.data ?? { items: [] };
  const staffingRes = staffingQuery.data;

  const rows: readonly StaffingRow[] = staffingRes
    ? staffingRes.vehicles.map((v) => {
        const matchingDeal = dealsRes.items.find((d) => d.vehicleId === v.vehicleId);
        return {
          id: v.vehicleId,
          vehicle: v.plateNumber ?? v.vehicleId,
          driver: mapSourceToState(
            v.driverSource,
            v.driverAccountId,
            Boolean(matchingDeal && matchingDeal.supplierRole === "platform_driver"),
          ),
          moderator: mapSourceToState(v.moderatorSource, v.moderatorAccountId, false),
          photographer: mapSourceToState(
            v.photographerSource,
            v.photographerAccountId,
            Boolean(matchingDeal && matchingDeal.supplierRole === "platform_photographer"),
          ),
          negotiationId: matchingDeal?.id,
        };
      })
    : [];

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink
          parent={{
            slug: "trip-command-view",
            label: t("screen.organization.staffing.staffingBoard.backToTrip"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.staffing.staffingBoard.staffingBoard")}
          description={tripTitle || t("screen.organization.staffing.staffingBoard.tripName")}
          actions={
            <div className="flex flex-wrap gap-3">
              <OrgButtonLink slug="organization-owned-drivers-and-photographers" variant="ghost">
                {t("screen.organization.staffing.staffingBoard.organizationOwnedStaff")}
              </OrgButtonLink>
              <OrgButtonLink slug="platform-supplier-search-and-deal-start" variant="secondary">
                {t("screen.organization.staffing.staffingBoard.findPlatformSupplier")}
              </OrgButtonLink>
            </div>
          }
        />
        {hasGap ? (
          <TeInlineAlert
            tone="warning"
            title={t("screen.organization.staffing.staffingBoard.readyIsBlocked")}
          >
            {t("screen.organization.staffing.staffingBoard.everyVehicleNeedsADriver")}
          </TeInlineAlert>
        ) : null}
        <TeDataTable
          columns={COLUMNS()}
          rows={rows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.staffing.staffingBoard.staffingForEachVehicle")}
          emptyTitle={t("screen.organization.staffing.staffingBoard.noVehiclesOnThisTrip")}
          emptyDescription={t("screen.organization.staffing.staffingBoard.addVehiclesToTheTrip")}
        />
      </div>
    </StatePreview>
  );
}
