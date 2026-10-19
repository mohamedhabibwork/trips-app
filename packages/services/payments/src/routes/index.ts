import {
  confirmPaymentSchema,
  createPaymentIntentSchema,
  getReceiptSchema,
  openDisputeSchema,
  paymentTransactionDtoSchema,
  receiptDtoSchema,
  refundPaymentSchema,
  resolveDisputeSchema,
} from "../schemas";
import { createPaymentsService } from "../services";
import { paymentsAdminProcedure, paymentsAuthenticatedProcedure, procedure } from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/payments/status",
    summary: "Health check for the payments service",
    tags: ["payments"],
  })
  .handler(async () => ({ service: "payments" as const, status: "ok" as const }));

const createPaymentIntent = paymentsAuthenticatedProcedure
  .input(createPaymentIntentSchema)
  .output(paymentTransactionDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.createPaymentIntent(context.auth.accountId, input);
  });

const confirmPayment = paymentsAuthenticatedProcedure
  .input(confirmPaymentSchema)
  .output(paymentTransactionDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.confirmPayment(input, {
      accountId: context.auth.accountId,
      tenantId: context.auth.activeTenantId,
      role: context.auth.activeRole,
    });
  });

const refundPayment = paymentsAuthenticatedProcedure
  .input(refundPaymentSchema)
  .output(paymentTransactionDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.refundPayment(
      {
        accountId: context.auth.accountId,
        tenantId: context.auth.activeTenantId,
        role: context.auth.activeRole,
      },
      input,
    );
  });

const openDispute = paymentsAuthenticatedProcedure
  .input(openDisputeSchema)
  .output(paymentTransactionDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.openDispute(context.auth.accountId, input);
  });

const resolveDispute = paymentsAdminProcedure
  .input(resolveDisputeSchema)
  .output(paymentTransactionDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.resolveDispute(input);
  });

const listPayments = paymentsAuthenticatedProcedure
  .output(paymentTransactionDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.listMyPayments(context.auth.accountId, context.auth.activeTenantId);
  });

const getReceipt = paymentsAuthenticatedProcedure
  .route({
    method: "POST",
    path: "/payments/receipt",
    summary: "Receipt for one paid payment (payer, receiving organization or admin)",
    tags: ["payments"],
  })
  .input(getReceiptSchema)
  .output(receiptDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.getReceipt(
      {
        accountId: context.auth.accountId,
        tenantId: context.auth.activeTenantId,
        role: context.auth.activeRole,
      },
      input,
    );
  });

export const routes = {
  status,
  createPaymentIntent,
  confirmPayment,
  refundPayment,
  openDispute,
  resolveDispute,
  listPayments,
  getReceipt,
};
