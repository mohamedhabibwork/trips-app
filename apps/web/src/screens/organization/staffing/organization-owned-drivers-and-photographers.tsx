// SCR-ORG-20 Organization-owned staff: drivers and photographers the organization employs.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { lookupTypeByCodeQueryOptions, toLookupSelectOptions } from "@/utils/lookups";
import { orpc } from "@/utils/orpc";

import { OrgChoice, OrgInput, OrgSelect } from "../common/org-form";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";

type OrgSupplierRole = "org_driver" | "org_photographer";

interface StaffMemberRow {
  id: string;
  supplierRole: OrgSupplierRole;
  name: string;
  active: boolean;
}

function roleLabel(role: OrgSupplierRole): string {
  return role === "org_driver"
    ? t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.driver")
    : t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.photographer");
}

function buildColumns(
  onRemove: (row: StaffMemberRow) => void,
): readonly OrgColumn<StaffMemberRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.name"),
      render: (row) => <b>{row.name}</b>,
    },
    {
      key: "type",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.type"),
      render: (row) => roleLabel(row.supplierRole),
    },
    {
      key: "status",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.status"),
      render: (row) =>
        row.active ? (
          <OrgBadge tone="ok">
            {t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.active")}
          </OrgBadge>
        ) : (
          <OrgBadge tone="neu">
            {t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.inactive")}
          </OrgBadge>
        ),
    },
    {
      key: "vehicles",
      header: t(
        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.vehicleAssignments",
      ),
      render: () => NO_VALUE,
    },
    {
      key: "action",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.action"),
      render: (row) => (
        <OrgButton variant="text" onClick={() => onRemove(row)}>
          {t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove")}
        </OrgButton>
      ),
    },
  ];
}

interface AddStaffFormProps {
  busy: boolean;
  locale: "ar" | "en";
  onSubmit: (values: AddStaffValues) => void;
  onCancel: () => void;
}

interface AddStaffValues {
  supplierRole: OrgSupplierRole;
  fullName: string;
  phone: string;
  email: string;
  nationalId: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: string;
  labTestConsentSigned: boolean;
  cameraBody: string;
}

const EMPTY_STAFF: AddStaffValues = {
  supplierRole: "org_driver",
  fullName: "",
  phone: "",
  email: "",
  nationalId: "",
  licenseNumber: "",
  licenseCategory: "",
  licenseExpiry: "",
  labTestConsentSigned: false,
  cameraBody: "",
};

const K = "screen.organization.staffing.organizationOwnedDriversAndPhotographers";

/** Lookup items as select options, with a first "choose" option. */
function lookupOptions(
  items: Parameters<typeof toLookupSelectOptions>[0],
  locale: "ar" | "en",
): { value: string; label: string }[] {
  return [
    { value: "", label: t(`${K}.chooseOption`) },
    ...toLookupSelectOptions(items, locale).map((option) => ({
      value: option.code,
      label: option.label,
    })),
  ];
}

function AddStaffForm({ busy, locale, onSubmit, onCancel }: AddStaffFormProps) {
  const [values, setValues] = useState<AddStaffValues>(EMPTY_STAFF);
  const update = (patch: Partial<AddStaffValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const isDriver = values.supplierRole === "org_driver";
  const licenseCategories = useQuery(lookupTypeByCodeQueryOptions("DRIVER_LICENSE_CATEGORY"));
  const cameraBodies = useQuery(lookupTypeByCodeQueryOptions("CAMERA_BODY"));
  // The API requires a name, a phone and a national id; the rest is sent only when entered.
  const canSubmit =
    !busy &&
    values.fullName.trim().length >= 2 &&
    values.phone.trim().length >= 8 &&
    values.nationalId.trim().length >= 6;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) onSubmit(values);
  };

  return (
    <OrgCard title={t(`${K}.addDriverOrPhotographer`)}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <OrgSelect
            label={t(`${K}.type`)}
            options={[
              { value: "org_driver", label: roleLabel("org_driver") },
              { value: "org_photographer", label: roleLabel("org_photographer") },
            ]}
            value={values.supplierRole}
            onValueChange={(value) =>
              update({
                supplierRole: value === "org_photographer" ? "org_photographer" : "org_driver",
              })
            }
          />
          <OrgInput
            label={t(`${K}.fullName`)}
            value={values.fullName}
            onChange={(event) => update({ fullName: event.target.value })}
            required
          />
          <OrgInput
            label={t(`${K}.phone`)}
            type="tel"
            value={values.phone}
            onChange={(event) => update({ phone: event.target.value })}
            required
          />
          <OrgInput
            label={t(`${K}.emailOptional`)}
            type="email"
            value={values.email}
            onChange={(event) => update({ email: event.target.value })}
          />
          <OrgInput
            label={t(`${K}.nationalId`)}
            inputMode="numeric"
            autoComplete="off"
            value={values.nationalId}
            onChange={(event) => update({ nationalId: event.target.value })}
            required
          />
          {isDriver ? (
            <>
              <OrgInput
                label={t(`${K}.licenseNumber`)}
                value={values.licenseNumber}
                onChange={(event) => update({ licenseNumber: event.target.value })}
              />
              <OrgSelect
                label={t(`${K}.licenseCategory`)}
                options={lookupOptions(licenseCategories.data?.lookupType?.items, locale)}
                value={values.licenseCategory}
                onValueChange={(value) => update({ licenseCategory: value })}
              />
              <OrgInput
                label={t(`${K}.licenseExpiry`)}
                type="date"
                value={values.licenseExpiry}
                onChange={(event) => update({ licenseExpiry: event.target.value })}
              />
              <OrgChoice
                type="checkbox"
                checked={values.labTestConsentSigned}
                onChange={(event) => update({ labTestConsentSigned: event.target.checked })}
              >
                {t(`${K}.labTestConsent`)}
              </OrgChoice>
            </>
          ) : (
            <OrgSelect
              label={t(`${K}.cameraBody`)}
              options={lookupOptions(cameraBodies.data?.lookupType?.items, locale)}
              value={values.cameraBody}
              onValueChange={(value) => update({ cameraBody: value })}
            />
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          <OrgButton type="submit" disabled={!canSubmit}>
            {busy ? t(`${K}.saving`) : t(`${K}.saveStaffMember`)}
          </OrgButton>
          <OrgButton variant="secondary" onClick={onCancel}>
            {t(`${K}.cancel`)}
          </OrgButton>
        </div>
      </form>
    </OrgCard>
  );
}

export function OrganizationOwnedDriversAndPhotographers() {
  const { status: authStatus, actor, locale } = useAuth();
  const queryClient = useQueryClient();
  const [removeTarget, setRemoveTarget] = useState<StaffMemberRow | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);

  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const suppliersQuery = useQuery({
    ...orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
    enabled,
  });

  const rows: readonly StaffMemberRow[] =
    suppliersQuery.data?.suppliers.map((supplier) => ({
      id: supplier.supplierAccountId,
      supplierRole: supplier.supplierRole,
      name: supplier.fullName,
      active: supplier.status === "active",
    })) ?? [];
  const loaded = suppliersQuery.isSuccess;
  const driverCount = rows.filter((row) => row.supplierRole === "org_driver").length;
  const photographerCount = rows.length - driverCount;

  const onboardMutation = useMutation(
    orpc.onboarding.onboardOrganizationSupplier.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const removeMutation = useMutation(
    orpc.onboarding.removeOrganizationSupplier.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  async function handleAdd(values: AddStaffValues) {
    setActionFailed(false);
    const common = {
      fullName: values.fullName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || null,
      nationalId: values.nationalId.trim(),
    };
    try {
      if (values.supplierRole === "org_driver") {
        await onboardMutation.mutateAsync({
          ...common,
          supplierRole: "org_driver",
          licenseNumber: values.licenseNumber.trim() || undefined,
          licenseCategory: values.licenseCategory || undefined,
          licenseExpiry: values.licenseExpiry
            ? new Date(`${values.licenseExpiry}T00:00:00.000Z`).toISOString()
            : undefined,
          labTestConsentSigned: values.labTestConsentSigned,
        });
      } else {
        await onboardMutation.mutateAsync({
          ...common,
          supplierRole: "org_photographer",
          cameraBodies: values.cameraBody ? [values.cameraBody] : undefined,
        });
      }
      setAddFormOpen(false);
    } catch {
      setActionFailed(true);
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    const target = removeTarget;
    setRemoveTarget(null);
    setActionFailed(false);
    try {
      await removeMutation.mutateAsync({
        supplierAccountId: target.id,
        supplierRole: target.supplierRole,
      });
    } catch {
      setActionFailed(true);
    }
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.title")}
        caption={t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.caption")}
        actions={
          <OrgButton onClick={() => setAddFormOpen((open) => !open)} aria-expanded={addFormOpen}>
            {t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer",
            )}
          </OrgButton>
        }
      />
      {actionFailed ? (
        <OrgAlert
          tone="err"
          title={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailed",
          )}
        >
          {t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailedBody",
          )}
        </OrgAlert>
      ) : null}
      {addFormOpen ? (
        <AddStaffForm
          busy={onboardMutation.isPending}
          locale={locale === "en" ? "en" : "ar"}
          onSubmit={(values) => void handleAdd(values)}
          onCancel={() => setAddFormOpen(false)}
        />
      ) : null}
      <OrgKpiRow>
        <OrgKpi
          label={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDrivers",
          )}
          value={loaded ? String(driverCount) : NO_VALUE}
        />
        <OrgKpi
          label={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedPhotographers",
          )}
          value={loaded ? String(photographerCount) : NO_VALUE}
        />
      </OrgKpiRow>
      {suppliersQuery.isError ? <OrgError onRetry={() => void suppliersQuery.refetch()} /> : null}
      <OrgTable
        columns={buildColumns(setRemoveTarget)}
        rows={rows}
        rowKey={(row) => `${row.id}-${row.supplierRole}`}
        caption={t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.tableCaption",
        )}
        loading={suppliersQuery.isLoading}
        empty={
          suppliersQuery.isError ? undefined : (
            <OrgEmpty
              title={t(
                "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emptyTitle",
              )}
            >
              {t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.emptyBody")}
            </OrgEmpty>
          )
        }
      />
      <OrgAlert
        tone="info"
        title={t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.assignmentsAcceptedAutomatically",
        )}
      >
        {t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removingChangesFutureOnly",
        )}
      </OrgAlert>
      <TeDialog
        open={removeTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
        title={t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removeThisStaffMember",
        )}
        description={t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removingChangesFutureOnly",
        )}
        primaryLabel={t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove",
        )}
        onPrimary={() => void handleConfirmRemove()}
        secondaryLabel={t(
          "screen.organization.staffing.organizationOwnedDriversAndPhotographers.keep",
        )}
        onSecondary={() => setRemoveTarget(null)}
        tone="danger"
      />
    </OrgPage>
  );
}
