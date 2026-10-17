import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TE_ROLES, roleLabel, type TeRole } from "@trips-app/ui/components/te-role-badge";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import { AdminActions, AdminPage, AdminPanel, AdminToggle } from "../common/admin-shared";

const ROLE_OPTIONS: readonly TeSelectOption[] = TE_ROLES.map((role: TeRole) => ({
  value: role,
  label: roleLabel(role),
}));

export function PlanEditor() {
  const [role, setRole] = useState<string>(TE_ROLES[0]);
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Plan editor"
        description="Edit one plan's limits, features, prices and trial."
      />
      <StatePreview
        emptyTitle="No plan loaded"
        emptyDescription="Choose a role and a tier to edit from the catalog."
        loadingLabel="Loading the plan."
      >
        <AdminPanel title="Plan">
          <TeSelect label="Role" options={ROLE_OPTIONS} value={role} onValueChange={setRole} />
          <TeInput label="Tier name" placeholder="[Tier name]" required />
        </AdminPanel>
        <AdminPanel title="Limits and features">
          <TeInput
            label="Limits"
            placeholder="[Limit values]"
            supportingText="Values come from the BRD 5.1 tables."
          />
          <AdminToggle label="[Feature flag 1]" />
          <AdminToggle label="[Feature flag 2]" />
        </AdminPanel>
        <AdminPanel title="Prices and trial">
          <TeInput label="Monthly price" placeholder="[Amount]" inputMode="decimal" />
          <TeInput label="Currency" placeholder="[Currency code]" />
          <TeInput label="Annual price" placeholder="[Amount]" inputMode="decimal" />
          <TeInput
            label="Annual discount (%)"
            defaultValue="15"
            inputMode="decimal"
            supportingText="Placeholder. Finance sets this value (D-16)."
          />
          <TeInput label="Trial length (days)" placeholder="[Days]" inputMode="numeric" />
          <TeInput
            label="Grace period (days)"
            defaultValue="7"
            inputMode="numeric"
            supportingText="Set to 7 days (D-08)."
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="When changes apply">
          Saved changes apply to new actions at once. The effect on existing items is set in D-144.
          Prices come from the plan catalog.
        </TeInlineAlert>
        <AdminPanel
          title="Save"
          footer={
            <AdminActions>
              <AdminScreenLink slug="plans-catalog" variant="secondary">
                Cancel
              </AdminScreenLink>
              <TeButton onClick={() => goTo("plans-catalog")}>Save plan</TeButton>
            </AdminActions>
          }
        >
          <p className="te-caption">
            Validation errors appear next to the field that needs fixing.
          </p>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
