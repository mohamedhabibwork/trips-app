// SCR-ORG-57 API keys: the integrations API-keys page of the design. The plan notice and the
// reference card are real; no procedure stores API keys yet, so the key list and the IP allowlist
// render their structure with honest empty states instead of invented credentials.
import { useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import { OrgChoice, OrgInput } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import {
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  OrgEmpty,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { IntegrationsTabs } from "./integrations-parts";

const K = "screen.organization.integrations.apiKeys";
const PARTS_K = "screen.organization.integrations.integrationsParts";

const READ_SCOPES = [
  "read:bookings",
  "read:trips",
  "read:customers",
  "read:invoices",
  "read:settlements",
  "read:coupons",
] as const;

const WRITE_SCOPES = ["write:trips", "write:bookings", "write:customers", "write:coupons"] as const;

type Environment = "live" | "test";

export function ApiKeys(): ReactNode {
  const { status: authStatus, actor } = useAuth();
  const enabled = authStatus === "authenticated" && Boolean(actor?.activeTenantId);
  const [environment, setEnvironment] = useState<Environment>("live");
  const [panelOpen, setPanelOpen] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [scopes, setScopes] = useState<ReadonlySet<string>>(
    () => new Set<string>(["read:bookings", "read:trips"]),
  );

  const subscriptionQuery = useQuery({
    ...serverQueryOptions(
      orpc.plans.getOrganizationSubscription,
      "plans/getOrganizationSubscription",
      {
        input: undefined,
      },
    ),
    enabled,
  });
  const tier = subscriptionQuery.data?.tier;

  const scopesLabel = t(`${K}.nScopesSelected`, { n: scopes.size });
  const baseUrl =
    environment === "live"
      ? "https://api.trips-enjoy.com/v1"
      : "https://sandbox.api.trips-enjoy.com/v1";

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <div role="radiogroup" aria-label={t(`${K}.environmentLabel`)} className="flex gap-2">
            {(["live", "test"] as const).map((value) => (
              <OrgButton
                key={value}
                variant={environment === value ? "primary" : "secondary"}
                aria-pressed={environment === value}
                onClick={() => setEnvironment(value)}
              >
                {value === "live" ? t(`${K}.liveKeys`) : t(`${K}.testKeys`)}
              </OrgButton>
            ))}
          </div>
        }
      />
      <IntegrationsTabs activeSlug="api-keys" />
      {subscriptionQuery.isError ? (
        <OrgError onRetry={() => void subscriptionQuery.refetch()} />
      ) : null}
      <OrgAlert tone="info" title={t(`${K}.growthReadOnlyTitle`)}>
        <span className="block">{t(`${K}.growthReadOnlyBody`)}</span>
        <OrgButtonLink slug="subscription-and-billing" variant="text" className="-ms-2">
          {t(`${PARTS_K}.comparePlans`)}
        </OrgButtonLink>
      </OrgAlert>
      <OrgRow align="start">
        <div className="flex min-w-0 flex-[3] flex-col gap-6">
          <OrgCard
            title={environment === "live" ? t(`${K}.liveKeys`) : t(`${K}.testKeysTitle`)}
            actions={
              <OrgButton variant="secondary" onClick={() => setPanelOpen(true)}>
                {t(`${K}.newKey`)}
              </OrgButton>
            }
          >
            {subscriptionQuery.isLoading ? (
              <OrgLoading />
            ) : (
              <OrgEmpty title={t(`${K}.noKeysTitle`)}>{t(`${K}.noKeysBody`)}</OrgEmpty>
            )}
          </OrgCard>
          <OrgCard title={t(`${K}.ipAllowlist`)}>
            <p className="m-0 text-sm text-[var(--te-ink-muted)]">{t(`${K}.ipAllowlistBody`)}</p>
            <OrgEmpty title={t(`${K}.ipEmptyTitle`)}>{t(`${K}.ipEmptyBody`)}</OrgEmpty>
          </OrgCard>
          <OrgCard
            title={t(`${K}.apiReference`)}
            className="gap-2 bg-[var(--te-brand-navy)] text-[var(--te-on-primary)]"
          >
            <span className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="opacity-70">{t(`${K}.baseUrl`)}</span>
              <code className="font-mono text-[13px]">{baseUrl}</code>
            </span>
            <span className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="opacity-70">{t(`${K}.authHeader`)}</span>
              <code className="font-mono text-[13px]">Authorization: Bearer …</code>
            </span>
            <span className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="opacity-70">{t(`${K}.rateLimit`)}</span>
              <span>{t(`${K}.rateLimitValue`)}</span>
            </span>
          </OrgCard>
        </div>
        {panelOpen ? (
          <OrgCard title={t(`${K}.newKeyPanel`)} className="lg:flex-[2]">
            <OrgInput
              label={t(`${K}.keyName`)}
              hint={t(`${K}.keyNameHint`)}
              value={keyName}
              onChange={(change) => setKeyName(change.target.value)}
            />
            <fieldset className="m-0 grid gap-x-6 gap-y-2 border-0 p-0 sm:grid-cols-2">
              <legend className="pb-1 text-sm font-semibold">{t(`${K}.readScopes`)}</legend>
              {READ_SCOPES.map((scope) => (
                <OrgChoice
                  key={scope}
                  type="checkbox"
                  className="min-h-9"
                  checked={scopes.has(scope)}
                  onChange={(change) => {
                    setScopes((current) => {
                      const next = new Set(current);
                      if (change.target.checked) next.add(scope);
                      else next.delete(scope);
                      return next;
                    });
                  }}
                >
                  <code className="font-mono text-[13px]">{scope}</code>
                </OrgChoice>
              ))}
            </fieldset>
            <fieldset
              disabled
              className="m-0 grid gap-x-6 gap-y-2 rounded-xl border border-dashed border-[var(--te-control-border)] p-4 sm:grid-cols-2"
            >
              <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
                {t(`${K}.writeScopes`)}
                <OrgBadge tone="acc">{t(`${K}.enterpriseBadge`)}</OrgBadge>
              </legend>
              {WRITE_SCOPES.map((scope) => (
                <OrgChoice key={scope} type="checkbox" className="min-h-9" checked={false} disabled>
                  <code className="font-mono text-[13px]">{scope}</code>
                </OrgChoice>
              ))}
              <OrgButtonLink slug="subscription-and-billing" variant="text" className="-ms-2">
                {t(`${K}.upgradeForWrite`)}
              </OrgButtonLink>
            </fieldset>
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{scopesLabel}</p>
            <OrgAlert tone="info" title={t(`${K}.createUnavailableTitle`)}>
              {t(`${K}.createUnavailableBody`)}
            </OrgAlert>
            <div>
              <OrgButton variant="secondary" onClick={() => setPanelOpen(false)}>
                {t(`${K}.closePanel`)}
              </OrgButton>
            </div>
          </OrgCard>
        ) : null}
      </OrgRow>
      {tier === "enterprise" ? (
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.enterpriseNote`)}</p>
      ) : null}
    </OrgPage>
  );
}
