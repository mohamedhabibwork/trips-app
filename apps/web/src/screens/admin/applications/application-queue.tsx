import { useEffect, useState } from "react";
import {
  TeApplicationStatus,
  TE_APPLICATION_STATUS_PRESENTATION,
} from "@trips-app/ui/components/te-application-card";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeRoleBadge, type TeRole } from "@trips-app/ui/components/te-role-badge";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { useAuth } from "@/auth/auth-context";
import { setSelectedAdminApplicationId } from "@/screens/onboarding-state";
import { client } from "@/utils/orpc";
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

const DEFAULT_APPLICATION_ROWS: readonly ApplicationRow[] = [
  {
    id: "app-1",
    role: "driver",
    applicant: "[Applicant name]",
    country: "[Country]",
    submitted: "[Date]",
    waiting: "0",
    state: "pending",
    overdue: true,
  },
  {
    id: "app-2",
    role: "photographer",
    applicant: "[Applicant name]",
    country: "[Country]",
    submitted: "[Date]",
    waiting: "0",
    state: "changes-requested",
    overdue: false,
  },
];

const OVERDUE: AdminStatusPresentation = { tone: "danger", icon: "alert", label: "Overdue" };
const ON_TIME: AdminStatusPresentation = { tone: "info", icon: "clock", label: "On time" };

const TYPE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All types" },
  { value: "organization", label: "Organization" },
  { value: "driver", label: "Platform driver" },
  { value: "photographer", label: "Platform photographer" },
];
const COUNTRY_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "All countries" },
  { value: "EG", label: "Egypt" },
  { value: "JO", label: "Jordan" },
];
const AGE_OPTIONS: readonly TeSelectOption[] = [
  { value: "any", label: "Any age" },
  { value: "overdue", label: "Overdue (over 2 working days)" },
];
const STATE_OPTIONS: readonly TeSelectOption[] = [
  { value: "all", label: "Any state" },
  { value: "pending", label: "Pending review" },
  { value: "changes-requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
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
  const [rows, setRows] = useState<readonly ApplicationRow[]>(DEFAULT_APPLICATION_ROWS);
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("any");
  const [stateFilter, setStateFilter] = useState("all");

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    let cancelled = false;
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

    void client.onboarding
      .listReviewQueue({
        ...(applicationType ? { applicationType } : {}),
        ...(state ? { state } : {}),
        ...(overdueOnly ? { overdueOnly } : {}),
      })
      .then((items) => {
        if (cancelled) return;
        const mapped = items.map((item): ApplicationRow => {
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
        const filtered =
          countryFilter === "all"
            ? mapped
            : mapped.filter((r) => r.country.toUpperCase() === countryFilter.toUpperCase());
        setRows(filtered);
      })
      .catch(() => {
        // Keep preview rows when unauthenticated or unauthorized
      });

    return () => {
      cancelled = true;
    };
  }, [authStatus, typeFilter, countryFilter, ageFilter, stateFilter]);

  function openApplication(id: string) {
    setSelectedAdminApplicationId(id);
    void goTo("application-review-detail");
  }

  const columns: readonly TeDataTableColumn<ApplicationRow>[] = [
    { key: "role", header: "Type", render: (row) => <TeRoleBadge role={row.role} /> },
    { key: "applicant", header: "Applicant" },
    { key: "country", header: "Country" },
    { key: "submitted", header: "Submitted" },
    { key: "waiting", header: "Working days waiting", align: "end" },
    {
      key: "state",
      header: "State",
      render: (row) => <AdminStatus status={TE_APPLICATION_STATUS_PRESENTATION[row.state]} />,
    },
    {
      key: "overdue",
      header: "Overdue",
      render: (row) => <AdminStatus status={row.overdue ? OVERDUE : ON_TIME} />,
    },
    {
      key: "open",
      header: "Action",
      render: (row) => (
        <TeButton
          variant="secondary"
          aria-label={`Open application for ${row.applicant}`}
          onClick={() => openApplication(row.id)}
        >
          Open application
        </TeButton>
      ),
    },
  ];

  return (
    <AdminPage>
      <TePageHeader
        title="Application queue"
        description="Organizations, platform drivers and platform photographers waiting for a decision."
        actions={
          <AdminActions>
            <AdminScreenLink slug="appeal-review" variant="secondary">
              Review appeals
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
              Open next application
            </TeButton>
          </AdminActions>
        }
      />
      <StatePreview
        emptyTitle="No applications waiting"
        emptyDescription="Change the filters to see other applications."
        loadingLabel="Loading the application queue."
      >
        <AdminFilters>
          <TeSelect
            label="Type"
            options={TYPE_OPTIONS}
            value={typeFilter}
            onValueChange={setTypeFilter}
          />
          <TeSelect
            label="Country"
            options={COUNTRY_OPTIONS}
            value={countryFilter}
            onValueChange={setCountryFilter}
          />
          <TeSelect
            label="Age"
            options={AGE_OPTIONS}
            value={ageFilter}
            onValueChange={setAgeFilter}
          />
          <TeSelect
            label="State"
            options={STATE_OPTIONS}
            value={stateFilter}
            onValueChange={setStateFilter}
          />
        </AdminFilters>
        <AdminPanel title="Applications">
          <TeDataTable
            columns={columns}
            rows={rows}
            getRowKey={(row) => row.id}
            caption="Applications waiting for review"
            emptyTitle="No applications waiting"
            emptyDescription="Change the filters to see other applications."
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
      </StatePreview>
    </AdminPage>
  );
}
