import type { z } from "zod/v4";
import type { planCatalogDtoSchema, subscriptionRecordDtoSchema } from "../schemas";
import type { adminOverrideSubscriptionSchema, changePlanSchema } from "../schemas/validation";

export type ChangePlanInput = z.infer<typeof changePlanSchema>;
export type AdminOverrideSubscriptionInput = z.infer<typeof adminOverrideSubscriptionSchema>;
export type PlanCatalogDto = z.infer<typeof planCatalogDtoSchema>;
export type SubscriptionRecordDto = z.infer<typeof subscriptionRecordDtoSchema>;
