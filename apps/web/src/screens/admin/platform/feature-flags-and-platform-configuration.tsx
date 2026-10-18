import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import type { TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { StatePreview } from "../common/admin-state-preview";
import {
  AdminActions,
  AdminFilterSelect,
  AdminPage,
  AdminPanel,
  AdminToggle,
} from "../common/admin-shared";

const GATEWAY_OPTIONS = (): readonly TeSelectOption[] => [
  {
    value: "stripe",
    label: t("screen.admin.platform.featureFlagsAndPlatformConfiguration.stripeInternational"),
  },
  {
    value: "paymob",
    label: t("screen.admin.platform.featureFlagsAndPlatformConfiguration.paymobLocalMena"),
  },
  {
    value: "tap",
    label: t("screen.admin.platform.featureFlagsAndPlatformConfiguration.tapLocalMena"),
  },
  {
    value: "fawry",
    label: t("screen.admin.platform.featureFlagsAndPlatformConfiguration.fawryCashInEgypt"),
  },
];

export function FeatureFlagsAndPlatformConfiguration() {
  const queryClient = useQueryClient();
  const settingsQuery = useQuery(orpc.admin.getSystemSettings.queryOptions());

  const [market, setMarket] = useState("EG");
  const [flagPhase5, setFlagPhase5] = useState(true);
  const [flagPhase6, setFlagPhase6] = useState(true);

  useEffect(() => {
    if (settingsQuery.data) {
      setFlagPhase5(Boolean(settingsQuery.data.featureFlags.p5_subscriptions_coupons));
      setFlagPhase6(Boolean(settingsQuery.data.featureFlags.p6_live_tracking_public_api));
      const firstMarket = Object.values(settingsQuery.data.markets)[0];
      if (firstMarket) {
        setMarket(firstMarket.countryCode);
      }
    }
  }, [settingsQuery.data]);

  const updateSettingsMutation = useMutation(
    orpc.admin.updateSystemSettings.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
      },
    }),
  );

  const handleSave = async () => {
    const validMarket =
      market === "EG" || market === "SA" || market === "AE" ? market : ("EG" as const);
    try {
      await updateSettingsMutation.mutateAsync({
        marketCountryCode: validMarket,
        marketEnabled: true,
        featureFlags: {
          p5_subscriptions_coupons: flagPhase5,
          p6_live_tracking_public_api: flagPhase6,
        },
        reason: "Updated feature flags and market gateway from Admin console",
      });
    } catch {
      // Allow optimistic state in preview
    }
  };

  return (
    <AdminPage>
      <TePageHeader
        title={t(
          "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagsAndPlatformConfiguration",
        )}
        description={t(
          "screen.admin.platform.featureFlagsAndPlatformConfiguration.turnFeaturesOnOrOff",
        )}
        actions={
          <TeButton onClick={() => void handleSave()}>
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.saveConfiguration")}
          </TeButton>
        }
      />
      <StatePreview
        emptyTitle={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.noFeatureFlags")}
        emptyDescription={t(
          "screen.admin.platform.featureFlagsAndPlatformConfiguration.noFeatureFlagsAreDefined",
        )}
        loadingLabel={t(
          "screen.admin.platform.featureFlagsAndPlatformConfiguration.loadingTheConfiguration",
        )}
      >
        <AdminPanel
          title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlags")}
        >
          <p className="te-caption">
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.aFlagChangeAppliesTo")}
          </p>
          <div onClick={() => setFlagPhase5((v) => !v)}>
            <AdminToggle
              label={t(
                "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagName",
              )}
            />
          </div>
          <p className="te-caption">
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.phasePhase")}
          </p>
          <div onClick={() => setFlagPhase6((v) => !v)}>
            <AdminToggle
              label={t(
                "screen.admin.platform.featureFlagsAndPlatformConfiguration.featureFlagNameLabel",
              )}
            />
          </div>
          <p className="te-caption">
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.phasePhase2")}
          </p>
        </AdminPanel>
        <AdminPanel
          title={t(
            "screen.admin.platform.featureFlagsAndPlatformConfiguration.paymentGatewayByMarket",
          )}
        >
          <TeInput
            label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.market")}
            placeholder={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.marketCode")}
            value={market}
            onChange={(event) => setMarket(event.target.value)}
            required
          />
          <AdminFilterSelect
            label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.gateway")}
            options={GATEWAY_OPTIONS()}
          />
          <p className="te-caption">
            {t(
              "screen.admin.platform.featureFlagsAndPlatformConfiguration.stripeForInternationalPaymentsPaymob",
            )}
          </p>
        </AdminPanel>
        <AdminPanel
          title={t(
            "screen.admin.platform.featureFlagsAndPlatformConfiguration.otpAndSessionPolicy",
          )}
        >
          <TeInput
            label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.otpPolicy")}
            value="Fixed by BRL-20"
            readOnly
            supportingText={t(
              "screen.admin.platform.featureFlagsAndPlatformConfiguration.editabilityIsUnderReviewD",
            )}
          />
          <TeInput
            label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.sessionPolicy")}
            value="Fixed by BRL-22"
            readOnly
            supportingText={t(
              "screen.admin.platform.featureFlagsAndPlatformConfiguration.editabilityIsUnderReviewDSupportingText",
            )}
          />
        </AdminPanel>
        <AdminPanel
          title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.quietHours")}
        >
          <TeInput
            label={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentCategories")}
            placeholder={t(
              "screen.admin.platform.featureFlagsAndPlatformConfiguration.urgentNotificationCategories",
            )}
            disabled
            supportingText={t(
              "screen.admin.platform.featureFlagsAndPlatformConfiguration.setByD288",
            )}
          />
        </AdminPanel>
        <TeInlineAlert
          tone="info"
          title={t("screen.admin.platform.featureFlagsAndPlatformConfiguration.audit")}
        >
          {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.everyChangeOnThisPage")}
        </TeInlineAlert>
        <AdminActions>
          <TeButton variant="secondary" onClick={() => setMarket("EG")}>
            {t("screen.admin.platform.featureFlagsAndPlatformConfiguration.cancel")}
          </TeButton>
        </AdminActions>
      </StatePreview>
    </AdminPage>
  );
}
