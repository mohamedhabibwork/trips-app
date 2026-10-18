// SCR-ADM-03 Application review (docs/design/web/admin/SCR-ADM-03.dc.html): the applicant's data,
// documents and checks, with the decision in the header. Reject opens SCR-ADM-05, Request changes
// opens SCR-ADM-04, Approve runs the approve mutation once every check passes and every document
// is verified.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import {
  getSelectedAdminApplicationId,
  setSelectedAdminApplicationId,
} from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";

import {
  AdminButton,
  AdminLink,
  useAdminNavigate,
  useAdminParam,
  type AdminParams,
} from "../common/admin-actions";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminCard, AdminPage, AdminRow, AdminSplit } from "../common/admin-ui";
import {
  ChecksCard,
  DocumentsCard,
  type ReviewCheck,
  type ReviewDocument,
  type ReviewDocumentStatus,
} from "./application-review-sections";

const RESTRICTED_DOCUMENT = /identity|national|passport|id_card/i;

interface DriverCheckDefinition {
  id: string;
  label: string;
  /** The consent that proves the check; checks without one are confirmed by the reviewer. */
  consentType?: string;
}

const driverChecks = (): readonly DriverCheckDefinition[] => [
  {
    id: "background",
    label: t("screen.admin.applications.applicationReviewDetail.backgroundConsent"),
    consentType: "driver_background_check",
  },
  {
    id: "lab-consent",
    label: t("screen.admin.applications.applicationReviewDetail.labConsent"),
    consentType: "driver_lab_test",
  },
  {
    id: "lab-result",
    label: t("screen.admin.applications.applicationReviewDetail.initialLabResult"),
  },
  {
    id: "insurance",
    label: t("screen.admin.applications.applicationReviewDetail.insuranceValid"),
  },
];

function typeLabel(applicationType: string): string {
  if (applicationType === "organization")
    return t("screen.admin.applications.applicationReviewDetail.organization");
  if (applicationType === "platform_photographer")
    return t("screen.admin.applications.applicationReviewDetail.photographer");
  return t("screen.admin.applications.applicationReviewDetail.driver");
}

function readText(payload: Record<string, unknown>, ...keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

/** `insurance_certificate` → `Insurance certificate`. */
function documentLabel(documentType: string): string {
  const words = documentType.replace(/[_-]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function documentStatus(verifiedStatus: string | null): ReviewDocumentStatus {
  if (verifiedStatus === "verified") return "verified";
  if (verifiedStatus === "rejected") return "rejected";
  return "received";
}

function errorText(caught: unknown): string {
  return caught instanceof Error
    ? caught.message
    : t("screen.admin.applications.applicationReviewDetail.actionFailedBody");
}

export function ApplicationReviewDetail() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const routeId = useAdminParam("applicationId", getSelectedAdminApplicationId);

  const [checkOverrides, setCheckOverrides] = useState<Readonly<Record<string, boolean>>>({});
  const [openedDocument, setOpenedDocument] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });
  // Without an id in the URL or the session, review the first application in the queue.
  const applicationId = routeId ?? queueQuery.data?.[0]?.id ?? null;

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: applicationId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(applicationId),
  });

  const invalidateOnboarding = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
  };
  const openDocMutation = useMutation(orpc.onboarding.openApplicationDocument.mutationOptions({}));
  const verifyDocMutation = useMutation(
    orpc.onboarding.verifyApplicationDocument.mutationOptions({ onSuccess: invalidateOnboarding }),
  );
  const approveMutation = useMutation(
    orpc.onboarding.approveApplication.mutationOptions({ onSuccess: invalidateOnboarding }),
  );

  const detail = detailQuery.data;
  const application = detail?.application;
  const payload = (application?.payload ?? {}) as Record<string, unknown>;
  const isDriver = application?.applicationType === "platform_driver";

  const documents: readonly ReviewDocument[] = (detail?.documents ?? []).map((document) => ({
    id: document.id,
    label: documentLabel(document.documentType),
    status: documentStatus(document.verifiedStatus),
    restricted: RESTRICTED_DOCUMENT.test(document.documentType),
  }));

  const consentTypes: ReadonlySet<string> = new Set(
    (detail?.consents ?? []).map((consent) => consent.consentType),
  );
  const checks: readonly ReviewCheck[] = isDriver
    ? driverChecks().map((check) => ({
        id: check.id,
        label: check.label,
        confirmable: !check.consentType,
        passed: check.consentType
          ? consentTypes.has(check.consentType)
          : (checkOverrides[check.id] ?? false),
      }))
    : [];

  const duplicateHold = Boolean(detail?.duplicateHold);
  const allChecksPassed = checks.every((check) => check.passed);
  const allDocumentsVerified =
    documents.length > 0 && documents.every((document) => document.status === "verified");
  const canApprove =
    Boolean(application) &&
    allChecksPassed &&
    allDocumentsVerified &&
    !duplicateHold &&
    !approveMutation.isPending;
  const params: AdminParams = applicationId ? { applicationId } : {};

  function rememberApplication() {
    if (applicationId) setSelectedAdminApplicationId(applicationId);
  }

  function toggleCheck(id: string) {
    setCheckOverrides((current) => ({ ...current, [id]: !(current[id] ?? false) }));
  }

  async function openDocument(document: ReviewDocument) {
    if (!applicationId) return;
    setErrorMessage(null);
    try {
      await openDocMutation.mutateAsync({ applicationId, documentId: document.id });
      setOpenedDocument(document.label);
    } catch (caught) {
      setErrorMessage(errorText(caught));
    }
  }

  async function toggleVerified(document: ReviewDocument) {
    if (!applicationId) return;
    const verify = document.status !== "verified";
    setErrorMessage(null);
    try {
      await verifyDocMutation.mutateAsync({
        applicationId,
        documentId: document.id,
        verifiedStatus: verify ? "verified" : "rejected",
        rejectionNote: verify
          ? undefined
          : t("screen.admin.applications.applicationReviewDetail.unverifiedNote"),
      });
    } catch (caught) {
      setErrorMessage(errorText(caught));
    }
  }

  async function approve() {
    if (!canApprove || !applicationId) return;
    setErrorMessage(null);
    try {
      await approveMutation.mutateAsync({
        applicationId,
        decisionReasonCode: "verified_complete",
      });
      await goTo("SCR-ADM-02");
    } catch (caught) {
      setErrorMessage(errorText(caught));
    }
  }

  const actions = (
    <>
      <AdminLink
        screen="SCR-ADM-05"
        params={params}
        variant="danger-outline"
        onClick={rememberApplication}
      >
        {t("screen.admin.applications.applicationReviewDetail.reject")}
      </AdminLink>
      <AdminLink
        screen="SCR-ADM-04"
        params={params}
        variant="secondary"
        onClick={rememberApplication}
      >
        {t("screen.admin.applications.applicationReviewDetail.requestChanges")}
      </AdminLink>
      <AdminButton
        variant="primary"
        disabled={!canApprove}
        aria-busy={approveMutation.isPending}
        onClick={() => void approve()}
      >
        {approveMutation.isPending
          ? t("screen.admin.applications.applicationReviewDetail.approving")
          : t("screen.admin.applications.applicationReviewDetail.approve")}
      </AdminButton>
    </>
  );

  const body = application ? (
    <AdminSplit
      main={
        <>
          <AdminCard title={t("screen.admin.applications.applicationReviewDetail.applicantData")}>
            <div className="grid grid-cols-1 gap-x-6 gap-y-1 sm:grid-cols-2">
              <AdminRow label={t("screen.admin.applications.applicationReviewDetail.applicant")}>
                {detail?.applicant?.fullName ??
                  readText(payload, "legalEntityName") ??
                  application.applicantAccountId}
              </AdminRow>
              <AdminRow label={t("screen.admin.applications.applicationReviewDetail.type")}>
                {typeLabel(application.applicationType)}
              </AdminRow>
              <AdminRow label={t("screen.admin.applications.applicationReviewDetail.country")}>
                {readText(payload, "countryCode", "country") ?? "—"}
              </AdminRow>
              <AdminRow label={t("screen.admin.applications.applicationReviewDetail.submitted")}>
                {new Date(application.createdAt).toLocaleDateString(locale)}
              </AdminRow>
            </div>
          </AdminCard>
          <DocumentsCard
            documents={documents}
            disabled={openDocMutation.isPending || verifyDocMutation.isPending}
            onOpen={(document) => void openDocument(document)}
            onToggleVerified={(document) => void toggleVerified(document)}
          />
          <ChecksCard
            caption={
              isDriver
                ? t("screen.admin.applications.applicationReviewDetail.driverChecks")
                : t("screen.admin.applications.applicationReviewDetail.noChecksForType")
            }
            checks={checks}
            onToggle={toggleCheck}
          />
        </>
      }
      side={
        <>
          <AdminCard title={t("screen.admin.applications.applicationReviewDetail.decision")}>
            <p className="te-body text-[var(--te-ink-muted)]">
              {canApprove
                ? t("screen.admin.applications.applicationReviewDetail.readyToApprove")
                : t("screen.admin.applications.applicationReviewDetail.approveBlocked")}
            </p>
          </AdminCard>
          {duplicateHold ? (
            <AdminAlert
              tone="danger"
              title={t("screen.admin.applications.applicationReviewDetail.duplicateHold")}
            >
              {t("screen.admin.applications.applicationReviewDetail.duplicateHoldBody")}
            </AdminAlert>
          ) : null}
          {errorMessage ? (
            <AdminAlert
              tone="danger"
              title={t("screen.admin.applications.applicationReviewDetail.actionFailed")}
            >
              {errorMessage}
            </AdminAlert>
          ) : null}
          {openedDocument ? (
            <AdminAlert
              tone="success"
              title={t("screen.admin.applications.applicationReviewDetail.documentOpened", {
                document: openedDocument,
              })}
            >
              {t("screen.admin.applications.applicationReviewDetail.auditRecorded")}
            </AdminAlert>
          ) : null}
          <AdminAlert
            tone="info"
            title={t("screen.admin.applications.applicationReviewDetail.restrictedTitle")}
          >
            {t("screen.admin.applications.applicationReviewDetail.auditRecorded")}
          </AdminAlert>
        </>
      }
    />
  ) : null;

  return (
    <AdminPage
      title={t("screen.admin.applications.applicationReviewDetail.title")}
      description={t("screen.admin.applications.applicationReviewDetail.description")}
      actions={actions}
    >
      {applicationId ? (
        <AdminQueryState
          query={detailQuery}
          loadingLabel={t("screen.admin.applications.applicationReviewDetail.loading")}
        >
          {body}
        </AdminQueryState>
      ) : (
        <AdminQueryState
          query={queueQuery}
          loadingLabel={t("screen.admin.applications.applicationReviewDetail.loading")}
        >
          <AdminEmpty
            title={t("screen.admin.applications.applicationReviewDetail.emptyTitle")}
            description={t("screen.admin.applications.applicationReviewDetail.emptyBody")}
          />
        </AdminQueryState>
      )}
    </AdminPage>
  );
}
