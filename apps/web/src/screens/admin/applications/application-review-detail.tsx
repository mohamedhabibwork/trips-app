import { useState } from "react";
import { TeApplicationCard } from "@trips-app/ui/components/te-application-card";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeStepper, type TeStep } from "@trips-app/ui/components/te-stepper";
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
  label: string;
  verified: boolean;
}

const DOCUMENTS: readonly DocumentRow[] = [
  { label: "Identity document", verified: false },
  { label: "Insurance certificate", verified: false },
  { label: "Initial lab result", verified: false },
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

const DOCUMENT_COLUMNS: readonly TeDataTableColumn<DocumentRow>[] = [
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
      <TeButton variant="ghost" aria-label={`View ${row.label}`}>
        View
      </TeButton>
    ),
  },
];

export function ApplicationReviewDetail() {
  const [checks, setChecks] = useState(INITIAL_CHECKS);
  const goTo = useAdminNavigate();
  const allChecked = checks.every((item) => item.checked);
  const allVerified = DOCUMENTS.every((document) => document.verified);
  const canApprove = allChecked && allVerified;

  function toggleCheck(id: string) {
    setChecks((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  }

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
          applicant="[Applicant name]"
          role="driver"
          submittedAt="[Date and time]"
          status="pending"
          documents={DOCUMENTS}
        />
        <AdminPanel title="Applicant data">
          <AdminFacts
            items={[
              { label: "Applicant name", value: "[Applicant name]" },
              { label: "Email", value: "[Email]" },
              { label: "Phone", value: "[Phone]" },
              { label: "Country", value: "[Country]" },
            ]}
          />
        </AdminPanel>
        <AdminPanel title="Documents">
          <TeDataTable
            columns={DOCUMENT_COLUMNS}
            rows={DOCUMENTS}
            getRowKey={(row) => row.label}
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
              <TeButton disabled={!canApprove} onClick={() => goTo("application-queue")}>
                Approve application
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
