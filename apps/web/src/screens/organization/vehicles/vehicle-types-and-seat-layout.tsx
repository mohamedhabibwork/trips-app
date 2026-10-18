import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSeatMap, type TeSeatRow } from "@trips-app/ui/components/te-seat-map";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

interface SeatLayoutCell {
  row: number;
  col: number;
  type: "seat" | "aisle" | "driver" | "moderator" | "door" | "empty";
  seatLabel?: string | null;
  isAccessible?: boolean;
  isPriority?: boolean;
}

interface SeatLayoutConfig {
  rows: number;
  cols: number;
  cells: SeatLayoutCell[];
}

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const DEFAULT_LAYOUT_ROWS: readonly TeSeatRow[] = [
  {
    id: "row-1",
    seats: [
      { id: "1A", label: "1A", state: "available" },
      { id: "1B", label: "1B", state: "available" },
      { id: "1C", label: "1C", state: "available" },
      { id: "1D", label: "1D", state: "available" },
    ],
  },
  {
    id: "row-2",
    seats: [
      { id: "2A", label: "2A", state: "available" },
      { id: "2B", label: "2B", state: "available" },
      { id: "2C", label: "2C", state: "available" },
      { id: "2D", label: "2D", state: "available" },
    ],
  },
];

function buildSeatLayoutConfig(seatCount: number): SeatLayoutConfig {
  const cols = 4;
  const rows = Math.max(1, Math.ceil(seatCount / cols));
  const colLetters = ["A", "B", "C", "D"];
  const cells: SeatLayoutCell[] = [];
  let remaining = seatCount;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      if (remaining > 0) {
        const label = `${r + 1}${colLetters[c] ?? String(c + 1)}`;
        cells.push({ row: r, col: c, type: "seat", seatLabel: label });
        remaining -= 1;
      } else {
        cells.push({ row: r, col: c, type: "empty" });
      }
    }
  }

  return { rows, cols, cells };
}

function layoutConfigToSeatRows(layout: {
  rows: number;
  cols: number;
  cells: readonly SeatLayoutCell[];
}): readonly TeSeatRow[] {
  const rows: TeSeatRow[] = [];
  for (let r = 0; r < layout.rows; r += 1) {
    const rowCells = layout.cells
      .filter((cell) => cell.row === r && cell.type === "seat")
      .sort((a, b) => a.col - b.col);
    if (rowCells.length > 0) {
      rows.push({
        id: `row-${r + 1}`,
        seats: rowCells.map((cell) => ({
          id: cell.seatLabel ?? `${r + 1}-${cell.col + 1}`,
          label: cell.seatLabel ?? `${r + 1}-${cell.col + 1}`,
          state: "available" as const,
        })),
      });
    }
  }
  return rows.length > 0 ? rows : DEFAULT_LAYOUT_ROWS;
}

export function VehicleTypesAndSeatLayout() {
  const goTo = useOrgNavigate();
  const { status: authStatus, actor } = useAuth();
  const queryClient = useQueryClient();
  const [vehicleTypeId, setVehicleTypeId] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [seatCount, setSeatCount] = useState("8");
  const [layoutRows, setLayoutRows] = useState<readonly TeSeatRow[]>(DEFAULT_LAYOUT_ROWS);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const vehicleTypesQuery = useQuery({
    ...orpc.fleet.listVehicleTypes.queryOptions({ input: {} }),
    enabled,
  });

  useEffect(() => {
    if (vehicleTypesQuery.data) {
      const res = vehicleTypesQuery.data;
      const orgOwned = res.items.find((t) => t.scope === "organization") ?? res.items[0];
      if (orgOwned) {
        if (orgOwned.scope === "organization") {
          setVehicleTypeId(orgOwned.id);
        }
        setNameEn(orgOwned.nameEn);
        setSeatCount(String(orgOwned.seatCount));
        setLayoutRows(layoutConfigToSeatRows(orgOwned.seatLayout));
      }
    }
  }, [vehicleTypesQuery.data]);

  const updateVehicleTypeMutation = useMutation(
    orpc.fleet.updateVehicleType.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
      },
    }),
  );

  const createVehicleTypeMutation = useMutation(
    orpc.fleet.createVehicleType.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
      },
    }),
  );

  async function handleArchive() {
    if (authStatus === "authenticated" && vehicleTypeId) {
      setBusy(true);
      setErrorMsg(null);
      try {
        await updateVehicleTypeMutation.mutateAsync({
          vehicleTypeId,
          status: "archived",
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not archive vehicle type.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    void goTo("vehicle-registry");
  }

  async function handleSave() {
    if (authStatus === "authenticated" && nameEn.trim()) {
      setBusy(true);
      setErrorMsg(null);
      try {
        const count = Math.max(1, Number.parseInt(seatCount, 10) || 8);
        const seatLayout = buildSeatLayoutConfig(count);
        if (vehicleTypeId) {
          await updateVehicleTypeMutation.mutateAsync({
            vehicleTypeId,
            nameEn: nameEn.trim(),
            nameAr: nameEn.trim(),
            seatCount: count,
            seatLayout,
          });
        } else {
          await createVehicleTypeMutation.mutateAsync({
            categoryLookupCode: "COASTER_MINIBUS_28",
            nameEn: nameEn.trim(),
            nameAr: nameEn.trim(),
            seatCount: count,
            seatLayout,
          });
        }
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not save vehicle type.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    void goTo("vehicle-registry");
  }

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "vehicle-registry",
            label: t("screen.organization.vehicles.vehicleTypesAndSeatLayout.backToVehicles"),
          }}
        />
        <TePageHeader
          title={t(
            "screen.organization.vehicles.vehicleTypesAndSeatLayout.vehicleTypesAndSeatLayout",
          )}
          actions={
            <>
              <TeButton variant="ghost" disabled={busy} onClick={() => void handleArchive()}>
                {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.archiveType")}
              </TeButton>
              <TeButton disabled={busy} onClick={() => void handleSave()}>
                {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.save")}
              </TeButton>
            </>
          }
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <OrgSection title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.type")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.name")}
                placeholder={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.typeName")}
                dir="auto"
                value={nameEn}
                onChange={(event) => setNameEn(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCount")}
                placeholder={t(
                  "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCountPlaceholder",
                )}
                inputMode="numeric"
                value={seatCount}
                onChange={(event) => {
                  const val = event.target.value;
                  setSeatCount(val);
                  const parsed = Number.parseInt(val, 10);
                  if (parsed >= 1 && parsed <= 120) {
                    setLayoutRows(layoutConfigToSeatRows(buildSeatLayoutConfig(parsed)));
                  }
                }}
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayout")}>
          <TeCard>
            <TeSeatMap
              rows={layoutRows}
              ariaLabel={t(
                "screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayoutOfThisVehicle",
              )}
            />
          </TeCard>
          <p className="te-caption">
            {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLabelsAppearOnThe")}
          </p>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
