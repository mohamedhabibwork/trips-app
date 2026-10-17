import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeTimeline, type TeTimelineItem } from "@trips-app/ui/components/te-timeline";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFacts,
  AdminPage,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

const RESULT_UPLOADED: AdminStatusPresentation = {
  tone: "highlight",
  icon: "file",
  label: "Result uploaded",
};

const TIMELINE: readonly TeTimelineItem[] = [
  { id: "requested", time: "[Date and time]", label: "Test requested", state: "done" },
  {
    id: "result",
    time: "[Date and time]",
    label: "Result uploaded by the lab partner",
    state: "current",
  },
  { id: "decision", time: "[Pending]", label: "Decision: passed or failed", state: "upcoming" },
];

export function LabTestDetailAndDecision() {
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Lab test detail and decision"
        description="Review the result and decide. Both decisions are audited."
      />
      <StatePreview
        emptyTitle="No result yet"
        emptyDescription="The lab partner has not sent a result for this test."
        loadingLabel="Loading the lab test."
      >
        <AdminPanel title="Test">
          <AdminStatus status={RESULT_UPLOADED} />
          <AdminFacts
            items={[
              { label: "Driver", value: "[Driver name]" },
              { label: "Track", value: "[Test type]" },
              { label: "Requested", value: "[Date and time]" },
              { label: "Deadline", value: "[Date]" },
              { label: "Lab result reference", value: "[Result file reference]" },
              { label: "Consent record", value: "[Consent reference]" },
            ]}
          />
          <TeButton variant="ghost">Open result file</TeButton>
          <AdminScreenLink slug="entity-detail">Open driver account</AdminScreenLink>
        </AdminPanel>
        <AdminPanel title="Timeline">
          <TeTimeline items={TIMELINE} ariaLabel="Lab test timeline" />
        </AdminPanel>
        <TeInlineAlert tone="info" title="What each decision does">
          Mark passed unpauses the driver. Mark failed keeps the driver paused and opens a case.
        </TeInlineAlert>
        <AdminActions>
          <AdminScreenLink slug="lab-tests-queue" variant="ghost">
            Back to lab tests
          </AdminScreenLink>
          <TeButton variant="destructive" onClick={() => goTo("lab-tests-queue")}>
            Mark failed
          </TeButton>
          <TeButton onClick={() => goTo("lab-tests-queue")}>Mark passed</TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
