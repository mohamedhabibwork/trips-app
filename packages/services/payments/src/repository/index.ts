import { and, desc, eq, gte, inArray, lt, lte, or, sql } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type {
  CurrencyCode,
  DisputeResolutionStatus,
  PaymentGatewayCode,
  PaymentPurpose,
  PaymentTransactionStatus,
} from "../model";

export type { ServiceDatabase };

export function createPaymentsRepository(db: ServiceDatabase) {
  return {
    async findBookingById(bookingId: string) {
      const [row] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId))
        .limit(1);
      return row ?? null;
    },

    async insertPaymentTransaction(values: {
      tenantId: string | null;
      bookingId: string | null;
      payerAccountId: string;
      purpose: PaymentPurpose;
      gateway: PaymentGatewayCode;
      amountMinor: number;
      currencyCode: CurrencyCode;
      status: PaymentTransactionStatus;
      providerReference: string;
      fawryReferenceCode: string | null;
      fawryExpiresAt: Date | null;
    }) {
      const [created] = await db.insert(schema.paymentTransactions).values(values).returning();
      return created!;
    },

    async findPaymentById(paymentId: string) {
      const [row] = await db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.id, paymentId))
        .limit(1);
      return row ?? null;
    },

    async findPaymentByProviderReference(providerReference: string) {
      const [row] = await db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.providerReference, providerReference))
        .limit(1);
      return row ?? null;
    },

    /** D-30: pending payments with no callback before the deadline fail and free the retry. */
    async expireStalePending(cutoff: Date) {
      const rows = await db
        .update(schema.paymentTransactions)
        .set({ status: "failed", updatedAt: new Date() })
        .where(
          and(
            or(
              eq(schema.paymentTransactions.status, "pending"),
              eq(schema.paymentTransactions.status, "requires_action"),
            ),
            lt(schema.paymentTransactions.createdAt, cutoff),
          ),
        )
        .returning({ id: schema.paymentTransactions.id });
      return rows.length;
    },

    async markPaymentSucceeded(paymentId: string) {
      const now = new Date();
      const [updated] = await db
        .update(schema.paymentTransactions)
        .set({
          status: "succeeded",
          paidAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(schema.paymentTransactions.id, paymentId),
            inArray(schema.paymentTransactions.status, ["pending", "requires_action"]),
          ),
        )
        .returning();
      return updated ?? null;
    },

    async markPaymentFailed(paymentId: string) {
      const now = new Date();
      const [updated] = await db
        .update(schema.paymentTransactions)
        .set({
          status: "failed",
          updatedAt: now,
        })
        .where(eq(schema.paymentTransactions.id, paymentId))
        .returning();
      return updated ?? null;
    },

    async updateBookingStatus(
      bookingId: string,
      status: "confirmed" | "refunded",
      refundAmountMinor?: number,
    ) {
      const patch: Record<string, unknown> = { status, updatedAt: new Date() };
      if (refundAmountMinor !== undefined) {
        patch.refundAmountMinor = refundAmountMinor;
      }
      await db.update(schema.bookings).set(patch).where(eq(schema.bookings.id, bookingId));
    },

    /** Claim (delta > 0) or release (delta < 0) confirmed seats on the trip when a
     * booking crosses a payment boundary — this is what makes remaining seats move
     * on "mark as paid" / refund instead of at booking creation. */
    async adjustTripConfirmedSeats(tripId: string, delta: number) {
      if (delta === 0) return;
      await db
        .update(schema.trips)
        .set({
          confirmedSeatsCount: sql`GREATEST(0, ${schema.trips.confirmedSeatsCount} + ${delta})`,
          updatedAt: new Date(),
        })
        .where(eq(schema.trips.id, tripId));
    },

    async insertRevenueLedgerEntry(values: {
      tenantId: string;
      tripId: string | null;
      bookingId: string | null;
      grossAmountMinor: number;
      commissionAmountMinor: number;
      netAmountMinor: number;
      currencyCode: CurrencyCode;
      invoiceNumber: string;
      description: string;
    }) {
      await db.insert(schema.accountingLedgerEntries).values({
        tenantId: values.tenantId,
        tripId: values.tripId,
        bookingId: values.bookingId,
        entryType: "booking_revenue",
        direction: "credit",
        grossAmountMinor: values.grossAmountMinor,
        commissionAmountMinor: values.commissionAmountMinor,
        netAmountMinor: values.netAmountMinor,
        currencyCode: values.currencyCode,
        status: "posted",
        invoiceNumber: values.invoiceNumber,
        description: values.description,
      });
    },

    async insertRevenueLedgerEntries(
      entries: Array<typeof schema.accountingLedgerEntries.$inferInsert>,
    ) {
      if (entries.length === 0) return [];
      return db.insert(schema.accountingLedgerEntries).values(entries).returning();
    },

    async insertRefundLedgerEntry(values: {
      tenantId: string;
      tripId: string | null;
      bookingId: string | null;
      refundAmountMinor: number;
      currencyCode: CurrencyCode;
      description: string;
    }) {
      await db.insert(schema.accountingLedgerEntries).values({
        tenantId: values.tenantId,
        tripId: values.tripId,
        bookingId: values.bookingId,
        entryType: "refund_debit",
        direction: "debit",
        grossAmountMinor: values.refundAmountMinor,
        commissionAmountMinor: 0,
        netAmountMinor: values.refundAmountMinor,
        currencyCode: values.currencyCode,
        status: "posted",
        description: values.description,
      });
    },

    async markPaymentRefunded(paymentId: string, refundedAmountMinor: number) {
      const [updated] = await db
        .update(schema.paymentTransactions)
        .set({
          status: "refunded",
          refundedAmountMinor,
          updatedAt: new Date(),
        })
        .where(eq(schema.paymentTransactions.id, paymentId))
        .returning();
      return updated ?? null;
    },

    async markPaymentDisputed(paymentId: string, reason: string) {
      const [updated] = await db
        .update(schema.paymentTransactions)
        .set({
          status: "disputed",
          disputeReason: reason,
          disputeStatus: "open",
          updatedAt: new Date(),
        })
        .where(eq(schema.paymentTransactions.id, paymentId))
        .returning();
      return updated ?? null;
    },

    async resolveDispute(paymentId: string, resolution: DisputeResolutionStatus) {
      const status: PaymentTransactionStatus =
        resolution === "resolved_refund" ? "refunded" : "succeeded";
      const [updated] = await db
        .update(schema.paymentTransactions)
        .set({
          status,
          disputeStatus: resolution,
          updatedAt: new Date(),
        })
        .where(eq(schema.paymentTransactions.id, paymentId))
        .returning();
      return updated ?? null;
    },

    async listPaymentsForPayer(
      payerAccountId: string,
      filters?: {
        status?: PaymentTransactionStatus;
        limit?: number;
        offset?: number;
      },
    ) {
      let query = db.select().from(schema.paymentTransactions).$dynamic();
      const conditions = [eq(schema.paymentTransactions.payerAccountId, payerAccountId)];
      if (filters?.status) {
        conditions.push(eq(schema.paymentTransactions.status, filters.status));
      }
      query = query.where(and(...conditions)).orderBy(desc(schema.paymentTransactions.createdAt));
      if (filters?.limit !== undefined) query = query.limit(filters.limit);
      if (filters?.offset !== undefined) query = query.offset(filters.offset);
      return query;
    },

    /**
     * The payment with what its receipt shows: the booking and trip (when the payment is for one) and
     * the payer's name. Access is decided by the service from `tenantId` and `payerAccountId`.
     */
    async findReceiptSource(paymentId: string) {
      const [row] = await db
        .select({
          payment: schema.paymentTransactions,
          booking: {
            bookingReference: schema.bookings.bookingReference,
            passengersCount: schema.bookings.passengersCount,
            selectedProgramIds: schema.bookings.selectedProgramIds,
            subtotalMinor: schema.bookings.subtotalMinor,
            programsTotalMinor: schema.bookings.programsTotalMinor,
            discountMinor: schema.bookings.discountMinor,
            couponCode: schema.bookings.couponCode,
          },
          trip: { titleAr: schema.trips.titleAr, titleEn: schema.trips.titleEn },
          payerName: schema.accounts.fullName,
        })
        .from(schema.paymentTransactions)
        .innerJoin(
          schema.accounts,
          eq(schema.accounts.id, schema.paymentTransactions.payerAccountId),
        )
        .leftJoin(schema.bookings, eq(schema.bookings.id, schema.paymentTransactions.bookingId))
        .leftJoin(schema.trips, eq(schema.trips.id, schema.bookings.tripId))
        .where(eq(schema.paymentTransactions.id, paymentId))
        .limit(1);
      return row ?? null;
    },

    async listPaymentsForTenant(
      tenantId: string,
      filters?: {
        status?: PaymentTransactionStatus;
        purpose?: PaymentPurpose;
        from?: Date;
        to?: Date;
        limit?: number;
        offset?: number;
      },
    ) {
      let query = db.select().from(schema.paymentTransactions).$dynamic();
      const conditions = [eq(schema.paymentTransactions.tenantId, tenantId)];
      if (filters?.status) {
        conditions.push(eq(schema.paymentTransactions.status, filters.status));
      }
      if (filters?.purpose) {
        conditions.push(eq(schema.paymentTransactions.purpose, filters.purpose));
      }
      if (filters?.from) {
        conditions.push(gte(schema.paymentTransactions.createdAt, filters.from));
      }
      if (filters?.to) {
        conditions.push(lte(schema.paymentTransactions.createdAt, filters.to));
      }
      query = query.where(and(...conditions)).orderBy(desc(schema.paymentTransactions.createdAt));
      if (filters?.limit !== undefined) query = query.limit(filters.limit);
      if (filters?.offset !== undefined) query = query.offset(filters.offset);
      return query;
    },
  };
}

export type PaymentsRepository = ReturnType<typeof createPaymentsRepository>;
