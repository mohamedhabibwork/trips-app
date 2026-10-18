import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSection, TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface TripVehicleRow {
  id: string;
  vehicle: string;
  vehicleType: string;
  seats: string;
  remove: string;
}

export function TripWizardStep3Vehicles() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState<readonly TripVehicleRow[]>([]);
  const [availableVehicles, setAvailableVehicles] = useState<readonly TripVehicleRow[]>([]);

  const tripId = getActiveWizardTripId();
  const fleetQuery = useQuery({
    ...orpc.fleet.listVehicles.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(tripId),
  });

  useEffect(() => {
    if (fleetQuery.data) {
      const mappedFleet = fleetQuery.data.items.map((v) => ({
        id: v.id,
        vehicle: v.plateNumber,
        vehicleType: v.vehicleType?.nameEn ?? v.model,
        seats: String(v.seatCount),
        remove: "Remove",
      }));
      setAvailableVehicles(mappedFleet);

      if (tripQuery.data && tripQuery.data.vehicles.length > 0) {
        setRows(
          tripQuery.data.vehicles.map((tv) => ({
            id: tv.vehicleId,
            vehicle: tv.plateNumber ?? tv.vehicleId,
            vehicleType: tv.model ?? "Standard",
            seats: String(tv.seatCountSnapshot),
            remove: "Remove",
          })),
        );
      } else if (mappedFleet.length > 0 && rows.length === 0) {
        setRows([mappedFleet[0]!]);
      }
    }
  }, [fleetQuery.data, tripQuery.data]);

  const handleAddVehicle = () => {
    const nextCandidate = availableVehicles.find(
      (candidate) => !rows.some((r) => r.id === candidate.id),
    );
    if (nextCandidate) {
      setRows((prev) => [...prev, nextCandidate]);
    }
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== vehicleId));
  };

  const columns: readonly TeDataTableColumn<TripVehicleRow>[] = [
    { key: "vehicle", header: t("screen.organization.trips.tripWizardStep3Vehicles.vehicle") },
    {
      key: "vehicleType",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.vehicleType"),
    },
    {
      key: "seats",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.seats"),
      align: "end",
    },
    {
      key: "remove",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.remove"),
      render: (row) => (
        <TeButton variant="ghost" size="default" onClick={() => handleRemoveVehicle(row.id)}>
          {t("screen.organization.trips.tripWizardStep3Vehicles.removeVehicle")}
        </TeButton>
      ),
    },
  ];

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
    const validIds = rows.map((r) => r.id).filter((id) => id !== "vehicle-1");
    if (validIds.length === 0) return true;
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "vehicles",
        vehicleIds: validIds,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t("screen.organization.trips.tripWizardStep3Vehicles.tripWizardStep3Vehicles")}
        stepId="vehicles"
        previousSlug="trip-wizard-step-2-schedule-and-route"
        nextSlug="trip-wizard-step-4-staffing"
        beforeNext={saveStep}
        onSaveDraft={async () => {
          await saveStep();
        }}
      >
        <TeKpiTile
          label={t("screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip")}
          value={
            authStatus === "authenticated"
              ? `${rows.length} of 10`
              : t("screen.organization.trips.tripWizardStep3Vehicles.0Of10")
          }
          hint={t("screen.organization.trips.tripWizardStep3Vehicles.growthPlanLimitPerTrip")}
        />
        <OrgSection
          title={t("screen.organization.trips.tripWizardStep3Vehicles.vehicles")}
          actions={
            <TeButton variant="secondary" onClick={handleAddVehicle}>
              {t("screen.organization.trips.tripWizardStep3Vehicles.addVehicle")}
            </TeButton>
          }
        >
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTripCaption",
            )}
            emptyTitle={t("screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet")}
            emptyDescription={t(
              "screen.organization.trips.tripWizardStep3Vehicles.addAtLeastOneVehicle",
            )}
          />
        </OrgSection>
        <TeCard>
          <p className="te-body">
            {t("screen.organization.trips.tripWizardStep3Vehicles.theSeatLayoutPreviewAppears")}
          </p>
        </TeCard>
      </TripWizardFrame>
    </StatePreview>
  );
}
