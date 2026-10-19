// SCR-ADM-05 Reject with reason (docs/design/web/admin/SCR-ADM-05.dc.html): one reason code and
// the message the applicant sees. Confirming saves the application as Rejected.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { getSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";

import {
  AdminButton,
  AdminLink,
  useAdminNavigate,
  useAdminParam,
  type AdminParams,
} from "../common/admin-actions";
import { AdminSelect, AdminTextarea, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminSplit,
  type AdminTone,
} from "../common/admin-ui";

/** The API needs a message of at least 5 characters. */
const MIN_MESSAGE_LENGTH = 5;

// The decision reason codes stored with the rejection. No catalog endpoint exists yet, so the
// codes are defined here.
const reasonOptions = (): readonly AdminOption[] => [
  { value: "", label: t("screen.admin.applications.rejectWithReasonDecision.chooseReason") },
  {
    value: "documents_incomplete",
    label: t("screen.admin.applications.rejectWithReasonDecision.reasonDocuments"),
  },
  {
    value: "checks_not_passed",
    label: t("screen.admin.applications.rejectWithReasonDecision.reasonChecks"),
  },
  {
    value: "not_eligible",
    label: t("screen.admin.applications.rejectWithReasonDecision.reasonEligibility"),
  },
  {
    value: "duplicate_registration",
    label: t("screen.admin.applications.rejectWithReasonDecision.reasonDuplicate"),
  },
];

const STATE_PRESENTATION: Record<string, { key: string; tone: AdminTone }> = {
  Submitted: { key: "screen.admin.applications.rejectWithReasonDecision.submitted", tone: "info" },
  "Pending Review": {
    key: "screen.admin.applications.rejectWithReasonDecision.underReview",
    tone: "info",
  },
  "Changes Requested": {
    key: "screen.admin.applications.rejectWithReasonDecision.changesRequested",
    tone: "warn",
  },
  Approved: { key: "screen.admin.applications.rejectWithReasonDecision.approved", tone: "ok" },
  Rejected: { key: "screen.admin.applications.rejectWithReasonDecision.rejected", tone: "bad" },
  Appealed: { key: "screen.admin.applications.rejectWithReasonDecision.appealed", tone: "info" },
  Closed: { key: "screen.admin.applications.rejectWithReasonDecision.closed", tone: "neutral" },
};

function StateBadge({ state }: { state: string }) {
  const presentation = STATE_PRESENTATION[state];
  if (!presentation) return <AdminBadge icon={false}>{state}</AdminBadge>;
  return (
    <AdminBadge tone={presentation.tone} icon={presentation.tone === "info" ? false : undefined}>
      {t(presentation.key)}
    </AdminBadge>
  );
}

function ApplicantToldAlert() {
  return (
    <AdminAlert
      tone="info"
      title={t("screen.admin.applications.rejectWithReasonDecision.applicantIsTold")}
    >
      <p className="te-body mt-2">
        {t("screen.admin.applications.rejectWithReasonDecision.reapplyAfter")}
      </p>
      <p className="te-body mt-1">
        {t("screen.admin.applications.rejectWithReasonDecision.canAppeal")}
      </p>
    </AdminAlert>
  );
}

export function RejectWithReasonDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const applicationId = useAdminParam("applicationId", getSelectedAdminApplicationId);

  const [reasonCode, setReasonCode] = useState("");
  const [message, setMessage] = useState(() =>
    t("screen.admin.applications.rejectWithReasonDecision.defaultMessage"),
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: applicationId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(applicationId),
  });

  const rejectMutation = useMutation(
    orpc.onboarding.rejectApplication.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const trimmedMessage = message.trim();
  const isMessageValid = trimmedMessage.length >= MIN_MESSAGE_LENGTH;
  const canReject =
    Boolean(detailQuery.data) && reasonCode !== "" && isMessageValid && !rejectMutation.isPending;
  const params: AdminParams = applicationId ? { applicationId } : {};
  const currentState = detailQuery.data?.application.state;

  async function reject() {
    if (!canReject || !applicationId) return;
    setErrorMessage(null);
    try {
      await rejectMutation.mutateAsync({
        applicationId,
        decisionReasonCode: reasonCode,
        decisionNotes: trimmedMessage,
      });
      await goTo("SCR-ADM-02");
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : t("screen.admin.applications.rejectWithReasonDecision.rejectFailedBody"),
      );
    }
  }

  const form = (
    <AdminSplit
      main={
        <>
          <AdminCard title={t("screen.admin.applications.rejectWithReasonDecision.reason")}>
            <AdminSelect
              label={t("screen.admin.applications.rejectWithReasonDecision.reasonCode")}
              options={reasonOptions()}
              value={reasonCode}
              required
              onValueChange={setReasonCode}
            />
            <AdminTextarea
              label={t("screen.admin.applications.rejectWithReasonDecision.message")}
              rows={6}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              help={
                isMessageValid
                  ? undefined
                  : t("screen.admin.applications.rejectWithReasonDecision.messageTooShort")
              }
            />
          </AdminCard>
          {errorMessage ? (
            <AdminAlert
              tone="danger"
              title={t("screen.admin.applications.rejectWithReasonDecision.rejectFailed")}
            >
              {errorMessage}
            </AdminAlert>
          ) : null}
        </>
      }
      side={
        <>
          <ApplicantToldAlert />
          <AdminCard>
            <span className="te-label">
              {t("screen.admin.applications.rejectWithReasonDecision.currentState")}
            </span>
            {currentState ? <StateBadge state={currentState} /> : null}
            <span className="te-caption">
              {t("screen.admin.applications.rejectWithReasonDecision.savedAsRejected")}
            </span>
          </AdminCard>
        </>
      }
    />
  );

  return (
    <AdminPage
      title={t("screen.admin.applications.rejectWithReasonDecision.title")}
      description={t("screen.admin.applications.rejectWithReasonDecision.description")}
      actions={
        <>
          <AdminLink screen="SCR-ADM-03" params={params} variant="secondary">
            {t("screen.admin.applications.rejectWithReasonDecision.cancel")}
          </AdminLink>
          <AdminButton
            variant="danger"
            disabled={!canReject}
            aria-busy={rejectMutation.isPending}
            onClick={() => void reject()}
          >
            {rejectMutation.isPending
              ? t("screen.admin.applications.rejectWithReasonDecision.rejecting")
              : t("screen.admin.applications.rejectWithReasonDecision.rejectApplication")}
          </AdminButton>
        </>
      }
    >
      {applicationId ? (
        <AdminQueryState
          query={detailQuery}
          loadingLabel={t("screen.admin.applications.rejectWithReasonDecision.loading")}
        >
          {form}
        </AdminQueryState>
      ) : (
        <AdminEmpty
          title={t("screen.admin.applications.rejectWithReasonDecision.noApplication")}
          description={t("screen.admin.applications.rejectWithReasonDecision.noApplicationBody")}
        />
      )}
    </AdminPage>
  );
}
