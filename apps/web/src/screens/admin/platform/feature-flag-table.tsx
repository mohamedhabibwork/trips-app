// The "Feature flags" card of SCR-ADM-32 (docs/design/web/admin/SCR-ADM-32.dc.html): one row per
// phase flag with its On/Off state and a control to change it in the unsaved draft.
import { t } from "@trips-app/i18n";

import { AdminButton } from "../common/admin-actions";
import { AdminEmpty } from "../common/admin-states";
import { AdminBadge, AdminTable, type AdminColumn } from "../common/admin-ui";

export const FLAG_KEYS = [
  "p1_foundation",
  "p2_single_vehicle_mvp",
  "p3_multi_vehicle_checkin",
  "p4_marketplace_supply",
  "p5_subscriptions_coupons",
  "p6_live_tracking_public_api",
] as const;

export type FlagKey = (typeof FLAG_KEYS)[number];
export type FlagValues = Readonly<Record<FlagKey, boolean>>;

const FLAG_LABEL_KEY: Record<FlagKey, string> = {
  p1_foundation: "screen.admin.platform.featureFlagTable.flagFoundation",
  p2_single_vehicle_mvp: "screen.admin.platform.featureFlagTable.flagSingleVehicle",
  p3_multi_vehicle_checkin: "screen.admin.platform.featureFlagTable.flagMultiVehicle",
  p4_marketplace_supply: "screen.admin.platform.featureFlagTable.flagMarketplace",
  p5_subscriptions_coupons: "screen.admin.platform.featureFlagTable.flagSubscriptions",
  p6_live_tracking_public_api: "screen.admin.platform.featureFlagTable.flagLiveTracking",
};

interface FlagRow {
  key: FlagKey;
  label: string;
  phase: number;
  isOn: boolean;
}

export function FeatureFlagTable({
  values,
  onToggle,
}: {
  /** Saved flags with the draft applied; undefined until the settings load. */
  values: FlagValues | undefined;
  onToggle: (key: FlagKey) => void;
}) {
  const rows: readonly FlagRow[] = values
    ? FLAG_KEYS.map((key, index) => ({
        key,
        label: t(FLAG_LABEL_KEY[key]),
        phase: index + 1,
        isOn: values[key],
      }))
    : [];

  const columns: readonly AdminColumn<FlagRow>[] = [
    {
      key: "flag",
      header: t("screen.admin.platform.featureFlagTable.flag"),
      render: (row) => row.label,
      wrap: true,
    },
    {
      key: "phase",
      header: t("screen.admin.platform.featureFlagTable.phase"),
      render: (row) => t("screen.admin.platform.featureFlagTable.phaseN", { phase: row.phase }),
    },
    {
      key: "state",
      header: t("screen.admin.platform.featureFlagTable.state"),
      render: (row) => (
        <span className="flex items-center gap-3">
          {row.isOn ? (
            <AdminBadge tone="ok">{t("screen.admin.platform.featureFlagTable.on")}</AdminBadge>
          ) : (
            <AdminBadge icon="close">{t("screen.admin.platform.featureFlagTable.off")}</AdminBadge>
          )}
          <AdminButton
            variant="link"
            aria-label={t(
              row.isOn
                ? "screen.admin.platform.featureFlagTable.turnOffFor"
                : "screen.admin.platform.featureFlagTable.turnOnFor",
              { flag: row.label },
            )}
            onClick={() => onToggle(row.key)}
          >
            {row.isOn
              ? t("screen.admin.platform.featureFlagTable.turnOff")
              : t("screen.admin.platform.featureFlagTable.turnOn")}
          </AdminButton>
        </span>
      ),
    },
  ];

  return (
    <AdminTable
      caption={t("screen.admin.platform.featureFlagTable.caption")}
      title={t("screen.admin.platform.featureFlagTable.title")}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.key}
      empty={<AdminEmpty title={t("screen.admin.platform.featureFlagTable.empty")} />}
    />
  );
}
