// Traveler receipts/invoices (SCR-TRV-15): basic list for confirmed bookings on the Free plan,
// export gated to Explorer/VIP (VIP export rule).
import { and, desc, eq, inArray, schema } from "@trips-app/db";
import { ServiceError } from "@trips-app/rpc";
import { authenticatedProcedure, publicProcedure } from "@trips-app/rpc";
import { z } from "zod/v4";

export const travelerReceiptsRouter = {
  status: publicProcedure
    .route({
      method: "GET",
      path: "/traveler/receipts/status",
      operationId: "travelerReceiptsStatus",
      summary: "Traveler receipts service health status",
      tags: ["traveler"],
    })
    .handler(() => ({ service: "traveler-receipts", status: "ok" as const })),

  /** Receipt/invoice list backed by posted booking-revenue ledger entries (basic list: Free). */
  listMine: authenticatedProcedure
    .route({
      method: "GET",
      path: "/traveler/receipts",
      operationId: "travelerReceiptsList",
      summary: "Receipts for the traveler's paid bookings",
      tags: ["traveler"],
    })
    .handler(async ({ context }) => {
      const accountId = context.auth.accountId;

      const payments = await context.db
        .select({
          id: schema.paymentTransactions.id,
          bookingId: schema.paymentTransactions.bookingId,
          amountMinor: schema.paymentTransactions.amountMinor,
          currencyCode: schema.paymentTransactions.currencyCode,
          status: schema.paymentTransactions.status,
          providerReference: schema.paymentTransactions.providerReference,
          paidAt: schema.paymentTransactions.paidAt,
          createdAt: schema.paymentTransactions.createdAt,
          bookingReference: schema.bookings.bookingReference,
          tripId: schema.bookings.tripId,
          tripTitleEn: schema.trips.titleEn,
          tripTitleAr: schema.trips.titleAr,
        })
        .from(schema.paymentTransactions)
        .leftJoin(schema.bookings, eq(schema.paymentTransactions.bookingId, schema.bookings.id))
        .leftJoin(schema.trips, eq(schema.bookings.tripId, schema.trips.id))
        .where(
          and(
            eq(schema.paymentTransactions.payerAccountId, accountId),
            inArray(schema.paymentTransactions.status, ["succeeded", "refunded"]),
          ),
        )
        .orderBy(desc(schema.paymentTransactions.createdAt));

      return {
        receipts: payments.map((row) => ({
          id: row.id,
          bookingId: row.bookingId,
          bookingReference: row.bookingReference,
          tripId: row.tripId,
          tripTitleEn: row.tripTitleEn,
          tripTitleAr: row.tripTitleAr,
          amountMinor: row.amountMinor,
          currencyCode: row.currencyCode,
          status: row.status,
          invoiceNumber: `INV-${row.providerReference}`,
          paidAt: row.paidAt,
          createdAt: row.createdAt,
        })),
      };
    }),

  /** Export one receipt as structured data — Explorer/VIP only (Free export gate). */
  export: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/receipts/export",
      operationId: "travelerReceiptsExport",
      summary: "Export a receipt (Explorer/VIP plans)",
      tags: ["traveler"],
    })
    .input(z.object({ receiptId: z.uuid() }))
    .handler(async ({ context, input }) => {
      const [account] = await context.db
        .select({ tier: schema.accounts.travelerPlanTier })
        .from(schema.accounts)
        .where(eq(schema.accounts.id, context.auth.accountId))
        .limit(1);
      if (!account || account.tier === "free") {
        throw new ServiceError(
          "PLAN_REQUIRED",
          "Receipt export requires the Explorer or VIP plan.",
          undefined,
          "traveler",
        );
      }

      const [payment] = await context.db
        .select({
          id: schema.paymentTransactions.id,
          bookingId: schema.paymentTransactions.bookingId,
          amountMinor: schema.paymentTransactions.amountMinor,
          currencyCode: schema.paymentTransactions.currencyCode,
          status: schema.paymentTransactions.status,
          providerReference: schema.paymentTransactions.providerReference,
          paidAt: schema.paymentTransactions.paidAt,
          bookingReference: schema.bookings.bookingReference,
          travelersCount: schema.bookings.passengersCount,
          subtotalMinor: schema.bookings.subtotalMinor,
          discountMinor: schema.bookings.discountMinor,
          tripTitleEn: schema.trips.titleEn,
          tripTitleAr: schema.trips.titleAr,
          startsAt: schema.trips.startsAt,
        })
        .from(schema.paymentTransactions)
        .leftJoin(schema.bookings, eq(schema.paymentTransactions.bookingId, schema.bookings.id))
        .leftJoin(schema.trips, eq(schema.bookings.tripId, schema.trips.id))
        .where(
          and(
            eq(schema.paymentTransactions.id, input.receiptId),
            eq(schema.paymentTransactions.payerAccountId, context.auth.accountId),
          ),
        )
        .limit(1);
      if (!payment) {
        throw new ServiceError("RESOURCE_NOT_FOUND", "Receipt not found.", undefined, "traveler");
      }

      return {
        receipt: {
          ...payment,
          invoiceNumber: `INV-${payment.providerReference}`,
          planTier: account.tier,
        },
      };
    }),
};
