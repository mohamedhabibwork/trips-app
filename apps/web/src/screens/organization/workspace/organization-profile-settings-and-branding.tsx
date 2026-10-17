import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function OrganizationProfileSettingsAndBranding() {
  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title="Organization profile, settings and branding"
          actions={<TeButton>Save</TeButton>}
        />
        <OrgSection title="Legal details">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput label="Legal name (Arabic)" placeholder="[Legal name]" dir="auto" />
              <TeInput label="Legal name (English)" placeholder="[Legal name]" dir="auto" />
              <TeInput label="Trade name (Arabic)" placeholder="[Trade name]" dir="auto" />
              <TeInput label="Trade name (English)" placeholder="[Trade name]" dir="auto" />
              <TeInput label="Country" placeholder="[Country]" />
              <TeInput label="Time zone" placeholder="[Time zone]" />
              <TeInput label="Registration number" placeholder="[Registration number]" />
              <TeInput label="Tax number" placeholder="[Tax number]" />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Invoice details">
          <TeCard>
            <TeInput label="Invoice address" placeholder="[Invoice address]" dir="auto" />
          </TeCard>
        </OrgSection>
        <OrgSection title="Integrations">
          <TeCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="te-body">CRM connection and outbound webhooks</p>
              <OrgButtonLink slug="crm-and-webhooks" variant="secondary">
                Open CRM and webhooks
              </OrgButtonLink>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Branding">
          <TePlanGate
            plan="Enterprise"
            lockedLabel="Logo and colors are available on the Enterprise plan."
          />
        </OrgSection>
      </div>
    </StatePreview>
  );
}
