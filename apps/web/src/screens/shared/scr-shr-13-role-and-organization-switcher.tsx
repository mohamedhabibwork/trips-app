import { useState } from "react";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChip } from "@trips-app/ui/components/te-chip";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { goBack } from "./screen-actions";

const ROLE_OPTIONS = [
  { id: "traveler", label: "Traveler" },
  { id: "driver", label: "Driver" },
] as const;

// Organizations linked to the signed-in staff email. Names are placeholders.
const ORGANIZATION_OPTIONS = [
  { id: "org-1", label: "Organization 1" },
  { id: "org-2", label: "Organization 2" },
] as const;

/** Switch between roles of one person, or between organizations linked to one staff email. */
export function ScrShr13RoleAndOrganizationSwitcher() {
  const [activeRole, setActiveRole] = useState<string>("traveler");
  const [activeOrganization, setActiveOrganization] = useState<string>("org-1");

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6">
      <TePageHeader
        title="Role and organization switcher"
        description="Only roles you hold and organizations linked to your email are listed. Switching never shows another role's data."
        actions={
          <TeButton variant="ghost" onClick={goBack}>
            Back
          </TeButton>
        }
      />
      <section className="flex flex-col gap-3" aria-labelledby="switch-roles-heading">
        <h2 id="switch-roles-heading" className="te-h3">
          Roles
        </h2>
        <div role="group" aria-labelledby="switch-roles-heading" className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((role) => (
            <TeChip
              key={role.id}
              selected={activeRole === role.id}
              onClick={() => setActiveRole(role.id)}
            >
              {role.label}
            </TeChip>
          ))}
        </div>
        <p className="te-body" aria-live="polite">
          Showing: {ROLE_OPTIONS.find((role) => role.id === activeRole)?.label}. Data from other
          roles is not shown.
        </p>
      </section>
      <section className="flex flex-col gap-3" aria-labelledby="switch-orgs-heading">
        <h2 id="switch-orgs-heading" className="te-h3">
          Organizations
        </h2>
        <div role="group" aria-labelledby="switch-orgs-heading" className="flex flex-wrap gap-2">
          {ORGANIZATION_OPTIONS.map((organization) => (
            <TeChip
              key={organization.id}
              selected={activeOrganization === organization.id}
              onClick={() => setActiveOrganization(organization.id)}
            >
              {organization.label}
            </TeChip>
          ))}
        </div>
      </section>
    </div>
  );
}
