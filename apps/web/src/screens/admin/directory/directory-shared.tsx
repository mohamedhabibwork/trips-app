// Shared pieces of the directory screens (SCR-ADM-07..11): role and account-status labels, and
// readers for the application payload the directory is built from. An entity in the directory is
// an onboarding application, so `entityId` in the URL is the application ID.
import { t } from "@trips-app/i18n";

import { AdminLink } from "../common/admin-actions";
import { AdminEmpty } from "../common/admin-states";
import { AdminBadge, AdminCard } from "../common/admin-ui";

export type EntityRole = "organization" | "driver" | "photographer";

export function entityRole(applicationType: string): EntityRole {
  if (applicationType === "organization") return "organization";
  if (applicationType === "platform_photographer") return "photographer";
  return "driver";
}

export function roleLabel(role: string): string {
  if (role === "organization") return t("screen.admin.directory.directoryShared.organization");
  if (role === "photographer") return t("screen.admin.directory.directoryShared.photographer");
  if (role === "traveler") return t("screen.admin.directory.directoryShared.traveler");
  if (role === "moderator") return t("screen.admin.directory.directoryShared.moderator");
  return t("screen.admin.directory.directoryShared.driver");
}

/** The role row of the entity detail ("Platform driver"). */
export function roleAssignmentLabel(role: EntityRole): string {
  if (role === "organization") return t("screen.admin.directory.directoryShared.organization");
  if (role === "photographer")
    return t("screen.admin.directory.directoryShared.platformPhotographer");
  return t("screen.admin.directory.directoryShared.platformDriver");
}

export function readPayload(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
}

function readString(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function readCountry(payload: Record<string, unknown>): string | null {
  return readString(payload, "countryCode") ?? readString(payload, "country");
}

export function readLegalName(payload: Record<string, unknown>): string | null {
  return readString(payload, "legalEntityName");
}

interface EntitySource {
  applicantAccountId: string;
  payload: unknown;
  applicant?: { fullName?: string | null } | null;
}

export function entityName(source: EntitySource): string {
  return (
    source.applicant?.fullName ??
    readLegalName(readPayload(source.payload)) ??
    source.applicantAccountId
  );
}

const STATUS_PRESENTATION: Record<
  string,
  { key: string; tone: "ok" | "bad" | "info" | "neutral" }
> = {
  active: { key: "screen.admin.directory.directoryShared.active", tone: "ok" },
  suspended: { key: "screen.admin.directory.directoryShared.suspended", tone: "bad" },
  pending_approval: { key: "screen.admin.directory.directoryShared.pendingApproval", tone: "info" },
  deleted: { key: "screen.admin.directory.directoryShared.deleted", tone: "neutral" },
};

/** Account status as a badge (word plus icon). Unknown status shows a dash. */
export function AccountStatusBadge({ status }: { status: string | null | undefined }) {
  const presentation = status ? STATUS_PRESENTATION[status] : undefined;
  if (!presentation) return <span className="te-caption">—</span>;
  return (
    <AdminBadge
      tone={presentation.tone}
      icon={presentation.tone === "info" || presentation.tone === "neutral" ? false : undefined}
    >
      {t(presentation.key)}
    </AdminBadge>
  );
}

/** Shown by the detail pages when the URL names no account. */
export function NoEntitySelected() {
  return (
    <AdminCard>
      <AdminEmpty
        title={t("screen.admin.directory.directoryShared.noAccountSelected")}
        description={t("screen.admin.directory.directoryShared.openAnAccountFromTheDirectory")}
      />
      <AdminLink screen="SCR-ADM-07">
        {t("screen.admin.directory.directoryShared.openTheDirectory")}
      </AdminLink>
    </AdminCard>
  );
}
