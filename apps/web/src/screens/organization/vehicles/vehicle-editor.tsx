// SCR-ORG-17 Vehicle editor: one vehicle's details; `/business/vehicles/new` adds a vehicle.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, useOrgNavigate, useOrgParams } from "../common/org-link";
import { getSelectedVehicleId } from "../common/org-shared";
import { NO_VALUE, OrgEmpty, OrgError, OrgLoading, OrgPage, OrgPageHeader } from "../common/org-ui";

import { VehicleForm, type VehicleValues } from "./vehicle-editor-form";
import { NEW_VEHICLE_ID } from "./vehicle-parts";

export function VehicleEditor() {
  const goTo = useOrgNavigate();
  const { status: authStatus, actor, locale } = useAuth();
  const queryClient = useQueryClient();
  const vehicleIdParam = useOrgParams().vehicleId;
  const isNew = vehicleIdParam === NEW_VEHICLE_ID;
  const requestedId = isNew ? null : (vehicleIdParam ?? getSelectedVehicleId());
  const [removeOpen, setRemoveOpen] = useState(false);
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const vehiclesQuery = useQuery({
    ...orpc.fleet.listVehicles.queryOptions({ input: {} }),
    enabled,
  });
  const typesQuery = useQuery({
    ...orpc.fleet.listVehicleTypes.queryOptions({ input: {} }),
    enabled,
  });

  const vehicles = vehiclesQuery.data?.items ?? [];
  const vehicle = isNew
    ? null
    : ((requestedId ? vehicles.find((item) => item.id === requestedId) : vehicles[0]) ?? null);

  const creating = isNew || (vehiclesQuery.isSuccess && !vehicle && !requestedId);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
  };
  const toRegistry = () => {
    invalidate();
    void goTo("vehicle-registry");
  };
  const createVehicleMutation = useMutation(
    orpc.fleet.createVehicle.mutationOptions({ onSuccess: toRegistry }),
  );
  const updateVehicleMutation = useMutation(
    orpc.fleet.updateVehicle.mutationOptions({ onSuccess: toRegistry }),
  );
  const removeVehicleMutation = useMutation(
    orpc.fleet.removeVehicle.mutationOptions({ onSuccess: toRegistry }),
  );

  const busy =
    createVehicleMutation.isPending ||
    updateVehicleMutation.isPending ||
    removeVehicleMutation.isPending;
  const saveFailed = createVehicleMutation.isError || updateVehicleMutation.isError;

  function handleSave(values: VehicleValues) {
    if (!enabled) return;
    if (vehicle) {
      updateVehicleMutation.mutate({ vehicleId: vehicle.id, ...values });
      return;
    }
    if (creating) createVehicleMutation.mutate(values);
  }

  function handleRemove() {
    setRemoveOpen(false);
    if (!enabled || !vehicle) return;
    removeVehicleMutation.mutate({ vehicleId: vehicle.id });
  }

  const title = creating
    ? t("screen.organization.vehicles.vehicleEditor.addTitle")
    : t("screen.organization.vehicles.vehicleEditor.editTitle");
  const caption = vehicle
    ? t("screen.organization.vehicles.vehicleEditor.plateAndModel", {
        plate: vehicle.plateNumber,
        model: vehicle.model,
      })
    : creating
      ? t("screen.organization.vehicles.vehicleEditor.addCaption")
      : NO_VALUE;

  const loading = vehiclesQuery.isLoading || typesQuery.isLoading;
  const notFound = !isNew && vehiclesQuery.isSuccess && !vehicle && Boolean(requestedId);

  return (
    <OrgPage>
      <OrgPageHeader title={title} caption={caption} />
      {vehiclesQuery.isError || typesQuery.isError ? (
        <OrgError
          onRetry={() => {
            void vehiclesQuery.refetch();
            void typesQuery.refetch();
          }}
        />
      ) : null}
      {loading ? <OrgLoading rows={6} /> : null}
      {notFound ? (
        <OrgEmpty
          title={t("screen.organization.vehicles.vehicleEditor.notFoundTitle")}
          action={
            <OrgButtonLink slug="vehicle-registry" variant="secondary">
              {t("screen.organization.vehicles.vehicleEditor.backToVehicles")}
            </OrgButtonLink>
          }
        >
          {t("screen.organization.vehicles.vehicleEditor.notFoundBody")}
        </OrgEmpty>
      ) : null}
      {loading || notFound || vehiclesQuery.isError || typesQuery.isError ? null : (
        <VehicleForm
          key={`${vehicle?.id ?? NEW_VEHICLE_ID}-${vehiclesQuery.dataUpdatedAt}`}
          vehicle={vehicle}
          types={typesQuery.data?.items ?? []}
          locale={locale}
          disabled={!enabled || busy}
          saveFailed={saveFailed}
          removeFailed={removeVehicleMutation.isError}
          onSave={handleSave}
          onCancel={() => void goTo("vehicle-registry")}
          onRemove={() => setRemoveOpen(true)}
        />
      )}
      <TeDialog
        open={removeOpen}
        onOpenChange={setRemoveOpen}
        title={t("screen.organization.vehicles.vehicleEditor.removeThisVehicle")}
        description={t("screen.organization.vehicles.vehicleEditor.removeDialogBody")}
        primaryLabel={t("screen.organization.vehicles.vehicleEditor.removeVehicle")}
        onPrimary={handleRemove}
        secondaryLabel={t("screen.organization.vehicles.vehicleEditor.keepVehicle")}
        onSecondary={() => setRemoveOpen(false)}
        tone="danger"
      />
    </OrgPage>
  );
}
