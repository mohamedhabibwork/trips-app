import {
  confirmPaymentSchema,
  createPaymentIntentSchema,
  openDisputeSchema,
  paymentTransactionDtoSchema,
  refundPaymentSchema,
  resolveDisputeSchema,
} from "../schemas";
import { expireStalePaymentsSchema, processGatewayCallbackSchema } from "../schemas/validation";
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

const processGatewayCallback = procedure
  .route({
    method: "POST",
    path: "/payments/gateway-callback",
    summary:
      "Gateway webhook/callback processed idempotently (FR-PAY-02). Mock gateway adapter: no card data reaches the server (NFR-SEC-12).",
    tags: ["payments"],
  })
  .input(processGatewayCallbackSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.processGatewayCallback(input);
  });

const expireStalePayments = paymentsAuthenticatedProcedure
  .input(expireStalePaymentsSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.expireStalePendingPayments(input?.olderThanSeconds);
  });

const getGatewayHandoff = paymentsAuthenticatedProcedure
  .input(confirmPaymentSchema)
  .handler(async ({ context, input }) => {
    const svc = createPaymentsService({ db: context.db });
    return await svc.getGatewayHandoff(input.paymentId, { accountId: context.auth.accountId });
  });

export const routes = {
  status,
  createPaymentIntent,
  confirmPayment,
  processGatewayCallback,
  expireStalePayments,
  getGatewayHandoff,
  refundPayment,
  openDispute,
  resolveDispute,
  listPayments,
};
