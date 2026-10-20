// SCR-ADM-39 Countries & markets (docs/design/web/AdmCountries.dc.html): launch status, currency,
// gateways, tax and e-invoicing per market, plus the plan price list per market currency. Markets
// live in system settings; country names come from the COUNTRY lookup (the only market fields a
// lookup item carries — nothing else maps, so lookups.upsertLookup is not used here); plan prices
// come from the catalog. Only the launch status has a write procedure (preview, then update with a
// reason, which needs four-eyes approval), so other fields render read-only and unrecorded fields
// say so.
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import { AdminButton } from "../common/admin-actions";
import { AdminInput } from "../common/admin-form";
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
import { formatMinor } from "../finance/finance-format";

const K = "screen.admin.platform.countriesMarkets";

interface MarketRow {
  code: string;
  name: string;
  enabled: boolean;
  currency: string;
  gateways: readonly string[];
  timeZone: string;
  zatca: boolean;
}

interface PlanPriceRow {
  role: string;
  tier: string;
  price: string;
}

export function CountriesMarkets() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const settingsQuery = useQuery({
    ...serverQueryOptions(orpc.admin.getSystemSettings, "admin/getSystemSettings", {
      input: undefined,
    }),
    enabled: authStatus === "authenticated",
  });
  const countriesQuery = useQuery({
    ...serverQueryOptions(orpc.lookups.getByTypeCodes, "lookups/getByTypeCodes", {
      input: { codes: ["COUNTRY"] },
    }),
    enabled: authStatus === "authenticated",
  });
  const catalogQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", { input: {} }),
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

  const settings = settingsQuery.data ?? null;
  const lookupNames = useMemo(
    () =>
      new Map(
        (countriesQuery.data?.lookupTypes.COUNTRY?.items ?? []).map((item) => [item.code, item]),
      ),
    [countriesQuery.data],
  );
  const markets: readonly MarketRow[] = useMemo(
    () =>
      Object.values(settings?.markets ?? {})
        .map((market) => {
          const lookupItem = lookupNames.get(market.countryCode);
          const fromLookup = lookupItem
            ? locale === "ar"
              ? lookupItem.name.ar
              : lookupItem.name.en
            : null;
          return {
            code: market.countryCode,
            name:
              fromLookup || (locale === "ar" ? market.nameAr : market.nameEn) || market.countryCode,
            enabled: market.enabled,
            currency: market.currency,
            gateways: market.gateways,
            timeZone: market.timeZone,
            zatca: market.zatcaEnabled,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [settings, locale, lookupNames],
  );
  const selected = markets.find((market) => market.code === selectedCode) ?? null;

  const columns: readonly AdminColumn<MarketRow>[] = [
    {
      key: "market",
      header: t(`${K}.market`),
      render: (row) => (
        <span className="flex flex-col">
          <b>{row.name}</b>
          <span className="te-caption">{row.code}</span>
        </span>
      ),
      wrap: true,
    },
    {
      key: "status",
      header: t(`${K}.launchStatus`),
      render: (row) =>
        row.enabled ? (
          <AdminBadge tone="ok">{t(`${K}.statusLive`)}</AdminBadge>
        ) : (
          <AdminBadge tone="warn" icon={false}>
            {t(`${K}.statusNotLaunched`)}
          </AdminBadge>
        ),
    },
    { key: "currency", header: t(`${K}.currency`), render: (row) => row.currency },
    {
      key: "gateways",
      header: t(`${K}.gateways`),
      render: (row) => row.gateways.join(", "),
      wrap: true,
    },
    {
      key: "tax",
      header: t(`${K}.taxRate`),
      render: () => t(`${K}.notRecorded`),
      headerWrap: true,
    },
    {
      key: "einvoicing",
      header: t(`${K}.eInvoicing`),
      render: (row) => (row.zatca ? t(`${K}.zatcaOn`) : t(`${K}.zatcaOff`)),
      headerWrap: true,
    },
    { key: "zone", header: t(`${K}.timeZone`), render: (row) => row.timeZone },
    {
      key: "action",
      header: <span className="te-caption">{t(`${K}.action`)}</span>,
      render: (row) => (
        <AdminButton variant="link" onClick={() => setSelectedCode(row.code)}>
          {t(`${K}.openSettings`)}
        </AdminButton>
      ),
    },
  ];

  const priceRows: readonly PlanPriceRow[] = useMemo(() => {
    if (!selected) return [];
    const roleOrder = ["organization", "platform_driver", "platform_photographer", "traveler"];
    return (catalogQuery.data ?? [])
      .filter((plan) => plan.currencyCode === selected.currency && plan.status === "active")
      .sort(
        (a, b) =>
          roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role) || a.tier.localeCompare(b.tier),
      )
      .map((plan) => ({
        role: plan.role,
        tier: locale === "ar" ? plan.nameAr : plan.nameEn,
        price: `${formatMinor(plan.monthlyPriceMinor, plan.currencyCode, locale)} / ${t(`${K}.monthUnit`)}`,
      }));
  }, [catalogQuery.data, selected, locale]);

  const priceColumns: readonly AdminColumn<PlanPriceRow>[] = [
    { key: "role", header: t(`${K}.roleColumn`), render: (row) => row.role },
    { key: "tier", header: t(`${K}.tierColumn`), render: (row) => row.tier, wrap: true },
    { key: "price", header: t(`${K}.priceColumn`), render: (row) => row.price, align: "end" },
  ];

  const trimmedReason = reason.trim();
  const canSave = selected !== null && trimmedReason.length >= 5 && !updateMutation.isPending;

  const runPreview = () => {
    if (!selected) return;
    previewMutation.mutate({
      marketCountryCode: selected.code as "EG" | "SA" | "AE",
      marketEnabled: !selected.enabled,
    });
  };

  const runSave = () => {
    if (!selected || !canSave) return;
    updateMutation.mutate({
      marketCountryCode: selected.code as "EG" | "SA" | "AE",
      marketEnabled: !selected.enabled,
      reason: trimmedReason,
    });
  };

  return (
    <AdminPage
      title={t(`${K}.title`)}
      description={t(`${K}.description`)}
      actions={
        // No procedure adds a market yet; markets come from system settings.
        <AdminButton variant="primary" disabled title={t(`${K}.addMarketUnavailable`)}>
          {t(`${K}.addMarket`)}
        </AdminButton>
      }
    >
      <AdminQueryState query={settingsQuery} loadingLabel={t(`${K}.loading`)}>
        <AdminSplit
          main={
            <AdminCard title={t(`${K}.marketsTitle`)} caption={t(`${K}.marketsCaption`)}>
              <AdminTable
                caption={t(`${K}.marketsCaption`)}
                columns={columns}
                rows={markets}
                getRowKey={(row) => row.code}
                empty={
                  <AdminEmpty title={t(`${K}.emptyTitle`)} description={t(`${K}.emptyBody`)} />
                }
              />
            </AdminCard>
          }
          side={
            <AdminCard
              title={
                selected
                  ? t(`${K}.settingsTitle`, { market: selected.name })
                  : t(`${K}.settingsPickTitle`)
              }
              caption={selected ? t(`${K}.saveNote`) : undefined}
            >
              {!selected ? (
                <AdminEmpty
                  title={t(`${K}.pickMarketTitle`)}
                  description={t(`${K}.pickMarketBody`)}
                />
              ) : (
                <>
                  <AdminRow label={t(`${K}.launchStatus`)}>
                    <AdminBadge tone={selected.enabled ? "ok" : "warn"} icon={false}>
                      {selected.enabled ? t(`${K}.statusLive`) : t(`${K}.statusNotLaunched`)}
                    </AdminBadge>
                  </AdminRow>
                  <AdminRow label={t(`${K}.timeZone`)}>{selected.timeZone}</AdminRow>
                  <AdminRow label={t(`${K}.currency`)}>{selected.currency}</AdminRow>
                  <AdminRow label={t(`${K}.commission`)}>
                    {t(`${K}.commissionValue`, {
                      percent: ((settings?.operational.platformCommissionBps ?? 0) / 100).toFixed(
                        1,
                      ),
                    })}
                  </AdminRow>
                  <AdminRow label={t(`${K}.gateways`)}>{selected.gateways.join(", ")}</AdminRow>
                  <AdminRow label={t(`${K}.taxRate`)}>{t(`${K}.notRecorded`)}</AdminRow>
                  <AdminRow label={t(`${K}.eInvoicing`)}>
                    {selected.zatca ? t(`${K}.zatcaOn`) : t(`${K}.zatcaOff`)}
                  </AdminRow>
                  <AdminRow label={t(`${K}.languages`)}>{t(`${K}.notRecorded`)}</AdminRow>
                  <AdminRow label={t(`${K}.entityName`)} last>
                    {t(`${K}.notRecorded`)}
                  </AdminRow>

                  {previewMutation.data ? (
                    <AdminAlert tone="info" title={t(`${K}.previewTitle`)}>
                      {t(`${K}.previewBody`, {
                        accounts: previewMutation.data.affectedAccountsCount,
                        organizations: previewMutation.data.affectedOrganizationsCount,
                      })}
                    </AdminAlert>
                  ) : null}
                  {previewMutation.isError || updateMutation.isError ? (
                    <AdminAlert tone="danger" title={t(`${K}.saveErrorTitle`)}>
                      {t(`${K}.saveErrorBody`)}
                    </AdminAlert>
                  ) : null}
                  <AdminInput
                    label={t(`${K}.reasonLabel`)}
                    placeholder={t(`${K}.reasonPlaceholder`)}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                  <div className="flex flex-wrap gap-3">
                    <AdminButton
                      variant="secondary"
                      disabled={updateMutation.isPending}
                      onClick={runPreview}
                    >
                      {t(`${K}.previewChange`)}
                    </AdminButton>
                    <AdminButton variant="primary" disabled={!canSave} onClick={runSave}>
                      {t(`${K}.saveMarket`, { market: selected.name })}
                    </AdminButton>
                  </div>
                  <p className="te-caption">{t(`${K}.fourEyesNote`)}</p>
                  <AdminButton
                    variant="link"
                    onClick={() => {
                      setSelectedCode(null);
                      setReason("");
                      previewMutation.reset();
                    }}
                  >
                    {t(`${K}.discard`)}
                  </AdminButton>
                </>
              )}
            </AdminCard>
          }
        />
      </AdminQueryState>

      <AdminCard
        title={
          selected
            ? t(`${K}.priceListTitle`, { currency: selected.currency })
            : t(`${K}.priceListPickTitle`)
        }
        caption={t(`${K}.priceListCaption`, {
          discount: ((settings?.operational.annualBillingDiscountBps ?? 0) / 100).toFixed(0),
        })}
      >
        <AdminTable
          caption={t(`${K}.priceListCaption`, {
            discount: ((settings?.operational.annualBillingDiscountBps ?? 0) / 100).toFixed(0),
          })}
          columns={priceColumns}
          rows={priceRows}
          getRowKey={(row) => `${row.role}-${row.tier}`}
          empty={
            <AdminEmpty
              title={t(`${K}.priceListEmptyTitle`)}
              description={t(`${K}.priceListEmptyBody`)}
            />
          }
        />
      </AdminCard>
    </AdminPage>
  );
}
