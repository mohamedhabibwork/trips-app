import { PlansServiceError } from "../errors";
import { computeSubscriptionPeriodEnd } from "../model";
import { createPlansRepository, type ServiceDatabase } from "../repository";
import type { AdminOverrideSubscriptionInput, ChangePlanInput } from "../types";

export function createPlansService(deps: { db: ServiceDatabase }) {
  const repo = createPlansRepository(deps.db);

  return {
    async getCatalog(
      role?: "traveler" | "organization" | "platform_driver" | "platform_photographer",
    ) {
      return repo.listCatalog(role);
    },

    async getMySubscription(accountId: string) {
      return repo.findLatestAccountSubscription(accountId);
    },

    async getOrganizationSubscription(tenantId: string) {
      return repo.findLatestOrganizationSubscription(tenantId);
    },

    async changeOrganizationPlan(tenantId: string, actorAccountId: string, input: ChangePlanInput) {
      const plan = await repo.findPlanById(input.planId);
      if (!plan) {
        throw new PlansServiceError("PLAN_NOT_FOUND", "Plan not found.");
      }
      if (plan.role !== "organization") {
        throw new PlansServiceError(
          "INVALID_PLAN_SCOPE",
          "Selected plan is not an organization plan.",
        );
      }

      const now = new Date();
      const priceMinor =
        input.billingCycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor;

      const record = await repo.insertSubscriptionRecord({
        scope: "organization",
        accountId: null,
        tenantId,
        planId: plan.id,
        role: plan.role,
        tier: plan.tier,
        billingCycle: input.billingCycle,
        priceMinor,
        currencyCode: plan.currencyCode,
        currentPeriodStart: now,
        currentPeriodEnd: computeSubscriptionPeriodEnd(now, input.billingCycle),
        updatedByAccountId: actorAccountId,
      });

      if (plan.tier === "starter" || plan.tier === "growth" || plan.tier === "enterprise") {
        await repo.updateOrganizationTier(tenantId, plan.tier);
      }

      return record;
    },

    async changeAccountPlan(accountId: string, input: ChangePlanInput) {
      const plan = await repo.findPlanById(input.planId);
      if (!plan) {
        throw new PlansServiceError("PLAN_NOT_FOUND", "Plan not found.");
      }
      if (plan.role === "organization") {
        throw new PlansServiceError(
          "INVALID_PLAN_SCOPE",
          "Use changeOrganizationPlan for organization plans.",
        );
      }

      const now = new Date();
      const priceMinor =
        input.billingCycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor;

      const record = await repo.insertSubscriptionRecord({
        scope: "account",
        accountId,
        tenantId: null,
        planId: plan.id,
        role: plan.role,
        tier: plan.tier,
        billingCycle: input.billingCycle,
        priceMinor,
        currencyCode: plan.currencyCode,
        currentPeriodStart: now,
        currentPeriodEnd: computeSubscriptionPeriodEnd(now, input.billingCycle),
        updatedByAccountId: accountId,
      });

      if (
        plan.role === "traveler" &&
        (plan.tier === "free" || plan.tier === "explorer" || plan.tier === "vip")
      ) {
        await repo.updateTravelerTier(accountId, plan.tier);
      }

      return record;
    },

    async adminOverrideSubscription(adminAccountId: string, input: AdminOverrideSubscriptionInput) {
      const plan = await repo.findPlanById(input.planId);
      if (!plan) {
        throw new PlansServiceError("PLAN_NOT_FOUND", "Plan not found.");
      }
      const now = new Date();
      const priceMinor =
        input.billingCycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor;

      return repo.insertSubscriptionRecord({
        scope: input.scope,
        accountId: input.accountId ?? null,
        tenantId: input.tenantId ?? null,
        planId: plan.id,
        role: plan.role,
        tier: plan.tier,
        billingCycle: input.billingCycle,
        priceMinor,
        currencyCode: plan.currencyCode,
        currentPeriodStart: now,
        currentPeriodEnd: computeSubscriptionPeriodEnd(now, input.billingCycle),
        overrideNote: input.overrideNote,
        updatedByAccountId: adminAccountId,
      });
    },
  };
}

export type PlansService = ReturnType<typeof createPlansService>;
