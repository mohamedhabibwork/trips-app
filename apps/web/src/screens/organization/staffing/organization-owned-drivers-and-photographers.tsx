import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface StaffMemberRow {
  id: string;
  supplierRole: "org_driver" | "org_photographer";
  name: string;
  type: string;
  status: string;
  vehicles: string;
}

const SUPPLIER_ROLE_OPTIONS = (): readonly TeSelectOption[] => [
  {
    value: "org_driver",
    label: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.driver"),
  },
  {
    value: "org_photographer",
    label: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.photographer"),
  },
];

function buildColumns(
  onRemove: (row: StaffMemberRow) => void,
): readonly TeDataTableColumn<StaffMemberRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.name"),
    },
    {
      key: "type",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.type"),
    },
    {
      key: "status",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.status"),
      render: (row) => <StateBadge tone="success" icon="check" label={row.status} />,
    },
    {
      key: "vehicles",
      header: t(
        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.vehicleAssignments",
      ),
      align: "end",
    },
    {
      key: "remove",
      header: t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove"),
      render: (row) => (
        <TeButton variant="ghost" size="default" onClick={() => onRemove(row)}>
          {t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.remove2")}
        </TeButton>
      ),
    },
  ];
}

export function OrganizationOwnedDriversAndPhotographers() {
  const { status: authStatus, actor } = useAuth();
  const queryClient = useQueryClient();
  const [removeTarget, setRemoveTarget] = useState<StaffMemberRow | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [supplierRole, setSupplierRole] = useState<"org_driver" | "org_photographer">("org_driver");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseOrCamera, setLicenseOrCamera] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const suppliersQuery = useQuery({
    ...orpc.onboarding.listOrganizationSuppliers.queryOptions({ input: {} }),
    enabled,
  });

  const rows: readonly StaffMemberRow[] =
    suppliersQuery.data?.suppliers.map((s) => ({
      id: s.supplierAccountId,
      supplierRole: s.supplierRole,
      name: s.fullName,
      type: s.supplierRole === "org_driver" ? "Driver" : "Photographer",
      status: s.status === "active" ? "Active" : s.status,
      vehicles: "0",
    })) ?? [];

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

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !fullName.trim() || !phone.trim()) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      if (supplierRole === "org_driver") {
        await onboardMutation.mutateAsync({
          supplierRole: "org_driver",
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          nationalId: "28801011234567",
          licenseNumber: licenseOrCamera.trim() || "ORG-DRV-001",
          licenseCategory: "First Degree Bus",
          licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          labTestConsentSigned: true,
        });
      } else {
        await onboardMutation.mutateAsync({
          supplierRole: "org_photographer",
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
          nationalId: "29001011234567",
          cameraBodies: [licenseOrCamera.trim() || "Canon EOS R6"],
          portfolioPhotoCount: 8,
        });
      }
      setAddFormOpen(false);
      setFullName("");
      setPhone("");
      setEmail("");
      setLicenseOrCamera("");
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not add staff member.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return;
    const target = removeTarget;
    setRemoveTarget(null);
    if (authStatus === "authenticated" && !target.id.startsWith("staff-")) {
      try {
        await removeMutation.mutateAsync({
          supplierAccountId: target.id,
          supplierRole: target.supplierRole,
        });
        return;
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not remove staff member.");
        return;
      }
    }
  }

  const columns = buildColumns((row) => setRemoveTarget(row));

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "staffing-board",
            label: t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.backToStaffingBoard",
            ),
          }}
        />
        <TePageHeader
          title={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDriversAndPhotographers",
          )}
          actions={
            <TeButton onClick={() => setAddFormOpen((open) => !open)}>
              {t(
                "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addDriverOrPhotographer",
              )}
            </TeButton>
          }
        />
        <TeInlineAlert tone="info">
          {t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedStaffAreVisible",
          )}
        </TeInlineAlert>
        {errorMsg ? (
          <TeInlineAlert
            tone="error"
            title={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.actionFailed",
            )}
          >
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        {addFormOpen ? (
          <TeCard
            header={
              <h2 className="te-h3">
                {t(
                  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addOrganizationOwnedStaff",
                )}
              </h2>
            }
          >
            <form className="flex flex-col gap-4" onSubmit={(e) => void handleAddSubmit(e)}>
              <TeSelect
                label={t(
                  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.role",
                )}
                options={SUPPLIER_ROLE_OPTIONS()}
                value={supplierRole}
                onValueChange={(val) =>
                  setSupplierRole(val === "org_photographer" ? "org_photographer" : "org_driver")
                }
              />
              <TeInput
                label={t(
                  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.fullName",
                )}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <TeInput
                label={t(
                  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.phone",
                )}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <TeInput
                label={t(
                  "screen.organization.staffing.organizationOwnedDriversAndPhotographers.emailOptional",
                )}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TeInput
                label={
                  supplierRole === "org_driver"
                    ? t(
                        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.licenseNumber",
                      )
                    : t(
                        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cameraBody",
                      )
                }
                value={licenseOrCamera}
                onChange={(e) => setLicenseOrCamera(e.target.value)}
                required
              />
              <div className="flex flex-wrap gap-3">
                <TeButton type="submit" disabled={busy || !fullName.trim() || !phone.trim()}>
                  {busy
                    ? t(
                        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saving",
                      )
                    : t(
                        "screen.organization.staffing.organizationOwnedDriversAndPhotographers.saveStaffMember",
                      )}
                </TeButton>
                <TeButton type="button" variant="secondary" onClick={() => setAddFormOpen(false)}>
                  {t(
                    "screen.organization.staffing.organizationOwnedDriversAndPhotographers.cancel",
                  )}
                </TeButton>
              </div>
            </form>
          </TeCard>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedStaff",
            )}
            value={String(rows.length)}
            hint={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.capStaffCap",
            )}
          />
        </div>
        <OrgSection
          title={t("screen.organization.staffing.organizationOwnedDriversAndPhotographers.staff")}
        >
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.organizationOwnedDriversAndPhotographersCaption",
            )}
            emptyTitle={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.noOrganizationOwnedStaffYet",
            )}
            emptyDescription={t(
              "screen.organization.staffing.organizationOwnedDriversAndPhotographers.addADriverOrPhotographer",
            )}
          />
        </OrgSection>
        <TeDialog
          open={removeTarget !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveTarget(null);
          }}
          title={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removeThisStaffMember",
          )}
          description={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.futureAssignmentsAreAffectedTrips",
          )}
          primaryLabel={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.removePrimaryLabel",
          )}
          onPrimary={() => void handleConfirmRemove()}
          secondaryLabel={t(
            "screen.organization.staffing.organizationOwnedDriversAndPhotographers.keep",
          )}
          onSecondary={() => setRemoveTarget(null)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
