import { useState } from "react";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";

import { OrgButtonLink, WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function CancelTripDecision() {
  const goTo = useOrgNavigate();
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const hasReason = reason.trim().length > 0;

  const handleConfirm = () => {
    setConfirmOpen(false);
    void goTo("trip-command-view");
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink parent={{ slug: "trip-command-view", label: "Back to trip" }} />
        <TePageHeader title="Cancel trip (decision)" description="[Trip name]" />
        <TeInlineAlert tone="warning" title="This cancels the trip for every traveler">
          Confirmed bookings move to Cancelled, then Refunded. Travelers are notified and refunds
          are queued.
        </TeInlineAlert>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile label="Affected bookings" value="0" />
          <TeKpiTile label="Refund policy" value="[Policy summary]" />
        </div>
        <OrgSection title="Reason">
          <TeInput
            label="Reason for cancellation"
            placeholder="[Reason]"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            supportingText="Required. The reason is recorded with the cancellation."
            dir="auto"
          />
        </OrgSection>
        <TeCard>
          <ul className="flex flex-col gap-2">
            <li className="te-body">Travelers are notified of the cancellation.</li>
            <li className="te-body">Refunds are queued under the refund policy.</li>
          </ul>
        </TeCard>
        <div className="flex flex-wrap justify-end gap-3">
          <OrgButtonLink slug="trip-command-view" variant="secondary">
            Keep trip
          </OrgButtonLink>
          <TeButton disabled={!hasReason} onClick={() => setConfirmOpen(true)}>
            Cancel trip
          </TeButton>
        </div>
        <TeDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Cancel this trip?"
          description="Confirmed bookings move to Cancelled, then Refunded. Travelers are notified."
          primaryLabel="Cancel trip"
          onPrimary={handleConfirm}
          secondaryLabel="Keep trip"
          onSecondary={() => setConfirmOpen(false)}
          tone="danger"
          confirmDisabled={!hasReason}
        />
      </div>
    </StatePreview>
  );
}
