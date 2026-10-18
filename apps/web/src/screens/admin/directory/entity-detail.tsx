// SCR-ADM-08 Entity detail (docs/design/web/admin/SCR-ADM-08.dc.html): one account with its role
// and status, profile, role assignments, plan, deletion request and audit history, plus the
// suspend and plan-override actions. The entity is the onboarding application in the URL.
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink, useAdminParam } from "../common/admin-actions";
import { AdminTabs, type AdminTab } from "../common/admin-form";
import { getSelectedAdminEntityId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminBadge, AdminCard, AdminGrid, AdminPage, AdminRow } from "../common/admin-ui";
import {
  AccountStatusBadge,
  NoEntitySelected,
  entityName,
  entityRole,
  readCountry,
  readPayload,
  roleAssignmentLabel,
  roleLabel,
} from "./directory-shared";

type DetailTab = "profile" | "plan" | "trips" | "history";

const detailTabs = (): readonly AdminTab[] => [
  { id: "profile", label: t("screen.admin.directory.entityDetail.profile") },
  { id: "plan", label: t("screen.admin.directory.entityDetail.plan") },
  { id: "trips", label: t("screen.admin.directory.entityDetail.tripsAndBookings") },
  { id: "history", label: t("screen.admin.directory.entityDetail.history") },
];

const NO_VALUE = "—";

function PlanCard() {
  return (
    <AdminCard title={t("screen.admin.directory.entityDetail.planAndSubscription")}>
      <div>
        <AdminRow label={t("screen.admin.directory.entityDetail.plan")}>{NO_VALUE}</AdminRow>
        <AdminRow label={t("screen.admin.directory.entityDetail.billingStatus")}>
          {NO_VALUE}
        </AdminRow>
        <AdminRow label={t("screen.admin.directory.entityDetail.renewalDate")} last>
          {NO_VALUE}
        </AdminRow>
      </div>
    </AdminCard>
  );
}

function AuditHistoryCard() {
  return (
    <AdminCard title={t("screen.admin.directory.entityDetail.auditHistory")} className="py-4">
      <AdminEmpty
        title={t("screen.admin.directory.entityDetail.noAuditEntries")}
        description={t("screen.admin.directory.entityDetail.noAuditEntriesBody")}
      />
      <AdminLink screen="SCR-ADM-30">
        {t("screen.admin.directory.entityDetail.openAuditLog")}
      </AdminLink>
    </AdminCard>
  );
}

function TripsCard() {
  return (
    <AdminCard title={t("screen.admin.directory.entityDetail.tripsAndBookings")}>
      <AdminEmpty
        title={t("screen.admin.directory.entityDetail.noTrips")}
        description={t("screen.admin.directory.entityDetail.noTripsBody")}
      />
    </AdminCard>
  );
}

function DeletionRequestCard() {
  return (
    <AdminCard title={t("screen.admin.directory.entityDetail.deletionRequest")}>
      <div>
        <AdminRow label={t("screen.admin.directory.entityDetail.requested")}>{NO_VALUE}</AdminRow>
        <AdminRow label={t("screen.admin.directory.entityDetail.graceEnd")} last>
          {NO_VALUE}
        </AdminRow>
      </div>
      <p className="te-caption">{t("screen.admin.directory.entityDetail.openDeletionQueue")}</p>
      <AdminLink screen="SCR-ADM-10">
        {t("screen.admin.directory.entityDetail.deletionQueue")}
      </AdminLink>
    </AdminCard>
  );
}

interface EntityView {
  name: string;
  email: string | null;
  phone: string | null;
  country: string | null;
  roleLabel: string;
  assignmentLabel: string;
  status: string | null;
}

function ProfileTab({ entity }: { entity: EntityView }) {
  return (
    <>
      <AdminGrid columns={2}>
        <AdminCard title={t("screen.admin.directory.entityDetail.profile")}>
          <div>
            <AdminRow label={t("screen.admin.directory.entityDetail.name")}>{entity.name}</AdminRow>
            <AdminRow label={t("screen.admin.directory.entityDetail.email")}>
              {entity.email ?? NO_VALUE}
            </AdminRow>
            <AdminRow label={t("screen.admin.directory.entityDetail.phone")}>
              {entity.phone ?? NO_VALUE}
            </AdminRow>
            <AdminRow label={t("screen.admin.directory.entityDetail.country")} last>
              {entity.country ?? NO_VALUE}
            </AdminRow>
          </div>
        </AdminCard>
        <AdminCard title={t("screen.admin.directory.entityDetail.roleAssignments")}>
          <AdminRow label={entity.assignmentLabel} strong last>
            <AccountStatusBadge status={entity.status} />
          </AdminRow>
        </AdminCard>
        <PlanCard />
        <DeletionRequestCard />
      </AdminGrid>
      <AuditHistoryCard />
    </>
  );
}

const TAB_CONTENT: Record<Exclude<DetailTab, "profile">, () => ReactNode> = {
  plan: () => <PlanCard />,
  trips: () => <TripsCard />,
  history: () => <AuditHistoryCard />,
};

export function EntityDetail() {
  const { status: authStatus } = useAuth();
  const entityId = useAdminParam("entityId", getSelectedAdminEntityId);
  const [tab, setTab] = useState<DetailTab>("profile");

  const detailQuery = useQuery({
    ...orpc.onboarding.getApplicationDetail.queryOptions({
      input: { applicationId: entityId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(entityId),
  });

  if (!entityId) {
    return (
      <AdminPage title={t("screen.admin.directory.entityDetail.title")}>
        <NoEntitySelected />
      </AdminPage>
    );
  }

  const detail = detailQuery.data;
  const application = detail?.application;
  const payload = readPayload(application?.payload);
  const role = entityRole(application?.applicationType ?? "");
  const entity: EntityView = {
    name: application
      ? entityName({ ...application, applicant: detail?.applicant })
      : t("screen.admin.directory.entityDetail.title"),
    email: detail?.applicant?.email ?? null,
    phone: detail?.applicant?.phone ?? null,
    country: readCountry(payload),
    roleLabel: roleLabel(role),
    assignmentLabel: roleAssignmentLabel(role),
    status: detail?.applicant?.status ?? null,
  };
  const isSuspended = entity.status === "suspended";

  return (
    <AdminPage
      title={entity.name}
      description={
        application ? (
          <span className="flex flex-wrap items-center gap-2">
            <AdminBadge tone="info" icon={false}>
              {entity.roleLabel}
            </AdminBadge>
            <AccountStatusBadge status={entity.status} />
          </span>
        ) : undefined
      }
      actions={
        <>
          <AdminLink screen="SCR-ADM-09" params={{ entityId }} variant="danger-outline">
            {isSuspended
              ? t("screen.admin.directory.entityDetail.reinstate")
              : t("screen.admin.directory.entityDetail.suspend")}
          </AdminLink>
          <AdminButton
            disabled
            title={t("screen.admin.directory.entityDetail.resetCredentialsUnavailable")}
          >
            {t("screen.admin.directory.entityDetail.resetCredentials")}
          </AdminButton>
          <AdminLink screen="SCR-ADM-17" variant="primary">
            {t("screen.admin.directory.entityDetail.grantOrOverridePlan")}
          </AdminLink>
        </>
      }
    >
      <AdminTabs
        tabs={detailTabs()}
        activeId={tab}
        onSelect={(id) => setTab(id as DetailTab)}
        label={t("screen.admin.directory.entityDetail.sections")}
      />
      <AdminQueryState
        query={detailQuery}
        loadingLabel={t("screen.admin.directory.entityDetail.loading")}
      >
        {tab === "profile" ? <ProfileTab entity={entity} /> : TAB_CONTENT[tab]()}
      </AdminQueryState>
    </AdminPage>
  );
}
