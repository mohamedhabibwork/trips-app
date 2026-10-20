// SCR-ADM-02 Application queue (docs/design/web/admin/SCR-ADM-02.dc.html): one queue for
// organizations, platform drivers and platform photographers, filtered by type, country, age and
// state, with the overdue flag after 2 working days.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { setSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";

import { AdminLink } from "../common/admin-actions";
import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminBadge,
  AdminFilterBar,
  AdminPage,
  AdminTable,
  type AdminColumn,
  type AdminTone,
} from "../common/admin-ui";

type ApplicationType = "organization" | "platform_driver" | "platform_photographer";
type ApplicationState =
  | "Submitted"
  | "Pending Review"
  | "Changes Requested"
  | "Approved"
  | "Rejected";

interface ApplicationRow {
  id: string;
  type: string;
  applicant: string;
  country: string;
  submitted: string;
  waiting: number;
  state: string;
  overdue: boolean;
}

const TYPE_FILTER: Record<string, ApplicationType | undefined> = {
  all: undefined,
  organization: "organization",
  driver: "platform_driver",
  photographer: "platform_photographer",
};

const STATE_FILTER: Record<string, ApplicationState | undefined> = {
  all: undefined,
  submitted: "Submitted",
  underReview: "Pending Review",
  changesRequested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
};

const typeOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.applications.applicationQueue.allTypes") },
  { value: "organization", label: t("screen.admin.applications.applicationQueue.organization") },
  { value: "driver", label: t("screen.admin.applications.applicationQueue.driver") },
  { value: "photographer", label: t("screen.admin.applications.applicationQueue.photographer") },
];

const ageOptions = (): readonly AdminOption[] => [
  { value: "any", label: t("screen.admin.applications.applicationQueue.anyAge") },
  { value: "overdue", label: t("screen.admin.applications.applicationQueue.overdueOnly") },
];

const stateOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.applications.applicationQueue.allStates") },
  { value: "submitted", label: t("screen.admin.applications.applicationQueue.submittedState") },
  { value: "underReview", label: t("screen.admin.applications.applicationQueue.underReview") },
  {
    value: "changesRequested",
    label: t("screen.admin.applications.applicationQueue.changesRequested"),
  },
  { value: "approved", label: t("screen.admin.applications.applicationQueue.approved") },
  { value: "rejected", label: t("screen.admin.applications.applicationQueue.rejected") },
];

function typeLabel(applicationType: string): string {
  if (applicationType === "organization")
    return t("screen.admin.applications.applicationQueue.organization");
  if (applicationType === "platform_photographer")
    return t("screen.admin.applications.applicationQueue.photographer");
  return t("screen.admin.applications.applicationQueue.driver");
}

const STATE_PRESENTATION: Record<string, { key: string; tone: AdminTone }> = {
  Submitted: { key: "screen.admin.applications.applicationQueue.submittedState", tone: "info" },
  "Pending Review": { key: "screen.admin.applications.applicationQueue.underReview", tone: "info" },
  "Changes Requested": {
    key: "screen.admin.applications.applicationQueue.changesRequested",
    tone: "warn",
  },
  Approved: { key: "screen.admin.applications.applicationQueue.approved", tone: "ok" },
  Rejected: { key: "screen.admin.applications.applicationQueue.rejected", tone: "bad" },
  Appealed: { key: "screen.admin.applications.applicationQueue.appealed", tone: "info" },
  Closed: { key: "screen.admin.applications.applicationQueue.closed", tone: "neutral" },
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

function readCountry(payload: Record<string, unknown>): string {
  if (typeof payload.countryCode === "string") return payload.countryCode;
  if (typeof payload.country === "string") return payload.country;
  return "";
}

export function ApplicationQueue() {
  const { status: authStatus, locale } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("any");
  const [stateFilter, setStateFilter] = useState("all");

  const applicationType = TYPE_FILTER[typeFilter];
  const state = STATE_FILTER[stateFilter];
  const queueQuery = useQuery({
    ...serverQueryOptions(orpc.onboarding.listReviewQueue, "onboarding/listReviewQueue", {
      input: {
        ...(applicationType ? { applicationType } : {}),
        ...(state ? { state } : {}),
        ...(ageFilter === "overdue" ? { overdueOnly: true } : {}),
      },
    }),
    enabled: authStatus === "authenticated",
  });

  const allRows: readonly ApplicationRow[] = (queueQuery.data ?? []).map((item) => {
    const payload = (item.payload ?? {}) as Record<string, unknown>;
    const legalName = typeof payload.legalEntityName === "string" ? payload.legalEntityName : null;
    return {
      id: item.id,
      type: typeLabel(item.applicationType),
      applicant: item.applicant?.fullName ?? legalName ?? item.applicantAccountId,
      country: readCountry(payload),
      submitted: new Date(item.createdAt).toLocaleDateString(locale),
      waiting: item.workingDaysWaiting ?? 0,
      state: item.state,
      overdue: Boolean(item.isSlaOverdue),
    };
  });

  // Countries come from the loaded applications, so the list only offers ones that exist.
  const countries = [...new Set(allRows.map((row) => row.country).filter(Boolean))].sort();
  const countryOptions: readonly AdminOption[] = [
    { value: "all", label: t("screen.admin.applications.applicationQueue.allCountries") },
    ...countries.map((country) => ({ value: country, label: country })),
  ];
  const rows =
    countryFilter === "all" ? allRows : allRows.filter((row) => row.country === countryFilter);
  const first = rows[0];

  const columns: readonly AdminColumn<ApplicationRow>[] = [
    {
      key: "type",
      header: t("screen.admin.applications.applicationQueue.type"),
      render: (row) => row.type,
    },
    {
      key: "applicant",
      header: t("screen.admin.applications.applicationQueue.applicant"),
      render: (row) => row.applicant,
      wrap: true,
    },
    {
      key: "country",
      header: t("screen.admin.applications.applicationQueue.country"),
      render: (row) => row.country || "—",
    },
    {
      key: "submitted",
      header: t("screen.admin.applications.applicationQueue.submitted"),
      render: (row) => row.submitted,
    },
    {
      key: "waiting",
      header: t("screen.admin.applications.applicationQueue.workingDaysWaiting"),
      render: (row) => row.waiting,
      align: "end",
      headerWrap: true,
    },
    {
      key: "state",
      header: t("screen.admin.applications.applicationQueue.state"),
      render: (row) => <StateBadge state={row.state} />,
    },
    {
      key: "overdue",
      header: t("screen.admin.applications.applicationQueue.overdue"),
      render: (row) =>
        row.overdue ? (
          <AdminBadge tone="warn">
            {t("screen.admin.applications.applicationQueue.overdue")}
          </AdminBadge>
        ) : (
          <span className="te-caption">
            {t("screen.admin.applications.applicationQueue.notOverdue")}
          </span>
        ),
    },
    {
      key: "action",
      header: (
        <span className="te-caption">{t("screen.admin.applications.applicationQueue.action")}</span>
      ),
      render: (row) => (
        <AdminLink
          screen="SCR-ADM-03"
          params={{ applicationId: row.id }}
          ariaLabel={t("screen.admin.applications.applicationQueue.openApplicationFor", {
            applicant: row.applicant,
          })}
          onClick={() => setSelectedAdminApplicationId(row.id)}
        >
          {t("screen.admin.applications.applicationQueue.openApplication")}
        </AdminLink>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.applications.applicationQueue.title")}
      description={t("screen.admin.applications.applicationQueue.description")}
      actions={
        <AdminLink
          screen="SCR-ADM-03"
          params={first ? { applicationId: first.id } : {}}
          variant="primary"
          onClick={() => first && setSelectedAdminApplicationId(first.id)}
        >
          {t("screen.admin.applications.applicationQueue.openApplication")}
        </AdminLink>
      }
    >
      <AdminFilterBar label={t("screen.admin.applications.applicationQueue.filters")}>
        <AdminSelect
          label={t("screen.admin.applications.applicationQueue.type")}
          options={typeOptions()}
          value={typeFilter}
          onValueChange={setTypeFilter}
        />
        <AdminSelect
          label={t("screen.admin.applications.applicationQueue.country")}
          options={countryOptions}
          value={countryFilter}
          onValueChange={setCountryFilter}
        />
        <AdminSelect
          label={t("screen.admin.applications.applicationQueue.ageWorkingDays")}
          options={ageOptions()}
          value={ageFilter}
          onValueChange={setAgeFilter}
        />
        <AdminSelect
          label={t("screen.admin.applications.applicationQueue.state")}
          options={stateOptions()}
          value={stateFilter}
          onValueChange={setStateFilter}
        />
      </AdminFilterBar>
      <AdminQueryState
        query={queueQuery}
        loadingLabel={t("screen.admin.applications.applicationQueue.loading")}
      >
        <AdminTable
          caption={t("screen.admin.applications.applicationQueue.tableCaption")}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.applications.applicationQueue.emptyTitle")}
              description={t("screen.admin.applications.applicationQueue.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
