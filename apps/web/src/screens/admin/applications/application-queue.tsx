import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TeApplicationStatus,
  TE_APPLICATION_STATUS_PRESENTATION,
} from "@trips-app/ui/components/te-application-card";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeRoleBadge, type TeRole } from "@trips-app/ui/components/te-role-badge";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { setSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink, useAdminNavigate } from "../common/admin-links";
import {
  AdminActions,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface ApplicationRow {
  id: string;
  role: TeRole;
  applicant: string;
  country: string;
  submitted: string;
  waiting: string;
  state: TeApplicationStatus;
  overdue: boolean;
}

const OVERDUE = (): AdminStatusPresentation => ({
  tone: "danger",
  icon: "alert",
  label: t("screen.admin.applications.applicationQueue.overdue"),
});
const ON_TIME = (): AdminStatusPresentation => ({
  tone: "info",
  icon: "clock",
  label: t("screen.admin.applications.applicationQueue.onTime"),
});

const TYPE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.applications.applicationQueue.allTypes") },
  { value: "organization", label: t("screen.admin.applications.applicationQueue.organization") },
  { value: "driver", label: t("screen.admin.applications.applicationQueue.platformDriver") },
  {
    value: "photographer",
    label: t("screen.admin.applications.applicationQueue.platformPhotographer"),
  },
];
const COUNTRY_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.applications.applicationQueue.allCountries") },
  { value: "EG", label: t("screen.admin.applications.applicationQueue.egypt") },
  { value: "JO", label: t("screen.admin.applications.applicationQueue.jordan") },
];
const AGE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "any", label: t("screen.admin.applications.applicationQueue.anyAge") },
  {
    value: "overdue",
    label: t("screen.admin.applications.applicationQueue.overdueOver2WorkingDays"),
  },
];
const STATE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.applications.applicationQueue.anyState") },
  { value: "pending", label: t("screen.admin.applications.applicationQueue.pendingReview") },
  {
    value: "changes-requested",
    label: t("screen.admin.applications.applicationQueue.changesRequested"),
  },
  { value: "approved", label: t("screen.admin.applications.applicationQueue.approved") },
  { value: "rejected", label: t("screen.admin.applications.applicationQueue.rejected") },
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

export function ApplicationQueue() {
  const { status: authStatus } = useAuth();
  const goTo = useAdminNavigate();
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("any");
  const [stateFilter, setStateFilter] = useState("all");

  const applicationType =
    typeFilter === "organization"
      ? ("organization" as const)
      : typeFilter === "driver"
        ? ("platform_driver" as const)
        : typeFilter === "photographer"
          ? ("platform_photographer" as const)
          : undefined;
  const state =
    stateFilter === "pending"
      ? ("Pending Review" as const)
      : stateFilter === "changes-requested"
        ? ("Changes Requested" as const)
        : stateFilter === "approved"
          ? ("Approved" as const)
          : stateFilter === "rejected"
            ? ("Rejected" as const)
            : undefined;
  const overdueOnly = ageFilter === "overdue" ? true : undefined;

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({
      input: {
        ...(applicationType ? { applicationType } : {}),
        ...(state ? { state } : {}),
        ...(overdueOnly ? { overdueOnly } : {}),
      },
    }),
    enabled: authStatus === "authenticated",
  });

  const rawRows: readonly ApplicationRow[] = (queueQuery.data ?? []).map((item): ApplicationRow => {
    const payload = (item.payload ?? {}) as Record<string, unknown>;
    const country =
      typeof payload.countryCode === "string"
        ? payload.countryCode
        : typeof payload.country === "string"
          ? payload.country
          : "EG";
    const applicantName =
      item.applicant?.fullName ??
      (typeof payload.legalEntityName === "string" ? payload.legalEntityName : null) ??
      item.applicantAccountId;
    return {
      id: item.id,
      role: mapRole(item.applicationType),
      applicant: applicantName,
      country,
      submitted: new Date(item.createdAt).toLocaleDateString(),
      waiting: String(item.workingDaysWaiting ?? 0),
      state: mapStatus(item.state),
      overdue: Boolean(item.isSlaOverdue),
    };
  });

  const rows =
    countryFilter === "all"
      ? rawRows
      : rawRows.filter((r) => r.country.toUpperCase() === countryFilter.toUpperCase());

  function openApplication(id: string) {
    setSelectedAdminApplicationId(id);
    void goTo("application-review-detail");
  }

  const columns: readonly TeDataTableColumn<ApplicationRow>[] = [
    {
      key: "role",
      header: t("screen.admin.applications.applicationQueue.type"),
      render: (row) => <TeRoleBadge role={row.role} />,
    },
    { key: "applicant", header: t("screen.admin.applications.applicationQueue.applicant") },
    { key: "country", header: t("screen.admin.applications.applicationQueue.country") },
    { key: "submitted", header: t("screen.admin.applications.applicationQueue.submitted") },
    {
      key: "waiting",
      header: t("screen.admin.applications.applicationQueue.workingDaysWaiting"),
      align: "end",
    },
    {
      key: "state",
      header: t("screen.admin.applications.applicationQueue.state"),
      render: (row) => <AdminStatus status={TE_APPLICATION_STATUS_PRESENTATION[row.state]} />,
    },
    {
      key: "overdue",
      header: t("screen.admin.applications.applicationQueue.overdueHeader"),
      render: (row) => <AdminStatus status={row.overdue ? OVERDUE() : ON_TIME()} />,
    },
    {
      key: "open",
      header: t("screen.admin.applications.applicationQueue.action"),
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={t("screen.admin.applications.applicationQueue.openApplicationFor", {
            applicant: row.applicant,
          })}
          onClick={() => openApplication(row.id)}
        >
          {t("screen.admin.applications.applicationQueue.openApplication")}
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.applications.applicationQueue.applicationQueue")}
        description={t(
          "screen.admin.applications.applicationQueue.organizationsPlatformDriversAndPlatform",
        )}
        actions={
          <AdminActions>
            <AdminScreenLink slug="appeal-review" variant="secondary">
              {t("screen.admin.applications.applicationQueue.reviewAppeals")}
            </AdminScreenLink>
            <TeButton
              variant="primary"
              onClick={() => {
                if (rows[0]) {
                  openApplication(rows[0].id);
                } else {
                  void goTo("application-review-detail");
                }
              }}
            >
              {t("screen.admin.applications.applicationQueue.openNextApplication")}
            </TeButton>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.applications.applicationQueue.noApplicationsWaiting")}
        emptyDescription={t("screen.admin.applications.applicationQueue.changeTheFiltersToSee")}
        loadingLabel={t("screen.admin.applications.applicationQueue.loadingTheApplicationQueue")}
      >
        <AdminFilters>
          <TeSelect
            label={t("screen.admin.applications.applicationQueue.typeLabel")}
            options={TYPE_OPTIONS()}
            value={typeFilter}
            onValueChange={setTypeFilter}
          />
          <TeSelect
            label={t("screen.admin.applications.applicationQueue.countryLabel")}
            options={COUNTRY_OPTIONS()}
            value={countryFilter}
            onValueChange={setCountryFilter}
          />
          <TeSelect
            label={t("screen.admin.applications.applicationQueue.age")}
            options={AGE_OPTIONS()}
            value={ageFilter}
            onValueChange={setAgeFilter}
          />
          <TeSelect
            label={t("screen.admin.applications.applicationQueue.stateLabel")}
            options={STATE_OPTIONS()}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.applications.applicationQueue.applications")}>
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.applications.applicationQueue.applicationsWaitingForReview")}
            emptyTitle={t(
              "screen.admin.applications.applicationQueue.noApplicationsWaitingEmptyTitle",
            )}
            emptyDescription={t(
              "screen.admin.applications.applicationQueue.changeTheFiltersToSeeEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
