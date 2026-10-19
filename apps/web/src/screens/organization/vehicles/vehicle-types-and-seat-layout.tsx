// SCR-ORG-18 Vehicle type: a reusable seat layout the organization's vehicles use.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { lookupTypeByCodeQueryOptions, toLookupSelectOptions } from "@/utils/lookups";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";

import {
  SeatLayoutGrid,
  buildSeatLayout,
  layoutSeatCount,
  type SeatLayoutConfig,
} from "./seat-layout";
import { vehicleTypeName } from "./vehicle-parts";

const FORM_ID = "vehicle-type-form";
const MAX_SEATS = 120;

type TypeStatus = "active" | "archived";

interface EditedType {
  id: string;
  scope: "platform" | "organization";
  nameEn: string;
  nameAr: string;
  seatCount: number;
  seatLayout: SeatLayoutConfig;
  status: TypeStatus;
}

/** The API takes a mutable cell list; the page keeps layouts readonly. */
interface ApiSeatLayout {
  rows: number;
  cols: number;
  cells: SeatLayoutConfig["cells"][number][];
}

function toApiSeatLayout(layout: SeatLayoutConfig): ApiSeatLayout {
  return { rows: layout.rows, cols: layout.cols, cells: [...layout.cells] };
}

interface TypeCreatePayload {
  categoryLookupCode: string;
  nameEn: string;
  nameAr: string;
  seatCount: number;
  seatLayout: ApiSeatLayout;
  descriptionEn: string | null;
}

interface TypeUpdatePayload extends Partial<
  Omit<TypeCreatePayload, "categoryLookupCode" | "descriptionEn">
> {
  vehicleTypeId: string;
  status: TypeStatus;
}

export interface TypeValues {
  /** VEHICLE_TYPE lookup code; chosen when the type is created and fixed afterwards. */
  categoryLookupCode: string;
  name: string;
  seatCount: number;
  seatLayout: SeatLayoutConfig;
  status: TypeStatus;
}

interface TypeFormProps {
  type: EditedType | null;
  locale: string;
  disabled: boolean;
  onSave: (values: TypeValues) => void;
}

function TypeForm({ type, locale, disabled, onSave }: TypeFormProps) {
  const [name, setName] = useState(type ? vehicleTypeName(type, locale) : "");
  const [seats, setSeats] = useState(String(type?.seatCount ?? ""));
  const [status, setStatus] = useState<TypeStatus>(type?.status ?? "active");
  const [category, setCategory] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const categoriesQuery = useQuery({
    ...lookupTypeByCodeQueryOptions("VEHICLE_TYPE"),
    enabled: !type,
  });
  const categoryOptions = [
    {
      value: "",
      label: t("screen.organization.vehicles.vehicleTypesAndSeatLayout.chooseCategory"),
    },
    ...toLookupSelectOptions(
      categoriesQuery.data?.lookupType?.items,
      locale === "en" ? "en" : "ar",
    ).map((option) => ({ value: option.code, label: option.label })),
  ];
  const categoryMissing = !type && !category;

  const seatValue = Number.parseInt(seats, 10);
  const seatsValid = seatValue >= 1 && seatValue <= MAX_SEATS;
  const layout =
    type && seatValue === layoutSeatCount(type.seatLayout)
      ? type.seatLayout
      : buildSeatLayout(seatsValid ? seatValue : 0);

  function submit(nextStatus: TypeStatus) {
    setSubmitted(true);
    if (!name.trim() || !seatsValid || categoryMissing) return;
    onSave({
      categoryLookupCode: category,
      name: name.trim(),
      seatCount: seatValue,
      seatLayout: layout,
      status: nextStatus,
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(status);
  }

  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="contents">
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.typeDetails")}
          className="flex-1"
        >
          <OrgInput
            label={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.typeName")}
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={160}
            dir="auto"
            error={
              submitted && !name.trim()
                ? t("screen.organization.vehicles.vehicleTypesAndSeatLayout.nameRequired")
                : undefined
            }
          />
          <OrgInput
            label={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCount")}
            inputMode="numeric"
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
            error={
              submitted && !seatsValid
                ? t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatCountInvalid", {
                    max: MAX_SEATS,
                  })
                : undefined
            }
          />
          {type ? null : (
            <OrgSelect
              label={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.category")}
              options={categoryOptions}
              value={category}
              required
              error={
                submitted && categoryMissing
                  ? t("screen.organization.vehicles.vehicleTypesAndSeatLayout.categoryRequired")
                  : undefined
              }
              onValueChange={setCategory}
            />
          )}
          <OrgSelect
            label={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.status")}
            options={[
              {
                value: "active",
                label: t("screen.organization.vehicles.vehicleTypesAndSeatLayout.active"),
              },
              {
                value: "archived",
                label: t("screen.organization.vehicles.vehicleTypesAndSeatLayout.archived"),
              },
            ]}
            value={status}
            onValueChange={(value) => setStatus(value as TypeStatus)}
            disabled={!type}
          />
          <div className="mt-2">
            <OrgButton
              variant="secondary"
              disabled={disabled || !type || type.status === "archived"}
              onClick={() => submit("archived")}
            >
              {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.archiveType")}
            </OrgButton>
          </div>
        </OrgCard>
        <OrgCard
          title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayout")}
          className="lg:flex-[2]"
        >
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.seatLayoutCaption")}
          </p>
          <SeatLayoutGrid layout={layout} />
        </OrgCard>
      </OrgRow>
    </form>
  );
}

export function VehicleTypesAndSeatLayout() {
  const { status: authStatus, actor, locale } = useAuth();
  const queryClient = useQueryClient();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const typesQuery = useQuery({
    ...orpc.fleet.listVehicleTypes.queryOptions({ input: {} }),
    enabled,
  });
  const items = typesQuery.data?.items ?? [];
  const orgType = items.find((item) => item.scope === "organization") ?? null;

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.fleet.key() });
  };
  const updateMutation = useMutation(
    orpc.fleet.updateVehicleType.mutationOptions({ onSuccess: invalidate }),
  );
  const createMutation = useMutation(
    orpc.fleet.createVehicleType.mutationOptions({ onSuccess: invalidate }),
  );
  function handleSave(values: TypeValues) {
    if (!enabled) return;
    if (orgType) {
      // The generated input types of these two procedures currently lose their picked columns
      // (drizzle-zod on vehicle_types); the server schemas accept these fields, so the payloads
      // are built as typed values and passed without an object-literal excess-property check.
      const update: TypeUpdatePayload = {
        vehicleTypeId: orgType.id,
        ...(locale === "ar" ? { nameAr: values.name } : { nameEn: values.name }),
        seatCount: values.seatCount,
        seatLayout: toApiSeatLayout(values.seatLayout),
        status: values.status,
      };
      updateMutation.mutate(update);
      return;
    }
    const create: TypeCreatePayload = {
      categoryLookupCode: values.categoryLookupCode,
      nameEn: values.name,
      nameAr: values.name,
      seatCount: values.seatCount,
      seatLayout: toApiSeatLayout(values.seatLayout),
      descriptionEn: null,
    };
    createMutation.mutate(create);
  }

  const busy = updateMutation.isPending || createMutation.isPending;
  const failed = updateMutation.isError || createMutation.isError;
  const saved = updateMutation.isSuccess || createMutation.isSuccess;
  const typeName = orgType ? vehicleTypeName(orgType, locale) : NO_VALUE;

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.title")}
        caption={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.caption", {
          name: typeName,
        })}
        actions={
          <OrgButton type="submit" form={FORM_ID} disabled={!enabled || busy}>
            {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.saveType")}
          </OrgButton>
        }
      />
      <OrgAlert tone="info">
        {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.archivedNote")}
      </OrgAlert>
      {failed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.notSavedTitle")}
        >
          {t("screen.organization.vehicles.vehicleTypesAndSeatLayout.notSavedBody")}
        </OrgAlert>
      ) : null}
      {saved && !failed ? (
        <OrgAlert
          tone="ok"
          title={t("screen.organization.vehicles.vehicleTypesAndSeatLayout.saved")}
        />
      ) : null}
      {typesQuery.isError ? <OrgError onRetry={() => void typesQuery.refetch()} /> : null}
      {typesQuery.isLoading ? <OrgLoading rows={6} /> : null}
      {typesQuery.isLoading || typesQuery.isError ? null : (
        <TypeForm
          key={`${orgType?.id ?? "new"}-${typesQuery.dataUpdatedAt}`}
          type={orgType}
          locale={locale}
          disabled={!enabled || busy}
          onSave={handleSave}
        />
      )}
    </OrgPage>
  );
}
