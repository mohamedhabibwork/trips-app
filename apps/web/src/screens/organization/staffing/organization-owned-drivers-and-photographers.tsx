import { useEffect, useState, type FormEvent } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { useAuth } from "@/auth/auth-context";
import { client } from "@/utils/orpc";

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

const DEFAULT_STAFF_ROWS: readonly StaffMemberRow[] = [
  {
    id: "staff-1",
    supplierRole: "org_driver",
    name: "[Name]",
    type: "Driver",
    status: "Active",
    vehicles: "0",
  },
];

const SUPPLIER_ROLE_OPTIONS: readonly TeSelectOption[] = [
  { value: "org_driver", label: "Driver" },
  { value: "org_photographer", label: "Photographer" },
];

function buildColumns(
  onRemove: (row: StaffMemberRow) => void,
): readonly TeDataTableColumn<StaffMemberRow>[] {
  return [
    { key: "name", header: "Name" },
    { key: "type", header: "Type" },
    {
      key: "status",
      header: "Status",
      render: (row) => <StateBadge tone="success" icon="check" label={row.status} />,
    },
    { key: "vehicles", header: "Vehicle assignments", align: "end" },
    {
      key: "remove",
      header: "Remove",
      render: (row) => (
        <TeButton variant="ghost" size="default" onClick={() => onRemove(row)}>
          Remove
        </TeButton>
      ),
    },
  ];
}

export function OrganizationOwnedDriversAndPhotographers() {
  const { status: authStatus, actor } = useAuth();
  const [rows, setRows] = useState<readonly StaffMemberRow[]>(DEFAULT_STAFF_ROWS);
  const [removeTarget, setRemoveTarget] = useState<StaffMemberRow | null>(null);
  const [addFormOpen, setAddFormOpen] = useState(false);
  const [supplierRole, setSupplierRole] = useState<"org_driver" | "org_photographer">("org_driver");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [licenseOrCamera, setLicenseOrCamera] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function refreshList() {
    if (authStatus !== "authenticated" || !actor?.activeTenantId) return;
    try {
      const res = await client.onboarding.listOrganizationSuppliers({});
      const mapped: StaffMemberRow[] = res.suppliers.map((s) => ({
        id: s.supplierAccountId,
        supplierRole: s.supplierRole,
        name: s.fullName,
        type: s.supplierRole === "org_driver" ? "Driver" : "Photographer",
        status: s.status === "active" ? "Active" : s.status,
        vehicles: "0",
      }));
      setRows(mapped);
    } catch {
      // Keep default rows when previewed without tenant context
    }
  }

  useEffect(() => {
    void refreshList();
  }, [authStatus, actor?.activeTenantId]);

  async function handleAddSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !fullName.trim() || !phone.trim()) return;
    setBusy(true);
    setErrorMsg(null);
    try {
      if (supplierRole === "org_driver") {
        await client.onboarding.onboardOrganizationSupplier({
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
        await client.onboarding.onboardOrganizationSupplier({
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
      await refreshList();
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
        await client.onboarding.removeOrganizationSupplier({
          supplierAccountId: target.id,
          supplierRole: target.supplierRole,
        });
        await refreshList();
        return;
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not remove staff member.");
        return;
      }
    }
    setRows((prev) => prev.filter((r) => r.id !== target.id));
  }

  const columns = buildColumns((row) => setRemoveTarget(row));

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "staffing-board", label: "Back to staffing board" }} />
        <TePageHeader
          title="Organization-owned drivers and photographers"
          actions={
            <TeButton onClick={() => setAddFormOpen((open) => !open)}>
              Add driver or photographer
            </TeButton>
          }
        />
        <TeInlineAlert tone="info">
          Organization-owned staff are visible only to your organization. They are accepted
          automatically when assigned to a trip.
        </TeInlineAlert>
        {errorMsg ? (
          <TeInlineAlert tone="error" title="Action failed">
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        {addFormOpen ? (
          <TeCard header={<h2 className="te-h3">Add organization-owned staff</h2>}>
            <form className="flex flex-col gap-4" onSubmit={(e) => void handleAddSubmit(e)}>
              <TeSelect
                label="Role"
                options={SUPPLIER_ROLE_OPTIONS}
                value={supplierRole}
                onValueChange={(val) =>
                  setSupplierRole(val === "org_photographer" ? "org_photographer" : "org_driver")
                }
              />
              <TeInput
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <TeInput
                label="Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <TeInput
                label="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TeInput
                label={supplierRole === "org_driver" ? "License number" : "Camera body"}
                value={licenseOrCamera}
                onChange={(e) => setLicenseOrCamera(e.target.value)}
                required
              />
              <div className="flex flex-wrap gap-3">
                <TeButton type="submit" disabled={busy || !fullName.trim() || !phone.trim()}>
                  {busy ? "Saving..." : "Save staff member"}
                </TeButton>
                <TeButton type="button" variant="secondary" onClick={() => setAddFormOpen(false)}>
                  Cancel
                </TeButton>
              </div>
            </form>
          </TeCard>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label="Organization-owned staff"
            value={String(rows.length)}
            hint="Cap: [staff cap]"
          />
        </div>
        <OrgSection title="Staff">
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption="Organization-owned drivers and photographers"
            emptyTitle="No organization-owned staff yet"
            emptyDescription="Add a driver or photographer to assign them to trips."
          />
        </OrgSection>
        <TeDialog
          open={removeTarget !== null}
          onOpenChange={(open) => {
            if (!open) setRemoveTarget(null);
          }}
          title="Remove this staff member?"
          description="Future assignments are affected. Trips already assigned keep their history."
          primaryLabel="Remove"
          onPrimary={() => void handleConfirmRemove()}
          secondaryLabel="Keep"
          onSecondary={() => setRemoveTarget(null)}
          tone="danger"
        />
      </div>
    </StatePreview>
  );
}
