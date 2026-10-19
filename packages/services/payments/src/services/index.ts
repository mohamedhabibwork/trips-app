import { PaymentsServiceError } from "../errors";
import {
  DEFAULT_PLATFORM_COMMISSION_BPS,
  FAWRY_EXPIRY_HOURS,
  generateFawryReferenceCode,
  generateProviderReference,
} from "../model";
import { createPaymentsRepository, type ServiceDatabase } from "../repository";
import type {
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  OpenDisputeInput,
  RefundPaymentInput,
  ResolveDisputeInput,
} from "../types";

export function createPaymentsService(deps: { db: ServiceDatabase }) {
  const repo = createPaymentsRepository(deps.db);

  return {
    async createPaymentIntent(payerAccountId: string, input: CreatePaymentIntentInput) {
      let tenantId: string | null = null;
      let amountMinor = input.amountMinor ?? 0;
      let currencyCode = input.currencyCode;

      if (input.bookingId) {
        const booking = await repo.findBookingById(input.bookingId);
        if (!booking) {
          throw new PaymentsServiceError("BOOKING_NOT_FOUND", "Booking not found.");
        }
        if (booking.travelerAccountId !== payerAccountId) {
          throw new PaymentsServiceError(
            "FORBIDDEN_PAYMENT_ACCESS",
            "You can only create a payment intent for your own booking.",
          );
        }
        if (booking.status === "cancelled" || booking.status === "refunded") {
          throw new PaymentsServiceError(
            "INVALID_PAYMENT_STATE",
            `Cannot pay for a booking in ${booking.status} state.`,
          );
        }
        tenantId = booking.tenantId;
        amountMinor = booking.totalAmountMinor;
        currencyCode = booking.currencyCode;
      }

      if (amountMinor <= 0) {
        throw new PaymentsServiceError("INVALID_PAYMENT_STATE", "Payment amount must be positive.");
      }

      const isFawry = input.gateway === "fawry";
      const fawryReferenceCode = isFawry ? generateFawryReferenceCode() : null;
      const fawryExpiresAt = isFawry
        ? new Date(Date.now() + FAWRY_EXPIRY_HOURS * 60 * 60 * 1000)
        : null;

      return repo.insertPaymentTransaction({
        tenantId,
        bookingId: input.bookingId ?? null,
        payerAccountId,
        purpose: input.purpose,
        gateway: input.gateway,
        amountMinor,
        currencyCode,
        status: isFawry ? "requires_action" : "pending",
        providerReference: generateProviderReference(input.gateway),
        fawryReferenceCode,
        fawryExpiresAt,
      });
    },

    async confirmPayment(
      input: ConfirmPaymentInput,
      actor?: { accountId: string; tenantId?: string | null; role: string },
    ) {
      const payment = await repo.findPaymentById(input.paymentId);
      if (!payment) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      if (actor) {
        const isPayer = payment.payerAccountId === actor.accountId;
        const isTenant = Boolean(actor.tenantId) && payment.tenantId === actor.tenantId;
        const isAdmin = actor.role === "admin";
        if (!isPayer && !isTenant && !isAdmin) {
          throw new PaymentsServiceError(
            "FORBIDDEN_PAYMENT_ACCESS",
            "You do not have permission to confirm this payment.",
          );
        }
      }
      if (payment.status !== "pending" && payment.status !== "requires_action") {
        throw new PaymentsServiceError(
          "INVALID_PAYMENT_STATE",
          `Cannot confirm payment in ${payment.status} state.`,
        );
      }

      if (
        payment.gateway === "fawry" &&
        payment.fawryExpiresAt !== null &&
        payment.fawryExpiresAt.getTime() <= Date.now()
      ) {
        await repo.markPaymentFailed(payment.id);
        throw new PaymentsServiceError(
          "INVALID_PAYMENT_STATE",
          "Fawry reference code has expired.",
        );
      }

      const confirmed = await repo.markPaymentSucceeded(payment.id);
      if (!confirmed) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }

      if (payment.bookingId && payment.tenantId) {
        const booking = await repo.findBookingById(payment.bookingId);
        await repo.updateBookingStatus(payment.bookingId, "confirmed");
        const commissionMinor = Math.floor(
          (payment.amountMinor * DEFAULT_PLATFORM_COMMISSION_BPS) / 10000,
        );
        const netMinor = payment.amountMinor - commissionMinor;
        await repo.insertRevenueLedgerEntry({
          tenantId: payment.tenantId,
          tripId: booking?.tripId ?? null,
          bookingId: payment.bookingId,
          grossAmountMinor: payment.amountMinor,
          commissionAmountMinor: commissionMinor,
          netAmountMinor: netMinor,
          currencyCode: payment.currencyCode,
          invoiceNumber: `INV-${payment.providerReference}`,
          description: `Booking payment ${booking?.bookingReference ?? payment.bookingId}`,
        });
      }

      return confirmed;
    },

    async refundPayment(
      actor: { accountId: string; tenantId?: string | null; role: string },
      input: RefundPaymentInput,
    ) {
      const payment = await repo.findPaymentById(input.paymentId);
      if (!payment) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      const isPayer = payment.payerAccountId === actor.accountId;
      const isTenant = actor.tenantId && payment.tenantId === actor.tenantId;
      const isAdmin = actor.role === "admin";
      if (!isPayer && !isTenant && !isAdmin) {
        throw new PaymentsServiceError(
          "FORBIDDEN_PAYMENT_ACCESS",
          "You cannot refund this payment.",
        );
      }
      if (payment.status !== "succeeded") {
        throw new PaymentsServiceError(
          "INVALID_PAYMENT_STATE",
          "Only succeeded payments can be refunded.",
        );
      }

      const refundAmount = input.refundAmountMinor ?? payment.amountMinor;
      if (refundAmount > payment.amountMinor) {
        throw new PaymentsServiceError(
          "REFUND_EXCEEDS_AMOUNT",
          "Refund amount cannot exceed original payment amount.",
        );
      }

      const updated = await repo.markPaymentRefunded(payment.id, refundAmount);
      if (payment.bookingId) {
        await repo.updateBookingStatus(payment.bookingId, "refunded", refundAmount);
      }
      if (payment.tenantId) {
        const booking = payment.bookingId ? await repo.findBookingById(payment.bookingId) : null;
        await repo.insertRefundLedgerEntry({
          tenantId: payment.tenantId,
          tripId: booking?.tripId ?? null,
          bookingId: payment.bookingId,
          refundAmountMinor: refundAmount,
          currencyCode: payment.currencyCode,
          description: input.reason ?? `Refund for ${payment.providerReference}`,
        });
      }
      return updated!;
    },

    async openDispute(accountId: string, input: OpenDisputeInput) {
      const payment = await repo.findPaymentById(input.paymentId);
      if (!payment) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      if (payment.payerAccountId !== accountId) {
        throw new PaymentsServiceError(
          "FORBIDDEN_PAYMENT_ACCESS",
          "Only the payer can open a dispute.",
        );
      }
      const updated = await repo.markPaymentDisputed(payment.id, input.reason);
      if (!updated) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      return updated;
    },

    async resolveDispute(input: ResolveDisputeInput) {
      const payment = await repo.findPaymentById(input.paymentId);
      if (!payment) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      const updated = await repo.resolveDispute(payment.id, input.resolution);
      if (!updated) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      return updated;
    },

    async listMyPayments(accountId: string, tenantId?: string | null) {
      if (tenantId) {
        return repo.listPaymentsForTenant(tenantId);
      }
      return repo.listPaymentsForPayer(accountId);
    },
  };
}

export type PaymentsService = ReturnType<typeof createPaymentsService>;
