// Zod schemas that validate input at the boundary.
import { z } from "zod/v4";

export const featureFlagsPatchSchema = z.object({
  p1_foundation: z.boolean().optional(),
  p2_single_vehicle_mvp: z.boolean().optional(),
  p3_multi_vehicle_checkin: z.boolean().optional(),
  p4_marketplace_supply: z.boolean().optional(),
  p5_subscriptions_coupons: z.boolean().optional(),
  p6_live_tracking_public_api: z.boolean().optional(),
});

export const operationalSettingsPatchSchema = z.object({
  labTestDefaultDeadlineDays: z.number().int().min(1).max(7).optional(),
  platformCommissionBps: z.number().int().min(0).max(5000).optional(),
  annualBillingDiscountBps: z.number().int().min(0).max(5000).optional(),
  subscriptionGraceDays: z.number().int().min(1).max(30).optional(),
  fawryVoucherExpiryHours: z.number().int().min(6).max(168).optional(),
  seatHoldMinutes: z.number().int().min(5).max(60).optional(),
  negotiationExpiryHours: z.number().int().min(12).max(168).optional(),
});

export const maintenanceSettingsPatchSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessageEn: z.string().max(500).nullable().optional(),
  maintenanceMessageAr: z.string().max(500).nullable().optional(),
  maintenanceNoticeHoursAhead: z.number().int().min(1).max(720).optional(),
  minIosVersion: z.string().max(20).optional(),
  minAndroidSdk: z.number().int().min(21).max(40).optional(),
  minMobileAppVersion: z.string().max(20).optional(),
});

export const previewSystemSettingsChangeSchema = z.object({
  marketCountryCode: z.enum(["EG", "SA", "AE"]).optional(),
  marketEnabled: z.boolean().optional(),
  featureFlags: featureFlagsPatchSchema.optional(),
  operational: operationalSettingsPatchSchema.optional(),
  maintenanceAndSupport: maintenanceSettingsPatchSchema.optional(),
});

export const updateSystemSettingsSchema = z.object({
  marketCountryCode: z.enum(["EG", "SA", "AE"]).optional(),
  marketEnabled: z.boolean().optional(),
  featureFlags: featureFlagsPatchSchema.optional(),
  operational: operationalSettingsPatchSchema.optional(),
  maintenanceAndSupport: maintenanceSettingsPatchSchema.optional(),
  secondApproverAdminAccountId: z.string().uuid().optional(),
  reason: z.string().min(5).max(500),
});
