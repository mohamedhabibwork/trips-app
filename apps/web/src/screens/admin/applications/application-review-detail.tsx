import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  TeApplicationCard,
  type TeApplicationStatus,
} from "@trips-app/ui/components/te-application-card";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeRole } from "@trips-app/ui/components/te-role-badge";
import { TeStepper, type TeStep } from "@trips-app/ui/components/te-stepper";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import {
  getSelectedAdminApplicationId,
  setSelectedAdminApplicationId,
} from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";
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

interface DocumentRow {
  id: string;
  label: string;
  verified: boolean;
}

const DEFAULT_DOCUMENTS = (): readonly DocumentRow[] => [
  {
    id: "doc-1",
    label: t("screen.admin.applications.applicationReviewDetail.identityDocument"),
    verified: false,
  },
  {
    id: "doc-2",
    label: t("screen.admin.applications.applicationReviewDetail.insuranceCertificate"),
    verified: false,
  },
  {
    id: "doc-3",
    label: t("screen.admin.applications.applicationReviewDetail.initialLabResult"),
    verified: false,
  },
];

const VERIFIED = (): AdminStatusPresentation => ({
  tone: "success",
  icon: "check",
  label: t("screen.admin.applications.applicationReviewDetail.verified"),
});
const NOT_VERIFIED = (): AdminStatusPresentation => ({
  tone: "warning",
  icon: "alert",
  label: t("screen.admin.applications.applicationReviewDetail.notVerified"),
});

const STEPS = (): readonly TeStep[] => [
  { id: "submitted", label: t("screen.admin.applications.applicationReviewDetail.submitted") },
  { id: "documents", label: t("screen.admin.applications.applicationReviewDetail.documents") },
  { id: "checks", label: t("screen.admin.applications.applicationReviewDetail.checks") },
  { id: "decision", label: t("screen.admin.applications.applicationReviewDetail.decision") },
];

const INITIAL_CHECKS = (): readonly TeChecklistItem[] => [
  {
    id: "background",
    label: t("screen.admin.applications.applicationReviewDetail.backgroundCheckConsentSigned"),
    checked: false,
  },
  {
    id: "lab-consent",
    label: t("screen.admin.applications.applicationReviewDetail.labConsentSigned"),
    checked: false,
  },
  {
    id: "lab-result",
    label: t("screen.admin.applications.applicationReviewDetail.initialLabResultDatedWithin"),
    checked: false,
  },
  {
    id: "insurance",
    label: t("screen.admin.applications.applicationReviewDetail.insuranceValidFor3Months"),
    checked: false,
  },
];

function mapRole(applicationType: string): TeRole {
  if (applicationType === "organization") return "organization";
  if (applicationType === "platform_photographer") return "photographer";
  return "driver";
}

function mapStatus(state: string): TeApplicationStatus {
  if (state === "Changes Requested") return "changes-requested";
  if (state === "Approved") return "approved";
  if (state === "Rejected" || state === "Closed") return "rejected";
  return "pending";
}

export function ApplicationReviewDetail() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();

  const [checkOverrides, setCheckOverrides] = useState<Record<string, boolean>>({});
  const [verifiedDocOverrides, setVerifiedDocOverrides] = useState<Record<string, boolean>>({});
  const [openedPreviewKey, setOpenedPreviewKey] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const selectedId = getSelectedAdminApplicationId();
  const fallbackId = queueQuery.data?.[0]?.id ?? null;
  const targetId = selectedId || fallbackId;

  if (targetId && !selectedId) {
    setSelectedAdminApplicationId(targetId);
  }

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: targetId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(targetId),
  });

  const openDocMutation = useMutation(orpc.onboarding.openApplicationDocument.mutationOptions({}));
  const verifyDocMutation = useMutation(
    orpc.onboarding.verifyApplicationDocument.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );
  const approveMutation = useMutation(
    orpc.onboarding.approveApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );

  const detail = detailQuery.data;
  const applicationId = detail?.application.id ?? targetId;
  const payload = (detail?.application.payload ?? {}) as Record<string, unknown>;
  const applicantName =
    detail?.applicant?.fullName ??
    (typeof payload.legalEntityName === "string"
      ? payload.legalEntityName
      : (detail?.application.applicantAccountId ?? "-"));
  const applicantEmail =
    detail?.applicant?.email ??
    (typeof payload.billingContactEmail === "string" ? payload.billingContactEmail : "-");
  const applicantPhone =
    detail?.applicant?.phone ??
    (typeof payload.billingContactPhone === "string" ? payload.billingContactPhone : "-");
  const applicantCountry =
    typeof payload.countryCode === "string"
      ? payload.countryCode
      : typeof payload.country === "string"
        ? payload.country
        : "EG";
  const role: TeRole = detail?.application.applicationType
    ? mapRole(detail.application.applicationType)
    : "driver";
  const submittedAt = detail?.application.createdAt
    ? new Date(detail.application.createdAt).toLocaleString()
    : "-";
  const appStatus: TeApplicationStatus = detail?.application.state
    ? mapStatus(detail.application.state)
    : "pending";
  const duplicateHold = Boolean(detail?.duplicateHold);

  const documents: readonly DocumentRow[] =
    detail?.documents && detail.documents.length > 0
      ? detail.documents.map((doc) => ({
          id: doc.id,
          label: doc.documentType.replace(/_/g, " "),
          verified:
            verifiedDocOverrides[doc.id] !== undefined
              ? verifiedDocOverrides[doc.id]
              : doc.verifiedStatus === "verified",
        }))
      : DEFAULT_DOCUMENTS().map((doc) => ({
          ...doc,
          verified:
            verifiedDocOverrides[doc.id] !== undefined
              ? verifiedDocOverrides[doc.id]
              : doc.verified,
        }));

  const hasBgConsent = Boolean(
    detail?.consents?.some((c) => c.consentType === "driver_background_check"),
  );
  const hasLabConsent = Boolean(detail?.consents?.some((c) => c.consentType === "driver_lab_test"));

  const checks: readonly TeChecklistItem[] = INITIAL_CHECKS().map((item) => {
    let checked = checkOverrides[item.id];
    if (checked === undefined) {
      if (item.id === "background" && hasBgConsent) checked = true;
      else if (item.id === "lab-consent" && hasLabConsent) checked = true;
      else checked = false;
    }
    return { ...item, checked };
  });

  const allChecked = checks.every((item) => item.checked);
  const allVerified = documents.length > 0 && documents.every((document) => document.verified);
  const busy = approveMutation.isPending;
  const canApprove = allChecked && allVerified && !duplicateHold && !busy;

  function toggleCheck(id: string) {
    const currentChecked = checks.find((item) => item.id === id)?.checked ?? false;
    setCheckOverrides((prev) => ({ ...prev, [id]: !currentChecked }));
  }

  async function handleViewDocument(row: DocumentRow) {
    if (!applicationId || row.id.startsWith("doc-")) {
      setOpenedPreviewKey(`preview/${row.label}`);
      return;
    }
    try {
      const opened = await openDocMutation.mutateAsync({
        applicationId,
        documentId: row.id,
      });
      setOpenedPreviewKey(opened.document.storageKey);
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not open document.");
    }
  }

  async function handleToggleVerifyDocument(row: DocumentRow) {
    const nextVerified = !row.verified;
    setVerifiedDocOverrides((prev) => ({ ...prev, [row.id]: nextVerified }));
    if (!applicationId || row.id.startsWith("doc-")) return;
    try {
      await verifyDocMutation.mutateAsync({
        applicationId,
        documentId: row.id,
        verifiedStatus: nextVerified ? "verified" : "rejected",
        rejectionNote: nextVerified ? undefined : "Marked unverified during review",
      });
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not update verification.");
    }
  }

  async function handleApprove() {
    if (!canApprove) return;
    if (!applicationId) {
      await goTo("application-queue");
      return;
    }
    setErrorMsg(null);
    try {
      await approveMutation.mutateAsync({
        applicationId,
        decisionReasonCode: "verified_complete",
      });
      await goTo("application-queue");
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not approve application.");
    }
  }

  const documentColumns: readonly TeDataTableColumn<DocumentRow>[] = [
    { key: "label", header: t("screen.admin.applications.applicationReviewDetail.document") },
    {
      key: "verified",
      header: t("screen.admin.applications.applicationReviewDetail.status"),
      render: (row) => <AdminStatus status={row.verified ? VERIFIED() : NOT_VERIFIED()} />,
    },
    {
      key: "view",
      header: t("screen.admin.applications.applicationReviewDetail.restrictedView"),
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <TeButton
            variant="ghost"
            aria-label={t("screen.admin.applications.applicationReviewDetail.view", {
              label: row.label,
            })}
            onClick={() => void handleViewDocument(row)}
          >
            {t("screen.admin.applications.applicationReviewDetail.view2")}
          </TeButton>
          <TeButton
            variant="secondary"
            aria-label={row.verified ? `Unverify ${row.label}` : `Verify ${row.label}`}
            onClick={() => void handleToggleVerifyDocument(row)}
          >
            {row.verified
              ? t("screen.admin.applications.applicationReviewDetail.unverify")
              : t("screen.admin.applications.applicationReviewDetail.verify")}
          </TeButton>
        </div>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.applications.applicationReviewDetail.applicationReviewDetail")}
        description={t(
          "screen.admin.applications.applicationReviewDetail.checkTheSubmittedDataAnd",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.applications.applicationReviewDetail.noDocuments")}
        emptyDescription={t(
          "screen.admin.applications.applicationReviewDetail.theApplicantHasNotUploaded",
        )}
        loadingLabel={t("screen.admin.applications.applicationReviewDetail.loadingTheApplication")}
      >
        <TeStepper
          steps={STEPS()}
          currentId="checks"
          completedIds={["submitted", "documents"]}
          ariaLabel={t("screen.admin.applications.applicationReviewDetail.reviewSteps")}
        />
        <TeApplicationCard
          applicant={applicantName}
          role={role}
          submittedAt={submittedAt}
          status={appStatus}
          documents={documents}
        />
        {duplicateHold ? (
          <TeInlineAlert
            tone="error"
            title={t("screen.admin.applications.applicationReviewDetail.duplicateRegistrationHold")}
          >
            {t(
              "screen.admin.applications.applicationReviewDetail.anotherOrganizationAlreadyUsesThis",
            )}
          </TeInlineAlert>
        ) : null}
        {openedPreviewKey ? (
          <TeInlineAlert
            tone="info"
            title={t(
              "screen.admin.applications.applicationReviewDetail.restrictedDocumentOpenedAuditLogged",
            )}
          >
            {t("screen.admin.applications.applicationReviewDetail.viewing")} {openedPreviewKey}
          </TeInlineAlert>
        ) : null}
        {errorMsg ? (
          <TeInlineAlert
            tone="error"
            title={t("screen.admin.applications.applicationReviewDetail.actionFailed")}
          >
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title={t("screen.admin.applications.applicationReviewDetail.applicantData")}>
          <AdminFacts
            items={[
              {
                label: t("screen.admin.applications.applicationReviewDetail.applicantName"),
                value: applicantName,
              },
              {
                label: t("screen.admin.applications.applicationReviewDetail.email"),
                value: applicantEmail,
              },
              {
                label: t("screen.admin.applications.applicationReviewDetail.phone"),
                value: applicantPhone,
              },
              {
                label: t("screen.admin.applications.applicationReviewDetail.country"),
                value: applicantCountry,
              },
            ]}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.applications.applicationReviewDetail.documentsTitle")}>
          <TeDataTable
            columns={documentColumns}
            rows={documents}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.applications.applicationReviewDetail.submittedDocuments")}
            emptyTitle={t(
              "screen.admin.applications.applicationReviewDetail.noDocumentsEmptyTitle",
            )}
            emptyDescription={t(
              "screen.admin.applications.applicationReviewDetail.theApplicantHasNotUploadedEmptyDescription",
            )}
          />
        </AdminPanel>
        <AdminPanel title={t("screen.admin.applications.applicationReviewDetail.checksDriver")}>
          <TeChecklist
            items={checks}
            onToggle={toggleCheck}
            ariaLabel={t("screen.admin.applications.applicationReviewDetail.driverChecks")}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="warning"
          title={t("screen.admin.applications.applicationReviewDetail.approveIsBlocked")}
        >
          {t("screen.admin.applications.applicationReviewDetail.approveStaysOffUntilEvery")}
        </TeInlineAlert>
        <AdminPanel
          title={t("screen.admin.applications.applicationReviewDetail.decisionTitle")}
          footer={
            <AdminActions>
              <AdminScreenLink slug="application-queue">
                {t("screen.admin.applications.applicationReviewDetail.backToQueue")}
              </AdminScreenLink>
              <AdminScreenLink slug="reject-with-reason-decision" variant="ghost">
                {t("screen.admin.applications.applicationReviewDetail.reject")}
              </AdminScreenLink>
              <AdminScreenLink slug="request-changes-decision" variant="secondary">
                {t("screen.admin.applications.applicationReviewDetail.requestChanges")}
              </AdminScreenLink>
              <TeButton disabled={!canApprove} onClick={() => void handleApprove()}>
                {busy
                  ? t("screen.admin.applications.applicationReviewDetail.approving")
                  : t("screen.admin.applications.applicationReviewDetail.approveApplication")}
              </TeButton>
            </AdminActions>
          }
        >
          <p className="te-caption">
            {t("screen.admin.applications.applicationReviewDetail.chooseOneDecisionEachDecision")}
          </p>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
