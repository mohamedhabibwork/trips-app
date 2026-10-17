import { useEffect, useState } from "react";
import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeStepper } from "@trips-app/ui/components/te-stepper";
import { useAuth } from "@/auth/auth-context";
import { client } from "@/utils/orpc";
import {
  getApplicantApplicationId,
  setApplicantApplicationId,
  uploadItemsToDocuments,
} from "../../onboarding-state";
import { buttonLinkClass } from "../../shared/button-link";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { toPendingItems, withoutItem } from "../../shared/upload-items";
import { AuthFrame } from "../common/auth-frame";

const APPLICATION_STEPS = [
  { id: "submitted", label: "Submitted" },
  { id: "review", label: "Pending review" },
  { id: "decision", label: "Decision" },
] as const;

const DEFAULT_REQUESTED_CHANGES: readonly TeChecklistItem[] = [
  {
    id: "change-1",
    label: "Upload a clearer insurance document",
    checked: false,
    note: "Respond within 14 days.",
  },
  { id: "change-2", label: "Confirm the vehicle seat count", checked: false },
];

interface LiveApplication {
  id: string;
  applicationType: string;
  state: string;
  changesDueAt?: string | Date | null;
  changesExtensionUsed?: boolean;
  decisionNotes?: string | null;
  changesRequestedChecklist?: Array<{
    field: string;
    instruction: string;
    resolved?: boolean;
  }> | null;
}

function statusBadgeTone(state: string): {
  tone: "warning" | "success" | "danger" | "info";
  icon: "alert" | "check" | "clock";
  label: string;
} {
  switch (state) {
    case "Approved":
    case "approved":
      return { tone: "success", icon: "check", label: "Approved" };
    case "Rejected":
    case "rejected":
    case "Closed":
    case "closed":
      return {
        tone: "danger",
        icon: "alert",
        label: state === "Closed" || state === "closed" ? "Closed" : "Rejected",
      };
    case "Changes Requested":
    case "changes_requested":
      return { tone: "warning", icon: "alert", label: "Changes requested" };
    case "Appealed":
    case "appeal_pending":
      return { tone: "info", icon: "clock", label: "Appealed" };
    default:
      return { tone: "info", icon: "clock", label: "Pending review" };
  }
}

export function ApplicationStatusView({ applicationIdProp }: { applicationIdProp?: string } = {}) {
  const { status: authStatus } = useAuth();
  const [app, setApp] = useState<LiveApplication | null>(null);
  const [checks, setChecks] = useState<readonly TeChecklistItem[]>(DEFAULT_REQUESTED_CHANGES);
  const [additionalFiles, setAdditionalFiles] = useState<readonly TeFileUploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
    const storedId = applicationIdProp ?? getApplicantApplicationId() ?? undefined;
    void client.onboarding
      .getApplicationStatus(storedId ? { applicationId: storedId } : {})
      .then((res) => {
        if (cancelled || !res.application) return;
        const loaded = res.application as unknown as LiveApplication;
        setApp(loaded);
        setApplicantApplicationId(loaded.id);
        const items = loaded.changesRequestedChecklist;
        if (items && items.length > 0) {
          setChecks(
            items.map((item, index) => ({
              id: `change-${index}`,
              label: `${item.field}: ${item.instruction}`,
              checked: Boolean(item.resolved),
            })),
          );
        }
      })
      .catch(() => {
        // Ignore when previewed without an active application
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, applicationIdProp]);

  function toggleCheck(id: string) {
    setChecks((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }

  async function handleResubmit() {
    if (!app) return;
    setBusy(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const updated = await client.onboarding.resubmitApplication({
        applicationId: app.id,
        updatedPayload: { resubmittedFromWeb: true },
        documents: uploadItemsToDocuments(additionalFiles, "other"),
      });
      if (updated) {
        setApp(updated as unknown as LiveApplication);
      }
      setAdditionalFiles([]);
      setFeedback("Your updated application has been resubmitted for review.");
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not resubmit application.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRequestExtension() {
    if (!app) return;
    setBusy(true);
    setErrorMsg(null);
    setFeedback(null);
    try {
      const updated = await client.onboarding.requestChangesExtension({
        applicationId: app.id,
        reason: "Need additional time to obtain updated official documents.",
      });
      if (updated) {
        setApp(updated as unknown as LiveApplication);
      }
      setFeedback("Your 7-day deadline extension has been granted.");
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not request extension.");
    } finally {
      setBusy(false);
    }
  }

  const currentState = app?.state ?? "Changes Requested";
  const isChangesRequested =
    currentState === "Changes Requested" || currentState === "changes_requested";
  const isDecided =
    currentState === "Approved" ||
    currentState === "Rejected" ||
    currentState === "Closed" ||
    currentState === "approved" ||
    currentState === "rejected" ||
    currentState === "closed";
  const badge = statusBadgeTone(currentState);
  const canResubmit =
    Boolean(app) &&
    isChangesRequested &&
    !busy &&
    (checks.some((item) => item.checked) || additionalFiles.length > 0);

  const deadlineText = app?.changesDueAt ? new Date(app.changesDueAt).toLocaleDateString() : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <TeBadge tone={badge.tone}>
          <TeIcon name={badge.icon} />
          {badge.label}
        </TeBadge>
        <p className="te-body">Target: review within 2 working days.</p>
      </div>
      <TeStepper
        steps={APPLICATION_STEPS}
        currentId={isDecided ? "decision" : "review"}
        completedIds={isDecided ? ["submitted", "review"] : ["submitted"]}
        ariaLabel="Application progress"
      />
      <TeInlineAlert tone="warning" title="Respond within 14 days">
        Requested changes must be answered before the deadline
        {deadlineText ? ` (${deadlineText})` : ""}, or the application closes.
      </TeInlineAlert>
      {app?.decisionNotes ? (
        <TeInlineAlert tone={currentState === "Rejected" ? "error" : "info"} title="Reviewer notes">
          {app.decisionNotes}
        </TeInlineAlert>
      ) : null}
      {feedback ? (
        <TeInlineAlert tone="info" title="Update saved">
          {feedback}
        </TeInlineAlert>
      ) : null}
      {errorMsg ? (
        <TeInlineAlert tone="error" title="Action failed">
          {errorMsg}
        </TeInlineAlert>
      ) : null}
      <section className="flex flex-col gap-4" aria-labelledby="requested-changes-heading">
        <h2 id="requested-changes-heading" className="te-h3">
          Requested changes
        </h2>
        <TeChecklist items={checks} onToggle={toggleCheck} ariaLabel="Requested changes" />
        <TeFileUpload
          label="Updated documents (optional)"
          accept="image/*,application/pdf"
          multiple
          files={additionalFiles}
          onFilesSelected={(selected) =>
            setAdditionalFiles([...additionalFiles, ...toPendingItems(selected)])
          }
          onRemove={(name) => setAdditionalFiles(withoutItem(additionalFiles, name))}
          hint="Attach replacement or supporting documents before resubmitting."
        />
      </section>
      <div className="flex flex-wrap gap-3">
        <TeButton
          variant="primary"
          size="lg"
          disabled={!canResubmit}
          onClick={() => void handleResubmit()}
        >
          {busy ? "Submitting..." : "Resubmit"}
        </TeButton>
        {app && isChangesRequested && !app.changesExtensionUsed ? (
          <TeButton
            variant="secondary"
            size="lg"
            disabled={busy}
            onClick={() => void handleRequestExtension()}
          >
            Request 7-day extension
          </TeButton>
        ) : null}
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
