// SCR-ORG-55 Reviews: traveler reviews of the organization's trips and the public reply workflow
// (docs/design/web/OrgReviews.dc.html). No procedure stores reviews yet, so the summary and the
// list state that honestly; the reply workflow is shown as it will work, never with sample rows.
import { useState, type FormEvent, type ReactNode } from "react";

import { t } from "@trips-app/i18n";

import { OrgChips, OrgSelect, OrgTextarea } from "../common/org-form";
import { OrgButtonLink } from "../common/org-link";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgKpi,
  OrgKpiRow,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { CrmConnectBadge, CrmTabs } from "./crm-parts";

const K = "screen.organization.crm.reviews";

export function Reviews(): ReactNode {
  const [trip, setTrip] = useState("all");
  const [status, setStatus] = useState("any");
  const [replyDraft, setReplyDraft] = useState("");
  const [replyOpened, setReplyOpened] = useState(false);

  function postReply(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    if (replyDraft.trim().length === 0) return;
    // No reviews store exists yet; the alert says the reply was not sent anywhere.
    setReplyOpened(true);
  }

  return (
    <OrgPage>
      <OrgPageHeader
        title={t(`${K}.title`)}
        caption={t(`${K}.caption`)}
        actions={
          <OrgButtonLink slug="crm-customers" variant="secondary">
            {t(`${K}.toCustomers`)}
          </OrgButtonLink>
        }
      />
      <CrmTabs activeSlug="crm-reviews" />
      <OrgKpiRow>
        <OrgKpi label={t(`${K}.kpiRating`)} value={NO_VALUE} hint={t(`${K}.noStoreHint`)} />
        <OrgKpi label={t(`${K}.kpiReplied`)} value={NO_VALUE} hint={t(`${K}.noStoreHint`)} />
        <OrgKpi label={t(`${K}.kpiWaiting`)} value={NO_VALUE} />
      </OrgKpiRow>
      <OrgCard title={t(`${K}.listTitle`)}>
        <div className="flex flex-col gap-4">
          <OrgRow align="start">
            <OrgSelect
              label={t(`${K}.tripLabel`)}
              options={[
                { value: "all", label: t(`${K}.tripAll`) },
                { value: "pick", label: t(`${K}.tripPickNote`) },
              ]}
              value={trip}
              onValueChange={setTrip}
              className="lg:flex-1"
            />
            <OrgChips
              label={t(`${K}.statusLabel`)}
              options={[
                { value: "any", label: t(`${K}.statusAny`) },
                { value: "not-replied", label: t(`${K}.statusNotReplied`) },
                { value: "replied", label: t(`${K}.statusReplied`) },
                { value: "flagged", label: t(`${K}.statusFlagged`) },
              ]}
              value={status}
              onValueChange={setStatus}
            />
          </OrgRow>
          <OrgEmpty title={t(`${K}.noStoreTitle`)}>
            {t(`${K}.noStoreBody`)}
            <span className="mt-1 block">
              <OrgButtonLink slug="crm-and-webhooks" variant="text" className="-ms-2">
                {t(`${K}.openCrmSettings`)}
              </OrgButtonLink>
            </span>
          </OrgEmpty>
        </div>
      </OrgCard>
      <OrgRow align="start">
        <OrgCard title={t(`${K}.replyWorkflowTitle`)} className="lg:flex-[2]">
          <form onSubmit={postReply} className="flex flex-col gap-4" noValidate>
            <OrgTextarea
              label={t(`${K}.replyLabel`)}
              hint={t(`${K}.replyHint`)}
              rows={4}
              value={replyDraft}
              onChange={(change) => setReplyDraft(change.target.value)}
            />
            {replyOpened ? (
              <OrgAlert tone="info" title={t(`${K}.replyUnavailableTitle`)}>
                {t(`${K}.replyUnavailableBody`)}
              </OrgAlert>
            ) : null}
            <div>
              <OrgButton type="submit" disabled={replyDraft.trim().length === 0}>
                {t(`${K}.postReply`)}
              </OrgButton>
            </div>
          </form>
        </OrgCard>
        <OrgCard title={t(`${K}.rulesTitle`)} className="lg:flex-1">
          <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm leading-5">
            <li>{t(`${K}.rulePublicReply`)}</li>
            <li>{t(`${K}.ruleNotification`)}</li>
            <li>{t(`${K}.ruleFlagged`)}</li>
          </ul>
          <div className="flex flex-wrap items-center gap-3">
            <CrmConnectBadge />
          </div>
        </OrgCard>
      </OrgRow>
    </OrgPage>
  );
}
