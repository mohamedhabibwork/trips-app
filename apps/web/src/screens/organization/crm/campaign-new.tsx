// SCR-ORG-49 New campaign: audience, message, offer and schedule
// (docs/design/web/OrgCampaignNew.dc.html). There is no campaign store yet, so the draft lives in
// local state with validation and scheduling says it is not connected instead of pretending to send.
import { useState, type FormEvent, type ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgButtonLink, useOrgNavigate } from "../common/org-link";
import { OrgAlert, OrgButton, OrgCard, OrgPage, OrgPageHeader, OrgRow } from "../common/org-ui";
import { OrgChips, OrgInput, OrgTextarea } from "../common/org-form";
import { CrmTabs } from "./crm-parts";

const K = "screen.organization.crm.campaignNew";

type Channel = "email" | "sms" | "whatsapp" | "push";

const CHANNELS: readonly { value: Channel; labelKey: string }[] = [
  { value: "email", labelKey: "email" },
  { value: "sms", labelKey: "sms" },
  { value: "whatsapp", labelKey: "whatsapp" },
  { value: "push", labelKey: "push" },
];

export function CampaignNew(): ReactNode {
  const navigate = useOrgNavigate();
  const [channel, setChannel] = useState<Channel>("email");
  const [segment, setSegment] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyEn, setBodyEn] = useState("");
  const [bodyAr, setBodyAr] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [savedDraft, setSavedDraft] = useState(false);

  const segmentMissing = segment.trim().length === 0;
  const subjectMissing = channel === "email" && subject.trim().length === 0;
  const bodyMissing = bodyEn.trim().length === 0 && bodyAr.trim().length === 0;
  const scheduleMissing = date.trim().length === 0 || time.trim().length === 0;
  const valid = !segmentMissing && !subjectMissing && !bodyMissing && !scheduleMissing;

  // No campaign procedure exists yet; saving keeps the draft on screen and says so.
  function handleSubmit(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (!valid) return;
    setSavedDraft(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <OrgButtonLink slug="crm-campaigns" variant="secondary">
            {t(`${K}.backToCampaigns`)}
          </OrgButtonLink>
        }
      />
      <CrmTabs activeSlug="crm-campaigns" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <OrgCard title={t(`${K}.audienceTitle`)}>
          <div className="flex flex-col gap-4">
            <OrgInput
              label={t(`${K}.segmentLabel`)}
              hint={t(`${K}.segmentHint`)}
              error={segmentMissing ? t(`${K}.segmentRequired`) : undefined}
              value={segment}
              onChange={(change) => setSegment(change.target.value)}
              fieldClassName="max-w-[560px]"
            />
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.consentNote`)}</p>
          </div>
        </OrgCard>
        <OrgCard title={t(`${K}.messageTitle`)}>
          <div className="flex flex-col gap-4">
            <OrgChips
              label={t(`${K}.channelLabel`)}
              options={CHANNELS.map((option) => ({
                value: option.value,
                label: t(`${K}.channel.${option.labelKey}`),
              }))}
              value={channel}
              onValueChange={(value) => setChannel(value as Channel)}
            />
            {channel === "email" ? (
              <OrgInput
                label={t(`${K}.subjectLabel`)}
                error={subjectMissing ? t(`${K}.subjectRequired`) : undefined}
                value={subject}
                onChange={(change) => setSubject(change.target.value)}
                fieldClassName="max-w-[560px]"
              />
            ) : null}
            <OrgRow align="start">
              <OrgTextarea
                label={t(`${K}.bodyEnLabel`)}
                hint={t(`${K}.firstNameNote`)}
                rows={4}
                value={bodyEn}
                onChange={(change) => setBodyEn(change.target.value)}
                className="lg:flex-1"
              />
              <OrgTextarea
                label={t(`${K}.bodyArLabel`)}
                rows={4}
                dir="rtl"
                value={bodyAr}
                onChange={(change) => setBodyAr(change.target.value)}
                className="lg:flex-1"
              />
            </OrgRow>
            {bodyMissing ? (
              <p className="te-caption m-0 text-[var(--te-danger)]">{t(`${K}.bodyRequired`)}</p>
            ) : null}
          </div>
        </OrgCard>
        <OrgCard title={t(`${K}.offerTitle`)}>
          <OrgInput
            label={t(`${K}.couponLabel`)}
            hint={t(`${K}.couponHint`)}
            value={couponCode}
            onChange={(change) => setCouponCode(change.target.value)}
            fieldClassName="max-w-[280px]"
          />
        </OrgCard>
        <OrgCard title={t(`${K}.scheduleTitle`)}>
          <div className="flex flex-col gap-4">
            <OrgRow align="start">
              <OrgInput
                label={t(`${K}.dateLabel`)}
                type="date"
                value={date}
                onChange={(change) => setDate(change.target.value)}
                className="lg:flex-1"
              />
              <OrgInput
                label={t(`${K}.timeLabel`)}
                type="time"
                value={time}
                onChange={(change) => setTime(change.target.value)}
                className="lg:flex-1"
              />
            </OrgRow>
            <p className="te-caption m-0 text-[var(--te-ink-muted)]">{t(`${K}.quietHoursNote`)}</p>
          </div>
        </OrgCard>
        <OrgCard title={t(`${K}.previewTitle`)}>
          <div className="flex flex-col gap-2 rounded-xl border border-[var(--te-hairline)] p-4">
            <b>{subject || t(`${K}.previewNoSubject`)}</b>
            <p className="m-0 text-sm leading-5 whitespace-pre-line">
              {bodyEn || bodyAr || t(`${K}.previewNoBody`)}
            </p>
            {couponCode ? (
              <span className="te-caption text-[var(--te-ink-muted)]">
                {t(`${K}.previewCoupon`, { code: couponCode })}
              </span>
            ) : null}
          </div>
        </OrgCard>
        {savedDraft ? (
          <OrgAlert tone="info" title={t(`${K}.notConnectedTitle`)}>
            {t(`${K}.notConnectedBody`)}
          </OrgAlert>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <OrgButton variant="secondary" onClick={() => navigate("crm-campaigns")}>
            {t(`${K}.cancel`)}
          </OrgButton>
          <OrgButton type="submit" disabled={!valid}>
            {t(`${K}.saveDraft`)}
          </OrgButton>
        </div>
      </form>
    </OrgPage>
  );
}
