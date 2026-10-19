// SCR-ORG-16 Vehicles: the organization's vehicles and their seat counts.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgChips } from "../common/org-form";
import { OrgButtonLink, OrgLink } from "../common/org-link";
import { setSelectedVehicleId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { OrgEmpty, OrgError, OrgPage, OrgPageHeader } from "../common/org-ui";

import { NEW_VEHICLE_ID, RegistrationBadge, vehicleTypeName } from "./vehicle-parts";

type RegistrationStatus = "valid" | "pending_renewal" | "expired";

interface VehicleRow {
  id: string;
  plate: string;
  model: string;
  year: string;
  vehicleType: string;
  seats: string;
  registration: RegistrationStatus;
}

function columns(): readonly OrgColumn<VehicleRow>[] {
  return [
    {
      key: "plate",
      header: t("screen.organization.vehicles.vehicleRegistry.plate"),
      render: (row) => (
        <OrgLink
          slug="vehicle-editor"
          params={{ vehicleId: row.id }}
          onClick={() => setSelectedVehicleId(row.id)}
          className="text-[var(--te-ink)]"
        >
          {row.plate}
        </OrgLink>
      ),
    },
    { key: "model", header: t("screen.organization.vehicles.vehicleRegistry.model") },
    { key: "year", header: t("screen.organization.vehicles.vehicleRegistry.year") },
    { key: "vehicleType", header: t("screen.organization.vehicles.vehicleRegistry.vehicleType") },
    { key: "seats", header: t("screen.organization.vehicles.vehicleRegistry.seats") },
    {
      key: "registration",
      header: t("screen.organization.vehicles.vehicleRegistry.registration"),
      render: (row) => <RegistrationBadge status={row.registration} />,
    },
  ];
}

export function VehicleRegistry() {
  const { status: authStatus, actor, locale } = useAuth();
  const [filter, setFilter] = useState("all");
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const vehiclesQuery = useQuery({
    ...orpc.fleet.listVehicles.queryOptions({ input: {} }),
    enabled,
  });
  const typesQuery = useQuery({
    ...orpc.fleet.listVehicleTypes.queryOptions({ input: {} }),
    enabled,
  });

  const typesById = new Map((typesQuery.data?.items ?? []).map((type) => [type.id, type]));
  const rows: readonly VehicleRow[] =
    vehiclesQuery.data?.items.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plateNumber,
      model: vehicle.model,
      year: String(vehicle.manufacturingYear),
      vehicleType: vehicleTypeName(
        vehicle.vehicleType ?? typesById.get(vehicle.vehicleTypeId) ?? null,
        locale,
      ),
      seats: String(vehicle.seatCount),
      registration: vehicle.registrationStatus,
    })) ?? [];

  const visibleRows = rows.filter(
    (row) =>
      filter === "all" ||
      (filter === "registered" && row.registration === "valid") ||
      (filter === "pending" && row.registration !== "valid"),
  );

  const addVehicle = (
    <OrgButtonLink
      slug="vehicle-editor"
      params={{ vehicleId: NEW_VEHICLE_ID }}
      onClick={() => setSelectedVehicleId(null)}
    >
      {t("screen.organization.vehicles.vehicleRegistry.addVehicle")}
    </OrgButtonLink>
  );

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.vehicles.vehicleRegistry.title")}
        caption={t("screen.organization.vehicles.vehicleRegistry.caption")}
        actions={
          <>
            <OrgButtonLink slug="vehicle-types-and-seat-layout" variant="secondary">
              {t("screen.organization.vehicles.vehicleRegistry.vehicleTypes")}
            </OrgButtonLink>
            {addVehicle}
          </>
        }
      />
      <OrgChips
        label={t("screen.organization.vehicles.vehicleRegistry.filterByRegistration")}
        options={[
          { value: "all", label: t("screen.organization.vehicles.vehicleRegistry.all") },
          {
            value: "registered",
            label: t("screen.organization.vehicles.vehicleRegistry.registered"),
          },
          {
            value: "pending",
            label: t("screen.organization.vehicles.vehicleRegistry.pendingReview"),
          },
        ]}
        value={filter}
        onValueChange={setFilter}
      />
      {vehiclesQuery.isError ? (
        <OrgError onRetry={() => void vehiclesQuery.refetch()} />
      ) : (
        <OrgTable
          columns={columns()}
          rows={visibleRows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.vehicles.vehicleRegistry.title")}
          loading={vehiclesQuery.isLoading}
          empty={
            <OrgEmpty
              title={
                rows.length === 0
                  ? t("screen.organization.vehicles.vehicleRegistry.emptyTitle")
                  : t("screen.organization.vehicles.vehicleRegistry.noMatchTitle")
              }
              action={rows.length === 0 ? addVehicle : undefined}
            >
              {rows.length === 0
                ? t("screen.organization.vehicles.vehicleRegistry.emptyBody")
                : null}
            </OrgEmpty>
          }
        />
      )}
    </OrgPage>
  );
}
