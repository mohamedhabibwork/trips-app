// SCR-SHR-01 Plan-limit upgrade prompt, shown on its catalog page for the organization's monthly
// trip limit: the default plan's allowance, and the next paid tier from the plan catalog.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { formatMinorAmount } from "@/components/kit/format";
import { orpc } from "@/utils/orpc";

import { SignInRequired } from "./sign-in-required";
import { PlanLimitPrompt, type PlanLimitKey } from "./plan-limit-prompt";

/** Plan limits arrive as JSON; a missing or non-numeric limit reads as 0. */
function readLimit(limits: unknown, key: PlanLimitKey): number {
  if (!limits || typeof limits !== "object" || Array.isArray(limits)) return 0;
  const value = (limits as Record<string, unknown>)[key];
  return typeof value === "number" ? value : 0;
}

export function ScrShr01PlanLimitUpgradePrompt() {
  const { t, locale, status } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signedIn = status === "authenticated";
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: { role: "organization" } }),
    enabled: signedIn,
  });
  const upgradeMutation = useMutation(
    orpc.plans.changeOrganizationPlan.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.plans.key() });
      },
    }),
  );

  const plans = [...(catalogQuery.data ?? [])].sort(
    (a, b) => a.monthlyPriceMinor - b.monthlyPriceMinor,
  );
  const current = plans.find((plan) => plan.isDefault) ?? plans[0];
  const next = plans.find((plan) => plan.monthlyPriceMinor > (current?.monthlyPriceMinor ?? 0));
  const allowance = readLimit(current?.limits, "activeTripsPerMonth");
  const close = () => void navigate({ to: "/" });

  if (!signedIn) {
    return (
      <div className="mx-auto w-full max-w-[480px] p-6">
        <SignInRequired message={t("screen.shared.planLimit.signIn")} />
      </div>
    );
  }
  if (!next) {
    return (
      <p role="status" className="m-0 p-12 text-center text-[var(--te-ink-muted)]">
        {catalogQuery.isPending
          ? t("screen.shared.planLimit.loading")
          : t("screen.shared.planLimit.noTier")}
      </p>
    );
  }

  return (
    <PlanLimitPrompt
      limit="activeTripsPerMonth"
      current={allowance}
      allowance={allowance}
      tierName={locale === "ar" ? next.nameAr : next.nameEn}
      monthlyPrice={formatMinorAmount(next.monthlyPriceMinor, next.currencyCode, locale)}
      busy={upgradeMutation.isPending}
      error={upgradeMutation.isError ? t("screen.shared.planLimit.failed") : undefined}
      onUpgrade={() => {
        void upgradeMutation
          .mutateAsync({ planId: next.id, billingCycle: "monthly" })
          .then(close)
          .catch(() => undefined);
      }}
      onCancel={close}
    />
  );
}
