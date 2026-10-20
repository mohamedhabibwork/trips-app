import { PaymentsServiceError } from "../errors";
import {
  DEFAULT_PLATFORM_COMMISSION_BPS,
  FAWRY_EXPIRY_HOURS,
  PAYMENT_CONFIRM_TIMEOUT_SECONDS,
  buildMockGatewayHandoff,
  generateFawryReferenceCode,
  buildReceiptLines,
  generateProviderReference,
  resolveGatewayCallbackAction,
  hasReceipt,
  invoiceNumberFor,
} from "../model";
import { createPaymentsRepository, type ServiceDatabase } from "../repository";
import type {
  ConfirmPaymentInput,
  CreatePaymentIntentInput,
  GetReceiptInput,
  OpenDisputeInput,
  ProcessGatewayCallbackInput,
  ReceiptDto,
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

      const confirmed = await applySuccessfulPayment(deps.db, payment);
      if (!confirmed) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }

      return confirmed;
    },

    /**
     * Gateway webhook/callback (FR-PAY-02): processed idempotently. Repeated deliveries for an
     * already-settled payment return the current transaction with `alreadyProcessed: true` and
     * never re-apply booking confirmation or ledger entries.
     */
    async processGatewayCallback(input: ProcessGatewayCallbackInput) {
      const payment = await repo.findPaymentByProviderReference(input.providerReference);
      if (!payment) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      if (payment.gateway !== input.gateway) {
        throw new PaymentsServiceError(
          "INVALID_PAYMENT_STATE",
          "Gateway does not match the payment transaction.",
        );
      }

      const decision = resolveGatewayCallbackAction(payment.status, input.outcome);
      if (decision.action === "already_processed") {
        return { payment, alreadyProcessed: true };
      }
      if (decision.action === "apply_success") {
        const settled = await applySuccessfulPayment(deps.db, payment);
        return { payment: settled ?? payment, alreadyProcessed: false };
      }
      const failed = await repo.markPaymentFailed(payment.id);
      return { payment: failed ?? payment, alreadyProcessed: false };
    },

    /** D-30: fail pendings that never received a callback, freeing the traveler to retry. */
    async expireStalePendingPayments(olderThanSeconds?: number) {
      const seconds = olderThanSeconds ?? PAYMENT_CONFIRM_TIMEOUT_SECONDS;
      const cutoff = new Date(Date.now() - seconds * 1000);
      return { expiredCount: await repo.expireStalePending(cutoff) };
    },

    /** Mock gateway handoff (dry run, NFR-SEC-12) for an existing pending transaction. */
    async getGatewayHandoff(paymentId: string, actor?: { accountId: string }) {
      const payment = await repo.findPaymentById(paymentId);
      if (!payment) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Payment transaction not found.");
      }
      if (actor && payment.payerAccountId !== actor.accountId) {
        throw new PaymentsServiceError(
          "FORBIDDEN_PAYMENT_ACCESS",
          "You do not have permission to open this payment handoff.",
        );
      }
      return buildMockGatewayHandoff(payment.gateway, payment.providerReference);
    },

    buildMockGatewayHandoff,

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

      return deps.db.transaction(async (tx) => {
        const txRepo = createPaymentsRepository(tx as unknown as ServiceDatabase);
        const updated = await txRepo.markPaymentRefunded(payment.id, refundAmount);
        if (payment.bookingId) {
          await txRepo.updateBookingStatus(payment.bookingId, "refunded", refundAmount);
        }
        if (payment.tenantId) {
          const booking = payment.bookingId
            ? await txRepo.findBookingById(payment.bookingId)
            : null;
          if (booking && ["confirmed", "checked_in", "completed"].includes(booking.status)) {
            await txRepo.adjustTripConfirmedSeats(booking.tripId, -booking.passengersCount);
          }
          await txRepo.insertRefundLedgerEntry({
            tenantId: payment.tenantId,
            tripId: booking?.tripId ?? null,
            bookingId: payment.bookingId,
            refundAmountMinor: refundAmount,
            currencyCode: payment.currencyCode,
            description: input.reason ?? `Refund for ${payment.providerReference}`,
          });
        }
        return updated!;
      });
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

    /**
     * The receipt for one paid payment (SCR-SHR-12). The payer, the organization that received the
     * payment and platform admins may read it; anyone else is told it does not exist (IF-12).
     */
    async getReceipt(
      actor: { accountId: string; tenantId?: string | null; role: string },
      input: GetReceiptInput,
    ): Promise<ReceiptDto> {
      const source = await repo.findReceiptSource(input.paymentId);
      const payment = source?.payment;
      const isPayer = payment?.payerAccountId === actor.accountId;
      const isTenant = Boolean(actor.tenantId) && payment?.tenantId === actor.tenantId;
      const isAdmin = actor.role === "admin";
      if (!source || !payment || (!isPayer && !isTenant && !isAdmin)) {
        throw new PaymentsServiceError("PAYMENT_NOT_FOUND", "Receipt not found.");
      }
      if (!hasReceipt(payment.status) || !payment.paidAt) {
        throw new PaymentsServiceError(
          "INVALID_PAYMENT_STATE",
          `A ${payment.status} payment has no receipt yet.`,
        );
      }

      const booking =
        source.booking && source.trip
          ? {
              ...source.booking,
              tripTitleAr: source.trip.titleAr,
              tripTitleEn: source.trip.titleEn,
            }
          : null;
      const lines = buildReceiptLines(booking, payment.amountMinor);
      return {
        paymentId: payment.id,
        invoiceNumber: invoiceNumberFor(payment.providerReference),
        status: payment.status,
        gateway: payment.gateway,
        issuedAt: payment.paidAt,
        billedToName: source.payerName,
        bookingReference: source.booking?.bookingReference ?? null,
        lines,
        subtotalMinor: lines
          .filter((line) => line.amountMinor > 0)
          .reduce((sum, line) => sum + line.amountMinor, 0),
        totalMinor: payment.amountMinor,
        refundedMinor: payment.refundedAmountMinor,
        currencyCode: payment.currencyCode,
      };
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

/** Shared success path for both the direct confirm and the gateway callback. */
async function applySuccessfulPayment(
  db: ServiceDatabase,
  payment: NonNullable<
    Awaited<ReturnType<ReturnType<typeof createPaymentsRepository>["findPaymentById"]>>
  >,
) {
  return db.transaction(async (tx) => {
    const txRepo = createPaymentsRepository(tx as unknown as ServiceDatabase);
    const confirmed = await txRepo.markPaymentSucceeded(payment.id);
    if (!confirmed) {
      return (await txRepo.findPaymentById(payment.id)) ?? payment;
    }
    if (payment.bookingId && payment.tenantId) {
      const booking = await txRepo.findBookingById(payment.bookingId);
      await txRepo.updateBookingStatus(payment.bookingId, "confirmed");
      if (booking) {
        await txRepo.adjustTripConfirmedSeats(booking.tripId, booking.passengersCount);
      }
      const commissionMinor = Math.floor(
        (payment.amountMinor * DEFAULT_PLATFORM_COMMISSION_BPS) / 10000,
      );
      const netMinor = payment.amountMinor - commissionMinor;
      await txRepo.insertRevenueLedgerEntry({
        tenantId: payment.tenantId,
        tripId: booking?.tripId ?? null,
        bookingId: payment.bookingId,
        grossAmountMinor: payment.amountMinor,
        commissionAmountMinor: commissionMinor,
        netAmountMinor: netMinor,
        currencyCode: payment.currencyCode,
        invoiceNumber: invoiceNumberFor(payment.providerReference),
        description: `Booking payment ${booking?.bookingReference ?? payment.bookingId}`,
      });
    }
    return confirmed;
  });
}
