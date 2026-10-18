// The plan-limit upgrade prompt from SCR-SHR-01: shown when an action hits a plan limit. Names the
// limit, the usage, and the tier that lifts it; upgrading starts now and is prorated.
import type { ReactNode } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";

import { Overlay } from "./overlay";

export type PlanLimitKey =
  | "activeTripsPerMonth"
  | "vehiclesPerTrip"
  | "programsPerTrip"
  | "employeesMax"
  | "activeCouponsMax"
  | "portfolioPhotosMax"
  | "webhookEndpointsMax";

interface PlanLimitPromptProps {
  limit: PlanLimitKey;
  current: number;
  allowance: number;
  /** The tier that lifts the limit, with its monthly price already formatted. */
  tierName: string;
  monthlyPrice: string;
  onUpgrade: () => void;
  onCancel: () => void;
  busy?: boolean;
  /** Shown when the upgrade failed. */
  error?: ReactNode;
}

export function PlanLimitPrompt({
  limit,
  current,
  allowance,
  tierName,
  monthlyPrice,
  onUpgrade,
  onCancel,
  busy = false,
  error,
}: PlanLimitPromptProps) {
  const { t } = useAuth();
  return (
    <Overlay placement="sheet" labelledBy="plan-limit-title" onClose={onCancel}>
      <StatusPill tone="warning" icon="lock">
        {t("screen.shared.planLimit.badge")}
      </StatusPill>
      <h2 id="plan-limit-title" className="m-0 text-2xl leading-8 font-bold">
        {t("screen.shared.planLimit.title")}
      </h2>
      <p className="m-0 text-[15px] leading-[22px] text-[var(--te-ink-muted)]">
        {t("screen.shared.planLimit.usage", {
          limit: t(`screen.shared.planLimit.limit.${limit}`),
          current,
          allowance,
        })}
      </p>
      <div className="flex flex-col gap-1 rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] px-4 py-3.5">
        <span className="text-sm font-semibold">
          {t("screen.shared.planLimit.tierLifts", { tier: tierName })}
        </span>
        <span className="text-[15px]">
          {t("screen.shared.planLimit.perMonth", { price: monthlyPrice })}
        </span>
        <span className="text-[13px] text-[var(--te-ink-muted)]">
          {t("screen.shared.planLimit.prorated")}
        </span>
      </div>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      <Button onClick={onUpgrade} disabled={busy}>
        {busy
          ? t("auth.common.submitting")
          : t("screen.shared.planLimit.upgrade", { tier: tierName })}
      </Button>
      <Button tone="outline" onClick={onCancel} disabled={busy}>
        {t("screen.shared.planLimit.cancel")}
      </Button>
    </Overlay>
  );
}
