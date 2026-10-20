// Shared pieces of the integrations pages (SCR-ORG-57 to 60): the section tabs, the event ids an
// endpoint can subscribe to and the static delivery rules of the design.
import type { ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgNavTabs } from "../common/org-form";
import { orgHref } from "../common/org-routes";
import { OrgCard } from "../common/org-ui";

export const INTEGRATIONS_K = "screen.organization.integrations.integrationsParts";

/** The integrations pages, in the artboards' tab order. */
const INTEGRATIONS_TABS = [
  { id: "webhooks", labelKey: `${INTEGRATIONS_K}.tabWebhooks` },
  { id: "api-keys", labelKey: `${INTEGRATIONS_K}.tabApiKeys` },
] as const;

export function IntegrationsTabs({ activeSlug }: { activeSlug: string }): ReactNode {
  return (
    <OrgNavTabs
      label={t(`${INTEGRATIONS_K}.tabsLabel`)}
      tabs={INTEGRATIONS_TABS.map((tab) => ({
        id: tab.id,
        label: t(tab.labelKey),
        href: orgHref(tab.id as "webhooks" | "api-keys"),
      }))}
      activeId={activeSlug}
    />
  );
}

/** Event ids an endpoint subscribes to, the same values `settings.webhookEndpoints[].events` holds. */
export const INTEGRATION_EVENTS = [
  { id: "bookingConfirmed", group: "bookings" },
  { id: "bookingCancelled", group: "bookings" },
  { id: "tripPublished", group: "trips" },
  { id: "checkIn", group: "checkIn" },
  { id: "checkOut", group: "checkIn" },
  { id: "signingStatus", group: "signing" },
] as const;

export type IntegrationEventId = (typeof INTEGRATION_EVENTS)[number]["id"];

export function integrationEventLabel(event: IntegrationEventId): string {
  return t(`screen.organization.integrations.integrationsParts.event.${event}`);
}

export function integrationGroupLabel(group: string): string {
  return t(`screen.organization.integrations.integrationsParts.group.${group}`);
}

/** The static delivery rules the webhooks artboards state under the endpoints table. */
export function DeliveryRules(): ReactNode {
  return (
    <OrgCard title={t(`${INTEGRATIONS_K}.howDeliveriesWork`)}>
      <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm leading-5">
        <li>{t(`${INTEGRATIONS_K}.ruleSigned`)}</li>
        <li>{t(`${INTEGRATIONS_K}.ruleRetries`)}</li>
        <li>{t(`${INTEGRATIONS_K}.ruleDisabled`)}</li>
      </ul>
    </OrgCard>
  );
}
