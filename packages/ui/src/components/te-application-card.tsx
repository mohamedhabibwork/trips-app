import { cn } from "@trips-app/ui/lib/utils";
import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TeRoleBadge, type TeRole } from "@trips-app/ui/components/te-role-badge";

export const TE_APPLICATION_STATUSES = [
  "pending",
  "changes-requested",
  "approved",
  "rejected",
] as const;
export type TeApplicationStatus = (typeof TE_APPLICATION_STATUSES)[number];

export interface TeApplicationDocument {
  label: string;
  verified: boolean;
}

export interface TeApplicationStatusPresentation {
  icon: TeIconName;
  tone: TeBadgeTone;
  label: string;
}

export const TE_APPLICATION_STATUS_PRESENTATION: Record<
  TeApplicationStatus,
  TeApplicationStatusPresentation
> = {
  pending: { icon: "clock", tone: "info", label: "Pending review" },
  "changes-requested": { icon: "alert", tone: "warning", label: "Changes requested" },
  approved: { icon: "check", tone: "success", label: "Approved" },
  rejected: { icon: "close", tone: "danger", label: "Rejected" },
};

export interface TeApplicationCardProps {
  applicant: string;
  role: TeRole;
  /** Already formatted submission time. */
  submittedAt: string;
  status: TeApplicationStatus;
  documents: readonly TeApplicationDocument[];
  onOpen?: () => void;
  openLabel?: string;
  submittedLabel?: string;
  documentsLabel?: string;
  verifiedLabel?: string;
  notVerifiedLabel?: string;
  className?: string;
}

/** Admin review queue item: who applied, their status and each document's verification. */
export function TeApplicationCard({
  applicant,
  role,
  submittedAt,
  status,
  documents,
  onOpen,
  openLabel = "Open application",
  submittedLabel = "Submitted",
  documentsLabel = "Documents",
  verifiedLabel = "Verified",
  notVerifiedLabel = "Not verified",
  className,
}: TeApplicationCardProps) {
  const presentation = TE_APPLICATION_STATUS_PRESENTATION[status];

  return (
    <TeCard
      as="article"
      className={cn("te-application-card", className)}
      header={
        <div className="te-application-card__header">
          <h3 className="te-application-card__name">{applicant}</h3>
          <TeRoleBadge role={role} />
        </div>
      }
      footer={
        onOpen ? (
          <TeButton variant="secondary" onClick={onOpen}>
            {openLabel}
          </TeButton>
        ) : undefined
      }
    >
      <div className="te-application-card__meta">
        <TeBadge tone={presentation.tone} data-status={status}>
          <TeIcon name={presentation.icon} />
          <span>{presentation.label}</span>
        </TeBadge>
        <span className="te-application-card__submitted">
          {submittedLabel}: {submittedAt}
        </span>
      </div>
      <ul aria-label={documentsLabel} className="te-application-card__documents">
        {documents.map((doc) => (
          <li key={doc.label} className="te-application-card__document">
            <span>{doc.label}</span>
            <span
              className={cn(
                "te-application-card__verified",
                doc.verified
                  ? "te-application-card__verified--yes"
                  : "te-application-card__verified--no",
              )}
            >
              <TeIcon name={doc.verified ? "check" : "alert"} />
              <span>{doc.verified ? verifiedLabel : notVerifiedLabel}</span>
            </span>
          </li>
        ))}
      </ul>
    </TeCard>
  );
}
