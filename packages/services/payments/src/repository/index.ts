import { and, desc, eq, lt, or } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type {
  CurrencyCode,
  DisputeResolutionStatus,
  PaymentGatewayCode,
  PaymentPurpose,
  PaymentTransactionStatus,
} from "../model";

export type { ServiceDatabase };

export function createPaymentsRepository(db: Database) {
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
        .where(eq(schema.paymentTransactions.id, paymentId))
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

    async listPaymentsForPayer(payerAccountId: string) {
      return db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.payerAccountId, payerAccountId))
        .orderBy(desc(schema.paymentTransactions.createdAt));
    },

    async listPaymentsForTenant(tenantId: string) {
      return db
        .select()
        .from(schema.paymentTransactions)
        .where(eq(schema.paymentTransactions.tenantId, tenantId))
        .orderBy(desc(schema.paymentTransactions.createdAt));
    },
  };
}

export type PaymentsRepository = ReturnType<typeof createPaymentsRepository>;
