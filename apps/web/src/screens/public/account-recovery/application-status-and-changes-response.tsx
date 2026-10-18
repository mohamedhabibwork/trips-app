import { useEffect, useState } from "react";
import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeStepper } from "@trips-app/ui/components/te-stepper";
import { t } from "@trips-app/i18n";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
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

const APPLICATION_STEPS = () =>
  [
    {
      id: "submitted",
      label: t("screen.public.accountRecovery.applicationStatusAndChangesResponse.submitted"),
    },
    {
      id: "review",
      label: t("screen.public.accountRecovery.applicationStatusAndChangesResponse.pendingReview"),
    },
    {
      id: "decision",
      label: t("screen.public.accountRecovery.applicationStatusAndChangesResponse.decision"),
    },
  ] as const;

const DEFAULT_REQUESTED_CHANGES = (): readonly TeChecklistItem[] => [
  {
    id: "change-1",
    label: t(
      "screen.public.accountRecovery.applicationStatusAndChangesResponse.uploadAClearerInsuranceDocument",
    ),
    checked: false,
    note: "Respond within 14 days.",
  },
  {
    id: "change-2",
    label: t(
      "screen.public.accountRecovery.applicationStatusAndChangesResponse.confirmTheVehicleSeatCount",
    ),
    checked: false,
  },
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
      return {
        tone: "success",
        icon: "check",
        label: t("screen.public.accountRecovery.applicationStatusAndChangesResponse.approved"),
      };
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
      return {
        tone: "warning",
        icon: "alert",
        label: t(
          "screen.public.accountRecovery.applicationStatusAndChangesResponse.changesRequested",
        ),
      };
    case "Appealed":
    case "appeal_pending":
      return {
        tone: "info",
        icon: "clock",
        label: t("screen.public.accountRecovery.applicationStatusAndChangesResponse.appealed"),
      };
    default:
      return {
        tone: "info",
        icon: "clock",
        label: t(
          "screen.public.accountRecovery.applicationStatusAndChangesResponse.pendingReviewLabel",
        ),
      };
  }
}

export function ApplicationStatusView({ applicationIdProp }: { applicationIdProp?: string } = {}) {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const storedId = applicationIdProp ?? getApplicantApplicationId() ?? undefined;
  const statusQuery = useQuery({
    ...orpc.onboarding.getApplicationStatus.queryOptions({
      input: storedId ? { applicationId: storedId } : {},
    }),
    enabled: authStatus === "authenticated",
  });

  const resubmitMutation = useMutation(
    orpc.onboarding.resubmitApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const extensionMutation = useMutation(
    orpc.onboarding.requestChangesExtension.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const app = (statusQuery.data?.application as unknown as LiveApplication) ?? null;
  const [checks, setChecks] = useState<readonly TeChecklistItem[]>(DEFAULT_REQUESTED_CHANGES());
  const [additionalFiles, setAdditionalFiles] = useState<readonly TeFileUploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!app) return;
    setApplicantApplicationId(app.id);
    const items = app.changesRequestedChecklist;
    if (items && items.length > 0) {
      setChecks(
        items.map((item, index) => ({
          id: `change-${index}`,
          label: `${item.field}: ${item.instruction}`,
          checked: Boolean(item.resolved),
        })),
      );
    }
  }, [app]);

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
      await resubmitMutation.mutateAsync({
        applicationId: app.id,
        updatedPayload: { resubmittedFromWeb: true },
        documents: uploadItemsToDocuments(additionalFiles, "other"),
      });
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
      await extensionMutation.mutateAsync({
        applicationId: app.id,
        reason: "Need additional time to obtain updated official documents.",
      });
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
        <p className="te-body">
          {t(
            "screen.public.accountRecovery.applicationStatusAndChangesResponse.targetReviewWithin2Working",
          )}
        </p>
      </div>
      <TeStepper
        steps={APPLICATION_STEPS()}
        currentId={isDecided ? "decision" : "review"}
        completedIds={isDecided ? ["submitted", "review"] : ["submitted"]}
        ariaLabel={t(
          "screen.public.accountRecovery.applicationStatusAndChangesResponse.applicationProgress",
        )}
      />
      <TeInlineAlert
        tone="warning"
        title={t(
          "screen.public.accountRecovery.applicationStatusAndChangesResponse.respondWithin14Days",
        )}
      >
        {t(
          "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChangesMustBeAnswered",
        )}{" "}
        {deadlineText ? ` (${deadlineText})` : ""}
        {t(
          "screen.public.accountRecovery.applicationStatusAndChangesResponse.orTheApplicationCloses",
        )}
      </TeInlineAlert>
      {app?.decisionNotes ? (
        <TeInlineAlert
          tone={currentState === "Rejected" ? "error" : "info"}
          title={t(
            "screen.public.accountRecovery.applicationStatusAndChangesResponse.reviewerNotes",
          )}
        >
          {app.decisionNotes}
        </TeInlineAlert>
      ) : null}
      {feedback ? (
        <TeInlineAlert
          tone="info"
          title={t("screen.public.accountRecovery.applicationStatusAndChangesResponse.updateSaved")}
        >
          {feedback}
        </TeInlineAlert>
      ) : null}
      {errorMsg ? (
        <TeInlineAlert
          tone="error"
          title={t(
            "screen.public.accountRecovery.applicationStatusAndChangesResponse.actionFailed",
          )}
        >
          {errorMsg}
        </TeInlineAlert>
      ) : null}
      <section className="flex flex-col gap-4" aria-labelledby="requested-changes-heading">
        <h2 id="requested-changes-heading" className="te-h3">
          {t("screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChanges")}
        </h2>
        <TeChecklist
          items={checks}
          onToggle={toggleCheck}
          ariaLabel={t(
            "screen.public.accountRecovery.applicationStatusAndChangesResponse.requestedChangesAriaLabel",
          )}
        />
        <TeFileUpload
          label={t(
            "screen.public.accountRecovery.applicationStatusAndChangesResponse.updatedDocumentsOptional",
          )}
          accept="image/*,application/pdf"
          multiple
          files={additionalFiles}
          onFilesSelected={(selected) =>
            setAdditionalFiles([...additionalFiles, ...toPendingItems(selected)])
          }
          onRemove={(name) => setAdditionalFiles(withoutItem(additionalFiles, name))}
          hint={t(
            "screen.public.accountRecovery.applicationStatusAndChangesResponse.attachReplacementOrSupportingDocuments",
          )}
        />
      </section>
      <div className="flex flex-wrap gap-3">
        <TeButton
          variant="primary"
          size="lg"
          disabled={!canResubmit}
          onClick={() => void handleResubmit()}
        >
          {busy
            ? t("screen.public.accountRecovery.applicationStatusAndChangesResponse.submitting")
            : t("screen.public.accountRecovery.applicationStatusAndChangesResponse.resubmit")}
        </TeButton>
        {app && isChangesRequested && !app.changesExtensionUsed ? (
          <TeButton
            variant="secondary"
            size="lg"
            disabled={busy}
            onClick={() => void handleRequestExtension()}
          >
            {t(
              "screen.public.accountRecovery.applicationStatusAndChangesResponse.request7DayExtension",
            )}
          </TeButton>
        ) : null}
        <ScreenLink
          surface="public"
          slug="appeal-a-rejection"
          className={buttonLinkClass("secondary")}
        >
          {t("screen.public.accountRecovery.applicationStatusAndChangesResponse.appealARejection")}
        </ScreenLink>
      </div>
    </div>
  );
}

/** Where an application stands. Shows requested changes, the deadline, and the appeal route. */
export function ApplicationStatusAndChangesResponse() {
  return (
    <AuthFrame
      title={t(
        "screen.public.accountRecovery.applicationStatusAndChangesResponse.applicationStatusAndChangesResponse",
      )}
      description={t(
        "screen.public.accountRecovery.applicationStatusAndChangesResponse.trackYourApplicationAndRespond",
      )}
    >
      <StatePreview
        main={<ApplicationStatusView />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t(
              "screen.public.accountRecovery.applicationStatusAndChangesResponse.statusCouldNotLoad",
            )}
          >
            {t("screen.public.accountRecovery.applicationStatusAndChangesResponse.tryAgainInAFew")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
