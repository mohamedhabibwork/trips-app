// The "Gateway routing by market" card of SCR-ADM-32 (docs/design/web/admin/SCR-ADM-32.dc.html):
// which gateway handles international, local MENA and Egyptian cash payments, read from each
// market's configured gateways. updateSystemSettings cannot change gateways, so the fields are
// read only.
import { t } from "@trips-app/i18n";

import { AdminSelect, type AdminOption } from "../common/admin-form";
import { AdminCard } from "../common/admin-ui";

export interface MarketGateways {
  countryCode: string;
  gateways: readonly string[];
}

const NONE = "none";
const LOCAL_MENA_GATEWAYS = ["paymob", "tap"] as const;

const GATEWAY_LABEL_KEY: Record<string, string> = {
  stripe: "screen.admin.platform.gatewayRoutingCard.stripe",
  paymob: "screen.admin.platform.gatewayRoutingCard.paymob",
  tap: "screen.admin.platform.gatewayRoutingCard.tap",
  fawry: "screen.admin.platform.gatewayRoutingCard.fawry",
};

function gatewayLabel(code: string): string {
  const key = GATEWAY_LABEL_KEY[code];
  return key ? t(key) : code;
}

/** One read-only field: the configured gateway, or "Not configured". */
function GatewayField({ label, gateways }: { label: string; gateways: readonly string[] }) {
  const value = gateways.length > 0 ? gateways.join("+") : NONE;
  const display =
    gateways.length > 0
      ? gateways.map(gatewayLabel).join(t("screen.admin.platform.gatewayRoutingCard.or"))
      : t("screen.admin.platform.gatewayRoutingCard.notConfigured");
  const options: readonly AdminOption[] = [{ value, label: display }];
  return (
    <AdminSelect label={label} options={options} value={value} onValueChange={() => {}} disabled />
  );
}

export function GatewayRoutingCard({ markets }: { markets: readonly MarketGateways[] }) {
  const configured = new Set(markets.flatMap((market) => market.gateways));
  const egypt = markets.find((market) => market.countryCode === "EG");
  const international = configured.has("stripe") ? ["stripe"] : [];
  const localMena = LOCAL_MENA_GATEWAYS.filter((code) => configured.has(code));
  const cashEgypt = egypt?.gateways.includes("fawry") ? ["fawry"] : [];

  return (
    <AdminCard title={t("screen.admin.platform.gatewayRoutingCard.title")}>
      <GatewayField
        label={t("screen.admin.platform.gatewayRoutingCard.international")}
        gateways={international}
      />
      <GatewayField
        label={t("screen.admin.platform.gatewayRoutingCard.localMena")}
        gateways={localMena}
      />
      <GatewayField
        label={t("screen.admin.platform.gatewayRoutingCard.cashEgypt")}
        gateways={cashEgypt}
      />
      <p className="te-caption">{t("screen.admin.platform.gatewayRoutingCard.note")}</p>
    </AdminCard>
  );
}
