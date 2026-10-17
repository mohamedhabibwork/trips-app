import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { AdminDecisionForm } from "../common/admin-decision-form";
import { StatePreview } from "../common/admin-state-preview";
import { useAdminNavigate } from "../common/admin-links";
import { AdminFacts, AdminPage, AdminPanel } from "../common/admin-shared";

export function RejectWithReasonDecision() {
  const goTo = useAdminNavigate();

  return (
    <AdminPage>
      <TePageHeader
        title="Reject with reason (decision)"
        description="Reject this application. The applicant is told the reason."
      />
      <StatePreview
        emptyTitle="No reason entered"
        emptyDescription="Enter a reason before you reject the application."
        loadingLabel="Loading the application."
      >
        <AdminPanel title="Applicant">
          <AdminFacts
            items={[
              { label: "Applicant name", value: "[Applicant name]" },
              { label: "Application type", value: "[Application type]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Reason">
          <AdminDecisionForm
            reasonLabel="Reason for rejection (required)"
            reasonHelp="Reason codes are proposed (D-234). This text is sent to the applicant."
            submitLabel="Reject application"
            dialogTitle="Reject this application?"
            dialogDescription="The applicant is told the reason. They can re-apply after 30 days, or appeal."
            confirmLabel="Reject application"
            tone="danger"
            cancel={{ slug: "application-review-detail", label: "Cancel" }}
            onConfirm={() => goTo("application-queue")}
          />
        </AdminPanel>
        <TeInlineAlert tone="info" title="What the applicant can do next">
          The applicant can re-apply after 30 days. The applicant can also appeal this decision.
        </TeInlineAlert>
      </StatePreview>
    </AdminPage>
  );
}
