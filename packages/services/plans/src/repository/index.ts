import { and, desc, eq, gte, inArray, ne, sql } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { CurrencyCode, SubscriptionBillingCycle } from "../model";

export type { ServiceDatabase };

export function createPlansRepository(db: Database) {
  return {
    /**
     * Usage the organization's plan limits apply to, counted the way each service enforces it
     * (trips: published or active this month; coupons: active; employees: invited or active).
     */
    async getOrganizationUsage(tenantId: string, monthStart: Date) {
      const { trips, tripVehicles, tripPrograms, coupons, employeeMemberships } = schema;
      const [tripsRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(trips)
        .where(
          and(
            eq(trips.tenantId, tenantId),
            ne(trips.state, "draft"),
            ne(trips.state, "cancelled"),
            gte(trips.createdAt, monthStart),
          ),
        );
      const [employeesRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(employeeMemberships)
        .where(
          and(
            eq(employeeMemberships.tenantId, tenantId),
            inArray(employeeMemberships.status, ["invited", "active"]),
          ),
        );
      const [couponsRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(and(eq(coupons.tenantId, tenantId), eq(coupons.status, "active")));
      const vehiclesPerTrip = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tripVehicles)
        .innerJoin(trips, eq(trips.id, tripVehicles.tripId))
        .where(and(eq(tripVehicles.tenantId, tenantId), ne(trips.state, "cancelled")))
        .groupBy(tripVehicles.tripId);
      const programsPerTrip = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tripPrograms)
        .innerJoin(trips, eq(trips.id, tripPrograms.tripId))
        .where(
          and(
            eq(tripPrograms.tenantId, tenantId),
            ne(tripPrograms.status, "cancelled"),
            ne(trips.state, "cancelled"),
          ),
        )
        .groupBy(tripPrograms.tripId);
      const max = (rows: readonly { count: number }[]) =>
        rows.reduce((top, row) => Math.max(top, Number(row.count)), 0);
      return {
        activeTripsThisMonth: Number(tripsRow?.count ?? 0),
        employees: Number(employeesRow?.count ?? 0),
        activeCoupons: Number(couponsRow?.count ?? 0),
        maxVehiclesPerTrip: max(vehiclesPerTrip),
        maxProgramsPerTrip: max(programsPerTrip),
      };
    },

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
