import { z } from "zod/v4";

export const getPlanCatalogSchema = z
  .object({
    role: z
      .enum(["traveler", "organization", "platform_driver", "platform_photographer"])
      .optional(),
  })
  .optional();

export const changePlanSchema = z.object({
  planId: z.string().trim().min(1),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
});

export const adminOverrideSubscriptionSchema = z.object({
  scope: z.enum(["account", "organization"]),
  accountId: z.uuid().nullable().optional(),
  tenantId: z.uuid().nullable().optional(),
  planId: z.string().trim().min(1),
  billingCycle: z.enum(["monthly", "annual"]).default("monthly"),
  overrideNote: z.string().trim().min(3).max(500),
});
