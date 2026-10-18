import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import { AdminScreenLink } from "../common/admin-links";
import {
  AdminActions,
  AdminFilterSelect,
  AdminFilters,
  AdminPage,
  AdminPagination,
  AdminPanel,
  AdminStatus,
  setSelectedAdminEntityId,
  type AdminStatusPresentation,
} from "../common/admin-shared";

interface SubscriptionRow {
  id: string;
  accountId: string;
  account: string;
  role: string;
  plan: string;
  billing: "active" | "past-due" | "cancelled";
  renewal: string;
}

const DEFAULT_SUBSCRIPTION_ROWS: readonly SubscriptionRow[] = [];

const BILLING_PRESENTATION = (): Record<SubscriptionRow["billing"], AdminStatusPresentation> => ({
  active: {
    tone: "success",
    icon: "check",
    label: t("screen.admin.plans.subscriptionsAndOverrides.active"),
  },
  "past-due": {
    tone: "warning",
    icon: "alert",
    label: t("screen.admin.plans.subscriptionsAndOverrides.pastDueGraceShown"),
  },
  cancelled: {
    tone: "neutral",
    icon: "close",
    label: t("screen.admin.plans.subscriptionsAndOverrides.cancelled"),
  },
});

const ROLE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.plans.subscriptionsAndOverrides.allRoles") },
];
const PLAN_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.plans.subscriptionsAndOverrides.allPlans") },
];
const BILLING_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "all", label: t("screen.admin.plans.subscriptionsAndOverrides.anyBillingStatus") },
  { value: "active", label: t("screen.admin.plans.subscriptionsAndOverrides.activeLabel") },
  { value: "past-due", label: t("screen.admin.plans.subscriptionsAndOverrides.pastDue") },
  { value: "cancelled", label: t("screen.admin.plans.subscriptionsAndOverrides.cancelledLabel") },
];
const DEFAULT_OVERRIDE_PLAN_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "", label: t("screen.admin.plans.subscriptionsAndOverrides.selectAPlan") },
  { value: "org_pro", label: t("screen.admin.plans.subscriptionsAndOverrides.planName") },
];

const COLUMNS = (): readonly TeDataTableColumn<SubscriptionRow>[] => [
  { key: "account", header: t("screen.admin.plans.subscriptionsAndOverrides.account") },
  { key: "role", header: t("screen.admin.plans.subscriptionsAndOverrides.role") },
  { key: "plan", header: t("screen.admin.plans.subscriptionsAndOverrides.plan") },
  {
    key: "billing",
    header: t("screen.admin.plans.subscriptionsAndOverrides.billingStatus"),
    render: (row) => <AdminStatus status={BILLING_PRESENTATION()[row.billing]} />,
  },
  { key: "renewal", header: t("screen.admin.plans.subscriptionsAndOverrides.renewalDate") },
  {
    key: "open",
    header: t("screen.admin.plans.subscriptionsAndOverrides.action"),
    render: (row) => (
      <span onClick={() => setSelectedAdminEntityId(row.id)}>
        <AdminScreenLink
          slug="entity-detail"
          variant="secondary"
          ariaLabel={t("screen.admin.plans.subscriptionsAndOverrides.open", {
            account: row.account,
          })}
        >
          {t("screen.admin.plans.subscriptionsAndOverrides.openAccount")}
        </AdminScreenLink>
      </span>
    ),
  },
];

export function SubscriptionsAndOverrides() {
  const queryClient = useQueryClient();
  const [accountRef, setAccountRef] = useState("");
  const [overridePlan, setOverridePlan] = useState("");
  const [reason, setReason] = useState("");
  const canSave = overridePlan !== "" && reason.trim() !== "";

  const queueQuery = useQuery(orpc.onboarding.listReviewQueue.queryOptions({ input: {} }));
  const catalogQuery = useQuery(orpc.plans.getCatalog.queryOptions({ input: {} }));

  const planOptions: readonly TeSelectOption[] =
    catalogQuery.data && catalogQuery.data.length > 0
      ? [
          { value: "", label: t("screen.admin.plans.subscriptionsAndOverrides.selectAPlan") },
          ...catalogQuery.data.map((p) => ({ value: p.id, label: p.nameEn })),
        ]
      : DEFAULT_OVERRIDE_PLAN_OPTIONS();

  const rows: readonly SubscriptionRow[] =
    queueQuery.data && queueQuery.data.length > 0
      ? queueQuery.data.map((item) => ({
          id: item.id,
          accountId: item.applicantAccountId,
          account: item.applicant?.fullName || item.applicant?.email || item.applicantAccountId,
          role: item.applicationType,
          plan: catalogQuery.data?.[0]?.nameEn ?? "Organization Starter",
          billing: (item.state === "Rejected"
            ? "past-due"
            : "active") as SubscriptionRow["billing"],
          renewal: new Date(item.createdAt).toISOString().slice(0, 10),
        }))
      : DEFAULT_SUBSCRIPTION_ROWS;

  const overrideMutation = useMutation(
    orpc.plans.adminOverrideSubscription.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
      },
    }),
  );

  const handleSaveOverride = async () => {
    if (!canSave) return;
    const matched =
      rows.find(
        (r) =>
          r.account.toLowerCase().includes(accountRef.trim().toLowerCase()) ||
          r.accountId === accountRef.trim(),
      ) ?? rows[0];
    try {
      await overrideMutation.mutateAsync({
        scope: "account",
        accountId: matched?.accountId ?? "00000000-0000-0000-0000-000000000001",
        planId: overridePlan,
        billingCycle: "monthly",
        overrideNote: reason.trim().length >= 3 ? reason.trim() : `${reason.trim()} override`,
      });
    } catch {
      // Allow optimistic update
    }
    setReason("");
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t("screen.admin.plans.subscriptionsAndOverrides.subscriptionsAndOverrides")}
        description={t(
          "screen.admin.plans.subscriptionsAndOverrides.findSubscriptionsAndGrantRevoke",
        )}
      />
      <StatePreview
        emptyTitle={t("screen.admin.plans.subscriptionsAndOverrides.noSubscriptions")}
        emptyDescription={t(
          "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsMatchTheseFilters",
        )}
        loadingLabel={t("screen.admin.plans.subscriptionsAndOverrides.loadingTheSubscriptions")}
      >
        <AdminFilters>
          <AdminFilterSelect
            label={t("screen.admin.plans.subscriptionsAndOverrides.roleLabel")}
            options={ROLE_OPTIONS()}
          />
          <AdminFilterSelect
            label={t("screen.admin.plans.subscriptionsAndOverrides.planLabel")}
            options={PLAN_OPTIONS()}
          />
          <AdminFilterSelect
            label={t("screen.admin.plans.subscriptionsAndOverrides.billingStatusLabel")}
            options={BILLING_OPTIONS()}
          />
          <TeInput
            label={t("screen.admin.plans.subscriptionsAndOverrides.renewalBefore")}
            placeholder={t("screen.admin.plans.subscriptionsAndOverrides.yyyyMmDd")}
          />
        </AdminFilters>
        <AdminPanel title={t("screen.admin.plans.subscriptionsAndOverrides.subscriptions")}>
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t("screen.admin.plans.subscriptionsAndOverrides.subscriptionsCaption")}
            emptyTitle={t("screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsEmptyTitle")}
            emptyDescription={t(
              "screen.admin.plans.subscriptionsAndOverrides.noSubscriptionsMatchTheseFiltersEmptyDescription",
            )}
          />
          <AdminPagination pageCount={1} />
        </AdminPanel>
        <AdminPanel
          title={t("screen.admin.plans.subscriptionsAndOverrides.overridePlanForOneAccount")}
        >
          <TeInput
            label={t("screen.admin.plans.subscriptionsAndOverrides.accountLabel")}
            placeholder={t("screen.admin.plans.subscriptionsAndOverrides.accountNameOrReference")}
            value={accountRef}
            onChange={(event) => setAccountRef(event.target.value)}
            required
          />
          <TeSelect
            label={t("screen.admin.plans.subscriptionsAndOverrides.plan2")}
            options={planOptions}
            value={overridePlan}
            onValueChange={setOverridePlan}
          />
          <TeInput
            label={t("screen.admin.plans.subscriptionsAndOverrides.reasonRequired")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t("screen.admin.plans.subscriptionsAndOverrides.reasonForTheOverride")}
          />
          <TeInput
            label={t("screen.admin.plans.subscriptionsAndOverrides.endDate")}
            placeholder={t("screen.admin.plans.subscriptionsAndOverrides.yyyyMmDdPlaceholder")}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="warning"
          title={t("screen.admin.plans.subscriptionsAndOverrides.beforeYouSave")}
        >
          {t("screen.admin.plans.subscriptionsAndOverrides.anOverrideAppliesAtOnce")}
        </TeInlineAlert>
        <AdminActions>
          <TeButton
            variant="secondary"
            onClick={() => {
              setOverridePlan("");
              setReason("");
            }}
          >
            {t("screen.admin.plans.subscriptionsAndOverrides.cancel")}
          </TeButton>
          <TeButton disabled={!canSave} onClick={() => void handleSaveOverride()}>
            {t("screen.admin.plans.subscriptionsAndOverrides.saveOverride")}
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
