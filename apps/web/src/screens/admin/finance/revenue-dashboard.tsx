// SCR-ADM-18 Revenue dashboard (docs/design/web/admin/SCR-ADM-18.dc.html): MRR, churn, upgrades,
// downgrades and plan distribution for a period, filtered by role, plan and billing status. The
// plan catalog is real; subscription figures have no endpoint yet, so they show an em dash.
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminLink } from "../common/admin-actions";
import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminFilterBar,
  AdminGrid,
  AdminKpi,
  AdminPage,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

type PlanRole = "traveler" | "organization" | "platform_driver" | "platform_photographer";

interface PlanRow {
  id: string;
  plan: string;
  role: PlanRole;
}

const NO_VALUE = "—";

const ROLE_FILTER: Record<string, PlanRole | undefined> = {
  all: undefined,
  organization: "organization",
  platform_driver: "platform_driver",
  platform_photographer: "platform_photographer",
  traveler: "traveler",
};

const PLAN_ROLES: readonly PlanRole[] = [
  "traveler",
  "organization",
  "platform_driver",
  "platform_photographer",
];

function toPlanRole(role: string): PlanRole {
  return PLAN_ROLES.find((known) => known === role) ?? "traveler";
}

function roleLabel(role: PlanRole): string {
  if (role === "organization") return t("screen.admin.finance.revenueDashboard.organization");
  if (role === "platform_driver") return t("screen.admin.finance.revenueDashboard.platformDriver");
  if (role === "platform_photographer")
    return t("screen.admin.finance.revenueDashboard.photographer");
  return t("screen.admin.finance.revenueDashboard.traveler");
}

const periodOptions = (): readonly AdminOption[] => [
  { value: "month", label: t("screen.admin.finance.revenueDashboard.thisMonth") },
  { value: "quarter", label: t("screen.admin.finance.revenueDashboard.thisQuarter") },
  { value: "year", label: t("screen.admin.finance.revenueDashboard.thisYear") },
];

const roleOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.finance.revenueDashboard.allRoles") },
  { value: "organization", label: roleLabel("organization") },
  { value: "platform_driver", label: roleLabel("platform_driver") },
  { value: "platform_photographer", label: roleLabel("platform_photographer") },
  { value: "traveler", label: roleLabel("traveler") },
];

// Billing status needs subscription records, which no endpoint lists yet.
const billingOptions = (): readonly AdminOption[] => [
  { value: "all", label: t("screen.admin.finance.revenueDashboard.allStatuses") },
];

const columns = (): readonly AdminColumn<PlanRow>[] => [
  {
    key: "plan",
    header: t("screen.admin.finance.revenueDashboard.plan"),
    render: (row) => row.plan,
    wrap: true,
  },
  {
    key: "role",
    header: t("screen.admin.finance.revenueDashboard.role"),
    render: (row) => roleLabel(row.role),
  },
  {
    key: "subscriptions",
    header: t("screen.admin.finance.revenueDashboard.subscriptions"),
    render: () => NO_VALUE,
  },
  {
    key: "share",
    header: t("screen.admin.finance.revenueDashboard.shareOfTotal"),
    render: () => NO_VALUE,
  },
];

export function RevenueDashboard() {
  const { status: authStatus, locale } = useAuth();
  const [period, setPeriod] = useState("month");
  const [roleFilter, setRoleFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [billingFilter, setBillingFilter] = useState("all");

  const role = ROLE_FILTER[roleFilter];
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: role ? { role } : {} }),
    enabled: authStatus === "authenticated",
  });

  const plans = catalogQuery.data ?? [];
  const allRows: readonly PlanRow[] = plans.map((plan) => ({
    id: plan.id,
    plan: locale === "ar" ? plan.nameAr : plan.nameEn,
    role: toPlanRole(plan.role),
  }));
  const rows = planFilter === "all" ? allRows : allRows.filter((row) => row.id === planFilter);
  const planOptions: readonly AdminOption[] = [
    { value: "all", label: t("screen.admin.finance.revenueDashboard.allPlans") },
    ...allRows.map((row) => ({ value: row.id, label: row.plan })),
  ];
  const currency = plans[0]?.currencyCode ?? NO_VALUE;

  const changeRole = (value: string) => {
    setRoleFilter(value);
    setPlanFilter("all");
  };

  return (
    <AdminPage
      title={t("screen.admin.finance.revenueDashboard.title")}
      description={t("screen.admin.finance.revenueDashboard.description")}
      actions={
        <>
          <AdminSelect
            label={t("screen.admin.finance.revenueDashboard.period")}
            options={periodOptions()}
            value={period}
            onValueChange={setPeriod}
            className="w-full sm:w-[200px]"
          />
          <AdminLink screen="SCR-ADM-25" variant="secondary">
            {t("screen.admin.finance.revenueDashboard.openFinancialView")}
          </AdminLink>
        </>
      }
    >
      <AdminFilterBar label={t("screen.admin.finance.revenueDashboard.filters")}>
        <AdminSelect
          label={t("screen.admin.finance.revenueDashboard.role")}
          options={roleOptions()}
          value={roleFilter}
          onValueChange={changeRole}
        />
        <AdminSelect
          label={t("screen.admin.finance.revenueDashboard.plan")}
          options={planOptions}
          value={planFilter}
          onValueChange={setPlanFilter}
        />
        <AdminSelect
          label={t("screen.admin.finance.revenueDashboard.billingStatus")}
          options={billingOptions()}
          value={billingFilter}
          onValueChange={setBillingFilter}
        />
      </AdminFilterBar>
      <AdminGrid columns={4}>
        <AdminKpi
          label={t("screen.admin.finance.revenueDashboard.mrr")}
          value={NO_VALUE}
          caption={t("screen.admin.finance.revenueDashboard.currencyForThePeriod", { currency })}
        />
        <AdminKpi
          label={t("screen.admin.finance.revenueDashboard.churn")}
          value={NO_VALUE}
          caption={t("screen.admin.finance.revenueDashboard.shareOfSubscriptionsLost")}
        />
        <AdminKpi
          label={t("screen.admin.finance.revenueDashboard.upgrades")}
          value={NO_VALUE}
          caption={t("screen.admin.finance.revenueDashboard.planMovedUp")}
        />
        <AdminKpi
          label={t("screen.admin.finance.revenueDashboard.downgrades")}
          value={NO_VALUE}
          caption={t("screen.admin.finance.revenueDashboard.planMovedDown")}
        />
      </AdminGrid>
      <AdminQueryState
        query={catalogQuery}
        loadingLabel={t("screen.admin.finance.revenueDashboard.loading")}
      >
        <AdminTable
          caption={t("screen.admin.finance.revenueDashboard.planDistribution")}
          title={t("screen.admin.finance.revenueDashboard.planDistribution")}
          columns={columns()}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.finance.revenueDashboard.emptyTitle")}
              description={t("screen.admin.finance.revenueDashboard.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
