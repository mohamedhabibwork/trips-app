// SCR-ORG-07 Trip wizard step 3: the vehicles on the trip, within the plan's vehicle limit.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgLink } from "../common/org-link";
import { TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgAlert, OrgButton, OrgCard, OrgError, OrgRow } from "../common/org-ui";
import { SeatLayoutPreview, limitText, useOrgPlan, useWizardTrip } from "./trip-parts";

interface TripVehicleRow {
  id: string;
  plate: string;
  vehicleType: string;
  seats: number;
  layout: {
    rows: number;
    cols: number;
    cells: readonly { row: number; col: number; type: string }[];
  } | null;
}

type FleetVehicle = Awaited<
  ReturnType<NonNullable<ReturnType<typeof orpc.fleet.listVehicles.queryOptions>["queryFn"]>>
>["items"][number];

function vehicleTypeName(vehicle: FleetVehicle, locale: string): string | undefined {
  const type = vehicle.vehicleType;
  if (!type) return undefined;
  return (locale === "ar" ? type.nameAr || type.nameEn : type.nameEn || type.nameAr) || undefined;
}

export function TripWizardStep3Vehicles() {
  const { authStatus, locale, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { limits } = useOrgPlan();
  const [rows, setRows] = useState<readonly TripVehicleRow[]>([]);
  const [saveFailed, setSaveFailed] = useState(false);

  const fleetQuery = useQuery({
    ...orpc.fleet.listVehicles.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const toRow = (vehicle: FleetVehicle): TripVehicleRow => ({
    id: vehicle.id,
    plate: vehicle.plateNumber,
    vehicleType: vehicleTypeName(vehicle, locale) ?? vehicle.model,
    seats: vehicle.seatCount,
    layout: vehicle.vehicleType?.seatLayout ?? null,
  });
  const availableVehicles: readonly TripVehicleRow[] = fleetQuery.data?.items.map(toRow) ?? [];

  useEffect(() => {
    if (!fleetQuery.data) return;
    const fleet = fleetQuery.data.items;
    if (tripQuery.data && tripQuery.data.vehicles.length > 0) {
      setRows(
        tripQuery.data.vehicles.map((assigned) => {
          const vehicle = fleet.find((item) => item.id === assigned.vehicleId);
          return {
            id: assigned.vehicleId,
            plate: assigned.plateNumber ?? assigned.vehicleId,
            vehicleType: (vehicle && vehicleTypeName(vehicle, locale)) ?? assigned.model ?? "",
            seats: assigned.seatCountSnapshot,
            layout: assigned.seatLayoutSnapshot ?? null,
          };
        }),
      );
      return;
    }
    // A new draft starts with the first fleet vehicle, as before.
    const first = fleet[0];
    if (first) {
      setRows((current) => (current.length > 0 ? current : [toRow(first)]));
    }
  }, [fleetQuery.data, tripQuery.data, locale]);

  const vehicleLimit = limits?.vehiclesPerTrip ?? null;
  const atLimit = vehicleLimit !== null && rows.length >= vehicleLimit;
  const nextCandidate = availableVehicles.find(
    (candidate) => !rows.some((row) => row.id === candidate.id),
  );

  const handleAddVehicle = () => {
    if (nextCandidate && !atLimit) setRows((current) => [...current, nextCandidate]);
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    setRows((current) => current.filter((row) => row.id !== vehicleId));
  };

  const columns: readonly OrgColumn<TripVehicleRow>[] = [
    {
      key: "plate",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.plate"),
      render: (row) => <b>{row.plate}</b>,
    },
    {
      key: "vehicleType",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.vehicleType"),
    },
    {
      key: "seats",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.seats"),
      render: (row) =>
        t("screen.organization.trips.tripWizardStep3Vehicles.nSeats", { n: row.seats }),
    },
    {
      key: "action",
      header: t("screen.organization.trips.tripWizardStep3Vehicles.action"),
      render: (row) => (
        <OrgButton
          variant="text"
          aria-label={t("screen.organization.trips.tripWizardStep3Vehicles.removeVehicle", {
            plate: row.plate,
          })}
          onClick={() => handleRemoveVehicle(row.id)}
        >
          {t("screen.organization.trips.tripWizardStep3Vehicles.remove")}
        </OrgButton>
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
    const validIds = rows.map((row) => row.id);
    if (validIds.length === 0) return true;
    setSaveFailed(false);
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "vehicles",
        vehicleIds: validIds,
      });
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  };

  const preview = rows[0];
  const signedIn = authStatus === "authenticated";

  return (
    <TripWizardFrame
      stepId="vehicles"
      tripName={tripName}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      <OrgAlert tone="info">
        {t("screen.organization.trips.tripWizardStep3Vehicles.vehicleLimitNote", {
          n: signedIn ? rows.length : NO_VALUE,
          limit: limitText(limits, "vehiclesPerTrip"),
        })}{" "}
        <OrgLink slug="subscription-and-billing">
          {t("screen.organization.trips.tripWizardStep3Vehicles.upgradeYourPlan")}
        </OrgLink>
      </OrgAlert>
      {saveFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep3Vehicles.saveFailedTitle")}
        >
          {t("screen.organization.trips.tripWizardStep3Vehicles.saveFailedBody")}
        </OrgAlert>
      ) : null}
      {fleetQuery.isError ? <OrgError onRetry={() => void fleetQuery.refetch()} /> : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip")}
          className="lg:flex-[2]"
        >
          <OrgTable
            columns={columns}
            rows={rows}
            rowKey={(row) => row.id}
            caption={t("screen.organization.trips.tripWizardStep3Vehicles.vehiclesOnThisTrip")}
            loading={fleetQuery.isLoading}
            empty={t("screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet")}
          />
          <div className="flex flex-col items-start gap-2">
            <OrgButton
              variant="secondary"
              disabled={!nextCandidate || atLimit}
              aria-describedby={atLimit || !nextCandidate ? "trip-vehicles-add-note" : undefined}
              onClick={handleAddVehicle}
            >
              {t("screen.organization.trips.tripWizardStep3Vehicles.addVehicle")}
            </OrgButton>
            {signedIn && fleetQuery.isSuccess && (atLimit || !nextCandidate) ? (
              <p id="trip-vehicles-add-note" className="te-caption m-0 text-[var(--te-ink-muted)]">
                {atLimit
                  ? t("screen.organization.trips.tripWizardStep3Vehicles.atLimitNote")
                  : t("screen.organization.trips.tripWizardStep3Vehicles.noMoreVehiclesNote")}
              </p>
            ) : null}
          </div>
        </OrgCard>
        <OrgCard
          title={t("screen.organization.trips.tripWizardStep3Vehicles.seatLayoutPreview")}
          className="flex-1"
        >
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {preview
              ? t("screen.organization.trips.tripWizardStep3Vehicles.layoutOfVehicle", {
                  type: preview.vehicleType || preview.plate,
                })
              : t("screen.organization.trips.tripWizardStep3Vehicles.layoutCaption")}
          </p>
          {preview ? (
            <SeatLayoutPreview layout={preview.layout} seatCount={preview.seats} />
          ) : (
            <SeatLayoutPreview layout={null} seatCount={16} />
          )}
        </OrgCard>
      </OrgRow>
    </TripWizardFrame>
  );
}
