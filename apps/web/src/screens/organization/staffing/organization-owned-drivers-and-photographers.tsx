// SCR-ORG-20 Organization-owned staff: drivers and photographers the organization employs.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
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

const DAY_MS = 24 * 60 * 60 * 1000;

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
  onSubmit: (values: AddStaffValues) => void;
  onCancel: () => void;
}

interface AddStaffValues {
  supplierRole: OrgSupplierRole;
  fullName: string;
  phone: string;
  email: string;
  licenseOrCamera: string;
}

function AddStaffForm({ busy, onSubmit, onCancel }: AddStaffFormProps) {
  const [values, setValues] = useState<AddStaffValues>({
    supplierRole: "org_driver",
    fullName: "",
    phone: "",
    email: "",
    licenseOrCamera: "",
  });
  const update = (patch: Partial<AddStaffValues>) => setValues((prev) => ({ ...prev, ...patch }));
  const canSubmit = !busy && values.fullName.trim() !== "" && values.phone.trim() !== "";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit) onSubmit(values);
  };

  return (
    <OrgCard
      title={t(
        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer",
      )}
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <OrgSelect
            label={t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.type")}
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
            label={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.fullName",
            )}
            value={values.fullName}
            onChange={(event) => update({ fullName: event.target.value })}
            required
          />
          <OrgInput
            label={t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.phone")}
            type="tel"
            value={values.phone}
            onChange={(event) => update({ phone: event.target.value })}
            required
          />
          <OrgInput
            label={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emailOptional",
            )}
            type="email"
            value={values.email}
            onChange={(event) => update({ email: event.target.value })}
          />
          <OrgInput
            label={
              values.supplierRole === "org_driver"
                ? t(
                    "screen.organization.staffing.organizationOwnedDriversAndPhotographers.licenseNumber",
                  )
                : t(
                    "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cameraBody",
                  )
            }
            value={values.licenseOrCamera}
            onChange={(event) => update({ licenseOrCamera: event.target.value })}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <OrgButton type="submit" disabled={!canSubmit}>
            {busy
              ? t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.saving")
              : t(
                  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saveStaffMember",
                )}
          </OrgButton>
          <OrgButton variant="secondary" onClick={onCancel}>
            {t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.cancel")}
          </OrgButton>
        </div>
      </form>
    </OrgCard>
  );
}

export function OrganizationOwnedDriversAndPhotographers() {
  const { status: authStatus, actor } = useAuth();
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
    };
    try {
      if (values.supplierRole === "org_driver") {
        await onboardMutation.mutateAsync({
          ...common,
          supplierRole: "org_driver",
          nationalId: "28801011234567",
          licenseNumber: values.licenseOrCamera.trim() || "ORG-DRV-001",
          licenseCategory: "First Degree Bus",
          licenseExpiry: new Date(Date.now() + 365 * DAY_MS).toISOString(),
          labTestConsentSigned: true,
        });
      } else {
        await onboardMutation.mutateAsync({
          ...common,
          supplierRole: "org_photographer",
          nationalId: "29001011234567",
          cameraBodies: [values.licenseOrCamera.trim() || "Canon EOS R6"],
          portfolioPhotoCount: 8,
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
