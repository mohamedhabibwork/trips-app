// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

export const getOrganizationSettingsSchema = z
  .object({
    tenantId: z.uuid().optional(),
  })
  .optional();

export const updateOrganizationSettingsSchema = z.object({
  tenantId: z.uuid().optional(),
  displayNameEn: z.string().min(2).max(120).optional(),
  displayNameAr: z.string().min(2).max(120).optional(),
  timeZone: z.string().min(3).max(80).optional(),
  defaultLanguage: z.enum(["ar", "en"]).optional(),
  seatSelfSelectionEnabled: z.boolean().optional(),
  seatPriorityWindowMinutes: z.number().int().min(15).max(1440).optional(),
  childTrackingEnabledByDefault: z.boolean().optional(),
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
  b2bInvoicingEnabled: z.boolean().optional(),
  customBrandingEnabled: z.boolean().optional(),
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
