// Traveler plans (SCR-TRV-18/19) and supplier application entry point (SCR-TRV-21 status reuse).
// Comparison catalog is public; upgrade (immediate, prorated), downgrade (end of cycle) and
// trial activation are signed-in traveler operations.
import { and, desc, eq, schema } from "@trips-app/db";
import { ServiceError } from "@trips-app/rpc";
import { authenticatedProcedure, publicProcedure } from "@trips-app/rpc";
import { z } from "zod/v4";

const TRAVELER_TIERS = ["free", "explorer", "vip"] as const;
type Tier = (typeof TRAVELER_TIERS)[number];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function tierRank(tier: string): number {
  return TRAVELER_TIERS.indexOf(tier as Tier);
}

export const travelerAccountRouter = {
  status: publicProcedure
    .route({
      method: "GET",
      path: "/traveler/account/status",
      operationId: "travelerAccountStatus",
      summary: "Traveler account service health status",
      tags: ["traveler"],
    })
    .handler(() => ({ service: "traveler-account", status: "ok" as const })),

  /** Public plan comparison data (pricing in minor units with currency labels). */
  getPlanComparison: publicProcedure
    .route({
      method: "GET",
      path: "/traveler/account/plan-comparison",
      operationId: "travelerAccountPlanComparison",
      summary: "Traveler plan comparison catalog (SCR-TRV-18)",
      tags: ["traveler"],
    })
    .handler(async ({ context }) => {
      const plans = await context.db
        .select()
        .from(schema.planCatalog)
        .where(
          and(eq(schema.planCatalog.role, "traveler"), eq(schema.planCatalog.status, "active")),
        );
      return { plans };
    }),

  /** Immediate upgrade with prorated charge preview (no real charge in this milestone). */
  upgradePlan: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/account/plan-upgrade",
      operationId: "travelerAccountPlanUpgrade",
      summary: "Upgrade plan immediately; returns the prorated amount due now",
      tags: ["traveler"],
    })
    .input(
      z.object({
        targetTier: z.enum(["explorer", "vip"]),
        billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
      }),
    )
    .handler(async ({ context, input }) => {
      const accountId = context.auth.accountId;
      const [account] = await context.db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.id, accountId))
        .limit(1);
      if (!account) {
        throw new ServiceError("RESOURCE_NOT_FOUND", "Account not found.", undefined, "traveler");
      }
      if (tierRank(account.travelerPlanTier) >= tierRank(input.targetTier)) {
        throw new ServiceError(
          "VALIDATION_ERROR",
          "Target tier must be higher than the current tier; use downgrade instead.",
          undefined,
          "traveler",
        );
      }

      const [plan] = await context.db
        .select()
        .from(schema.planCatalog)
        .where(
          and(
            eq(schema.planCatalog.role, "traveler"),
            eq(schema.planCatalog.tier, input.targetTier),
            eq(schema.planCatalog.status, "active"),
          ),
        )
        .limit(1);
      if (!plan) {
        throw new ServiceError("RESOURCE_NOT_FOUND", "Plan not found.", undefined, "traveler");
      }

      const now = new Date();
      const [current] = await context.db
        .select()
        .from(schema.subscriptionRecords)
        .where(
          and(
            eq(schema.subscriptionRecords.accountId, accountId),
            eq(schema.subscriptionRecords.scope, "account"),
            eq(schema.subscriptionRecords.status, "active"),
          ),
        )
        .orderBy(desc(schema.subscriptionRecords.currentPeriodEnd))
        .limit(1);

      // Proration against the remaining current cycle; a fresh cycle charges the full period.
      const periodEnd = current?.currentPeriodEnd ?? new Date(now.getTime() + 30 * MS_PER_DAY);
      const periodStart = current?.currentPeriodStart ?? now;
      const totalMs = Math.max(1, periodEnd.getTime() - periodStart.getTime());
      const remainingMs = Math.max(0, periodEnd.getTime() - now.getTime());
      const basePrice =
        input.billingCycle === "annual" ? plan.annualPriceMinor : plan.monthlyPriceMinor;
      const proratedDueMinor = Math.ceil((basePrice * remainingMs) / totalMs);

      if (current) {
        await context.db
          .update(schema.subscriptionRecords)
          .set({ status: "cancelled", updatedAt: now })
          .where(eq(schema.subscriptionRecords.id, current.id));
      }
      const [created] = await context.db
        .insert(schema.subscriptionRecords)
        .values({
          scope: "account",
          accountId,
          planId: plan.id,
          role: "traveler",
          tier: input.targetTier,
          billingCycle: input.billingCycle,
          priceMinor: proratedDueMinor,
          currencyCode: plan.currencyCode,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          overrideNote: `upgrade_prorated_from_${account.travelerPlanTier}`,
          updatedByAccountId: accountId,
        })
        .returning();

      await context.db
        .update(schema.accounts)
        .set({ travelerPlanTier: input.targetTier, updatedAt: now })
        .where(eq(schema.accounts.id, accountId));

      return {
        subscription: created,
        proratedDueMinor,
        currencyCode: plan.currencyCode,
        previousTier: account.travelerPlanTier,
        currentTier: input.targetTier,
      };
    }),

  /** Downgrade takes effect at the end of the current cycle. */
  downgradePlan: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/account/plan-downgrade",
      operationId: "travelerAccountPlanDowngrade",
      summary: "Schedule a downgrade effective at the end of the current cycle",
      tags: ["traveler"],
    })
    .input(z.object({ targetTier: z.enum(["free", "explorer"]) }))
    .handler(async ({ context, input }) => {
      const accountId = context.auth.accountId;
      const [account] = await context.db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.id, accountId))
        .limit(1);
      if (!account) {
        throw new ServiceError("RESOURCE_NOT_FOUND", "Account not found.", undefined, "traveler");
      }
      if (tierRank(input.targetTier) >= tierRank(account.travelerPlanTier)) {
        throw new ServiceError(
          "VALIDATION_ERROR",
          "Target tier must be lower than the current tier; use upgrade instead.",
          undefined,
          "traveler",
        );
      }

      const now = new Date();
      const [current] = await context.db
        .select()
        .from(schema.subscriptionRecords)
        .where(
          and(
            eq(schema.subscriptionRecords.accountId, accountId),
            eq(schema.subscriptionRecords.scope, "account"),
            eq(schema.subscriptionRecords.status, "active"),
          ),
        )
        .orderBy(desc(schema.subscriptionRecords.currentPeriodEnd))
        .limit(1);

      const effectiveAt = current?.currentPeriodEnd ?? now;
      if (current) {
        await context.db
          .update(schema.subscriptionRecords)
          .set({
            overrideNote: `pending_downgrade_to_${input.targetTier}`,
            updatedAt: now,
          })
          .where(eq(schema.subscriptionRecords.id, current.id));
      }

      return {
        currentTier: account.travelerPlanTier,
        targetTier: input.targetTier,
        effectiveAt,
      };
    }),

  /** Start a trial for a paid tier — once per tier (SCR-TRV-18 trial rule). */
  startTrial: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/account/plan-trial",
      operationId: "travelerAccountPlanTrial",
      summary: "Start a free trial for a paid plan (once per tier)",
      tags: ["traveler"],
    })
    .input(z.object({ targetTier: z.enum(["explorer", "vip"]) }))
    .handler(async ({ context, input }) => {
      const accountId = context.auth.accountId;
      const [plan] = await context.db
        .select()
        .from(schema.planCatalog)
        .where(
          and(
            eq(schema.planCatalog.role, "traveler"),
            eq(schema.planCatalog.tier, input.targetTier),
            eq(schema.planCatalog.status, "active"),
          ),
        )
        .limit(1);
      if (!plan || plan.trialDays <= 0) {
        throw new ServiceError(
          "RESOURCE_NOT_FOUND",
          "Trial plan not available.",
          undefined,
          "traveler",
        );
      }

      const previous = await context.db
        .select({ id: schema.subscriptionRecords.id })
        .from(schema.subscriptionRecords)
        .where(
          and(
            eq(schema.subscriptionRecords.accountId, accountId),
            eq(schema.subscriptionRecords.tier, input.targetTier),
          ),
        )
        .limit(1);
      if (previous.length > 0) {
        throw new ServiceError(
          "CONFLICT",
          "Trial already used for this plan.",
          undefined,
          "traveler",
        );
      }

      const now = new Date();
      const periodEnd = new Date(now.getTime() + plan.trialDays * MS_PER_DAY);
      const [created] = await context.db
        .insert(schema.subscriptionRecords)
        .values({
          scope: "account",
          accountId,
          planId: plan.id,
          role: "traveler",
          tier: input.targetTier,
          billingCycle: "monthly",
          priceMinor: 0,
          currencyCode: plan.currencyCode,
          status: "trialing",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          overrideNote: `trial_${plan.trialDays}d`,
          updatedByAccountId: accountId,
        })
        .returning();

      await context.db
        .update(schema.accounts)
        .set({ travelerPlanTier: input.targetTier, updatedAt: now })
        .where(eq(schema.accounts.id, accountId));

      return {
        subscription: created,
        trialDays: plan.trialDays,
        currentTier: input.targetTier,
      };
    }),
};
