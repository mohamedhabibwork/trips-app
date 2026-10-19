// SCR-ADM-15 Plans catalog (docs/design/web/admin/SCR-ADM-15.dc.html): every plan tier by role, with
// its status and a link to the plan editor.
import { useQuery } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink } from "../common/admin-actions";
import { setSelectedAdminPlanId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminBadge, AdminPage, AdminTable, type AdminColumn } from "../common/admin-ui";
import { planName, planRoleLabel } from "./plan-labels";

interface PlanRow {
  id: string;
  role: string;
  tier: string;
  isActive: boolean;
}

export function PlansCatalog() {
  const { status: authStatus, locale } = useAuth();
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const rows: readonly PlanRow[] = (catalogQuery.data ?? []).map((plan) => ({
    id: plan.id,
    role: planRoleLabel(plan.role),
    tier: planName(plan, locale),
    isActive: plan.status === "active",
  }));

  const columns: readonly AdminColumn<PlanRow>[] = [
    { key: "role", header: t("screen.admin.plans.plansCatalog.role"), render: (row) => row.role },
    {
      key: "tier",
      header: t("screen.admin.plans.plansCatalog.tier"),
      render: (row) => row.tier,
      wrap: true,
    },
    {
      key: "status",
      header: t("screen.admin.plans.plansCatalog.status"),
      render: (row) =>
        row.isActive ? (
          <AdminBadge tone="ok" icon={false}>
            {t("screen.admin.plans.plansCatalog.active")}
          </AdminBadge>
        ) : (
          <AdminBadge tone="info" icon={false}>
            {t("screen.admin.plans.plansCatalog.inactive")}
          </AdminBadge>
        ),
    },
    {
      key: "subscriptions",
      header: t("screen.admin.plans.plansCatalog.activeSubscriptions"),
      // The catalog does not report subscription counts yet.
      render: () => "—",
      align: "end",
      headerWrap: true,
    },
    {
      key: "action",
      header: <span className="te-caption">{t("screen.admin.plans.plansCatalog.action")}</span>,
      render: (row) => (
        <AdminLink
          screen="SCR-ADM-16"
          params={{ planId: row.id }}
          ariaLabel={t("screen.admin.plans.plansCatalog.openPlanFor", { tier: row.tier })}
          onClick={() => setSelectedAdminPlanId(row.id)}
        >
          {t("screen.admin.plans.plansCatalog.openPlan")}
        </AdminLink>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.plans.plansCatalog.title")}
      description={t("screen.admin.plans.plansCatalog.description")}
      actions={
        // No endpoint creates a plan tier yet, so the action stays unavailable.
        <AdminButton
          variant="primary"
          disabled
          title={t("screen.admin.plans.plansCatalog.createTierUnavailable")}
        >
          {t("screen.admin.plans.plansCatalog.createTier")}
        </AdminButton>
      }
    >
      <AdminQueryState
        query={catalogQuery}
        loadingLabel={t("screen.admin.plans.plansCatalog.loading")}
      >
        <AdminTable
          caption={t("screen.admin.plans.plansCatalog.tableCaption")}
          columns={columns}
          rows={rows}
          getRowKey={(row) => row.id}
          empty={
            <AdminEmpty
              title={t("screen.admin.plans.plansCatalog.emptyTitle")}
              description={t("screen.admin.plans.plansCatalog.emptyBody")}
            />
          }
        />
      </AdminQueryState>
    </AdminPage>
  );
}
