import { useEffect, useState } from "react";
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
import { useAuth } from "@/auth/auth-context";
import {
  getSelectedAdminApplicationId,
  setSelectedAdminApplicationId,
} from "@/screens/onboarding-state";
import { client } from "@/utils/orpc";
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

const DEFAULT_DOCUMENTS: readonly DocumentRow[] = [
  { id: "doc-1", label: "Identity document", verified: false },
  { id: "doc-2", label: "Insurance certificate", verified: false },
  { id: "doc-3", label: "Initial lab result", verified: false },
];

const VERIFIED: AdminStatusPresentation = { tone: "success", icon: "check", label: "Verified" };
const NOT_VERIFIED: AdminStatusPresentation = {
  tone: "warning",
  icon: "alert",
  label: "Not verified",
};

const STEPS: readonly TeStep[] = [
  { id: "submitted", label: "Submitted" },
  { id: "documents", label: "Documents" },
  { id: "checks", label: "Checks" },
  { id: "decision", label: "Decision" },
];

const INITIAL_CHECKS: readonly TeChecklistItem[] = [
  { id: "background", label: "Background check consent signed", checked: false },
  { id: "lab-consent", label: "Lab consent signed", checked: false },
  { id: "lab-result", label: "Initial lab result dated within 30 days", checked: false },
  { id: "insurance", label: "Insurance valid for 3 months or more", checked: false },
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
  const [applicationId, setApplicationId] = useState<string | null>(() =>
    getSelectedAdminApplicationId(),
  );
  const [applicantName, setApplicantName] = useState("[Applicant name]");
  const [applicantEmail, setApplicantEmail] = useState("[Email]");
  const [applicantPhone, setApplicantPhone] = useState("[Phone]");
  const [applicantCountry, setApplicantCountry] = useState("[Country]");
  const [role, setRole] = useState<TeRole>("driver");
  const [submittedAt, setSubmittedAt] = useState("[Date and time]");
  const [appStatus, setAppStatus] = useState<TeApplicationStatus>("pending");
  const [documents, setDocuments] = useState<readonly DocumentRow[]>(DEFAULT_DOCUMENTS);
  const [duplicateHold, setDuplicateHold] = useState(false);
  const [checks, setChecks] = useState(INITIAL_CHECKS);
  const [openedPreviewKey, setOpenedPreviewKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const goTo = useAdminNavigate();
  const allChecked = checks.every((item) => item.checked);
  const allVerified = documents.length > 0 && documents.every((document) => document.verified);
  const canApprove = allChecked && allVerified && !duplicateHold && !busy;

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;

    async function load() {
      let targetId = getSelectedAdminApplicationId();
      if (!targetId || targetId.startsWith("app-")) {
        const queue = await client.onboarding.listReviewQueue({});
        targetId = queue[0]?.id ?? null;
        if (targetId) {
          setSelectedAdminApplicationId(targetId);
        }
      }
      if (!targetId) return;

      const detail = await client.onboarding.getApplicationDetail({ applicationId: targetId });
      if (cancelled) return;

      setApplicationId(detail.application.id);
      const payload = (detail.application.payload ?? {}) as Record<string, unknown>;
      setApplicantName(
        detail.applicant?.fullName ??
          (typeof payload.legalEntityName === "string"
            ? payload.legalEntityName
            : "[Applicant name]"),
      );
      setApplicantEmail(
        detail.applicant?.email ??
          (typeof payload.billingContactEmail === "string"
            ? payload.billingContactEmail
            : "[Email]"),
      );
      setApplicantPhone(
        detail.applicant?.phone ??
          (typeof payload.billingContactPhone === "string"
            ? payload.billingContactPhone
            : "[Phone]"),
      );
      setApplicantCountry(
        typeof payload.countryCode === "string"
          ? payload.countryCode
          : typeof payload.country === "string"
            ? payload.country
            : "EG",
      );
      setRole(mapRole(detail.application.applicationType));
      setSubmittedAt(new Date(detail.application.createdAt).toLocaleString());
      setAppStatus(mapStatus(detail.application.state));
      setDuplicateHold(Boolean(detail.duplicateHold));

      if (detail.documents.length > 0) {
        setDocuments(
          detail.documents.map((doc) => ({
            id: doc.id,
            label: doc.documentType.replace(/_/g, " "),
            verified: doc.verifiedStatus === "verified",
          })),
        );
      }

      const hasBgConsent = (detail.consents ?? []).some(
        (c) => c.consentType === "driver_background_check",
      );
      const hasLabConsent = (detail.consents ?? []).some(
        (c) => c.consentType === "driver_lab_test",
      );
      if (hasBgConsent || hasLabConsent) {
        setChecks((prev) =>
          prev.map((item) => {
            if (item.id === "background" && hasBgConsent) return { ...item, checked: true };
            if (item.id === "lab-consent" && hasLabConsent) return { ...item, checked: true };
            return item;
          }),
        );
      }
    }

    void load().catch(() => {
      // Keep default preview data when no backend session is active
    });
    return () => {
      cancelled = true;
    };
  }, [authStatus]);

  function toggleCheck(id: string) {
    setChecks((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }

  async function handleViewDocument(row: DocumentRow) {
    if (!applicationId || row.id.startsWith("doc-")) {
      setOpenedPreviewKey(`preview/${row.label}`);
      return;
    }
    try {
      const opened = await client.onboarding.openApplicationDocument({
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
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === row.id ? { ...doc, verified: nextVerified } : doc)),
    );
    if (!applicationId || row.id.startsWith("doc-")) return;
    try {
      await client.onboarding.verifyApplicationDocument({
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
    setBusy(true);
    setErrorMsg(null);
    try {
      await client.onboarding.approveApplication({
        applicationId,
        decisionReasonCode: "verified_complete",
      });
      await goTo("application-queue");
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not approve application.");
    } finally {
      setBusy(false);
    }
  }

  const documentColumns: readonly TeDataTableColumn<DocumentRow>[] = [
    { key: "label", header: "Document" },
    {
      key: "verified",
      header: "Status",
      render: (row) => <AdminStatus status={row.verified ? VERIFIED : NOT_VERIFIED} />,
    },
    {
      key: "view",
      header: "Restricted view",
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <TeButton
            variant="ghost"
            aria-label={`View ${row.label}`}
            onClick={() => void handleViewDocument(row)}
          >
            View
          </TeButton>
          <TeButton
            variant="secondary"
            aria-label={row.verified ? `Unverify ${row.label}` : `Verify ${row.label}`}
            onClick={() => void handleToggleVerifyDocument(row)}
          >
            {row.verified ? "Unverify" : "Verify"}
          </TeButton>
        </div>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title="Application review detail"
        description="Check the submitted data and documents, then decide."
      />
      <StatePreview
        emptyTitle="No documents"
        emptyDescription="The applicant has not uploaded documents."
        loadingLabel="Loading the application."
      >
        <TeStepper
          steps={STEPS}
          currentId="checks"
          completedIds={["submitted", "documents"]}
          ariaLabel="Review steps"
        />
        <TeApplicationCard
          applicant={applicantName}
          role={role}
          submittedAt={submittedAt}
          status={appStatus}
          documents={documents}
        />
        {duplicateHold ? (
          <TeInlineAlert tone="error" title="Duplicate registration hold">
            Another organization already uses this commercial registration number or tax number.
            Approval is blocked while this duplicate hold is active.
          </TeInlineAlert>
        ) : null}
        {openedPreviewKey ? (
          <TeInlineAlert tone="info" title="Restricted document opened (audit logged)">
            Viewing: {openedPreviewKey}
          </TeInlineAlert>
        ) : null}
        {errorMsg ? (
          <TeInlineAlert tone="error" title="Action failed">
            {errorMsg}
          </TeInlineAlert>
        ) : null}
        <AdminPanel title="Applicant data">
          <AdminFacts
            items={[
              { label: "Applicant name", value: applicantName },
              { label: "Email", value: applicantEmail },
              { label: "Phone", value: applicantPhone },
              { label: "Country", value: applicantCountry },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Documents">
          <TeDataTable
            columns={documentColumns}
            rows={documents}
            getRowKey={(row) => row.id}
            caption="Submitted documents"
            emptyTitle="No documents"
            emptyDescription="The applicant has not uploaded documents."
          />
        </AdminPanel>
        <AdminPanel title="Checks (driver)">
          <TeChecklist items={checks} onToggle={toggleCheck} ariaLabel="Driver checks" />
        </AdminPanel>
        <TeInlineAlert tone="warning" title="Approve is blocked">
          Approve stays off until every check passes and every document is verified. Approval
          assigns the Starter plan (D-24).
        </TeInlineAlert>
        <AdminPanel
          title="Decision"
          footer={
            <AdminActions>
              <AdminScreenLink slug="application-queue">Back to queue</AdminScreenLink>
              <AdminScreenLink slug="reject-with-reason-decision" variant="ghost">
                Reject
              </AdminScreenLink>
              <AdminScreenLink slug="request-changes-decision" variant="secondary">
                Request changes
              </AdminScreenLink>
              <TeButton disabled={!canApprove} onClick={() => void handleApprove()}>
                {busy ? "Approving..." : "Approve application"}
              </TeButton>
            </AdminActions>
          }
        >
          <p className="te-caption">
            Choose one decision. Each decision is written to the audit log.
          </p>
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
