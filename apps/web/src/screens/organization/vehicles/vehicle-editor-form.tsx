// The details form of SCR-ORG-17 Vehicle editor, with the remove and save actions under it.
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import { OrgAlert, OrgButton, OrgCard } from "../common/org-ui";

import { registrationOptions, vehicleTypeName, type RegistrationStatus } from "./vehicle-parts";

const REMOVE_HINT_ID = "vehicle-remove-hint";
const MIN_YEAR = 1990;
const MAX_YEAR = 2100;

export interface VehicleValues {
  vehicleTypeId: string;
  plateNumber: string;
  model: string;
  manufacturingYear: number;
  seatCount: number;
  registrationStatus: RegistrationStatus;
  photoUrls: string[];
  fileIds: string[];
}

interface EditedVehicle {
  vehicleTypeId: string;
  plateNumber: string;
  model: string;
  manufacturingYear: number;
  seatCount: number;
  registrationStatus: RegistrationStatus;
  photoUrls: readonly string[];
  activeBookingsCount: number;
}

interface VehicleTypeOption {
  id: string;
  nameEn: string;
  nameAr: string;
  seatCount: number;
}

interface VehicleFormProps {
  vehicle: EditedVehicle | null;
  types: readonly VehicleTypeOption[];
  locale: string;
  disabled: boolean;
  saveFailed: boolean;
  removeFailed: boolean;
  onSave: (values: VehicleValues) => void;
  onCancel: () => void;
  onRemove: () => void;
}

/** Base64 of a file, for `media.uploadFile`. */
async function toBase64(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

export function VehicleForm(props: VehicleFormProps) {
  const { vehicle, types, locale, disabled } = props;
  const firstType = types[0];
  const [typeId, setTypeId] = useState(vehicle?.vehicleTypeId ?? firstType?.id ?? "");
  const [plate, setPlate] = useState(vehicle?.plateNumber ?? "");
  const [model, setModel] = useState(vehicle?.model ?? "");
  const [year, setYear] = useState(String(vehicle?.manufacturingYear ?? new Date().getFullYear()));
  const [seats, setSeats] = useState(String(vehicle?.seatCount ?? firstType?.seatCount ?? ""));
  const [registration, setRegistration] = useState<RegistrationStatus>(
    vehicle?.registrationStatus ?? "pending_renewal",
  );
  const [photoUrls, setPhotoUrls] = useState<string[]>([...(vehicle?.photoUrls ?? [])]);
  const [fileIds, setFileIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const uploadMutation = useMutation(orpc.media.uploadFile.mutationOptions());

  const type = types.find((item) => item.id === typeId);
  const seatValue = Number.parseInt(seats, 10);
  const yearValue = Number.parseInt(year, 10);
  const seatMismatch = Boolean(type) && seatValue !== type?.seatCount;
  const errors = {
    plate:
      submitted && plate.trim().length < 2
        ? t("screen.organization.vehicles.vehicleEditorForm.plateRequired")
        : undefined,
    model:
      submitted && !model.trim()
        ? t("screen.organization.vehicles.vehicleEditorForm.modelRequired")
        : undefined,
    year:
      submitted && !(yearValue >= MIN_YEAR && yearValue <= MAX_YEAR)
        ? t("screen.organization.vehicles.vehicleEditorForm.yearInvalid", {
            min: MIN_YEAR,
            max: MAX_YEAR,
          })
        : undefined,
    type:
      submitted && !type
        ? t("screen.organization.vehicles.vehicleEditorForm.typeRequired")
        : undefined,
    seats:
      submitted && seatMismatch && type
        ? t("screen.organization.vehicles.vehicleEditorForm.seatCountMismatch", {
            n: type.seatCount,
            m: Number.isNaN(seatValue) ? seats : seatValue,
          })
        : undefined,
  };
  const invalid = Object.values(errors).some(Boolean);

  function handleTypeChange(value: string) {
    setTypeId(value);
    const next = types.find((item) => item.id === value);
    if (next) setSeats(String(next.seatCount));
  }

  async function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const mimeType =
      file.type === "image/png" || file.type === "image/webp" ? file.type : ("image/jpeg" as const);
    try {
      const res = await uploadMutation.mutateAsync({
        originalFilename: file.name,
        mimeType,
        contentBase64: await toBase64(file),
        purpose: "vehicle_photo",
      });
      setPhotoUrls((current) => [...current, res.file.url]);
      setFileIds((current) => [...current, res.file.id]);
    } catch {
      // The upload alert below reports the failure from the mutation state.
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const valid =
      plate.trim().length >= 2 &&
      model.trim() &&
      yearValue >= MIN_YEAR &&
      yearValue <= MAX_YEAR &&
      type &&
      !seatMismatch;
    if (!valid) return;
    props.onSave({
      vehicleTypeId: typeId,
      plateNumber: plate.trim(),
      model: model.trim(),
      manufacturingYear: yearValue,
      seatCount: seatValue,
      registrationStatus: registration,
      photoUrls,
      fileIds,
    });
  }

  const bookings = vehicle?.activeBookingsCount ?? 0;
  const typeOptions = [
    ...(type
      ? []
      : [{ value: "", label: t("screen.organization.vehicles.vehicleEditorForm.chooseType") }]),
    ...types.map((item) => ({ value: item.id, label: vehicleTypeName(item, locale) })),
  ];

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-[760px] flex-col gap-6">
      {(submitted && invalid) || props.saveFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.vehicles.vehicleEditorForm.notSavedTitle")}
        >
          {errors.seats && !props.saveFailed
            ? t("screen.organization.vehicles.vehicleEditorForm.fixSeatCount")
            : t("screen.organization.vehicles.vehicleEditorForm.notSavedBody")}
        </OrgAlert>
      ) : null}
      {props.removeFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.vehicles.vehicleEditorForm.notRemovedTitle")}
        >
          {t("screen.organization.vehicles.vehicleEditorForm.notRemovedBody")}
        </OrgAlert>
      ) : null}
      {uploadMutation.isError ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.vehicles.vehicleEditorForm.photoNotUploaded")}
        />
      ) : null}
      <OrgCard title={t("screen.organization.vehicles.vehicleEditorForm.vehicleDetails")}>
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <OrgInput
            label={t("screen.organization.vehicles.vehicleEditorForm.plateNumber")}
            value={plate}
            onChange={(event) => setPlate(event.target.value)}
            maxLength={32}
            dir="auto"
            error={errors.plate}
          />
          <OrgInput
            label={t("screen.organization.vehicles.vehicleEditorForm.model")}
            value={model}
            onChange={(event) => setModel(event.target.value)}
            maxLength={160}
            dir="auto"
            error={errors.model}
          />
          <OrgInput
            label={t("screen.organization.vehicles.vehicleEditorForm.year")}
            inputMode="numeric"
            value={year}
            onChange={(event) => setYear(event.target.value)}
            error={errors.year}
          />
          <OrgSelect
            label={t("screen.organization.vehicles.vehicleEditorForm.vehicleType")}
            options={typeOptions}
            value={typeId}
            onValueChange={handleTypeChange}
            error={errors.type}
          />
          <OrgInput
            label={t("screen.organization.vehicles.vehicleEditorForm.seatCount")}
            inputMode="numeric"
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
            error={errors.seats}
          />
          <OrgSelect
            label={t("screen.organization.vehicles.vehicleEditorForm.registrationStatus")}
            options={registrationOptions()}
            value={registration}
            onValueChange={(value) => setRegistration(value as RegistrationStatus)}
          />
          <OrgInput
            label={t("screen.organization.vehicles.vehicleEditorForm.vehiclePhoto")}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            fieldClassName="md:col-span-2"
            hint={t("screen.organization.vehicles.vehicleEditorForm.photosAttached", {
              n: photoUrls.length,
            })}
            disabled={disabled || uploadMutation.isPending}
            onChange={(event) => void handlePhoto(event)}
          />
        </div>
      </OrgCard>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {vehicle ? (
          <div className="flex flex-col items-start gap-1">
            <OrgButton
              variant="danger"
              disabled={disabled || bookings > 0}
              aria-describedby={bookings > 0 ? REMOVE_HINT_ID : undefined}
              onClick={props.onRemove}
            >
              {t("screen.organization.vehicles.vehicleEditorForm.removeVehicle")}
            </OrgButton>
            {bookings > 0 ? (
              <p id={REMOVE_HINT_ID} className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t("screen.organization.vehicles.vehicleEditorForm.removalBlocked", {
                  n: bookings,
                })}
              </p>
            ) : null}
          </div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-3">
          <OrgButton variant="secondary" onClick={props.onCancel}>
            {t("screen.organization.vehicles.vehicleEditorForm.cancel")}
          </OrgButton>
          <OrgButton type="submit" disabled={disabled || uploadMutation.isPending}>
            {t("screen.organization.vehicles.vehicleEditorForm.saveVehicle")}
          </OrgButton>
        </div>
      </div>
    </form>
  );
}
