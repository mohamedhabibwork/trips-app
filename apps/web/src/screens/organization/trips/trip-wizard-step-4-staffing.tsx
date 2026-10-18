import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink } from "../common/org-link";
import { StateBadge, TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const DRIVER_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "none", label: t("screen.organization.trips.tripWizardStep4Staffing.notAssigned") },
  {
    value: "organization",
    label: t("screen.organization.trips.tripWizardStep4Staffing.organizationOwned"),
  },
  {
    value: "platform",
    label: t("screen.organization.trips.tripWizardStep4Staffing.platformThroughADeal"),
  },
];

const MODERATOR_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "none", label: t("screen.organization.trips.tripWizardStep4Staffing.notAssignedLabel") },
  {
    value: "organization",
    label: t("screen.organization.trips.tripWizardStep4Staffing.organizationOwnedLabel"),
  },
];

const PHOTOGRAPHER_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "none", label: t("screen.organization.trips.tripWizardStep4Staffing.notAssigned2") },
  {
    value: "organization",
    label: t("screen.organization.trips.tripWizardStep4Staffing.organizationOwned2"),
  },
  {
    value: "platform",
    label: t("screen.organization.trips.tripWizardStep4Staffing.platformThroughADealLabel"),
  },
];

interface VehicleStaffingCardProps {
  vehicleLabel: string;
  driver: string;
  moderator: string;
  photographer: string;
  onChange: (next: { driver: string; moderator: string; photographer: string }) => void;
}

function VehicleStaffingCard({
  vehicleLabel,
  driver,
  moderator,
  photographer,
  onChange,
}: VehicleStaffingCardProps) {
  const missingLabels = [
    driver === "none" ? "Driver missing" : null,
    moderator === "none" ? "Moderator missing" : null,
  ].filter((label): label is string => label !== null);

  const gapBadge =
    missingLabels.length > 0 ? (
      <StateBadge tone="warning" icon="alert" label={missingLabels.join(", ")} />
    ) : (
      <StateBadge
        tone="success"
        icon="check"
        label={t("screen.organization.trips.tripWizardStep4Staffing.ready")}
      />
    );

  return (
    <TeCard
      header={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="te-h3">{vehicleLabel}</h3>
          {gapBadge}
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <TeSelect
            label={t("screen.organization.trips.tripWizardStep4Staffing.driver")}
            options={DRIVER_OPTIONS()}
            value={driver}
            onValueChange={(value) => onChange({ driver: value, moderator, photographer })}
          />
          <TeSelect
            label={t("screen.organization.trips.tripWizardStep4Staffing.moderator")}
            options={MODERATOR_OPTIONS()}
            value={moderator}
            onValueChange={(value) => onChange({ driver, moderator: value, photographer })}
          />
          <TeSelect
            label={t("screen.organization.trips.tripWizardStep4Staffing.photographer")}
            options={PHOTOGRAPHER_OPTIONS()}
            value={photographer}
            onValueChange={(value) => onChange({ driver, moderator, photographer: value })}
          />
        </div>
        <div className="flex justify-end">
          <OrgButtonLink slug="platform-supplier-search-and-deal-start" variant="ghost">
            {t("screen.organization.trips.tripWizardStep4Staffing.findPlatformSupplier")}
          </OrgButtonLink>
        </div>
      </div>
    </TeCard>
  );
}

interface VehicleStaffState {
  vehicleId: string;
  vehicleLabel: string;
  driver: string;
  driverAccountId?: string | null;
  moderator: string;
  moderatorAccountId?: string | null;
  photographer: string;
  photographerAccountId?: string | null;
}

export function TripWizardStep4Staffing() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [vehicles, setVehicles] = useState<readonly VehicleStaffState[]>([]);

  const tripId = getActiveWizardTripId();
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(tripId),
  });

  useEffect(() => {
    if (tripQuery.data && tripQuery.data.vehicles.length > 0) {
      setVehicles(
        tripQuery.data.vehicles.map((v) => ({
          vehicleId: v.vehicleId,
          vehicleLabel: `Vehicle ${v.plateNumber ?? v.vehicleId}`,
          driver:
            v.driverSource === "org_staff"
              ? "organization"
              : v.driverSource === "platform_supplier"
                ? "platform"
                : "none",
          driverAccountId: v.driverAccountId,
          moderator: v.moderatorSource === "org_staff" ? "organization" : "none",
          moderatorAccountId: v.moderatorAccountId,
          photographer:
            v.photographerSource === "org_staff"
              ? "organization"
              : v.photographerSource === "platform_supplier"
                ? "platform"
                : "none",
          photographerAccountId: v.photographerAccountId,
        })),
      );
    }
  }, [tripQuery.data]);

  const toStaffSource = (val: string): "org_staff" | "platform_supplier" | "unassigned" => {
    if (val === "organization") return "org_staff";
    if (val === "platform") return "platform_supplier";
    return "unassigned";
  };

  const saveWizardStepMutation = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const saveStep = async (): Promise<boolean> => {
    if (authStatus !== "authenticated") return true;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return true;
    const validAssignments = vehicles
      .filter((v) => v.vehicleId !== "vehicle-1")
      .map((v) => ({
        vehicleId: v.vehicleId,
        driverSource: toStaffSource(v.driver),
        driverAccountId: v.driver === "none" ? null : (v.driverAccountId ?? null),
        moderatorSource: toStaffSource(v.moderator),
        moderatorAccountId: v.moderator === "none" ? null : (v.moderatorAccountId ?? null),
        photographerSource: toStaffSource(v.photographer),
        photographerAccountId: v.photographer === "none" ? null : (v.photographerAccountId ?? null),
      }));
    if (validAssignments.length === 0) return true;
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "staffing",
        assignments: validAssignments,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t("screen.organization.trips.tripWizardStep4Staffing.tripWizardStep4Staffing")}
        stepId="staffing"
        previousSlug="trip-wizard-step-3-vehicles"
        nextSlug="trip-wizard-step-5-programs"
        beforeNext={saveStep}
        onSaveDraft={async () => {
          await saveStep();
        }}
      >
        <TeInlineAlert tone="info">
          {t("screen.organization.trips.tripWizardStep4Staffing.aPlatformDriverOrPhotographer")}
        </TeInlineAlert>
        {vehicles.map((vehicle, index) => (
          <VehicleStaffingCard
            key={vehicle.vehicleId}
            vehicleLabel={vehicle.vehicleLabel}
            driver={vehicle.driver}
            moderator={vehicle.moderator}
            photographer={vehicle.photographer}
            onChange={(next) =>
              setVehicles((prev) =>
                prev.map((item, idx) => (idx === index ? { ...item, ...next } : item)),
              )
            }
          />
        ))}
      </TripWizardFrame>
    </StatePreview>
  );
}
