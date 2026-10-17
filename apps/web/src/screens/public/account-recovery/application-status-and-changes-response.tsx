import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeStepper } from "@trips-app/ui/components/te-stepper";
import { buttonLinkClass } from "../../shared/button-link";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";

const APPLICATION_STEPS = [
  { id: "submitted", label: "Submitted" },
  { id: "review", label: "Pending review" },
  { id: "decision", label: "Decision" },
] as const;

const REQUESTED_CHANGES: readonly TeChecklistItem[] = [
  {
    id: "change-1",
    label: "Upload a clearer insurance document",
    checked: false,
    note: "Respond within 14 days.",
  },
  { id: "change-2", label: "Confirm the vehicle seat count", checked: false },
];

// Resubmit has no route yet, so it is shown disabled until the app supplies one.
function ApplicationStatusView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <TeBadge tone="warning">
          <TeIcon name="alert" />
          Changes requested
        </TeBadge>
        <p className="te-body">Target: review within 2 working days.</p>
      </div>
      <TeStepper
        steps={APPLICATION_STEPS}
        currentId="review"
        completedIds={["submitted"]}
        ariaLabel="Application progress"
      />
      <TeInlineAlert tone="warning" title="Respond within 14 days">
        Requested changes must be answered before the deadline, or the application closes.
      </TeInlineAlert>
      <section className="flex flex-col gap-4" aria-labelledby="requested-changes-heading">
        <h2 id="requested-changes-heading" className="te-h3">
          Requested changes
        </h2>
        <TeChecklist items={REQUESTED_CHANGES} ariaLabel="Requested changes" />
      </section>
      <div className="flex flex-wrap gap-3">
        <TeButton variant="primary" size="lg" disabled>
          Resubmit
        </TeButton>
        <ScreenLink
          surface="public"
          slug="appeal-a-rejection"
          className={buttonLinkClass("secondary")}
        >
          Appeal a rejection
        </ScreenLink>
      </div>
    </div>
  );
}

/** Where an application stands. Shows requested changes, the deadline, and the appeal route. */
export function ApplicationStatusAndChangesResponse() {
  return (
    <AuthFrame
      title="Application status and changes response"
      description="Track your application and respond to any requested changes."
    >
      <StatePreview
        main={<ApplicationStatusView />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Status could not load">
            Try again in a few minutes.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
