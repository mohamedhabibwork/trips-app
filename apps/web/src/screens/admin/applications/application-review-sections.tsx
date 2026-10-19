// The Documents and Checks cards of SCR-ADM-03 Application review
// (docs/design/web/admin/SCR-ADM-03.dc.html). Presentational: the screen passes the rows and the
// handlers that call the document mutations.
import { t } from "@trips-app/i18n";

import { AdminButton } from "../common/admin-actions";
import { AdminEmpty } from "../common/admin-states";
import { AdminBadge, AdminCard, AdminRow } from "../common/admin-ui";

export type ReviewDocumentStatus = "received" | "verified" | "rejected";

export interface ReviewDocument {
  id: string;
  label: string;
  status: ReviewDocumentStatus;
  /** Identity documents open only in the audit-logged restricted view. */
  restricted: boolean;
}

export interface ReviewCheck {
  id: string;
  label: string;
  passed: boolean;
  /** Checks with no stored evidence are confirmed by the reviewer. */
  confirmable: boolean;
}

function DocumentStatusBadge({ status }: { status: ReviewDocumentStatus }) {
  if (status === "verified") {
    return (
      <AdminBadge tone="ok">
        {t("screen.admin.applications.applicationReviewSections.verified")}
      </AdminBadge>
    );
  }
  if (status === "rejected") {
    return (
      <AdminBadge tone="bad">
        {t("screen.admin.applications.applicationReviewSections.rejected")}
      </AdminBadge>
    );
  }
  return (
    <AdminBadge tone="info" icon={false}>
      {t("screen.admin.applications.applicationReviewSections.received")}
    </AdminBadge>
  );
}

function DocumentRow({
  document,
  last,
  disabled,
  onOpen,
  onToggleVerified,
}: {
  document: ReviewDocument;
  last: boolean;
  disabled: boolean;
  onOpen: (document: ReviewDocument) => void;
  onToggleVerified: (document: ReviewDocument) => void;
}) {
  const isVerified = document.status === "verified";
  return (
    <AdminRow label={document.label} strong last={last}>
      <span className="inline-flex flex-wrap items-center justify-end gap-2">
        {document.restricted ? (
          <button
            type="button"
            className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--te-focus-ring)]"
            aria-label={t("screen.admin.applications.applicationReviewSections.openRestricted", {
              document: document.label,
            })}
            disabled={disabled}
            onClick={() => onOpen(document)}
          >
            <AdminBadge tone="info" icon="lock">
              {t("screen.admin.applications.applicationReviewSections.restrictedView")}
            </AdminBadge>
          </button>
        ) : null}
        <DocumentStatusBadge status={document.status} />
        <AdminButton
          variant="link"
          small
          disabled={disabled}
          aria-label={
            isVerified
              ? t("screen.admin.applications.applicationReviewSections.unverifyDocument", {
                  document: document.label,
                })
              : t("screen.admin.applications.applicationReviewSections.verifyDocument", {
                  document: document.label,
                })
          }
          onClick={() => onToggleVerified(document)}
        >
          {isVerified
            ? t("screen.admin.applications.applicationReviewSections.unverify")
            : t("screen.admin.applications.applicationReviewSections.verify")}
        </AdminButton>
      </span>
    </AdminRow>
  );
}

export function DocumentsCard({
  documents,
  disabled,
  onOpen,
  onToggleVerified,
}: {
  documents: readonly ReviewDocument[];
  disabled: boolean;
  onOpen: (document: ReviewDocument) => void;
  onToggleVerified: (document: ReviewDocument) => void;
}) {
  return (
    <AdminCard title={t("screen.admin.applications.applicationReviewSections.documents")}>
      {documents.length === 0 ? (
        <AdminEmpty
          title={t("screen.admin.applications.applicationReviewSections.noDocuments")}
          description={t("screen.admin.applications.applicationReviewSections.noDocumentsBody")}
        />
      ) : (
        <div>
          {documents.map((document, index) => (
            <DocumentRow
              key={document.id}
              document={document}
              last={index === documents.length - 1}
              disabled={disabled}
              onOpen={onOpen}
              onToggleVerified={onToggleVerified}
            />
          ))}
        </div>
      )}
    </AdminCard>
  );
}

function CheckState({ check, onToggle }: { check: ReviewCheck; onToggle: (id: string) => void }) {
  const badge = check.passed ? (
    <AdminBadge tone="ok">
      {t("screen.admin.applications.applicationReviewSections.passed")}
    </AdminBadge>
  ) : check.confirmable ? (
    <AdminBadge tone="warn">
      {t("screen.admin.applications.applicationReviewSections.notConfirmed")}
    </AdminBadge>
  ) : (
    <AdminBadge tone="bad">
      {t("screen.admin.applications.applicationReviewSections.missing")}
    </AdminBadge>
  );
  if (!check.confirmable) return badge;
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-2">
      {badge}
      <AdminButton
        variant="link"
        small
        aria-label={t("screen.admin.applications.applicationReviewSections.toggleCheck", {
          check: check.label,
        })}
        onClick={() => onToggle(check.id)}
      >
        {check.passed
          ? t("screen.admin.applications.applicationReviewSections.undo")
          : t("screen.admin.applications.applicationReviewSections.markPassed")}
      </AdminButton>
    </span>
  );
}

export function ChecksCard({
  caption,
  checks,
  onToggle,
}: {
  caption: string;
  checks: readonly ReviewCheck[];
  onToggle: (id: string) => void;
}) {
  return (
    <AdminCard
      title={t("screen.admin.applications.applicationReviewSections.checks")}
      caption={caption}
    >
      {checks.length > 0 ? (
        <div>
          {checks.map((check, index) => (
            <AdminRow key={check.id} label={check.label} strong last={index === checks.length - 1}>
              <CheckState check={check} onToggle={onToggle} />
            </AdminRow>
          ))}
        </div>
      ) : null}
    </AdminCard>
  );
}
