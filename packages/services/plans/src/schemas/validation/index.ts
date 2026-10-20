// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertPlanCatalogSchema,
  insertSubscriptionRecordsSchema,
  selectPlanCatalogSchema,
  selectSubscriptionRecordsSchema,
  updatePlanCatalogSchema,
  updateSubscriptionRecordsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

import { SUBSCRIPTION_ROLES } from "../../model";

export const subscriptionRecordSelectSchema = selectSubscriptionRecordsSchema;
export const subscriptionRecordInsertSchema = insertSubscriptionRecordsSchema;
export const subscriptionRecordUpdateSchema = updateSubscriptionRecordsSchema;

export const planCatalogSelectSchema = selectPlanCatalogSchema;
export const planCatalogInsertSchema = insertPlanCatalogSchema;
export const planCatalogUpdateSchema = updatePlanCatalogSchema;

export const getPlanCatalogSchema = selectPlanCatalogSchema
  .pick({
    role: true,
  })
  .extend({
    role: z.enum(SUBSCRIPTION_ROLES).optional(),
  })
  .optional();

export const changePlanSchema = insertSubscriptionRecordsSchema
  .pick({
    planId: true,
  })
  .extend({
    planId: z.string().trim().min(1),
    billingCycle: insertSubscriptionRecordsSchema.shape.billingCycle.default("monthly"),
  });

export const adminOverrideSubscriptionSchema = insertSubscriptionRecordsSchema
  .pick({
    scope: true,
    accountId: true,
    tenantId: true,
    planId: true,
  })
  .extend({
    accountId: z.uuid().nullable().optional(),
    tenantId: z.uuid().nullable().optional(),
    planId: z.string().trim().min(1),
    billingCycle: insertSubscriptionRecordsSchema.shape.billingCycle.default("monthly"),
    overrideNote: z.string().trim().min(3).max(500),
  });
