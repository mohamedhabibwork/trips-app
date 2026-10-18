import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink, WorkspaceBackLink } from "../common/org-link";
import { setSelectedVehicleId, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface VehicleRow {
  id: string;
  plate: string;
  model: string;
  year: string;
  vehicleType: string;
  seats: string;
  registration: string;
}

const COLUMNS = (): readonly TeDataTableColumn<VehicleRow>[] => [
  {
    key: "plate",
    header: t("screen.organization.vehicles.vehicleRegistry.plate"),
    render: (row) => (
      <OrgLink slug="vehicle-editor" onClick={() => setSelectedVehicleId(row.id)}>
        {row.plate}
      </OrgLink>
    ),
  },
  { key: "model", header: t("screen.organization.vehicles.vehicleRegistry.model") },
  { key: "year", header: t("screen.organization.vehicles.vehicleRegistry.year") },
  { key: "vehicleType", header: t("screen.organization.vehicles.vehicleRegistry.vehicleType") },
  { key: "seats", header: t("screen.organization.vehicles.vehicleRegistry.seats"), align: "end" },
  {
    key: "registration",
    header: t("screen.organization.vehicles.vehicleRegistry.registration"),
    render: (row) => <StateBadge tone="neutral" icon="file" label={row.registration} />,
  },
];

export function VehicleRegistry() {
  const { status: authStatus, actor } = useAuth();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const vehiclesQuery = useQuery({
    ...orpc.fleet.listVehicles.queryOptions({ input: {} }),
    enabled,
  });

  const typesQuery = useQuery({
    ...orpc.fleet.listVehicleTypes.queryOptions({ input: {} }),
    enabled,
  });

  const rows: readonly VehicleRow[] =
    vehiclesQuery.data?.items.map((v) => ({
      id: v.id,
      plate: v.plateNumber,
      model: v.model,
      year: String(v.manufacturingYear),
      vehicleType: v.vehicleType?.nameEn ?? v.vehicleTypeId,
      seats: String(v.seatCount),
      registration: v.registrationStatus,
    })) ?? [];

  const filterOptions: readonly TeSelectOption[] = [
    {
      value: "all",
      label: t("screen.organization.vehicles.vehicleRegistry.allVehicleTypesLabel"),
    },
    ...(typesQuery.data?.items.map((item) => ({ value: item.nameEn, label: item.nameEn })) ?? []),
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const visibleRows = rows.filter(
    (row) =>
      (typeFilter === "all" || row.vehicleType === typeFilter) &&
      row.plate.toLowerCase().includes(normalizedQuery),
  );

  return (
    <StatePreview>
      <div className="flex flex-col gap-6">
        <WorkspaceBackLink />
        <TePageHeader
          title={t("screen.organization.vehicles.vehicleRegistry.vehicleRegistry")}
          actions={
            <div className="flex flex-wrap gap-3">
              <OrgButtonLink slug="vehicle-types-and-seat-layout" variant="secondary">
                {t("screen.organization.vehicles.vehicleRegistry.vehicleTypes")}
              </OrgButtonLink>
              <OrgButtonLink slug="vehicle-editor">
                {t("screen.organization.vehicles.vehicleRegistry.addVehicle")}
              </OrgButtonLink>
            </div>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TeSearchField
            label={t("screen.organization.vehicles.vehicleRegistry.searchByPlate")}
            value={query}
            onValueChange={setQuery}
            clearLabel={t("screen.organization.vehicles.vehicleRegistry.clearSearch")}
          />
          <TeSelect
            label={t("screen.organization.vehicles.vehicleRegistry.vehicleType2")}
            options={filterOptions}
            value={typeFilter}
            onValueChange={setTypeFilter}
          />
        </div>
        <TeDataTable
          columns={COLUMNS()}
          rows={visibleRows}
          getRowKey={(row) => row.id}
          caption={t("screen.organization.vehicles.vehicleRegistry.vehicles")}
          emptyTitle={t("screen.organization.vehicles.vehicleRegistry.noVehiclesYet")}
          emptyDescription={t("screen.organization.vehicles.vehicleRegistry.addAVehicleToUse")}
        />
      </div>
    </StatePreview>
  );
}
