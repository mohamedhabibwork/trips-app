import { findPlanCatalogEntry, ROLE_AUTH_DEFAULTS } from "./roles-and-plans";
import type {
  AuthSettingsData,
  OrganizationSettingsData,
  OrganizationSettingsValidationResult,
  SupportedCountryCode,
  SupportedLocale,
  SystemSettingsData,
} from "./types";

export type {
  AuthSettingsData,
  MarketSetting,
  OrganizationSettingsData,
  OrganizationSettingsValidationResult,
  OrganizationWebhookEndpoint,
  PaymentGatewayCode,
  RefundPolicyTier,
  SupportedCountryCode,
  SupportedLocale,
  SystemFeatureFlags,
  SystemMaintenanceSettings,
  SystemNotificationSettings,
  SystemOperationalSettings,
  SystemSettingsData,
} from "./types";

export const DEFAULT_SYSTEM_SETTINGS: SystemSettingsData = {
  id: "default",
  markets: {
    EG: {
      countryCode: "EG",
      nameEn: "Egypt",
      nameAr: "مصر",
      enabled: true,
      currency: "EGP",
      timeZone: "Africa/Cairo",
      gateways: ["stripe", "paymob", "fawry"],
      zatcaEnabled: false,
    },
    SA: {
      countryCode: "SA",
      nameEn: "Saudi Arabia",
      nameAr: "المملكة العربية السعودية",
      enabled: false,
      currency: "SAR",
      timeZone: "Asia/Riyadh",
      gateways: ["stripe", "paymob"],
      zatcaEnabled: false,
    },
    AE: {
      countryCode: "AE",
      nameEn: "United Arab Emirates",
      nameAr: "الإمارات العربية المتحدة",
      enabled: false,
      currency: "AED",
      timeZone: "Asia/Dubai",
      gateways: ["stripe"],
      zatcaEnabled: false,
    },
  },
  operational: {
    labTestDefaultDeadlineDays: 3,
    labTestMinDeadlineDays: 1,
    labTestMaxDeadlineDays: 7,
    platformCommissionBps: 1000,
    annualBillingDiscountBps: 1500,
    subscriptionGraceDays: 7,
    dunningRetryDays: [1, 3, 5, 7],
    fawryVoucherExpiryHours: 48,
    seatHoldMinutes: 15,
    negotiationExpiryHours: 72,
    applicationReviewSlaWorkingDays: 2,
    applicationChangesResponseDays: 14,
    applicationChangesExtensionDays: 7,
    rejectionReapplyBlockDays: 30,
  },
  refundPolicyTiers: [
    { minHoursBeforeDeparture: 48, refundPercent: 80 },
    { minHoursBeforeDeparture: 24, refundPercent: 50 },
    { minHoursBeforeDeparture: 0, refundPercent: 0 },
  ],
  notifications: {
    quietHoursStartLocal: "22:00",
    quietHoursEndLocal: "07:00",
    urgentCategories: ["verification", "identity", "bookings", "trip_operations", "driver_safety"],
  },
  maintenanceAndSupport: {
    maintenanceMode: false,
    maintenanceMessageEn: null,
    maintenanceMessageAr: null,
    maintenanceNoticeHoursAhead: 72,
    minIosVersion: "16.0",
    minAndroidSdk: 29,
    minMobileAppVersion: "1.0.0",
  },
  featureFlags: {
    p1_foundation: true,
    p2_single_vehicle_mvp: true,
    p3_multi_vehicle_checkin: true,
    p4_marketplace_supply: true,
    p5_subscriptions_coupons: true,
    p6_live_tracking_public_api: true,
  },
};

export const DEFAULT_AUTH_SETTINGS: AuthSettingsData = {
  id: "default",
  otpExpirySeconds: 300,
  otpResendCooldownSeconds: 45,
  otpMaxWrongAttempts: 5,
  otpPauseDurationSeconds: 900,
  otpDeliveryMaxRetries: 3,
  otpFallbackChannelEnabled: true,
  maxFailedSignInAttempts: 5,
  lockoutDurationSeconds: 900,
  passwordMinLength: 12,
  breachedPasswordCheckEnabled: true,
  passwordHashAlgorithm: "argon2id",
  accessTokenTtlSeconds: 900,
  webSessionMaxSeconds: 43200,
  rotateRefreshTokens: true,
  retainDraftsOnSessionExpiry: true,
  deletionGraceDays: 30,
  adminInviteTtlHours: 72,
  employeeInviteTtlDays: 7,
  orgSupplierInviteTtlDays: 7,
  moderatorCodePostTripHours: 24,
  newDeviceAlertRoles: ["admin", "organization_owner"],
  roleAuthPolicies: ROLE_AUTH_DEFAULTS,
};

export function createDefaultOrganizationSettings(params: {
  tenantId: string;
  countryCode?: SupportedCountryCode;
  planTier?: "starter" | "growth" | "enterprise";
  billingContactName?: string | null;
  billingContactEmail?: string | null;
  billingContactPhone?: string | null;
  billingAddress?: string | null;
  invoiceLanguage?: SupportedLocale;
  taxNumber?: string | null;
  safetyLeadName?: string | null;
  safetyHotlinePhone?: string | null;
}): OrganizationSettingsData {
  const country = params.countryCode ?? "EG";
  const market = DEFAULT_SYSTEM_SETTINGS.markets[country] ?? DEFAULT_SYSTEM_SETTINGS.markets.EG;

  return {
    tenantId: params.tenantId,
    timeZone: market.timeZone,
    defaultLanguage: "ar",
    defaultCurrency: market.currency,
    seatSelfSelectionEnabled: false,
    seatPriorityWindowMinutes: 60,
    childTrackingEnabledByDefault: false,
    operationsContactPhone: params.billingContactPhone ?? null,
    operationsContactEmail: params.billingContactEmail ?? null,
    safetyLeadName: params.safetyLeadName ?? null,
    safetyHotlinePhone: params.safetyHotlinePhone ?? null,
    billingContactName: params.billingContactName ?? null,
    billingContactEmail: params.billingContactEmail ?? null,
    billingContactPhone: params.billingContactPhone ?? null,
    billingAddress: params.billingAddress ?? null,
    invoiceLanguage: params.invoiceLanguage ?? "ar",
    taxNumber: params.taxNumber ?? null,
    b2bInvoicingEnabled: true,
    customBrandingEnabled: false,
    logoUrl: null,
    primaryColorHex: null,
    secondaryColorHex: null,
    crmProvider: null,
    webhookEndpoints: [],
  };
}

/**
 * Enforces plan-based feature gates (CON-06, FR-ORG-05, D-05, SCR-ORG-03) on organization settings updates.
 */
export function validateOrganizationSettingsAgainstPlan(
  planTier: "starter" | "growth" | "enterprise",
  patch: Partial<
    Pick<
      OrganizationSettingsData,
      | "seatSelfSelectionEnabled"
      | "childTrackingEnabledByDefault"
      | "customBrandingEnabled"
      | "webhookEndpoints"
    >
  >,
): OrganizationSettingsValidationResult {
  const plan = findPlanCatalogEntry("organization", planTier);
  if (!plan) {
    return {
      valid: false,
      reason: `Unknown organization plan tier "${planTier}"`,
      field: "planTier",
    };
  }

  if (patch.seatSelfSelectionEnabled === true && !plan.features.seatSelfSelection) {
    return {
      valid: false,
      field: "seatSelfSelectionEnabled",
      reason: `Traveler seat self-selection requires Growth or Enterprise plan (current plan: ${planTier})`,
    };
  }

  if (patch.childTrackingEnabledByDefault === true && !plan.features.childTracking) {
    return {
      valid: false,
      field: "childTrackingEnabledByDefault",
      reason: `Default child tracking requires Growth or Enterprise plan (current plan: ${planTier})`,
    };
  }

  if (patch.customBrandingEnabled === true && !plan.features.customBranding) {
    return {
      valid: false,
      field: "customBrandingEnabled",
      reason: `Custom organization branding requires Enterprise plan (current plan: ${planTier})`,
    };
  }

  if (
    patch.webhookEndpoints &&
    plan.limits.webhookEndpointsMax !== null &&
    patch.webhookEndpoints.length > plan.limits.webhookEndpointsMax
  ) {
    return {
      valid: false,
      field: "webhookEndpoints",
      reason: `Webhook endpoint limit exceeded for ${planTier} plan (max ${plan.limits.webhookEndpointsMax})`,
    };
  }

  return { valid: true };
}
