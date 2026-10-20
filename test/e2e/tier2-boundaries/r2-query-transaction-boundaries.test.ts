import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { and, eq, gte, inArray, lte, schema } from "@trips-app/db";
import { getTestContext, getTestDb, TestEntityTracker } from "../helpers/db";

describe("Tier 2 - Boundary Cases: R2 Dynamic Queries, Transactions & Batch Patterns", () => {
  const db = getTestDb();
  const tracker = new TestEntityTracker();
  let tenantId: string;
  let ownerAccountId: string;

  beforeAll(async () => {
    const ctx = await getTestContext();
    tenantId = ctx.tenantId;
    ownerAccountId = ctx.ownerAccountId;
  });

  afterAll(async () => {
    await tracker.cleanup(db);
  });

  test("R2-B01: Dynamic query with zero filter conditions executes cleanly without invalid SQL", async () => {
    // Dynamic query with no optional filters applied
    const qb = db.select().from(schema.organizations).$dynamic();
    const results = await qb.limit(5);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test("R2-B02: Dynamic query with impossible filter criteria returns empty array without throwing", async () => {
    // Impossible filter: price <= 100 AND price >= 1000000
    const qb = db.select().from(schema.trips).$dynamic();
    const results = await qb
      .where(
        and(
          eq(schema.trips.tenantId, tenantId),
          lte(schema.trips.basePriceMinor, 100),
          gte(schema.trips.basePriceMinor, 1000000),
        ),
      )
      .limit(10);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  test("R2-B03: Hostile SQL injection payloads in dynamic query parameters are strictly parameterized", async () => {
    const hostileInput = "test' OR '1'='1; DROP TABLE trips; --";

    const qb = db.select().from(schema.vehicleTypes).$dynamic();
    const results = await qb
      .where(
        and(
          eq(schema.vehicleTypes.tenantId, tenantId),
          eq(schema.vehicleTypes.nameEn, hostileInput),
        ),
      )
      .limit(5);

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);

    // Verify trips table was not dropped
    const checkTable = await db.select().from(schema.trips).limit(1);
    expect(Array.isArray(checkTable)).toBe(true);
  });

  test("R2-B04: Transaction error propagation preserves custom application error types and messages", async () => {
    class CustomDomainException extends Error {
      public readonly code = "INSUFFICIENT_FUNDS";
      constructor(msg: string) {
        super(msg);
        this.name = "CustomDomainException";
      }
    }

    const failingTx = db.transaction(async (tx) => {
      // Step 1: Query inside tx
      await tx.select().from(schema.organizations).limit(1);
      // Step 2: Throw domain exception
      throw new CustomDomainException("Payment balance insufficient for operation");
    });

    try {
      await failingTx;
      expect(true).toBe(false); // Should not reach here
    } catch (err: unknown) {
      expect(err instanceof CustomDomainException).toBe(true);
      expect((err as CustomDomainException).code).toBe("INSUFFICIENT_FUNDS");
      expect((err as CustomDomainException).message).toBe("Payment balance insufficient for operation");
    }
  });

  test("R2-B05: High-volume batch inserts execute reliably without connection exhaustion", async () => {
    const bulkCoupons = Array.from({ length: 15 }, (_, i) => {
      const id = tracker.trackCoupon(randomUUID());
      return {
        id,
        tenantId,
        ownerAccountId,
        code: `VOL_${Date.now()}_${i}`,
        titleAr: `كوبون دفعة ${i}`,
        titleEn: `Batch Coupon ${i}`,
        discountType: "percentage" as const,
        discountValue: 5,
        currencyCode: "EGP" as const,
        status: "active" as const,
      };
    });

    const inserted = await db.insert(schema.coupons).values(bulkCoupons).returning();
    expect(inserted.length).toBe(15);
  });
});
