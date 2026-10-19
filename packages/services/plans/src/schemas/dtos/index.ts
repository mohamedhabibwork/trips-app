import { z } from "zod/v4";
import { selectPlanCatalogSchema, selectSubscriptionRecordsSchema } from "@trips-app/db/zod";

export const planCatalogDtoSchema = selectPlanCatalogSchema;
export const subscriptionRecordDtoSchema = selectSubscriptionRecordsSchema;

/** Usage the organization's plan limits apply to (SCR-ORG-01, 04, 12, 33). */
export const organizationUsageDtoSchema = z.object({
  monthStart: z.string(),
  activeTripsThisMonth: z.number().int().min(0),
  employees: z.number().int().min(0),
  activeCoupons: z.number().int().min(0),
  maxVehiclesPerTrip: z.number().int().min(0),
  maxProgramsPerTrip: z.number().int().min(0),
});
