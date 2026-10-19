// SCR-ORG-08 Trip wizard step 4: driver, moderator and photographer of each vehicle, with gaps.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { Link } from "@tanstack/react-router";

import { orgHref } from "../common/org-routes";
import { TripWizardFrame, setSelectedTripId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { OrgAlert, OrgBadge, OrgCard, OrgError, orgButtonClass } from "../common/org-ui";
import { WizardSaveAlert, useOrgPlan, useWizardStepSave, useWizardTrip } from "./trip-parts";

type StaffChoice = "organization" | "platform" | "none";
type StaffSource = "org_staff" | "platform_supplier" | "unassigned";

interface VehicleStaffState {
  vehicleId: string;
  plate: string;
  driver: StaffChoice;
  driverAccountId?: string | null;
  moderator: StaffChoice;
  moderatorAccountId?: string | null;
  photographer: StaffChoice;
  photographerAccountId?: string | null;
}

type StaffRole = "driver" | "moderator" | "photographer";

function toChoice(source: string): StaffChoice {
  if (source === "org_staff") return "organization";
  if (source === "platform_supplier") return "platform";
  return "none";
}

function toStaffSource(choice: StaffChoice): StaffSource {
  if (choice === "organization") return "org_staff";
  if (choice === "platform") return "platform_supplier";
  return "unassigned";
}

/** Names of the organization's employees and own suppliers, by account id. */
function useStaffNames(enabled: boolean): ReadonlyMap<string, string> {
  const employeesQuery = useQuery({
    ...orpc.employees.list.queryOptions({ input: {} }),
    enabled,
  });
  const suppliersQuery = useQuery({
    ...orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
    enabled,
  });
  const names = new Map<string, string>();
  for (const member of employeesQuery.data?.employees ?? []) {
    if (member.accountId && member.fullName) names.set(member.accountId, member.fullName);
  }
  for (const supplier of suppliersQuery.data?.suppliers ?? []) {
    if (supplier.fullName) names.set(supplier.supplierAccountId, supplier.fullName);
  }
  return names;
}

const MISSING_KEY: Record<Exclude<StaffRole, "photographer">, string> = {
  driver: "screen.organization.trips.tripWizardStep4Staffing.missingDriver",
  moderator: "screen.organization.trips.tripWizardStep4Staffing.missingModerator",
};

function StaffCell({
  role,
  choice,
  accountId,
  names,
}: {
  role: StaffRole;
  choice: StaffChoice;
  accountId: string | null | undefined;
  names: ReadonlyMap<string, string>;
}) {
  if (choice === "none") {
    if (role === "photographer") {
      return (
        <OrgBadge tone="neu">
          {t("screen.organization.trips.tripWizardStep4Staffing.notAssigned")}
        </OrgBadge>
      );
    }
    return <OrgBadge tone="err">{t(MISSING_KEY[role])}</OrgBadge>;
  }
  const name =
    (accountId && names.get(accountId)) ||
    t("screen.organization.trips.tripWizardStep4Staffing.assigned");
  const label =
    choice === "organization"
      ? t("screen.organization.trips.tripWizardStep4Staffing.nameOwnStaff", { name })
      : t("screen.organization.trips.tripWizardStep4Staffing.namePlatform", { name });
  return <OrgBadge tone="ok">{label}</OrgBadge>;
}

export function TripWizardStep4Staffing() {
  const { authStatus, tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { features } = useOrgPlan();
  const names = useStaffNames(authStatus === "authenticated");
  const [vehicles, setVehicles] = useState<readonly VehicleStaffState[]>([]);
  const [noVehicles, setNoVehicles] = useState(false);
  const { error: saveError, run } = useWizardStepSave(tripId);

  useEffect(() => {
    if (tripQuery.data) {
      setVehicles(
        tripQuery.data.vehicles.map((vehicle) => ({
          vehicleId: vehicle.vehicleId,
          plate: vehicle.plateNumber ?? vehicle.vehicleId,
          driver: toChoice(vehicle.driverSource),
          driverAccountId: vehicle.driverAccountId,
          moderator: toChoice(vehicle.moderatorSource),
          moderatorAccountId: vehicle.moderatorAccountId,
          photographer: toChoice(vehicle.photographerSource),
          photographerAccountId: vehicle.photographerAccountId,
        })),
      );
    }
  }, [tripQuery.data]);

  const saveWizardStepMutation = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const saveStep = async (): Promise<boolean> => {
    const assignments = vehicles.map((vehicle) => ({
      vehicleId: vehicle.vehicleId,
      driverSource: toStaffSource(vehicle.driver),
      driverAccountId: vehicle.driver === "none" ? null : (vehicle.driverAccountId ?? null),
      moderatorSource: toStaffSource(vehicle.moderator),
      moderatorAccountId:
        vehicle.moderator === "none" ? null : (vehicle.moderatorAccountId ?? null),
      photographerSource: toStaffSource(vehicle.photographer),
      photographerAccountId:
        vehicle.photographer === "none" ? null : (vehicle.photographerAccountId ?? null),
    }));
    // Staff are saved per vehicle, so a trip without vehicles has nothing to save yet.
    setNoVehicles(assignments.length === 0);
    if (assignments.length === 0) return false;
    return run((id) =>
      saveWizardStepMutation.mutateAsync({ tripId: id, step: "staffing", assignments }),
    );
  };

  const columns: readonly OrgColumn<VehicleStaffState>[] = [
    {
      key: "plate",
      header: t("screen.organization.trips.tripWizardStep4Staffing.vehicle"),
      render: (row) => <b>{row.plate}</b>,
    },
    {
      key: "driver",
      header: t("screen.organization.trips.tripWizardStep4Staffing.driver"),
      render: (row) => (
        <StaffCell
          role="driver"
          choice={row.driver}
          accountId={row.driverAccountId}
          names={names}
        />
      ),
    },
    {
      key: "moderator",
      header: t("screen.organization.trips.tripWizardStep4Staffing.moderator"),
      render: (row) => (
        <StaffCell
          role="moderator"
          choice={row.moderator}
          accountId={row.moderatorAccountId}
          names={names}
        />
      ),
    },
    {
      key: "photographer",
      header: t("screen.organization.trips.tripWizardStep4Staffing.photographer"),
      render: (row) => (
        <StaffCell
          role="photographer"
          choice={row.photographer}
          accountId={row.photographerAccountId}
          names={names}
        />
      ),
    },
  ];

  return (
    <TripWizardFrame
      stepId="staffing"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStepMutation.isPending}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      {features?.platformSuppliers ? null : (
        <OrgAlert
          tone="info"
          title={t("screen.organization.trips.tripWizardStep4Staffing.platformStaffTitle")}
        >
          {t("screen.organization.trips.tripWizardStep4Staffing.platformStaffBody")}
        </OrgAlert>
      )}
      <WizardSaveAlert error={saveError} />
      {noVehicles ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep4Staffing.noVehiclesTitle")}
        >
          {t("screen.organization.trips.tripWizardStep4Staffing.noVehiclesBody")}
        </OrgAlert>
      ) : null}
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
      <OrgCard title={t("screen.organization.trips.tripWizardStep4Staffing.staffForEachVehicle")}>
        <OrgTable
          columns={columns}
          rows={vehicles}
          rowKey={(row) => row.vehicleId}
          caption={t("screen.organization.trips.tripWizardStep4Staffing.staffForEachVehicle")}
          loading={tripQuery.isLoading}
          empty={t("screen.organization.trips.tripWizardStep4Staffing.noVehicles")}
        />
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">
          {t("screen.organization.trips.tripWizardStep4Staffing.readyNeedsNote")}
        </p>
        <div>
          <Link
            to={orgHref("staffing-board")}
            className={orgButtonClass("text")}
            onClick={() => setSelectedTripId(tripId)}
          >
            {t("screen.organization.trips.tripWizardStep4Staffing.assignOwnStaff")}
          </Link>
        </div>
      </OrgCard>
    </TripWizardFrame>
  );
}
