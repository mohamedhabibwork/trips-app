import { selectPlanCatalogSchema, selectSubscriptionRecordsSchema } from "@trips-app/db/zod";

export const planCatalogDtoSchema = selectPlanCatalogSchema;
export const subscriptionRecordDtoSchema = selectSubscriptionRecordsSchema;
