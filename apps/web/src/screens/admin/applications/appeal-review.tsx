// SCR-ADM-06 Appeal review (docs/design/web/admin/SCR-ADM-06.dc.html): the original application,
// the rejection reason and the applicant's appeal statement beside the decision: uphold the appeal
// (Approved) or uphold the rejection, with a required reason.
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
import { AdminRadioGroup, AdminTextarea, type AdminRadioOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminBadge, AdminCard, AdminPage, AdminRow } from "../common/admin-ui";

type AppealDecision = "uphold-appeal" | "uphold-rejection";

/** The API needs a reason of at least 5 characters. */
const MIN_REASON_LENGTH = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

const decisionOptions = (): readonly AdminRadioOption[] => [
  {
    value: "uphold-appeal",
    label: <strong>{t("screen.admin.applications.appealReview.upholdAppeal")}</strong>,
    description: t("screen.admin.applications.appealReview.upholdAppealBody"),
  },
  {
    value: "uphold-rejection",
    label: <strong>{t("screen.admin.applications.appealReview.upholdRejection")}</strong>,
    description: t("screen.admin.applications.appealReview.upholdRejectionBody"),
  },
];

function typeLabel(applicationType: string): string {
  if (applicationType === "organization")
    return t("screen.admin.applications.appealReview.organization");
  if (applicationType === "platform_photographer")
    return t("screen.admin.applications.appealReview.photographer");
  return t("screen.admin.applications.appealReview.driver");
}

/** `documents_incomplete` → `Documents incomplete`. */
function reasonCodeLabel(code: string): string {
  const words = code.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Whole days left until `until`, never below zero; `null` when there is no end date. */
function daysRemaining(until: Date | string | null | undefined): number | null {
  if (!until) return null;
  return Math.max(0, Math.ceil((new Date(until).getTime() - Date.now()) / DAY_MS));
}

function StatusBadge({ state }: { state: string | undefined }) {
  if (state === "Appealed") {
    return (
      <AdminBadge tone="warn" className="px-3.5 py-1.5 text-sm leading-5">
        {t("screen.admin.applications.appealReview.appealedPending")}
      </AdminBadge>
    );
  }
  if (state === "Approved") {
    return (
      <AdminBadge tone="ok" className="px-3.5 py-1.5 text-sm leading-5">
        {t("screen.admin.applications.appealReview.decidedApproved")}
      </AdminBadge>
    );
  }
  if (state === "Rejected") {
    return (
      <AdminBadge tone="bad" className="px-3.5 py-1.5 text-sm leading-5">
        {t("screen.admin.applications.appealReview.decidedRejected")}
      </AdminBadge>
    );
  }
  return null;
}

export function AppealReview() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  // An appeal is the appealed application, so the appeal id is the application id.
  const routeId = useAdminParam("appealId", getSelectedAdminApplicationId);

  const [decision, setDecision] = useState<AppealDecision>("uphold-rejection");
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const appealsQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: { state: "Appealed" } }),
    enabled: authStatus === "authenticated",
  });
  const applicationId = routeId ?? appealsQuery.data?.[0]?.id ?? null;

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: applicationId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(applicationId),
  });

  const decideAppealMutation = useMutation(
    orpc.onboarding.decideAppeal.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const detail = detailQuery.data;
  const application = detail?.application;
  const trimmedReason = reason.trim();
  const isReasonValid = trimmedReason.length >= MIN_REASON_LENGTH;
  const canSave =
    application?.state === "Appealed" && isReasonValid && !decideAppealMutation.isPending;
  const remaining = daysRemaining(application?.reapplyBlockedUntil);
  const params: AdminParams = applicationId ? { applicationId } : {};

  async function saveDecision() {
    if (!canSave || !applicationId) return;
    setErrorMessage(null);
    const upholdAppeal = decision === "uphold-appeal";
    try {
      await decideAppealMutation.mutateAsync({
        applicationId,
        decision: upholdAppeal ? "approve" : "uphold_rejection",
        decisionReasonCode: upholdAppeal ? "appeal_upheld" : "appeal_denied_uphold_rejection",
        decisionNotes: trimmedReason,
      });
      await goTo("SCR-ADM-03", { applicationId });
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : t("screen.admin.applications.appealReview.saveFailedBody"),
      );
    }
  }

  const body = application ? (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
      <div className="flex min-w-0 flex-col gap-6">
        <AdminCard title={t("screen.admin.applications.appealReview.originalApplication")}>
          <div>
            <AdminRow label={t("screen.admin.applications.appealReview.applicant")}>
              {detail?.applicant?.fullName ?? application.applicantAccountId}
            </AdminRow>
            <AdminRow label={t("screen.admin.applications.appealReview.type")}>
              {typeLabel(application.applicationType)}
            </AdminRow>
            <AdminRow label={t("screen.admin.applications.appealReview.rejectedOn")} last>
              {application.reviewedAt
                ? new Date(application.reviewedAt).toLocaleDateString(locale)
                : "—"}
            </AdminRow>
          </div>
        </AdminCard>
        <AdminCard title={t("screen.admin.applications.appealReview.originalReason")}>
          <span className="te-label">
            {application.decisionReasonCode ? reasonCodeLabel(application.decisionReasonCode) : "—"}
          </span>
          <p className="te-body">
            {application.decisionNotes ?? t("screen.admin.applications.appealReview.noMessage")}
          </p>
        </AdminCard>
        <AdminCard title={t("screen.admin.applications.appealReview.appealStatement")}>
          <p className="te-body whitespace-pre-line text-[var(--te-ink-muted)]">
            {application.appealStatement ?? t("screen.admin.applications.appealReview.noStatement")}
          </p>
          <span className="te-caption">
            {t("screen.admin.applications.appealReview.appealWindow", {
              days: remaining === null ? "—" : String(remaining),
            })}
          </span>
        </AdminCard>
      </div>
      <AdminCard title={t("screen.admin.applications.appealReview.decision")}>
        <AdminRadioGroup
          legend={
            <span className="sr-only">{t("screen.admin.applications.appealReview.decision")}</span>
          }
          name="appeal-decision"
          value={decision}
          options={decisionOptions()}
          onValueChange={(value) => setDecision(value as AppealDecision)}
        />
        <AdminTextarea
          label={t("screen.admin.applications.appealReview.reasonRequired")}
          value={reason}
          required
          placeholder={t("screen.admin.applications.appealReview.reasonPlaceholder")}
          onChange={(event) => setReason(event.target.value)}
          help={
            reason.length > 0 && !isReasonValid
              ? t("screen.admin.applications.appealReview.reasonTooShort")
              : undefined
          }
        />
        {errorMessage ? (
          <AdminAlert tone="danger" title={t("screen.admin.applications.appealReview.saveFailed")}>
            {errorMessage}
          </AdminAlert>
        ) : null}
        <div className="flex flex-wrap justify-end gap-3">
          <AdminLink screen="SCR-ADM-03" params={params} variant="secondary">
            {t("screen.admin.applications.appealReview.cancel")}
          </AdminLink>
          <AdminButton
            variant="primary"
            disabled={!canSave}
            aria-busy={decideAppealMutation.isPending}
            onClick={() => void saveDecision()}
          >
            {decideAppealMutation.isPending
              ? t("screen.admin.applications.appealReview.saving")
              : t("screen.admin.applications.appealReview.saveDecision")}
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  ) : null;

  return (
    <AdminPage
      title={t("screen.admin.applications.appealReview.title")}
      description={t("screen.admin.applications.appealReview.description")}
      actions={<StatusBadge state={application?.state} />}
    >
      {applicationId ? (
        <AdminQueryState
          query={detailQuery}
          loadingLabel={t("screen.admin.applications.appealReview.loading")}
        >
          {body}
        </AdminQueryState>
      ) : (
        <AdminQueryState
          query={appealsQuery}
          loadingLabel={t("screen.admin.applications.appealReview.loading")}
        >
          <AdminEmpty
            title={t("screen.admin.applications.appealReview.emptyTitle")}
            description={t("screen.admin.applications.appealReview.emptyBody")}
          />
        </AdminQueryState>
      )}
    </AdminPage>
  );
}
