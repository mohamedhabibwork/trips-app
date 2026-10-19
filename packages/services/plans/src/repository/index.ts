import { and, desc, eq } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { CurrencyCode, SubscriptionBillingCycle } from "../model";

export type { ServiceDatabase };

export function createPlansRepository(db: Database) {
  return {
    async listCatalog(
      role?: "traveler" | "organization" | "platform_driver" | "platform_photographer",
    ) {
      const condition = role
        ? and(eq(schema.planCatalog.status, "active"), eq(schema.planCatalog.role, role))
        : eq(schema.planCatalog.status, "active");
      return db.select().from(schema.planCatalog).where(condition);
    },

    async findPlanById(planId: string) {
      const [row] = await db
        .select()
        .from(schema.planCatalog)
        .where(eq(schema.planCatalog.id, planId))
        .limit(1);
      return row ?? null;
    },

    async findLatestAccountSubscription(accountId: string) {
      const [row] = await db
        .select()
        .from(schema.subscriptionRecords)
        .where(
          and(
            eq(schema.subscriptionRecords.scope, "account"),
            eq(schema.subscriptionRecords.accountId, accountId),
          ),
        )
        .orderBy(desc(schema.subscriptionRecords.createdAt))
        .limit(1);
      return row ?? null;
    },

    async findLatestOrganizationSubscription(tenantId: string) {
      const [row] = await db
        .select()
        .from(schema.subscriptionRecords)
        .where(
          and(
            eq(schema.subscriptionRecords.scope, "organization"),
            eq(schema.subscriptionRecords.tenantId, tenantId),
          ),
        )
        .orderBy(desc(schema.subscriptionRecords.createdAt))
        .limit(1);
      return row ?? null;
    },

    async insertSubscriptionRecord(values: {
      scope: "account" | "organization";
      accountId: string | null;
      tenantId: string | null;
      planId: string;
      role: "traveler" | "organization" | "platform_driver" | "platform_photographer";
      tier: string;
      billingCycle: SubscriptionBillingCycle;
      priceMinor: number;
      currencyCode: CurrencyCode;
      currentPeriodStart: Date;
      currentPeriodEnd: Date;
      overrideNote?: string | null;
      updatedByAccountId: string;
    }) {
      const [created] = await db
        .insert(schema.subscriptionRecords)
        .values({
          ...values,
          status: "active",
        })
        .returning();
      return created!;
    },

    async updateOrganizationTier(tenantId: string, tier: "starter" | "growth" | "enterprise") {
      await db
        .update(schema.organizations)
        .set({ planTier: tier, updatedAt: new Date() })
        .where(eq(schema.organizations.id, tenantId));
    },

    async updateTravelerTier(accountId: string, tier: "free" | "explorer" | "vip") {
      await db
        .update(schema.accounts)
        .set({ travelerPlanTier: tier, updatedAt: new Date() })
        .where(eq(schema.accounts.id, accountId));
    },
  };
}

export type PlansRepository = ReturnType<typeof createPlansRepository>;
