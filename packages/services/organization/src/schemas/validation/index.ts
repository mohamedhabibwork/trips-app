// Zod schemas that validate input at the boundary.
// Derived from @trips-app/db/zod table definitions.
import {
  insertOrganizationSettingsSchema,
  selectOrganizationSettingsSchema,
  updateOrganizationSettingsSchema as dbUpdateOrganizationSettingsSchema,
} from "@trips-app/db/zod";
import { z } from "zod/v4";

export const organizationSettingSelectSchema = selectOrganizationSettingsSchema;
export const organizationSettingInsertSchema = insertOrganizationSettingsSchema;
export const organizationSettingUpdateSchema = dbUpdateOrganizationSettingsSchema;

export const getOrganizationSettingsSchema = dbUpdateOrganizationSettingsSchema
  .pick({
    tenantId: true,
  })
  .partial()
  .optional();

export const updateOrganizationSettingsSchema = dbUpdateOrganizationSettingsSchema

  .pick({
    tenantId: true,
    timeZone: true,
    defaultLanguage: true,
    seatSelfSelectionEnabled: true,
    seatPriorityWindowMinutes: true,
    childTrackingEnabledByDefault: true,
    operationsContactPhone: true,
    operationsContactEmail: true,
    safetyLeadName: true,
    safetyHotlinePhone: true,
    billingContactName: true,
    billingContactEmail: true,
    billingContactPhone: true,
    billingAddress: true,
    invoiceLanguage: true,
    taxNumber: true,
    b2bInvoicingEnabled: true,
    customBrandingEnabled: true,
    logoUrl: true,
    primaryColorHex: true,
    secondaryColorHex: true,
    crmProvider: true,
  })
  .extend({
    displayNameEn: z.string().min(2).max(120).optional(),
    displayNameAr: z.string().min(2).max(120).optional(),
    timeZone: z.string().min(3).max(80).optional(),
    defaultLanguage: z.enum(["ar", "en"]).optional(),
    seatPriorityWindowMinutes: z.number().int().min(15).max(1440).optional(),
    operationsContactPhone: z.string().max(30).nullable().optional(),
    operationsContactEmail: z.email().nullable().optional(),
    safetyLeadName: z.string().max(120).nullable().optional(),
    safetyHotlinePhone: z.string().max(30).nullable().optional(),
    billingContactName: z.string().max(120).nullable().optional(),
    billingContactEmail: z.email().nullable().optional(),
    billingContactPhone: z.string().max(30).nullable().optional(),
    billingAddress: z.string().max(300).nullable().optional(),
    invoiceLanguage: z.enum(["ar", "en"]).optional(),
    taxNumber: z.string().max(80).nullable().optional(),
    logoUrl: z.url().nullable().optional(),
    primaryColorHex: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .nullable()
      .optional(),
    secondaryColorHex: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/)
      .nullable()
      .optional(),
    crmProvider: z.string().max(80).nullable().optional(),
  });

export const configureWebhooksSchema = z.object({
  tenantId: z.uuid().optional(),
  endpoints: z
    .array(
      z.object({
        id: z.string().min(1).max(64).optional(),
        url: z.url(),
        events: z.array(z.string().min(2)).min(1),
        enabled: z.boolean().default(true),
        rotateSecret: z.boolean().default(false),
      }),
    )
    .max(25),
});
