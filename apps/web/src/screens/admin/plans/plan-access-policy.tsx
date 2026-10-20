// SCR-ADM-45 Plan-required access (docs/design/web/AdmAccessPolicy.dc.html): who needs a paid plan
// to use their app, with trial length, grace days and what locked users see. The per-role policy
// derives from the plan catalog (trial, grace, tiers) and system settings (the platform grace
// days); the one editable knob is the grace after a failed renewal, saved through preview +
// updateSystemSettings. Per-role plan-required overrides have no procedure, so the table states
// that the catalog rules apply.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminPage,
  AdminRow,
  AdminSplit,
  AdminTable,
  type AdminColumn,
} from "../common/admin-ui";

const K = "screen.admin.plans.planAccessPolicy";

const MIN_REASON_LENGTH = 5;
const FREE_PLAN_MONTHLY_MINOR = 0;

interface RolePolicyRow {
  role: string;
  planRequired: string;
  trialDays: number;
  graceDays: number;
  tiers: number;
}

const REASON_OPTIONS = (): readonly AdminOption[] => [
  { value: "policy_review", label: t(`${K}.reasonPolicyReview`) },
  { value: "billing_incident", label: t(`${K}.reasonBillingIncident`) },
  { value: "partner_request", label: t(`${K}.reasonPartnerRequest`) },
];

export function PlanAccessPolicy() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [graceDays, setGraceDays] = useState("");
  const [reason, setReason] = useState("");
  const [reasonCode, setReasonCode] = useState("policy_review");

  const catalogQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", { input: {} }),
    enabled: authStatus === "authenticated",
  });
  const settingsQuery = useQuery({
    ...serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });

  const previewMutation = useMutation(
    serverMutationOptions(
      orpc.admin.previewSystemSettingsChange,
      "admin/previewSystemSettingsChange",
    ),
  );
  const updateMutation = useMutation(
    serverMutationOptions(orpc.admin.updateSystemSettings, "admin/updateSystemSettings", {
      onSuccess: () => {
        setReason("");
        previewMutation.reset();
        void queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
      },
    }),
  );

  const catalog = catalogQuery.data ?? [];
  const platformGrace = settingsQuery.data?.operational.subscriptionGraceDays ?? null;

  const rolePolicies: readonly RolePolicyRow[] = useMemo(() => {
    const byRole = new Map<string, typeof catalog>();
    for (const plan of catalog) {
      const bucket = byRole.get(plan.role) ?? [];
      bucket.push(plan);
      byRole.set(plan.role, bucket);
    }
    return [...byRole.entries()]
      .map(([role, plans]) => {
        const paid = plans
          .filter((plan) => plan.monthlyPriceMinor > FREE_PLAN_MONTHLY_MINOR)
          .sort((a, b) => a.monthlyPriceMinor - b.monthlyPriceMinor);
        const cheapest = paid[0];
        return {
          role,
          planRequired: cheapest ? cheapest.tier : "free",
          trialDays: cheapest?.trialDays ?? 0,
          graceDays: cheapest?.gracePeriodDays ?? platformGrace ?? 0,
          tiers: plans.length,
        };
      })
      .sort((a, b) => a.role.localeCompare(b.role));
  }, [catalog, platformGrace]);

  const graceInput = graceDays.trim();
  const graceValue = Number.parseInt(graceInput, 10);
  const canSave =
    Number.isInteger(graceValue) &&
    graceValue >= 1 &&
    graceValue <= 30 &&
    reason.trim().length >= MIN_REASON_LENGTH &&
    !updateMutation.isPending;

  const runPreview = () => {
    if (!Number.isInteger(graceValue)) return;
    previewMutation.mutate({ operational: { subscriptionGraceDays: graceValue } });
  };

  const runSave = () => {
    if (!canSave) return;
    updateMutation.mutate({
      operational: { subscriptionGraceDays: graceValue },
      reason: `${reasonCode}: ${reason.trim()}`,
    });
  };

  const columns: readonly AdminColumn<RolePolicyRow>[] = [
    {
      key: "role",
      header: t(`${K}.roleColumn`),
      render: (row) => (
        <span className="flex flex-col">
          <b>{t(`${K}.role.${row.role}`)}</b>
          <span className="te-caption">{t(`${K}.tiersValue`, { count: row.tiers })}</span>
        </span>
      ),
    },
    {
      key: "plan",
      header: t(`${K}.planRequired`),
      render: (row) =>
        row.planRequired === "free" ? (
          <AdminBadge tone="ok" icon={false}>
            {t(`${K}.planFree`)}
          </AdminBadge>
        ) : (
          <AdminBadge tone="info" icon={false}>
            {row.planRequired}
          </AdminBadge>
        ),
      wrap: true,
    },
    {
      key: "trial",
      header: t(`${K}.trialColumn`),
      render: (row) =>
        row.trialDays > 0 ? t(`${K}.daysValue`, { days: row.trialDays }) : t(`${K}.noTrial`),
      headerWrap: true,
    },
    {
      key: "grace",
      header: t(`${K}.graceColumn`),
      render: (row) => (row.graceDays > 0 ? t(`${K}.daysValue`, { days: row.graceDays }) : "—"),
      headerWrap: true,
    },
    {
      key: "locked",
      header: t(`${K}.lockedColumn`),
      render: () => t(`${K}.lockedDescription`),
      wrap: true,
    },
    {
      key: "action",
      header: <span className="te-caption">{t(`${K}.actionColumn`)}</span>,
      render: (row) => (
        <AdminButton
          variant="link"
          onClick={() => {
            setEditingRole(row.role);
            setGraceDays(String(row.graceDays));
          }}
        >
          {t(`${K}.edit`)}
        </AdminButton>
      ),
    },
  ];

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`)}
      actions={
        <AdminButton
          variant="primary"
          disabled={!canSave}
          title={canSave ? undefined : t(`${K}.saveHint`)}
          onClick={runSave}
        >
          {t(`${K}.savePolicy`)}
        </AdminButton>
      }
    >
      <AdminAlert tone="info">{t(`${K}.catalogRulesNote`)}</AdminAlert>

      <AdminQueryState query={catalogQuery} loadingLabel={t(`${K}.loading`)}>
        {catalog.length === 0 ? (
          <AdminCard>
            <AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />
          </AdminCard>
        ) : (
          <AdminCard title={t(`${K}.rolesTitle`)} caption={t(`${K}.rolesCaption`)}>
            <AdminTable
              caption={t(`${K}.rolesCaption`)}
              columns={columns}
              rows={rolePolicies}
              getRowKey={(row) => row.role}
            />
          </AdminCard>
        )}
      </AdminQueryState>

      <AdminSplit
        main={
          <AdminCard
            title={
              editingRole
                ? t(`${K}.editTitle`, { role: t(`${K}.role.${editingRole}`) })
                : t(`${K}.editPickTitle`)
            }
            caption={t(`${K}.editCaption`)}
          >
            {!editingRole ? (
              <AdminEmpty title={t(`${K}.pickRoleTitle`)} description={t(`${K}.pickRoleBody`)} />
            ) : (
              <>
                <AdminRow label={t(`${K}.graceLabel`)}>
                  {platformGrace !== null ? t(`${K}.daysValue`, { days: platformGrace }) : "—"}
                </AdminRow>
                <AdminInput
                  type="number"
                  min={1}
                  max={30}
                  label={t(`${K}.graceInputLabel`)}
                  help={t(`${K}.graceInputHelp`)}
                  value={graceDays}
                  onChange={(event) => setGraceDays(event.target.value)}
                />
                {previewMutation.data ? (
                  <AdminAlert tone="info" title={t(`${K}.previewTitle`)}>
                    {t(`${K}.previewBody`, {
                      accounts: previewMutation.data.affectedAccountsCount,
                      organizations: previewMutation.data.affectedOrganizationsCount,
                    })}
                  </AdminAlert>
                ) : null}
                {updateMutation.isError ? (
                  <AdminAlert tone="danger" title={t(`${K}.saveErrorTitle`)}>
                    {t(`${K}.saveErrorBody`)}
                  </AdminAlert>
                ) : null}
                {updateMutation.isSuccess ? (
                  <AdminAlert tone="success">{t(`${K}.savedNote`)}</AdminAlert>
                ) : null}
                <AdminSelect
                  label={t(`${K}.reasonCodeLabel`)}
                  options={REASON_OPTIONS()}
                  value={reasonCode}
                  onValueChange={setReasonCode}
                />
                <AdminInput
                  label={t(`${K}.reasonLabel`)}
                  placeholder={t(`${K}.reasonPlaceholder`)}
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
                <div className="flex flex-wrap gap-3">
                  <AdminButton
                    variant="secondary"
                    disabled={!Number.isInteger(graceValue) || updateMutation.isPending}
                    onClick={runPreview}
                  >
                    {t(`${K}.previewChange`)}
                  </AdminButton>
                  <AdminButton variant="primary" disabled={!canSave} onClick={runSave}>
                    {t(`${K}.savePolicy`)}
                  </AdminButton>
                </div>
                <p className="te-caption">{t(`${K}.auditNote`)}</p>
              </>
            )}
          </AdminCard>
        }
        side={
          <AdminCard title={t(`${K}.lockedSeeTitle`)} caption={t(`${K}.lockedSeeCaption`)}>
            <AdminRow label={t(`${K}.lockedBilling`)}>{t(`${K}.alwaysAvailable`)}</AdminRow>
            <AdminRow label={t(`${K}.lockedPayment`)}>{t(`${K}.alwaysAvailable`)}</AdminRow>
            <AdminRow label={t(`${K}.lockedStatements`)}>{t(`${K}.readOnly`)}</AdminRow>
            <AdminRow label={t(`${K}.lockedSupport`)}>{t(`${K}.alwaysAvailable`)}</AdminRow>
            <AdminRow label={t(`${K}.lockedSignOut`)} last>
              {t(`${K}.alwaysAvailable`)}
            </AdminRow>
          </AdminCard>
        }
      />
    </AdminPage>
  );
}
