import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSearchField } from "@trips-app/ui/components/te-search-field";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function PlatformSupplierSearchAndDealStart() {
  const goTo = useOrgNavigate();
  const [query, setQuery] = useState("");

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "staffing-board", label: "Back to staffing board" }} />
        <TePageHeader title="Platform supplier search and deal start" />
        <TeInlineAlert tone="info">
          The trip, route, date and pay are shown to the supplier.
        </TeInlineAlert>
        <OrgSection title="Find a supplier">
          <TeSearchField
            label="Search suppliers"
            value={query}
            onValueChange={setQuery}
            clearLabel="Clear search"
            placeholder="[Name, role or area]"
          />
          <TeCard
            header={
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="te-h3">[Supplier name]</h3>
                <StateBadge tone="success" icon="check" label="Verified" />
              </div>
            }
          >
            <div className="flex flex-col gap-4">
              <StateBadge tone="info" icon="calendar" label="Available on [date]" />
              <div className="grid gap-4 sm:grid-cols-2">
                <TeInput label="Price" placeholder="[Amount]" inputMode="decimal" />
                <TeInput label="Currency" placeholder="[Currency code]" />
              </div>
              <div className="flex justify-end">
                <TeButton onClick={() => void goTo("deal-detail-and-negotiation")}>
                  Send proposal
                </TeButton>
              </div>
            </div>
          </TeCard>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
