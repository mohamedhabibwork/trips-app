// SCR-ADM-17 Subscriptions and overrides (docs/design/web/admin/SCR-ADM-17.dc.html): find accounts
// by role, plan, billing status and renewal date, and override the plan of one account.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminLink } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { setSelectedAdminEntityId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminFilterBar,
  AdminPage,
  AdminSplit,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";
import { planName, planRoleLabel } from "./plan-labels";
import { OverridePlanCard, type OverrideAccount } from "./override-plan-card";

interface SubscriptionRow extends OverrideAccount {
  /** Application id, which the directory uses as the entity id. */
  id: string;
  role: string;
  roleLabel: string;
  // The admin console has no subscription list endpoint yet, so these stay unknown.
  planId: string | null;
  billingStatus: string | null;
  renewalDate: string | null;
}

const ALL = "all";
const ROLES = ["organization", "platform_driver", "platform_photographer", "traveler"] as const;

function roleOptions(): readonly AdminOption[] {
  return [
    { value: ALL, label: t("screen.admin.plans.subscriptionsAndOverrides.allRoles") },
    ...ROLES.map((role) => ({ value: role, label: planRoleLabel(role) })),
  ];
}

function billingOptions(): readonly AdminOption[] {
  return [
    { value: ALL, label: t("screen.admin.plans.subscriptionsAndOverrides.allStatuses") },
    { value: "active", label: t("screen.admin.plans.subscriptionsAndOverrides.active") },
    { value: "grace", label: t("screen.admin.plans.subscriptionsAndOverrides.gracePeriod") },
    { value: "cancelled", label: t("screen.admin.plans.subscriptionsAndOverrides.cancelled") },
  ];
}

export function SubscriptionsAndOverrides() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [planFilter, setPlanFilter] = useState(ALL);
  const [billingFilter, setBillingFilter] = useState(ALL);
  const [renewalFilter, setRenewalFilter] = useState("");

  const queueQuery = useQuery({
    ...orpc.onboarding.listReviewQueue.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  const overrideMutation = useMutation(
    orpc.plans.adminOverrideSubscription.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
      },
    }),
  );

  const plans: readonly AdminOption[] = (catalogQuery.data ?? []).map((plan) => ({
    value: plan.id,
    label: planName(plan, locale),
  }));

  const allRows: readonly SubscriptionRow[] = (queueQuery.data ?? []).map((item) => ({
    id: item.id,
    accountId: item.applicantAccountId,
    name: item.applicant?.fullName || item.applicant?.email || item.applicantAccountId,
    role: item.applicationType,
    roleLabel: planRoleLabel(item.applicationType),
    planId: null,
    billingStatus: null,
    renewalDate: null,
  }));

  const rows = allRows.filter(
    (row) =>
      (roleFilter === ALL || row.role === roleFilter) &&
      (planFilter === ALL || row.planId === planFilter) &&
      (billingFilter === ALL || row.billingStatus === billingFilter) &&
      (renewalFilter === "" || (row.renewalDate !== null && row.renewalDate <= renewalFilter)),
  );

  const columns: readonly AdminColumn<SubscriptionRow>[] = [
    {
      key: "account",
      header: t("screen.admin.plans.subscriptionsAndOverrides.account"),
      render: (row) => row.name,
      wrap: true,
    },
    {
      key: "role",
      header: t("screen.admin.plans.subscriptionsAndOverrides.role"),
      render: (row) => row.roleLabel,
    },
    {
      key: "plan",
      header: t("screen.admin.plans.subscriptionsAndOverrides.plan"),
      render: () => "—",
    },
    {
      key: "billing",
      header: t("screen.admin.plans.subscriptionsAndOverrides.billingStatus"),
      render: () => "—",
    },
    {
      key: "renewal",
      header: t("screen.admin.plans.subscriptionsAndOverrides.renewalDate"),
      render: () => "—",
    },
    {
      key: "action",
      header: (
        <span className="te-caption">
          {t("screen.admin.plans.subscriptionsAndOverrides.action")}
        </span>
      ),
      render: (row) => (
        <AdminLink
          screen="SCR-ADM-08"
          params={{ entityId: row.id }}
          ariaLabel={t("screen.admin.plans.subscriptionsAndOverrides.openFor", {
            account: row.name,
          })}
          onClick={() => setSelectedAdminEntityId(row.id)}
        >
          {t("screen.admin.plans.subscriptionsAndOverrides.open")}
        </AdminLink>
      ),
    },
  ];

  return (
    <AdminPage
      title={t("screen.admin.plans.subscriptionsAndOverrides.title")}
      description={t("screen.admin.plans.subscriptionsAndOverrides.description")}
    >
      <AdminSplit
        main={
          <>
            <AdminFilterBar label={t("screen.admin.plans.subscriptionsAndOverrides.filters")}>
              <AdminSelect
                label={t("screen.admin.plans.subscriptionsAndOverrides.role")}
                options={roleOptions()}
                value={roleFilter}
                onValueChange={setRoleFilter}
              />
              <AdminSelect
                label={t("screen.admin.plans.subscriptionsAndOverrides.plan")}
                options={[
                  { value: ALL, label: t("screen.admin.plans.subscriptionsAndOverrides.allPlans") },
                  ...plans,
                ]}
                value={planFilter}
                onValueChange={setPlanFilter}
              />
              <AdminSelect
                label={t("screen.admin.plans.subscriptionsAndOverrides.billingStatus")}
                options={billingOptions()}
                value={billingFilter}
                onValueChange={setBillingFilter}
              />
              <AdminInput
                label={t("screen.admin.plans.subscriptionsAndOverrides.renewalDate")}
                type="date"
                value={renewalFilter}
                onChange={(event) => setRenewalFilter(event.target.value)}
              />
            </AdminFilterBar>
            <AdminQueryState
              query={queueQuery}
              loadingLabel={t("screen.admin.plans.subscriptionsAndOverrides.loading")}
            >
              <AdminTable
                caption={t("screen.admin.plans.subscriptionsAndOverrides.tableCaption")}
                columns={columns}
                rows={rows}
                getRowKey={(row) => row.id}
                empty={
                  <AdminEmpty
                    title={t("screen.admin.plans.subscriptionsAndOverrides.emptyTitle")}
                    description={t("screen.admin.plans.subscriptionsAndOverrides.emptyBody")}
                  />
                }
              />
            </AdminQueryState>
          </>
        }
        side={
          <OverridePlanCard
            accounts={allRows}
            plans={plans}
            isSaving={overrideMutation.isPending}
            isSaved={overrideMutation.isSuccess}
            isFailed={overrideMutation.isError}
            onSave={(input, onDone) =>
              overrideMutation.mutate(
                {
                  scope: "account",
                  accountId: input.accountId,
                  planId: input.planId,
                  billingCycle: "monthly",
                  overrideNote: input.reason,
                },
                { onSuccess: onDone },
              )
            }
          />
        }
      />
    </AdminPage>
  );
}
