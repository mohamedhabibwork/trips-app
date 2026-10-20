// SCR-ADM-32 Feature flags and platform configuration
// (docs/design/web/admin/SCR-ADM-32.dc.html): phase feature flags, gateway routing by market, the
// fixed OTP and session policy and the quiet-hours urgent categories. Only the flags can be saved
// (updateSystemSettings); a flag change needs a reason and a second admin (four-eyes, D-233).
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput, AdminTextarea } from "../common/admin-form";
import { AdminQueryState } from "../common/admin-states";
import {
  AdminAlert,
  AdminBadge,
  AdminCard,
  AdminGrid,
  AdminPage,
  AdminRow,
} from "../common/admin-ui";
import { FeatureFlagTable, FLAG_KEYS, type FlagKey, type FlagValues } from "./feature-flag-table";
import { GatewayRoutingCard, type MarketGateways } from "./gateway-routing-card";

const MIN_REASON_LENGTH = 5;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type FlagDraft = Partial<Record<FlagKey, boolean>>;

/** The flags whose draft value differs from the saved one. */
function changedFlags(saved: FlagValues, draft: FlagDraft): FlagDraft {
  return Object.fromEntries(
    FLAG_KEYS.filter((key) => draft[key] !== undefined && draft[key] !== saved[key]).map((key) => [
      key,
      draft[key],
    ]),
  );
}

function PolicyCard() {
  return (
    <AdminCard title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.otpTitle")}>
      <div>
        <AdminRow label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.otpPolicy")}>
          <AdminBadge icon="lock">
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.fixedByBrl20")}
          </AdminBadge>
        </AdminRow>
        <AdminRow
          last
          label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.sessionPolicy")}
        >
          <AdminBadge icon="lock">
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.fixedByBrl22")}
          </AdminBadge>
        </AdminRow>
      </div>
      <p className="te-caption">
        {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.policyNotDecided")}
      </p>
    </AdminCard>
  );
}

function QuietHoursCard({ categories }: { categories: readonly string[] }) {
  return (
    <AdminCard
      title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.quietHoursTitle")}
    >
      <AdminInput
        label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentCategories")}
        value={categories.length > 0 ? categories.join(", ") : "—"}
        readOnly
      />
      <p className="te-caption">
        {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.quietHoursNote")}
      </p>
    </AdminCard>
  );
}

export function FeatureFlagsAndPlatformConfiguration() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<FlagDraft>({});
  const [reason, setReason] = useState("");
  const [approverId, setApproverId] = useState("");

  const settingsQuery = useQuery({
    ...serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });

  const updateSettingsMutation = useMutation(
    serverMutationOptions(orpc.admin.updateSystemSettings, "admin/updateSystemSettings", {
      onSuccess: () => {
        trackEvent("platform_settings_updated", { surface: "admin" });
        setDraft({});
        setReason("");
        setApproverId("");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
      },
      onError: () => trackEvent("platform_settings_update_failed", { surface: "admin" }),
    }),
  );

  const settings = settingsQuery.data;
  const saved: FlagValues | undefined = settings?.featureFlags;
  const pending = saved ? changedFlags(saved, draft) : {};
  const isDirty = Object.keys(pending).length > 0;
  const canSave =
    isDirty &&
    reason.trim().length >= MIN_REASON_LENGTH &&
    UUID_PATTERN.test(approverId.trim()) &&
    !updateSettingsMutation.isPending;

  const handleToggle = (key: FlagKey) => {
    if (!saved) return;
    updateSettingsMutation.reset();
    setDraft((current) => ({ ...current, [key]: !(current[key] ?? saved[key]) }));
  };

  const handleSave = () => {
    if (!canSave) return;
    updateSettingsMutation.mutate({
      featureFlags: pending,
      reason: reason.trim(),
      secondApproverAdminAccountId: approverId.trim(),
    });
  };

  const markets: readonly MarketGateways[] = settings ? Object.values(settings.markets) : [];

  return (
    <AdminPage
      title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.title")}
      description={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.description")}
      actions={
        <AdminButton variant="primary" disabled={!canSave} onClick={handleSave}>
          {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.saveConfiguration")}
        </AdminButton>
      }
    >
      <AdminQueryState
        query={settingsQuery}
        loadingLabel={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.loading")}
      >
        {isDirty ? (
          <>
            <AdminAlert tone="warning">
              {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.unsavedChanges")}
            </AdminAlert>
            <AdminCard
              title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.approvalTitle")}
              caption={t(
                "screen.admin.platform.featureFlagsAndPlatformConfiguration.approvalCaption",
              )}
            >
              <AdminTextarea
                label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.reason")}
                rows={3}
                required
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <AdminInput
                label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.approver")}
                help={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.approverHelp")}
                required
                value={approverId}
                onChange={(event) => setApproverId(event.target.value)}
              />
            </AdminCard>
          </>
        ) : null}
        {updateSettingsMutation.isError ? (
          <AdminAlert
            tone="danger"
            title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.saveFailedTitle")}
          >
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.saveFailedBody")}
          </AdminAlert>
        ) : null}
        {updateSettingsMutation.isSuccess ? (
          <AdminAlert tone="success">
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.saved")}
          </AdminAlert>
        ) : null}
        <AdminGrid columns={2}>
          <FeatureFlagTable
            values={saved ? { ...saved, ...draft } : undefined}
            onToggle={handleToggle}
          />
          <GatewayRoutingCard markets={markets} />
          <PolicyCard />
          <QuietHoursCard categories={settings?.notifications.urgentCategories ?? []} />
        </AdminGrid>
      </AdminQueryState>
    </AdminPage>
  );
}
