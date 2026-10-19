// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, desc, type Database, eq, schema, sql } from "@trips-app/db";

import type { CouponDiscountType, CouponScope, CouponStatus, CurrencyCode } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { coupons, organizations, planCatalog, trips } = schema;

export function createCouponsRepository(db: Database) {
  return {
    async findOrganizationPlan(tenantId: string) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      if (!org) return null;
      const [plan] = await db
        .select()
        .from(planCatalog)
        .where(and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, org.planTier)))
        .limit(1);
      return { org, plan: plan ?? null };
    },

    async countActiveCouponsForTenant(tenantId: string) {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(coupons)
        .where(and(eq(coupons.tenantId, tenantId), eq(coupons.status, "active")));
      return Number(row?.count ?? 0);
    },

    async findByCode(code: string) {
      const [row] = await db.select().from(coupons).where(eq(coupons.code, code)).limit(1);
      return row ?? null;
    },

    async findById(couponId: string) {
      const [row] = await db.select().from(coupons).where(eq(coupons.id, couponId)).limit(1);
      return row ?? null;
    },

    async findTripById(tripId: string) {
      const [row] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
      return row ?? null;
    },

    async insertCoupon(values: {
      scope: CouponScope;
      tenantId: string | null;
      ownerAccountId: string | null;
      code: string;
      titleAr: string;
      titleEn: string;
      discountType: CouponDiscountType;
      discountValue: number;
      maxDiscountMinor: number | null;
      minOrderMinor: number;
      currencyCode: CurrencyCode;
      maxRedemptions: number | null;
      tripId: string | null;
      startsAt: Date | null;
      expiresAt: Date | null;
    }) {
      const now = new Date();
      const [created] = await db
        .insert(coupons)
        .values({
          ...values,
          status: "active",
          redemptionsCount: 0,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return created!;
    },

    async updateStatus(couponId: string, status: CouponStatus) {
      const [updated] = await db
        .update(coupons)
        .set({ status, updatedAt: new Date() })
        .where(eq(coupons.id, couponId))
        .returning();
      return updated ?? null;
    },

    async listForTenant(tenantId: string, status?: CouponStatus) {
      const conditions = [eq(coupons.tenantId, tenantId)];
      if (status) conditions.push(eq(coupons.status, status));
      return db
        .select()
        .from(coupons)
        .where(and(...conditions))
        .orderBy(desc(coupons.createdAt));
    },

    async listPlatformCoupons(status?: CouponStatus) {
      const conditions = [eq(coupons.scope, "platform")];
      if (status) conditions.push(eq(coupons.status, status));
      return db
        .select()
        .from(coupons)
        .where(and(...conditions))
        .orderBy(desc(coupons.createdAt));
    },
  };
}
