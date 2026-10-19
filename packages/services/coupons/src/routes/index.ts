// oRPC procedures for Coupons. Validate input with schemas, call services, map errors.
// Every service exposes at least one procedure. Build them on the local procedure in ./procedure.
import {
  createCouponInputSchema,
  listCouponsInputSchema,
  updateCouponStatusInputSchema,
  validateCouponInputSchema,
} from "../schemas/validation";
import { createCouponsService } from "../services";
import {
  couponsAdminProcedure,
  couponsAuthenticatedProcedure,
  couponsOrgManageProcedure,
  couponsOrgViewProcedure,
  procedure,
} from "./procedure";

export const routes = {
  status: procedure
    .route({
      method: "GET",
      path: "/coupons/status",
      operationId: "couponsStatus",
      summary: "Coupons service health status",
      tags: ["coupons"],
    })
    .handler(() => ({ service: "coupons", status: "ok" as const })),

  createOrganizationCoupon: couponsOrgManageProcedure
    .route({
      method: "POST",
      path: "/coupons/organization",
      operationId: "couponsCreateOrganization",
      summary: "Create a promotional coupon for the active organization (SCR-ORG-27)",
      tags: ["coupons"],
    })
    .input(createCouponInputSchema)
    .handler(async ({ input, context }) => {
      const service = createCouponsService(context.db);
      return service.createOrganizationCoupon(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  createPlatformCoupon: couponsAdminProcedure
    .route({
      method: "POST",
      path: "/coupons/platform",
      operationId: "couponsCreatePlatform",
      summary: "Create a platform-wide promotional coupon (Admin)",
      tags: ["coupons"],
    })
    .input(createCouponInputSchema)
    .handler(async ({ input, context }) => {
      const service = createCouponsService(context.db);
      return service.createPlatformCoupon(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  updateStatus: couponsAuthenticatedProcedure
    .route({
      method: "PATCH",
      path: "/coupons/{couponId}/status",
      operationId: "couponsUpdateStatus",
      summary: "Pause, activate, or expire a coupon (SCR-ORG-27)",
      tags: ["coupons"],
    })
    .input(updateCouponStatusInputSchema)
    .handler(async ({ input, context }) => {
      const service = createCouponsService(context.db);
      return service.updateCouponStatus(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  listOrganizationCoupons: couponsOrgViewProcedure
    .route({
      method: "GET",
      path: "/coupons/organization",
      operationId: "couponsListOrganization",
      summary: "List promotional coupons for the active organization (SCR-ORG-27)",
      tags: ["coupons"],
    })
    .input(listCouponsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createCouponsService(context.db);
      return service.listOrganizationCoupons(
        {
          accountId: context.auth.accountId,
          role: context.auth.activeRole,
          activeTenantId: context.auth.activeTenantId,
        },
        input,
      );
    }),

  listPlatformCoupons: couponsAdminProcedure
    .route({
      method: "GET",
      path: "/coupons/platform",
      operationId: "couponsListPlatform",
      summary: "List platform-wide promotional coupons (Admin)",
      tags: ["coupons"],
    })
    .input(listCouponsInputSchema)
    .handler(async ({ input, context }) => {
      const service = createCouponsService(context.db);
      return service.listPlatformCoupons(input);
    }),

  validateCoupon: couponsAuthenticatedProcedure
    .route({
      method: "POST",
      path: "/coupons/validate",
      operationId: "couponsValidate",
      summary: "Validate a coupon code and calculate discount for checkout (SCR-TRV-05)",
      tags: ["coupons"],
    })
    .input(validateCouponInputSchema)
    .handler(async ({ input, context }) => {
      const service = createCouponsService(context.db);
      return service.validateCoupon(input);
    }),
};
