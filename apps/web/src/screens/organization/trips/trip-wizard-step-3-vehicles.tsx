// SCR-ORG-07 Trip wizard step 3: the vehicles on the trip, within the plan's vehicle limit.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgSelect } from "../common/org-form";
import { OrgLink } from "../common/org-link";
import { TripWizardFrame } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgAlert, OrgButton, OrgCard, OrgError, OrgRow } from "../common/org-ui";
import {
  SeatLayoutPreview,
  WizardSaveAlert,
  limitText,
  useOrgPlan,
  useWizardStepSave,
  useWizardTrip,
} from "./trip-parts";

const CHOOSE = "";

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
  const { authStatus, locale, tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { limits } = useOrgPlan();
  const [rows, setRows] = useState<readonly TripVehicleRow[]>([]);
  const [chosenId, setChosenId] = useState(CHOOSE);
  const [rowsError, setRowsError] = useState<string | undefined>(undefined);
  const { error: saveError, run } = useWizardStepSave(tripId);

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
    if (!fleetQuery.data || !tripQuery.data) return;
    const fleet = fleetQuery.data.items;
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
  }, [fleetQuery.data, tripQuery.data, locale]);

  const vehicleLimit = limits?.vehiclesPerTrip ?? null;
  const atLimit = vehicleLimit !== null && rows.length >= vehicleLimit;
  const candidates = availableVehicles.filter(
    (candidate) => !rows.some((row) => row.id === candidate.id),
  );
  const nextCandidate = candidates.find((candidate) => candidate.id === chosenId);

  const handleAddVehicle = () => {
    if (!nextCandidate || atLimit) return;
    setRows((current) => [...current, nextCandidate]);
    setChosenId(CHOOSE);
    setRowsError(undefined);
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
    const vehicleIds = rows.map((row) => row.id);
    if (vehicleIds.length === 0) {
      setRowsError(t("screen.organization.trips.tripWizardStep3Vehicles.vehicleRequired"));
      return false;
    }
    setRowsError(undefined);
    return run((id) =>
      saveWizardStepMutation.mutateAsync({ tripId: id, step: "vehicles", vehicleIds }),
    );
  };

  const preview = rows[0];
  const signedIn = authStatus === "authenticated";

  return (
    <TripWizardFrame
      stepId="vehicles"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStepMutation.isPending}
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
      <WizardSaveAlert error={saveError} />
      {fleetQuery.isError ? <OrgError onRetry={() => void fleetQuery.refetch()} /> : null}
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
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
            loading={fleetQuery.isLoading || tripQuery.isLoading}
            empty={t("screen.organization.trips.tripWizardStep3Vehicles.noVehiclesYet")}
          />
          {rowsError ? (
            <p role="alert" className="m-0 text-sm leading-5 text-[var(--te-danger)]">
              {rowsError}
            </p>
          ) : null}
          <div className="flex flex-wrap items-end gap-3">
            <OrgSelect
              label={t("screen.organization.trips.tripWizardStep3Vehicles.chooseVehicle")}
              fieldClassName="min-w-[200px] flex-1"
              disabled={atLimit || candidates.length === 0}
              options={[
                {
                  value: CHOOSE,
                  label: t("screen.organization.trips.tripWizardStep3Vehicles.chooseVehicleOption"),
                },
                ...candidates.map((candidate) => ({
                  value: candidate.id,
                  label: t("screen.organization.trips.tripWizardStep3Vehicles.vehicleOption", {
                    plate: candidate.plate,
                    type: candidate.vehicleType,
                    n: candidate.seats,
                  }),
                })),
              ]}
              value={chosenId}
              onValueChange={setChosenId}
            />
            <OrgButton
              variant="secondary"
              disabled={!nextCandidate || atLimit}
              aria-describedby={
                atLimit || candidates.length === 0 ? "trip-vehicles-add-note" : undefined
              }
              onClick={handleAddVehicle}
            >
              {t("screen.organization.trips.tripWizardStep3Vehicles.addVehicle")}
            </OrgButton>
          </div>
          <div className="flex flex-col items-start gap-2">
            {signedIn && fleetQuery.isSuccess && (atLimit || candidates.length === 0) ? (
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
          {preview ? <SeatLayoutPreview layout={preview.layout} seatCount={preview.seats} /> : null}
        </OrgCard>
      </OrgRow>
    </TripWizardFrame>
  );
}
