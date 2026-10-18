import { useEffect, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { getSelectedVehicleId, OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function VehicleEditor() {
  const goTo = useOrgNavigate();
  const { status: authStatus, actor } = useAuth();
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState<string | null>(getSelectedVehicleId());
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2025");
  const [seatCount, setSeatCount] = useState("28");
  const [registrationStatus, setRegistrationStatus] = useState<
    "valid" | "pending_renewal" | "expired"
  >("valid");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const vehiclesQuery = useQuery({
    ...orpc.fleet.listVehicles.queryOptions({ input: {} }),
    enabled,
  });

  const typesQuery = useQuery({
    ...orpc.fleet.listVehicleTypes.queryOptions({ input: {} }),
    enabled,
  });

  useEffect(() => {
    if (typesQuery.data?.items[0]) {
      const defaultType = typesQuery.data.items[0];
      setVehicleTypeId((prev) => prev || defaultType.id);
      setSeatCount((prev) => (prev === "28" ? String(defaultType.seatCount) : prev));
    }
  }, [typesQuery.data]);

  useEffect(() => {
    if (vehiclesQuery.data) {
      const selectedId = getSelectedVehicleId();
      const targetVehicle =
        (selectedId ? vehiclesQuery.data.items.find((v) => v.id === selectedId) : undefined) ??
        vehiclesQuery.data.items[0];
      if (targetVehicle) {
        setVehicleId(targetVehicle.id);
        setVehicleTypeId(targetVehicle.vehicleTypeId);
        setPlate(targetVehicle.plateNumber);
        setModel(targetVehicle.model);
        setYear(String(targetVehicle.manufacturingYear));
        setSeatCount(String(targetVehicle.seatCount));
        setRegistrationStatus(targetVehicle.registrationStatus);
        setPhotoUrls([...targetVehicle.photoUrls]);
        setActiveBookingsCount(targetVehicle.activeBookingsCount);
      }
    }
  }, [vehiclesQuery.data]);

  const uploadFileMutation = useMutation(orpc.media.uploadFile.mutationOptions());

  const updateVehicleMutation = useMutation(
    orpc.fleet.updateVehicle.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
      },
    }),
  );

  const createVehicleMutation = useMutation(
    orpc.fleet.createVehicle.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
      },
    }),
  );

  const removeVehicleMutation = useMutation(
    orpc.fleet.removeVehicle.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
      },
    }),
  );

  async function handlePhotoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || authStatus !== "authenticated") return;
    setBusy(true);
    setErrorMsg(null);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = "";
      for (const byte of bytes) {
        binary += String.fromCharCode(byte);
      }
      const contentBase64 = btoa(binary);
      const mimeType =
        file.type === "image/png" || file.type === "image/webp"
          ? file.type
          : ("image/jpeg" as const);
      const res = await uploadFileMutation.mutateAsync({
        originalFilename: file.name,
        mimeType,
        contentBase64,
        purpose: "vehicle_photo",
      });
      setPhotoUrls((prev) => [...prev, res.file.url]);
      setUploadedFileIds((prev) => [...prev, res.file.id]);
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not upload vehicle photo.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (authStatus === "authenticated" && vehicleTypeId && plate.trim() && model.trim()) {
      setBusy(true);
      setErrorMsg(null);
      try {
        const parsedYear = Number.parseInt(year, 10) || 2025;
        const parsedSeats = Number.parseInt(seatCount, 10) || 1;
        if (vehicleId) {
          await updateVehicleMutation.mutateAsync({
            vehicleId,
            vehicleTypeId,
            plateNumber: plate.trim(),
            model: model.trim(),
            manufacturingYear: parsedYear,
            seatCount: parsedSeats,
            registrationStatus,
            photoUrls,
            fileIds: uploadedFileIds,
          });
        } else {
          await createVehicleMutation.mutateAsync({
            vehicleTypeId,
            plateNumber: plate.trim(),
            model: model.trim(),
            manufacturingYear: parsedYear,
            seatCount: parsedSeats,
            registrationStatus,
            photoUrls,
            fileIds: uploadedFileIds,
          });
        }
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not save vehicle.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    void goTo("vehicle-registry");
  }

  async function handleRemove() {
    setRemoveOpen(false);
    if (authStatus === "authenticated" && vehicleId) {
      setBusy(true);
      setErrorMsg(null);
      try {
        await removeVehicleMutation.mutateAsync({ vehicleId });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not remove vehicle.");
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
            label: t("screen.organization.vehicles.vehicleEditor.backToVehicles"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.vehicles.vehicleEditor.vehicleEditor")}
          actions={
            <TeButton disabled={busy} onClick={() => void handleSave()}>
              {t("screen.organization.vehicles.vehicleEditor.save")}
            </TeButton>
          }
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <OrgSection title={t("screen.organization.vehicles.vehicleEditor.vehicle")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.vehicles.vehicleEditor.plate")}
                placeholder={t("screen.organization.vehicles.vehicleEditor.platePlaceholder")}
                dir="auto"
                value={plate}
                onChange={(event) => setPlate(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.vehicles.vehicleEditor.model")}
                placeholder={t("screen.organization.vehicles.vehicleEditor.modelPlaceholder")}
                dir="auto"
                value={model}
                onChange={(event) => setModel(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.vehicles.vehicleEditor.year")}
                placeholder={t("screen.organization.vehicles.vehicleEditor.yearPlaceholder")}
                inputMode="numeric"
                value={year}
                onChange={(event) => setYear(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.vehicles.vehicleEditor.vehicleType")}
                placeholder={t("screen.organization.vehicles.vehicleEditor.vehicleTypePlaceholder")}
                value={vehicleTypeId}
                onChange={(event) => setVehicleTypeId(event.target.value)}
              />
              <TeInput
                label={t("screen.organization.vehicles.vehicleEditor.seatCount")}
                placeholder={t("screen.organization.vehicles.vehicleEditor.seatCountPlaceholder")}
                inputMode="numeric"
                value={seatCount}
                onChange={(event) => setSeatCount(event.target.value)}
                supportingText={t(
                  "screen.organization.vehicles.vehicleEditor.mustMatchTheSeatCount",
                )}
              />
              <TeInput
                label={t("screen.organization.vehicles.vehicleEditor.registrationStatus")}
                placeholder={t(
                  "screen.organization.vehicles.vehicleEditor.registrationStatusPlaceholder",
                )}
                value={registrationStatus}
                onChange={(event) =>
                  setRegistrationStatus(
                    (event.target.value as "valid" | "pending_renewal" | "expired") || "valid",
                  )
                }
              />
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <label className="te-caption">
                {t("screen.organization.vehicles.vehicleEditor.uploadVehiclePhoto")}{" "}
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 block text-sm"
                  onChange={(event) => void handlePhotoUpload(event)}
                />
              </label>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.vehicles.vehicleEditor.removeVehicle")}>
          <TeInlineAlert
            tone="info"
            title={t("screen.organization.vehicles.vehicleEditor.removalIsBlockedWhileBookings")}
          >
            {t("screen.organization.vehicles.vehicleEditor.confirmedBookingsCount", {
              count: activeBookingsCount,
            })}
          </TeInlineAlert>
          <div className="flex justify-start">
            <TeButton
              variant="ghost"
              disabled={busy || activeBookingsCount > 0}
              onClick={() => setRemoveOpen(true)}
            >
              {t("screen.organization.vehicles.vehicleEditor.removeVehicle2")}
            </TeButton>
          </div>
        </OrgSection>
        <TeDialog
          open={removeOpen}
          onOpenChange={setRemoveOpen}
          title={t("screen.organization.vehicles.vehicleEditor.removeThisVehicle")}
          description={t("screen.organization.vehicles.vehicleEditor.theVehicleLeavesTheRegistry")}
          primaryLabel={t("screen.organization.vehicles.vehicleEditor.removeVehiclePrimaryLabel")}
          onPrimary={() => void handleRemove()}
          secondaryLabel={t("screen.organization.vehicles.vehicleEditor.keepVehicle")}
          onSecondary={() => setRemoveOpen(false)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
