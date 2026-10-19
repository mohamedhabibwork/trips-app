// Webhook endpoint and events of SCR-ORG-36. One form spans both cards; the page header submits it.
import { useState, type FormEvent, type ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgChoice, OrgInput } from "../common/org-form";
import { OrgButton, OrgCard, OrgRow } from "../common/org-ui";

export const WEBHOOK_FORM_ID = "webhook-endpoint-form";
const EVENTS_ERROR_ID = "webhook-events-error";

/** Event ids stored on the endpoint, in the artboard's order. */
const EVENT_IDS = [
  "bookingConfirmed",
  "bookingCancelled",
  "tripPublished",
  "checkIn",
  "checkOut",
  "signingStatus",
] as const;

type EventId = (typeof EVENT_IDS)[number];

function eventLabel(event: EventId): string {
  switch (event) {
    case "bookingConfirmed":
      return t("screen.organization.people.webhookForm.bookingConfirmed");
    case "bookingCancelled":
      return t("screen.organization.people.webhookForm.bookingCancelled");
    case "tripPublished":
      return t("screen.organization.people.webhookForm.tripPublished");
    case "checkIn":
      return t("screen.organization.people.webhookForm.checkIn");
    case "checkOut":
      return t("screen.organization.people.webhookForm.checkOut");
    case "signingStatus":
      return t("screen.organization.people.webhookForm.signingStatus");
  }
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export interface WebhookValues {
  url: string;
  events: readonly EventId[];
}

interface WebhookFormProps {
  endpoint: { url: string; events: readonly string[] } | null;
  disabled: boolean;
  onSave: (values: WebhookValues, rotateSecret: boolean) => void;
  /** The CRM card, drawn beside the endpoint card. */
  crmCard: ReactNode;
}

export function WebhookForm({ endpoint, disabled, onSave, crmCard }: WebhookFormProps) {
  const [url, setUrl] = useState(endpoint?.url ?? "");
  const [events, setEvents] = useState<ReadonlySet<EventId>>(
    () => new Set(EVENT_IDS.filter((id) => endpoint?.events.includes(id))),
  );
  const [submitted, setSubmitted] = useState(false);

  const urlError =
    submitted && !isHttpsUrl(url.trim())
      ? t("screen.organization.people.webhookForm.urlInvalid")
      : undefined;
  const eventsError = submitted && events.size === 0;

  function toggle(event: EventId, checked: boolean) {
    setEvents((current) => {
      const next = new Set(current);
      if (checked) next.add(event);
      else next.delete(event);
      return next;
    });
  }

  function save(rotateSecret: boolean) {
    setSubmitted(true);
    if (!isHttpsUrl(url.trim()) || events.size === 0) return;
    onSave({ url: url.trim(), events: EVENT_IDS.filter((id) => events.has(id)) }, rotateSecret);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    save(false);
  }

  return (
    <form id={WEBHOOK_FORM_ID} noValidate onSubmit={handleSubmit} className="contents">
      <OrgRow align="start">
        {crmCard}
        <OrgCard
          title={t("screen.organization.people.webhookForm.webhookEndpoint")}
          className="lg:flex-[1.4]"
        >
          <OrgInput
            label={t("screen.organization.people.webhookForm.endpointUrl")}
            type="url"
            inputMode="url"
            placeholder="https://"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            error={urlError}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="te-caption text-[var(--te-ink-muted)]">
              {endpoint
                ? t("screen.organization.people.webhookForm.signingSecretHidden")
                : t("screen.organization.people.webhookForm.signingSecretAfterSave")}
            </span>
            <div className="flex flex-wrap gap-2">
              <OrgButton variant="text" disabled={disabled || !endpoint} onClick={() => save(true)}>
                {t("screen.organization.people.webhookForm.rotateSecret")}
              </OrgButton>
            </div>
          </div>
        </OrgCard>
      </OrgRow>
      <OrgCard title={t("screen.organization.people.webhookForm.events")}>
        <fieldset
          className="m-0 grid gap-x-6 gap-y-2 border-0 p-0 sm:grid-cols-2 lg:grid-cols-3"
          aria-describedby={eventsError ? EVENTS_ERROR_ID : undefined}
        >
          <legend className="sr-only">{t("screen.organization.people.webhookForm.events")}</legend>
          {EVENT_IDS.map((event) => (
            <OrgChoice
              key={event}
              type="checkbox"
              className="min-h-9"
              checked={events.has(event)}
              onChange={(change) => toggle(event, change.target.checked)}
            >
              {eventLabel(event)}
            </OrgChoice>
          ))}
        </fieldset>
        {eventsError ? (
          <p id={EVENTS_ERROR_ID} className="te-caption m-0 text-[var(--te-danger)]">
            {t("screen.organization.people.webhookForm.eventsRequired")}
          </p>
        ) : null}
      </OrgCard>
    </form>
  );
}
