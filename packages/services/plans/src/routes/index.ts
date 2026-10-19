import {
  adminOverrideSubscriptionSchema,
  changePlanSchema,
  getPlanCatalogSchema,
  planCatalogDtoSchema,
  subscriptionRecordDtoSchema,
} from "../schemas";
import { createPlansService } from "../services";
import {
  plansAdminProcedure,
  plansAuthenticatedProcedure,
  plansOrgManageProcedure,
  plansOrgViewProcedure,
  procedure,
} from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/plans/status",
    summary: "Health check for the plans service",
    tags: ["plans"],
  })
  .handler(async () => ({ service: "plans" as const, status: "ok" as const }));

const getCatalog = plansAuthenticatedProcedure
  .input(getPlanCatalogSchema)
  .output(planCatalogDtoSchema.array())
  .handler(async ({ context, input }) => {
    const svc = createPlansService({ db: context.db });
    return await svc.getCatalog(input?.role);
  });

const getMySubscription = plansAuthenticatedProcedure
  .output(subscriptionRecordDtoSchema.nullable())
  .handler(async ({ context }) => {
    const svc = createPlansService({ db: context.db });
    return await svc.getMySubscription(context.auth.accountId);
  });

const getOrganizationSubscription = plansOrgViewProcedure
  .output(subscriptionRecordDtoSchema.nullable())
  .handler(async ({ context }) => {
    const svc = createPlansService({ db: context.db });
    return await svc.getOrganizationSubscription(context.auth.activeTenantId);
  });

const changeOrganizationPlan = plansOrgManageProcedure
  .input(changePlanSchema)
  .output(subscriptionRecordDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPlansService({ db: context.db });
    return await svc.changeOrganizationPlan(
      context.auth.activeTenantId,
      context.auth.accountId,
      input,
    );
  });

const changeAccountPlan = plansAuthenticatedProcedure
  .input(changePlanSchema)
  .output(subscriptionRecordDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPlansService({ db: context.db });
    return await svc.changeAccountPlan(context.auth.accountId, input);
  });

const adminOverrideSubscription = plansAdminProcedure
  .input(adminOverrideSubscriptionSchema)
  .output(subscriptionRecordDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createPlansService({ db: context.db });
    return await svc.adminOverrideSubscription(context.auth.accountId, input);
  });

export const routes = {
  status,
  getCatalog,
  getMySubscription,
  getOrganizationSubscription,
  changeOrganizationPlan,
  changeAccountPlan,
  adminOverrideSubscription,
};
