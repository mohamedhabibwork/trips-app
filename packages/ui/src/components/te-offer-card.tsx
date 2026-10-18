import { cn } from "@trips-app/ui/lib/utils";
import { TeBadge, type TeBadgeTone } from "@trips-app/ui/components/te-badge";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TeMoney } from "@trips-app/ui/components/te-money";
import { t } from "@trips-app/i18n";

export const TE_OFFER_STATUSES = ["open", "accepted", "declined", "countered"] as const;
export type TeOfferStatus = (typeof TE_OFFER_STATUSES)[number];

export interface TeOfferStatusPresentation {
  icon: TeIconName;
  tone: TeBadgeTone;
  label: string;
}

export const TE_OFFER_STATUS_PRESENTATION: Record<TeOfferStatus, TeOfferStatusPresentation> = {
  open: {
    icon: "clock",
    tone: "info",
    get label() {
      return t("ui.teOfferCard.labels.open");
    },
  },
  accepted: {
    icon: "check",
    tone: "success",
    get label() {
      return t("ui.teOfferCard.labels.accepted");
    },
  },
  declined: {
    icon: "close",
    tone: "danger",
    get label() {
      return t("ui.teOfferCard.labels.declined");
    },
  },
  countered: {
    icon: "refresh",
    tone: "warning",
    get label() {
      return t("ui.teOfferCard.labels.countered");
    },
  },
};

export interface TeOfferCardProps {
  title: string;
  amount: number;
  currency: string;
  status: TeOfferStatus;
  /** Already formatted expiry, for example "20 Oct, 18:00". */
  expires?: string;
  expiresLabel?: string;
  onRespond?: () => void;
  respondLabel?: string;
  className?: string;
}

/** Deal offer for drivers and photographers. Amount and status are shown in words and icons. */
export function TeOfferCard({
  title,
  amount,
  currency,
  status,
  expires,
  expiresLabel = "Expires",
  onRespond,
  respondLabel = "Respond",
  className,
}: TeOfferCardProps) {
  const presentation = TE_OFFER_STATUS_PRESENTATION[status];

  return (
    <TeCard
      as="article"
      className={cn("te-offer-card", className)}
      header={<h3 className="te-offer-card__title">{title}</h3>}
      footer={
        onRespond ? (
          <TeButton variant="secondary" onClick={onRespond}>
            {respondLabel}
          </TeButton>
        ) : undefined
      }
    >
      <div className="te-offer-card__summary">
        <TeMoney amount={amount} currency={currency} />
        <TeBadge tone={presentation.tone} data-status={status}>
          <TeIcon name={presentation.icon} />
          <span>{presentation.label}</span>
        </TeBadge>
      </div>
      {expires ? (
        <p className="te-offer-card__expires">
          {expiresLabel}: {expires}
        </p>
      ) : null}
    </TeCard>
  );
}
