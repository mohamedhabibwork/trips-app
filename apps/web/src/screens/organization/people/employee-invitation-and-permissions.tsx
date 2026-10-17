import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const AREA_IDS = [
  "trips",
  "bookings",
  "accounting",
  "coupons",
  "employees",
  "fleet",
  "subscription",
] as const;

type AreaId = (typeof AREA_IDS)[number];

const AREA_LABELS: Record<AreaId, string> = {
  trips: "Trips",
  bookings: "Bookings",
  accounting: "Accounting",
  coupons: "Coupons",
  employees: "Employees",
  fleet: "Fleet",
  subscription: "Subscription",
};

const INITIAL_AREAS: Record<AreaId, boolean> = {
  trips: false,
  bookings: false,
  accounting: false,
  coupons: false,
  employees: false,
  fleet: false,
  subscription: false,
};

interface ChangeRow {
  id: string;
  actor: string;
  time: string;
  before: string;
  after: string;
}

const CHANGE_ROWS: readonly ChangeRow[] = [
  {
    id: "change-1",
    actor: "[Actor]",
    time: "[Time]",
    before: "[Previous permission areas]",
    after: "[New permission areas]",
  },
];

const CHANGE_COLUMNS: readonly TeDataTableColumn<ChangeRow>[] = [
  { key: "actor", header: "Changed by" },
  { key: "time", header: "When" },
  { key: "before", header: "Before" },
  { key: "after", header: "After" },
];

export function EmployeeInvitationAndPermissions() {
  const goTo = useOrgNavigate();
  const [email, setEmail] = useState("");
  const [areas, setAreas] = useState(INITIAL_AREAS);

  const setArea = (area: AreaId, checked: boolean) => {
    setAreas((current) => ({ ...current, [area]: checked }));
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "employees-list", label: "Back to employees" }} />
        <TePageHeader title="Employee invitation and permissions" />
        <OrgSection title="Invite">
          <TeCard>
            <TeInput
              label="Email"
              type="email"
              placeholder="[Email]"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </TeCard>
        </OrgSection>
        <OrgSection title="Permission areas">
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              {AREA_IDS.map((area) => (
                <TeCheckbox
                  key={area}
                  label={AREA_LABELS[area]}
                  checked={areas[area]}
                  onCheckedChange={(checked) => setArea(area, checked)}
                />
              ))}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title="Change history">
          <TeDataTable
            columns={CHANGE_COLUMNS}
            rows={CHANGE_ROWS}
            getRowKey={(row) => row.id}
            caption="Permission change history"
            emptyTitle="No changes yet"
            emptyDescription="Changes to permission areas are recorded here."
          />
        </OrgSection>
        <div className="flex flex-wrap justify-end gap-3">
          <TeButton variant="secondary" onClick={() => void goTo("employees-list")}>
            Save permissions
          </TeButton>
          <TeButton onClick={() => void goTo("employees-list")}>Send invitation</TeButton>
        </div>
      </div>
    </StatePreview>
  );
}
