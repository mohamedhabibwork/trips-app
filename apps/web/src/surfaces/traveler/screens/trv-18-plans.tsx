// SCR-TRV-18 Plans and upgrade (traveler): compare Free, Explorer and VIP and change plan.
// Upgrades are immediate and prorated; downgrades take effect at the end of the cycle (BRL-13).
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, Segmented, StatusPill } from "@/components/kit/controls";
import { formatDate, formatMinorAmount } from "@/components/kit/format";
import { client, orpc } from "@/utils/orpc";
import { PlanBadge } from "@/surfaces/traveler/components/cards";
import { ScreenError, ScreenLoading } from "@/surfaces/traveler/components/states";
import { useTravelerProfile } from "@/surfaces/traveler/plan-tier";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";
import { toast } from "sonner";

export function Trv18Plans() {
  const { t, locale } = useAuth();
  const profile = useTravelerProfile();
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");

  const plansQuery = useQuery(
    orpc.traveler.account.getPlanComparison.queryOptions({ input: undefined }),
  );

  const upgrade = useMutation({
    mutationFn: (targetTier: "explorer" | "vip") =>
      client.traveler.account.upgradePlan({ targetTier, billingCycle: cycle }),
    onSuccess: (result) => {
      toast.success(
        t("screen.traveler.plan.upgraded", {
          tier: t(`screen.traveler.plan.tier.${result.currentTier}`),
          due: formatMinorAmount(result.proratedDueMinor, result.currencyCode, locale),
        }),
      );
      void profile.refetch();
    },
    onError: () => toast.error(t("screen.traveler.plan.changeFailed")),
  });

  const downgrade = useMutation({
    mutationFn: (targetTier: "free" | "explorer") =>
      client.traveler.account.downgradePlan({ targetTier }),
    onSuccess: (result) => {
      toast.success(
        t("screen.traveler.plan.downgradeScheduled", {
          tier: t(`screen.traveler.plan.tier.${result.targetTier}`),
          date: formatDate(result.effectiveAt, locale),
        }),
      );
      void profile.refetch();
    },
    onError: () => toast.error(t("screen.traveler.plan.changeFailed")),
  });

  const startTrial = useMutation({
    mutationFn: (targetTier: "explorer" | "vip") =>
      client.traveler.account.startTrial({ targetTier }),
    onSuccess: (result) => {
      toast.success(
        t("screen.traveler.plan.trialStarted", {
          tier: t(`screen.traveler.plan.tier.${result.currentTier}`),
          days: result.trialDays,
        }),
      );
      void profile.refetch();
    },
    onError: () => toast.error(t("screen.traveler.plan.changeFailed")),
  });

  if (profile.isPending && plansQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (plansQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void plansQuery.refetch()} />
      </div>
    );
  }

  const tier =
    profile.data?.travelerPlanTier === "vip"
      ? "vip"
      : profile.data?.travelerPlanTier === "explorer"
        ? "explorer"
        : "free";

  const plans = (plansQuery.data?.plans ?? []).filter(
    (plan) => plan.tier === "explorer" || plan.tier === "vip" || plan.tier === "free",
  );

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.plan.title")}</h1>
      <div className="flex items-center gap-3">
        <span className="text-[15px]">{t("screen.traveler.plan.current")}</span>
        <PlanBadge tier={tier} />
      </div>

      <Segmented
        label={t("screen.traveler.plan.cycleLabel")}
        value={cycle}
        onChange={setCycle}
        options={[
          { value: "monthly", label: t("screen.traveler.plan.cycleMonthly") },
          { value: "annual", label: t("screen.traveler.plan.cycleAnnual") },
        ]}
      />
      <Notice tone="info">{t("screen.traveler.plan.annualPlaceholder")}</Notice>

      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-3">
        {plans.map((plan) => {
          const priceMinor = cycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor;
          const isCurrent = plan.tier === tier;
          const canUpgrade = !isCurrent && plan.tier !== "free";
          const canDowngrade = !isCurrent && plan.tier === "free";
          return (
            <li
              key={plan.id}
              className="flex flex-col gap-2 rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] bg-[var(--te-surface-raised)] p-5 shadow-[var(--te-card-shadow)]"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="m-0 text-lg font-bold">{pick(locale, plan.nameAr, plan.nameEn)}</h2>
                {isCurrent ? (
                  <StatusPill tone="success">{t("screen.traveler.plan.currentBadge")}</StatusPill>
                ) : null}
              </div>
              <p className="m-0 text-base font-bold">
                {plan.tier === "free"
                  ? t("screen.traveler.plan.free")
                  : formatMinorAmount(priceMinor, plan.currencyCode, locale)}
                {plan.tier !== "free" ? (
                  <span className="text-[13px] font-normal text-[var(--te-ink-muted)]">
                    {" "}
                    /{" "}
                    {cycle === "annual"
                      ? t("screen.traveler.plan.year")
                      : t("screen.traveler.plan.month")}
                  </span>
                ) : null}
              </p>
              <ul className="m-0 flex list-none flex-col gap-1 p-0 text-sm text-[var(--te-ink-muted)]">
                {plan.tier === "free" ? (
                  <li>{t("screen.traveler.plan.feature.basicHistory")}</li>
                ) : null}
                {plan.tier !== "free" ? (
                  <>
                    <li>{t("screen.traveler.plan.feature.programDiscount")}</li>
                    <li>{t("screen.traveler.plan.feature.earlyAccess")}</li>
                    <li>{t("screen.traveler.plan.feature.seatPriority")}</li>
                    <li>{t("screen.traveler.plan.feature.receiptExport")}</li>
                    <li>{t("screen.traveler.plan.feature.childTracking")}</li>
                  </>
                ) : null}
              </ul>
              {canUpgrade ? (
                <Button
                  block
                  disabled={upgrade.isPending}
                  onClick={() => upgrade.mutate(plan.tier as "explorer" | "vip")}
                >
                  {t("screen.traveler.plan.upgrade")}
                </Button>
              ) : null}
              {canDowngrade ? (
                <Button
                  tone="outline"
                  block
                  disabled={downgrade.isPending}
                  onClick={() => downgrade.mutate("free")}
                >
                  {t("screen.traveler.plan.downgrade")}
                </Button>
              ) : null}
              {!isCurrent && plan.tier !== "free" && plan.trialDays > 0 ? (
                <button
                  type="button"
                  className="cursor-pointer self-start text-sm underline"
                  disabled={startTrial.isPending}
                  onClick={() => startTrial.mutate(plan.tier as "explorer" | "vip")}
                >
                  {t("screen.traveler.plan.startTrial", { days: plan.trialDays })}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <Notice tone="info">{t("screen.traveler.plan.upgradeTerms")}</Notice>
    </div>
  );
}
