// Shared TypeScript interfaces and types for @trips-app/domain. No I/O.

export const CURRENCY_CODES = ["EGP", "SAR", "AED"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type Money = {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
};

export const SUPPORTED_COUNTRY_CODES = ["EG", "SA", "AE"] as const;
export type SupportedCountryCode = (typeof SUPPORTED_COUNTRY_CODES)[number];

export const SUPPORTED_LOCALES = ["ar", "en"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export const PAYMENT_GATEWAY_CODES = ["stripe", "paymob", "tap", "fawry", "stub"] as const;
export type PaymentGatewayCode = (typeof PAYMENT_GATEWAY_CODES)[number];

export const USER_ROLES = [
  "traveler",
  "parent",
  "platform_driver",
  "org_driver",
  "platform_photographer",
  "org_photographer",
  "organization_owner",
  "organization_employee",
  "moderator",
  "admin",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ADMIN_SUB_ROLES = ["super_admin", "operations", "finance"] as const;
export type AdminSubRole = (typeof ADMIN_SUB_ROLES)[number];

export const CLIENT_SURFACES = ["web", "mobile", "pwa"] as const;
export type ClientSurface = (typeof CLIENT_SURFACES)[number];

export const VERIFICATION_CHANNEL_RULES = [
  "either_email_or_phone",
  "both_email_and_phone",
  "phone_only",
  "invite_link_and_email",
  "invite_link_and_phone",
] as const;
export type VerificationChannelRule = (typeof VERIFICATION_CHANNEL_RULES)[number];

export const PRIMARY_SIGN_IN_METHODS = ["otp", "password", "staff_code"] as const;
export type PrimarySignInMethod = (typeof PRIMARY_SIGN_IN_METHODS)[number];

export const SECOND_FACTOR_RULES = ["none", "totp", "sms_or_totp", "staff_code"] as const;
export type SecondFactorRule = (typeof SECOND_FACTOR_RULES)[number];

export const PLAN_SCOPES = ["account", "organization", "none"] as const;
export type PlanScope = (typeof PLAN_SCOPES)[number];

export const ORG_PERMISSION_AREAS = [
  "trips",
  "bookings",
  "accounting",
  "coupons",
  "employees",
  "fleet",
  "subscription",
  "tracking",
  "settings",
] as const;
export type OrgPermissionArea = (typeof ORG_PERMISSION_AREAS)[number];

export const ORG_PERMISSION_LEVELS = ["none", "view", "manage"] as const;
export type OrgPermissionLevel = (typeof ORG_PERMISSION_LEVELS)[number];

export type OrgPermissionMatrix = Record<OrgPermissionArea, OrgPermissionLevel>;

export interface PermissionCatalogItem {
  area: OrgPermissionArea;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  allowedLevels: readonly OrgPermissionLevel[];
  mappedScreens: readonly string[];
  ownerOnlyByDefault: boolean;
}

export interface AdminSubRoleMetadata {
  subRole: AdminSubRole;
  nameEn: string;
  nameAr: string;
  allowedActions: readonly string[];
}

export interface RoleAuthPolicy {
  role: UserRole;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  selfRegistrationAllowed: boolean;
  allowedSurfaces: readonly ClientSurface[];
  requiredVerificationChannels: VerificationChannelRule;
  allowedPrimaryMethods: readonly PrimarySignInMethod[];
  requiredSecondFactor: SecondFactorRule;
  requiresApproval: boolean;
  planScope: PlanScope;
  defaultPlanTier: string | null;
  rateLimitPerMinute: number;
  subRoles: readonly AdminSubRoleMetadata[];
}

export interface PlanLimits {
  activeTripsPerMonth: number | null;
  vehiclesPerTrip: number | null;
  programsPerTrip: number | null;
  employeesMax: number | null;
  activeCouponsMax: number | null;
  portfolioPhotosMax: number | null;
  webhookEndpointsMax: number | null;
}

export interface PlanFeatures {
  platformSuppliers: boolean;
  seatSelfSelection: boolean;
  childTracking: boolean;
  customBranding: boolean;
  watermarks: boolean;
  receiptExport: boolean;
  vipEarlyAccess: boolean;
  prioritySeatWindow: boolean;
  analyticsDepth: "totals" | "date_range" | "per_traveler";
}

export interface PlanCatalogEntry {
  id: string;
  role: "traveler" | "organization" | "platform_driver" | "platform_photographer";
  tier: string;
  nameEn: string;
  nameAr: string;
  monthlyPriceMinor: number;
  annualPriceMinor: number;
  currencyCode: CurrencyCode;
  annualDiscountBps: number;
  trialDays: number;
  gracePeriodDays: number;
  limits: PlanLimits;
  features: PlanFeatures;
  isDefault: boolean;
  status: "active" | "retired";
}

export interface MarketSetting {
  countryCode: SupportedCountryCode;
  nameEn: string;
  nameAr: string;
  enabled: boolean;
  currency: CurrencyCode;
  timeZone: string;
  gateways: readonly PaymentGatewayCode[];
  zatcaEnabled: boolean;
}

export interface RefundPolicyTier {
  minHoursBeforeDeparture: number;
  refundPercent: number;
}

export interface SystemOperationalSettings {
  labTestDefaultDeadlineDays: number;
  labTestMinDeadlineDays: number;
  labTestMaxDeadlineDays: number;
  platformCommissionBps: number;
  annualBillingDiscountBps: number;
  subscriptionGraceDays: number;
  dunningRetryDays: readonly number[];
  fawryVoucherExpiryHours: number;
  seatHoldMinutes: number;
  negotiationExpiryHours: number;
  applicationReviewSlaWorkingDays: number;
  applicationChangesResponseDays: number;
  applicationChangesExtensionDays: number;
  rejectionReapplyBlockDays: number;
}

export interface SystemNotificationSettings {
  quietHoursStartLocal: string;
  quietHoursEndLocal: string;
  urgentCategories: readonly string[];
}

export interface SystemMaintenanceSettings {
  maintenanceMode: boolean;
  maintenanceMessageEn: string | null;
  maintenanceMessageAr: string | null;
  maintenanceNoticeHoursAhead: number;
  minIosVersion: string;
  minAndroidSdk: number;
  minMobileAppVersion: string;
}

export interface SystemFeatureFlags {
  p1_foundation: boolean;
  p2_single_vehicle_mvp: boolean;
  p3_multi_vehicle_checkin: boolean;
  p4_marketplace_supply: boolean;
  p5_subscriptions_coupons: boolean;
  p6_live_tracking_public_api: boolean;
}

export interface SystemSettingsData {
  id: string;
  markets: Record<SupportedCountryCode, MarketSetting>;
  operational: SystemOperationalSettings;
  refundPolicyTiers: readonly RefundPolicyTier[];
  notifications: SystemNotificationSettings;
  maintenanceAndSupport: SystemMaintenanceSettings;
  featureFlags: SystemFeatureFlags;
}

export interface AuthSettingsData {
  id: string;
  otpExpirySeconds: number;
  otpResendCooldownSeconds: number;
  otpMaxWrongAttempts: number;
  otpPauseDurationSeconds: number;
  otpDeliveryMaxRetries: number;
  otpFallbackChannelEnabled: boolean;
  maxFailedSignInAttempts: number;
  lockoutDurationSeconds: number;
  passwordMinLength: number;
  breachedPasswordCheckEnabled: boolean;
  passwordHashAlgorithm: "argon2id";
  accessTokenTtlSeconds: number;
  webSessionMaxSeconds: number;
  rotateRefreshTokens: boolean;
  retainDraftsOnSessionExpiry: boolean;
  deletionGraceDays: number;
  adminInviteTtlHours: number;
  employeeInviteTtlDays: number;
  orgSupplierInviteTtlDays: number;
  moderatorCodePostTripHours: number;
  newDeviceAlertRoles: readonly UserRole[];
  roleAuthPolicies: Record<UserRole, RoleAuthPolicy>;
}

export interface OrganizationWebhookEndpoint {
  id: string;
  url: string;
  secretHash: string;
  events: readonly string[];
  enabled: boolean;
}

export interface OrganizationSettingsData {
  tenantId: string;
  timeZone: string;
  defaultLanguage: SupportedLocale;
  defaultCurrency: CurrencyCode;
  seatSelfSelectionEnabled: boolean;
  seatPriorityWindowMinutes: number;
  childTrackingEnabledByDefault: boolean;
  operationsContactPhone: string | null;
  operationsContactEmail: string | null;
  safetyLeadName: string | null;
  safetyHotlinePhone: string | null;
  billingContactName: string | null;
  billingContactEmail: string | null;
  billingContactPhone: string | null;
  billingAddress: string | null;
  invoiceLanguage: SupportedLocale;
  taxNumber: string | null;
  b2bInvoicingEnabled: boolean;
  customBrandingEnabled: boolean;
  logoUrl: string | null;
  primaryColorHex: string | null;
  secondaryColorHex: string | null;
  crmProvider: string | null;
  webhookEndpoints: readonly OrganizationWebhookEndpoint[];
}

export interface OrganizationSettingsValidationResult {
  valid: boolean;
  reason?: string;
  field?: string;
}

export const ACCOUNT_STATUSES = [
  "pending_verification",
  "active",
  "suspended",
  "deletion_requested",
  "deleted",
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_ROLE_STATUSES = [
  "pending_approval",
  "active",
  "paused",
  "suspended",
  "revoked",
] as const;
export type AccountRoleStatus = (typeof ACCOUNT_ROLE_STATUSES)[number];

export const OTP_CHANNELS = ["sms", "email"] as const;
export type OtpChannel = (typeof OTP_CHANNELS)[number];

export const OTP_PURPOSES = [
  "registration",
  "sign_in",
  "password_reset",
  "contact_change",
  "staff_2fa",
] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export const OTP_DELIVERY_STATUSES = ["sent", "retrying", "failed_fallback_available"] as const;
export type OtpDeliveryStatus = (typeof OTP_DELIVERY_STATUSES)[number];

export const ORGANIZATION_STATUSES = [
  "pending_approval",
  "active",
  "suspended",
  "deleted",
] as const;
export type OrganizationStatus = (typeof ORGANIZATION_STATUSES)[number];

export const ORGANIZATION_PLAN_TIERS = ["starter", "growth", "enterprise"] as const;
export type OrganizationPlanTier = (typeof ORGANIZATION_PLAN_TIERS)[number];

export const PAYOUT_METHODS = ["bank_transfer", "mobile_wallet"] as const;
export type PayoutMethod = (typeof PAYOUT_METHODS)[number];

export const EMPLOYEE_MEMBERSHIP_STATUSES = ["invited", "active", "suspended", "revoked"] as const;
export type EmployeeMembershipStatus = (typeof EMPLOYEE_MEMBERSHIP_STATUSES)[number];

export const MODERATOR_ASSIGNMENT_STATUSES = ["assigned", "active", "expired", "revoked"] as const;
export type ModeratorAssignmentStatus = (typeof MODERATOR_ASSIGNMENT_STATUSES)[number];

export interface RegistrationValidationInput {
  role: UserRole;
  surface: ClientSurface;
  email?: string | null;
  phone?: string | null;
  authSettings?: AuthSettingsData;
}

export interface ValidationOutcome {
  valid: boolean;
  code?: "VALIDATION_ERROR" | "FORBIDDEN" | "UNAUTHORIZED" | "RATE_LIMITED";
  reason?: string;
  field?: string;
}

export interface OtpAttemptState {
  wrongAttempts: number;
  pausedUntil: Date | null;
  expiresAt: Date;
  consumedAt: Date | null;
}

export interface OtpEvaluationResult {
  allowed: boolean;
  matched: boolean;
  nextWrongAttempts: number;
  nextPausedUntil: Date | null;
  reason?: string;
  code?: "VALIDATION_ERROR" | "RATE_LIMITED";
}

export interface SignInLockoutEvaluation {
  locked: boolean;
  nextFailedAttempts: number;
  nextLockedUntil: Date | null;
  remainingLockoutSeconds: number;
}

export interface AccessTokenClaims {
  sub: string;
  sid: string;
  role: UserRole;
  adminSubRole?: AdminSubRole | null;
  tenantId?: string | null;
  planTier?: string | null;
  permissions?: Partial<OrgPermissionMatrix> | null;
  moderatorVehicleId?: string | null;
  moderatorTripId?: string | null;
  iat: number;
  exp: number;
}

export const APPLICATION_STATES = [
  "Submitted",
  "Pending Review",
  "Changes Requested",
  "Approved",
  "Rejected",
  "Appealed",
  "Closed",
] as const;
export type ApplicationState = (typeof APPLICATION_STATES)[number];

export const SUPPLIER_APPLICATION_TYPES = [
  "organization",
  "platform_driver",
  "platform_photographer",
] as const;
export type SupplierApplicationType = (typeof SUPPLIER_APPLICATION_TYPES)[number];

export const APPLICATION_DOCUMENT_VERIFIED_STATUSES = ["pending", "verified", "rejected"] as const;
export type ApplicationDocumentVerifiedStatus =
  (typeof APPLICATION_DOCUMENT_VERIFIED_STATUSES)[number];

export const CONSENT_TYPES = [
  "driver_lab_test",
  "driver_background_check",
  "child_tracking_guardian",
  "terms_of_service",
  "privacy_policy",
] as const;
export type ConsentType = (typeof CONSENT_TYPES)[number];

export const DRIVER_PROFILE_SCOPES = ["platform", "organization"] as const;
export type DriverProfileScope = (typeof DRIVER_PROFILE_SCOPES)[number];

export const DRIVER_PLAN_TIERS = ["basic", "professional", "premium"] as const;
export type DriverPlanTier = (typeof DRIVER_PLAN_TIERS)[number];

export const DRIVER_PROFILE_STATUSES = [
  "pending_approval",
  "active",
  "paused_lab_test",
  "suspended",
] as const;
export type DriverProfileStatus = (typeof DRIVER_PROFILE_STATUSES)[number];

export const PHOTOGRAPHER_PLAN_TIERS = ["basic", "studio", "pro"] as const;
export type PhotographerPlanTier = (typeof PHOTOGRAPHER_PLAN_TIERS)[number];

export const PHOTOGRAPHER_PROFILE_STATUSES = ["pending_approval", "active", "suspended"] as const;
export type PhotographerProfileStatus = (typeof PHOTOGRAPHER_PROFILE_STATUSES)[number];

export interface OrganizationApplicationSubmission {
  legalEntityName: string;
  commercialRegNumber: string;
  taxNumber: string;
  tourismLicenseNumber: string;
  tourismLicenseExpiry: Date;
  countryCode: SupportedCountryCode;
  headquartersAddress: string;
  signatoryFullName: string;
  signatoryNationalId: string;
  signatoryRoleTitle: string;
  payoutMethod: "bank_transfer" | "mobile_wallet";
  payoutIbanOrWallet: string;
  billingContactName: string;
  billingContactEmail: string;
  billingContactPhone: string;
  billingAddress: string;
  invoiceLanguage: SupportedLocale;
  childSafetyProgramOptIn: boolean;
  safetyLeadName?: string | null;
  safetyHotlinePhone?: string | null;
  emergencyEscalationAcknowledged?: boolean;
  documentTypes: readonly string[];
}

export interface DriverApplicationSubmission {
  nationalId: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiry: Date;
  yearsOfExperience: number;
  serviceAreas: readonly string[];
  hasOwnVehicle: boolean;
  vehicleMakeModel?: string | null;
  vehicleYear?: number | null;
  vehiclePlateNumber?: string | null;
  vehicleSeatCapacity?: number | null;
  insurancePolicyNumber?: string | null;
  insuranceExpiry?: Date | null;
  labTestConsentSigned: boolean;
  backgroundCheckConsentSigned?: boolean;
  labResultSubmittedAt: Date;
  documentTypes: readonly string[];
}

export interface PhotographerApplicationSubmission {
  nationalId: string;
  yearsOfExperience: number;
  cameraBodies: readonly string[];
  lenses: readonly string[];
  hasDroneLicense: boolean;
  serviceRegions: readonly string[];
  specialties: readonly string[];
  portfolioPhotoCount: number;
  sampleAlbums: readonly { title: string; photoCount: number }[];
  documentTypes: readonly string[];
}

export interface ApplicationValidationResult {
  valid: boolean;
  errors: { field: string; message: string }[];
}

export type ErrorCategory =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "PLAN_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "BUSINESS_RULE_VIOLATION"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

export type ErrorHttpStatus = 400 | 401 | 402 | 403 | 404 | 409 | 412 | 422 | 429 | 500 | 503;

export type SharedErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "PLAN_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PRECONDITION_FAILED"
  | "BUSINESS_RULE_VIOLATION"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE"
  | "INVALID_INPUT"
  | "IDEMPOTENCY_KEY_CONFLICT"
  | "AUTH_INVALID_CREDENTIALS"
  | "AUTH_TOKEN_EXPIRED"
  | "AUTH_SESSION_EXPIRED"
  | "AUTH_ACCOUNT_LOCKED"
  | "AUTH_ACCOUNT_SUSPENDED"
  | "AUTH_DELETION_PENDING"
  | "AUTH_OTP_EXPIRED"
  | "AUTH_OTP_INVALID"
  | "AUTH_OTP_PAUSED"
  | "AUTH_OTP_COOLDOWN"
  | "AUTH_MFA_REQUIRED"
  | "AUTH_VERIFICATION_REQUIRED"
  | "AUTH_WEB_ONLY_REGISTRATION"
  | "ROLE_FORBIDDEN"
  | "PERMISSION_DENIED"
  | "ADMIN_SUBROLE_FORBIDDEN"
  | "MODERATOR_SCOPE_FORBIDDEN"
  | "RESOURCE_NOT_FOUND"
  | "TENANT_NOT_FOUND"
  | "PLAN_LIMIT_EXCEEDED"
  | "SUBSCRIPTION_INACTIVE"
  | "FOUR_EYES_APPROVAL_REQUIRED"
  | "DUPLICATE_RESOURCE"
  | "INVALID_STATE_TRANSITION"
  | "ONBOARDING_COOLDOWN_ACTIVE"
  | "ONBOARDING_CHANGES_WINDOW_EXPIRED"
  | "SEAT_NOT_AVAILABLE"
  | "SEAT_HOLD_EXPIRED"
  | "COUPON_INVALID_OR_EXPIRED"
  | "DRIVER_LAB_TEST_RESTRICTED"
  | "PAYMENT_GATEWAY_ERROR";

export interface ApiErrorFieldDetail {
  field: string;
  code: string;
  message: string;
}

export interface SharedErrorDefinition {
  code: SharedErrorCode;
  category: ErrorCategory;
  status: ErrorHttpStatus;
  retryable: boolean;
  defaultMessage: Record<SupportedLocale, string>;
}

export interface ServiceErrorOptions {
  details?: Record<string, unknown>;
  fieldErrors?: ApiErrorFieldDetail[];
  retryAfterSeconds?: number;
  serviceId?: string;
  cause?: unknown;
}

export interface ApiPaginationMeta {
  cursor?: string | null;
  nextCursor?: string | null;
  hasMore?: boolean;
  limit?: number;
  total?: number;
}

export interface ApiResponseMeta {
  requestId: string;
  timestamp: string;
  locale: SupportedLocale;
  service?: string;
  pagination?: ApiPaginationMeta;
}

export interface ApiErrorPayload {
  code: SharedErrorCode;
  category: ErrorCategory;
  status: ErrorHttpStatus;
  message: string;
  fieldErrors?: ApiErrorFieldDetail[];
  details?: Record<string, unknown>;
  retryAfterSeconds?: number;
}

/**
 * Standardized Backend Success Envelope (SRS IF-03).
 */
export interface ApiSuccessResponse<TData = unknown> {
  success: true;
  data: TData;
  error: null;
  requestId: string;
  meta: ApiResponseMeta;
}

/**
 * Standardized Backend Failure Envelope (SRS IF-03, IF-04, IF-08, IF-09).
 */
export interface ApiErrorResponse {
  success: false;
  data: null;
  error: ApiErrorPayload;
  requestId: string;
  meta: ApiResponseMeta;
}

/**
 * Unified Backend Response Envelope across all cases (success and failure).
 */
export type ApiResponse<TData = unknown> = ApiSuccessResponse<TData> | ApiErrorResponse;

export interface CreateSuccessResponseOptions {
  requestId?: string;
  locale?: SupportedLocale;
  service?: string;
  timestamp?: string;
  pagination?: ApiPaginationMeta;
}

export interface CreateErrorResponseInput {
  code: SharedErrorCode;
  message?: string;
  locale?: SupportedLocale;
  requestId?: string;
  service?: string;
  timestamp?: string;
  fieldErrors?: ApiErrorFieldDetail[];
  details?: Record<string, unknown>;
  retryAfterSeconds?: number;
}

export interface LookupLocalizedText {
  readonly en: string;
  readonly ar: string;
}

export type LookupTypeCode =
  | "COUNTRY"
  | "CURRENCY"
  | "LANGUAGE"
  | "USER_ROLE"
  | "ADMIN_SUB_ROLE"
  | "CLIENT_SURFACE"
  | "PAYMENT_GATEWAY"
  | "PAYOUT_METHOD"
  | "ORG_PERMISSION_AREA"
  | "ORG_PERMISSION_LEVEL"
  | "APPLICATION_TYPE"
  | "APPLICATION_STATE"
  | "DOCUMENT_TYPE"
  | "CONSENT_TYPE"
  | "APPLICATION_DECISION_REASON"
  | "DRIVER_LICENSE_CATEGORY"
  | "SERVICE_REGION"
  | "CAMERA_BODY"
  | "CAMERA_LENS"
  | "PHOTOGRAPHER_SPECIALTY"
  | "TRIP_CATEGORY"
  | "VEHICLE_TYPE"
  | "CANCELLATION_REASON"
  // 36 types added by PRD LK-20 (+ `VEHICLE_AMENITY`, which replaces the hardcoded
  // `VEHICLE_AMENITY_CODES` enum in `packages/services/fleet/src/model/index.ts`).
  | "TRIP_STATE"
  | "COUPON_TYPE"
  | "COUPON_AUDIENCE"
  | "COUPON_STATE"
  | "DISPUTE_STATE"
  | "SETTLEMENT_STATE"
  | "RECONCILIATION_STATE"
  | "LAB_TEST_STATE"
  | "LAB_TEST_TYPE"
  | "ACCOUNT_STATUS"
  | "ACCOUNT_ACTION"
  | "DATA_REQUEST_TYPE"
  | "DATA_REQUEST_STATE"
  | "DEAL_STATE"
  | "REFUND_DECISION"
  | "SUBSCRIPTION_BILLING_STATUS"
  | "INVOICE_TYPE"
  | "STAFF_ASSIGNMENT_SOURCE"
  | "PUBLISH_MODE"
  | "PROGRAM_PRICING_MODEL"
  | "VEHICLE_REGISTRATION_STATUS"
  | "VEHICLE_AMENITY"
  | "SUPPLIER_STATUS"
  | "SAFETY_CASE_STATE"
  | "SEAT_STATE"
  | "CONTACT_CHANNEL"
  | "ALBUM_PRIVACY"
  | "PROFILE_VISIBILITY"
  | "INCIDENT_CATEGORY"
  | "HEADCOUNT_DIFFERENCE_REASON"
  | "TIMEZONE"
  | "WEBHOOK_EVENT_TYPE"
  | "APPEAL_DECISION"
  | "SEAT_ASSIGNMENT_MODE"
  | "DRIVER_RUN_STATE"
  | "ORG_ROLE_TITLE";

export interface LookupTypeSeedDefinition {
  readonly code: LookupTypeCode;
  readonly value: string;
  readonly name: LookupLocalizedText;
  readonly description: LookupLocalizedText;
  readonly parentTypeCode?: LookupTypeCode | null;
  readonly sortBy: number;
  readonly isPublic: boolean;
  readonly isSystem: boolean;
}

export interface LookupSeedDefinition {
  readonly typeCode: LookupTypeCode;
  readonly code: string;
  readonly value: string;
  readonly name: LookupLocalizedText;
  readonly description?: LookupLocalizedText | null;
  readonly parentTypeCode?: LookupTypeCode | null;
  readonly parentLookupCode?: string | null;
  readonly sortBy: number;
  readonly isPublic: boolean;
}

export interface LookupTypeRecord {
  id: number;
  uuid: string;
  name: LookupLocalizedText;
  description: LookupLocalizedText | null;
  value: string;
  code: string;
  parentId: number | null;
  sortBy: number;
  isPublic: boolean;
  isSystem: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface LookupRecord {
  id: number;
  uuid: string;
  name: LookupLocalizedText;
  description: LookupLocalizedText | null;
  value: string;
  code: string;
  lookupTypeId: number;
  parentId: number | null;
  sortBy: number;
  isPublic: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface LookupItemDto {
  id: number;
  uuid: string;
  /** The public identifier; the only value an entity ever stores or a select ever submits. */
  code: string;
  /** Legacy machine token. Never rendered, never compared, never sent as a select value. */
  value: string;
  name: LookupLocalizedText;
  description: LookupLocalizedText | null;
  lookupTypeId: number;
  typeCode: string;
  parentId: number | null;
  parentCode: string | null;
  sortBy: number;
  isPublic: boolean;
  /** `false` means retired from option lists but still resolvable (LK-01). */
  isActive: boolean;
}

export interface LookupTypeDto {
  id: number;
  uuid: string;
  code: string;
  value: string;
  name: LookupLocalizedText;
  description: LookupLocalizedText | null;
  parentId: number | null;
  parentCode: string | null;
  sortBy: number;
  isPublic: boolean;
  isSystem: boolean;
  /** `false` means the whole type is unavailable; its fields render the PRD §5 case (a). */
  isActive: boolean;
}

export interface LookupTypeWithItemsDto extends LookupTypeDto {
  items: LookupItemDto[];
}

/** `itemCount` counts active, non-deleted items only (LK-08). */
export interface LookupTypeSummaryDto extends LookupTypeDto {
  itemCount: number;
}

/**
 * Closed read-status vocabulary (design §11.4). `not_seeded` replaces the deleted static fallback:
 * an empty table is a visible, retryable state, never fabricated rows (LK-07).
 */
export const LOOKUP_TYPE_READ_STATUSES = ["ok", "type_not_found", "not_seeded"] as const;
export type LookupTypeReadStatus = (typeof LOOKUP_TYPE_READ_STATUSES)[number];

/** Status of resolving one stored value against the table, across all four flag combinations. */
export const LOOKUP_RESOLVE_STATUSES = [
  "active",
  "inactive",
  "deleted",
  "not_found",
  "type_not_found",
] as const;
export type LookupResolveStatus = (typeof LOOKUP_RESOLVE_STATUSES)[number];

/** Verdict for one submitted code (LK-12). */
export const LOOKUP_VALIDATE_REASONS = [
  "ok",
  "inactive",
  "deleted",
  "unknown_code",
  "unknown_type",
] as const;
export type LookupValidateReason = (typeof LOOKUP_VALIDATE_REASONS)[number];

/** Compact form used by services on the write path (design §1, layering constraint). */
export const LOOKUP_STATUSES = [
  "active",
  "inactive",
  "deleted",
  "unknown",
  "unknown_type",
] as const;
export type LookupStatus = (typeof LOOKUP_STATUSES)[number];

/** One entry of a `validate` response (LK-12). */
export interface LookupValidateResult {
  code: string;
  valid: boolean;
  reason: LookupValidateReason;
}

export const TRAVELER_PLAN_CODES = ["free", "explorer", "vip"] as const;
export type TravelerPlanCode = (typeof TRAVELER_PLAN_CODES)[number];

export const PRIVACY_REQUEST_TYPES = ["data_export", "account_deletion"] as const;
export type PrivacyRequestType = (typeof PRIVACY_REQUEST_TYPES)[number];

export const PRIVACY_REQUEST_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;
export type PrivacyRequestStatus = (typeof PRIVACY_REQUEST_STATUSES)[number];

export const VEHICLE_TYPE_SCOPES = ["platform", "organization"] as const;
export type VehicleTypeScope = (typeof VEHICLE_TYPE_SCOPES)[number];

export const VEHICLE_TYPE_STATUSES = ["active", "archived"] as const;
export type VehicleTypeStatus = (typeof VEHICLE_TYPE_STATUSES)[number];

export const VEHICLE_REGISTRATION_STATUSES = ["valid", "pending_renewal", "expired"] as const;
export type VehicleRegistrationStatus = (typeof VEHICLE_REGISTRATION_STATUSES)[number];

export const VEHICLE_STATUSES = ["active", "maintenance", "retired"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const SEAT_LAYOUT_CELL_TYPES = [
  "seat",
  "aisle",
  "driver",
  "moderator",
  "door",
  "empty",
] as const;
export type SeatLayoutCellType = (typeof SEAT_LAYOUT_CELL_TYPES)[number];

export interface SeatLayoutCell {
  row: number;
  col: number;
  type: SeatLayoutCellType;
  seatLabel?: string | null;
  isAccessible?: boolean;
  isPriority?: boolean;
}

export interface SeatLayoutConfig {
  rows: number;
  cols: number;
  cells: readonly SeatLayoutCell[];
}

export const TRIP_STATES = [
  "draft",
  "published",
  "scheduled",
  "Selection",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type TripState = (typeof TRIP_STATES)[number];

export const TRIP_SEAT_ASSIGNMENT_MODES = ["organization_assigned", "traveler_choice"] as const;
export type TripSeatAssignmentMode = (typeof TRIP_SEAT_ASSIGNMENT_MODES)[number];

export const TRIP_PUBLISH_MODES = ["draft", "public", "targeted"] as const;
export type TripPublishMode = (typeof TRIP_PUBLISH_MODES)[number];

export const TRIP_STAFF_SOURCES = ["org_staff", "platform_supplier", "unassigned"] as const;
export type TripStaffSource = (typeof TRIP_STAFF_SOURCES)[number];

export interface TripRoutePoint {
  nameAr: string;
  nameEn: string;
  latitude?: number | null;
  longitude?: number | null;
  regionLookupCode?: string | null;
}

export interface TripWizardStepCompletion {
  basics: boolean;
  schedule: boolean;
  vehicles: boolean;
  staffing: boolean;
  programs: boolean;
  seating: boolean;
  pricing: boolean;
  publish: boolean;
}

export const TRIP_PROGRAM_STATUSES = ["active", "cancelled"] as const;
export type TripProgramStatus = (typeof TRIP_PROGRAM_STATUSES)[number];

export const SUPPLIER_ROLES = [
  "platform_driver",
  "org_driver",
  "platform_photographer",
  "org_photographer",
] as const;
export type SupplierRole = (typeof SUPPLIER_ROLES)[number];

export const PLATFORM_SUPPLIER_ROLES = ["platform_driver", "platform_photographer"] as const;
export type PlatformSupplierRole = (typeof PLATFORM_SUPPLIER_ROLES)[number];

export const AVAILABILITY_BLOCK_TYPES = ["available", "unavailable", "assigned_trip"] as const;
export type AvailabilityBlockType = (typeof AVAILABILITY_BLOCK_TYPES)[number];

export const NEGOTIATION_STATUSES = [
  "pending_supplier",
  "countered_by_supplier",
  "countered_by_org",
  "accepted",
  "declined",
  "expired",
  "cancelled",
] as const;
export type NegotiationStatus = (typeof NEGOTIATION_STATUSES)[number];

export const NEGOTIATION_OFFER_PARTIES = ["organization", "supplier"] as const;
export type NegotiationOfferParty = (typeof NEGOTIATION_OFFER_PARTIES)[number];

export const SEAT_INVENTORY_STATUSES = ["available", "held", "reserved", "blocked"] as const;
export type SeatInventoryStatus = (typeof SEAT_INVENTORY_STATUSES)[number];

export const COUPON_SCOPES = ["organization", "platform", "driver"] as const;
export type CouponScope = (typeof COUPON_SCOPES)[number];

export const COUPON_DISCOUNT_TYPES = ["percentage", "fixed_amount"] as const;
export type CouponDiscountType = (typeof COUPON_DISCOUNT_TYPES)[number];

export const COUPON_STATUSES = ["active", "paused", "expired"] as const;
export type CouponStatus = (typeof COUPON_STATUSES)[number];

export const BOOKING_STATUSES = [
  "pending_payment",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
  "refunded",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingPassenger {
  id: string;
  fullName: string;
  isChild: boolean;
  age?: number | null;
  seatLabel?: string | null;
  guardianPhoneE164?: string | null;
}

export const PAYMENT_PURPOSES = ["trip_booking", "subscription_upgrade"] as const;
export type PaymentPurpose = (typeof PAYMENT_PURPOSES)[number];

export const PAYMENT_TRANSACTION_STATUSES = [
  "pending",
  "requires_action",
  "succeeded",
  "failed",
  "refunded",
  "disputed",
] as const;
export type PaymentTransactionStatus = (typeof PAYMENT_TRANSACTION_STATUSES)[number];

export const DISPUTE_RESOLUTION_STATUSES = [
  "open",
  "resolved_refund",
  "resolved_merchant",
] as const;
export type DisputeResolutionStatus = (typeof DISPUTE_RESOLUTION_STATUSES)[number];

export const SUBSCRIPTION_SCOPES = ["account", "organization"] as const;
export type SubscriptionScope = (typeof SUBSCRIPTION_SCOPES)[number];

export const SUBSCRIPTION_ROLES = [
  "traveler",
  "organization",
  "platform_driver",
  "platform_photographer",
] as const;
export type SubscriptionRole = (typeof SUBSCRIPTION_ROLES)[number];

export const SUBSCRIPTION_BILLING_CYCLES = ["monthly", "annual"] as const;
export type SubscriptionBillingCycle = (typeof SUBSCRIPTION_BILLING_CYCLES)[number];

export const SUBSCRIPTION_RECORD_STATUSES = [
  "active",
  "trialing",
  "past_due",
  "cancelled",
] as const;
export type SubscriptionRecordStatus = (typeof SUBSCRIPTION_RECORD_STATUSES)[number];

export const PLAN_CATALOG_STATUSES = ["active", "retired"] as const;
export type PlanCatalogStatus = (typeof PLAN_CATALOG_STATUSES)[number];

export const LEDGER_ENTRY_TYPES = [
  "booking_revenue",
  "platform_commission",
  "supplier_payout",
  "refund_debit",
  "payout_settlement",
] as const;
export type LedgerEntryType = (typeof LEDGER_ENTRY_TYPES)[number];

export const LEDGER_ENTRY_DIRECTIONS = ["credit", "debit"] as const;
export type LedgerEntryDirection = (typeof LEDGER_ENTRY_DIRECTIONS)[number];

export const LEDGER_ENTRY_STATUSES = ["posted", "settled", "reconciliation_exception"] as const;
export type LedgerEntryStatus = (typeof LEDGER_ENTRY_STATUSES)[number];

export const CHECK_IN_STATUSES = ["pending", "checked_in", "no_show"] as const;
export type CheckInStatus = (typeof CHECK_IN_STATUSES)[number];

export const CHECK_IN_METHODS = ["qr_scan", "manual_override"] as const;
export type CheckInMethod = (typeof CHECK_IN_METHODS)[number];

export const TRACKING_EVENT_TYPES = [
  "gps_ping",
  "checkpoint_reached",
  "child_boarded",
  "child_disembarked",
  "safety_alert",
  "headcount_verified",
] as const;
export type TrackingEventType = (typeof TRACKING_EVENT_TYPES)[number];

export const TRACKING_ALERT_SEVERITIES = ["info", "warning", "critical"] as const;
export type TrackingAlertSeverity = (typeof TRACKING_ALERT_SEVERITIES)[number];

export interface TrackingCoordinates {
  latitude: number;
  longitude: number;
  speedKmh?: number | null;
  headingDeg?: number | null;
}

export const PARENT_CHILD_LINK_STATUSES = ["active", "revoked"] as const;
export type ParentChildLinkStatus = (typeof PARENT_CHILD_LINK_STATUSES)[number];

export const TRIP_PHOTO_ALBUM_AUDIENCES = ["public", "selected_travelers"] as const;
export type TripPhotoAlbumAudience = (typeof TRIP_PHOTO_ALBUM_AUDIENCES)[number];

export const TRIP_PHOTO_ALBUM_STATUSES = ["draft", "published", "archived"] as const;
export type TripPhotoAlbumStatus = (typeof TRIP_PHOTO_ALBUM_STATUSES)[number];

export const ALBUM_SHARED_LINK_STATUSES = ["active", "revoked"] as const;
export type AlbumSharedLinkStatus = (typeof ALBUM_SHARED_LINK_STATUSES)[number];

export const DRIVER_LAB_TEST_STATUSES = [
  "requested",
  "booked",
  "result_uploaded",
  "verified_pass",
  "verified_fail",
  "expired",
] as const;
export type DriverLabTestStatus = (typeof DRIVER_LAB_TEST_STATUSES)[number];

/** What a requested lab test covers (SCR-ADM-14's test-type choice). */
export const DRIVER_LAB_TEST_KINDS = ["drug_screening", "medical_fitness", "both"] as const;
export type DriverLabTestKind = (typeof DRIVER_LAB_TEST_KINDS)[number];

export const NOTIFICATION_CATEGORIES = [
  "bookings",
  "trip_updates",
  "promotions",
  "security",
  "safety",
  "operations",
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const NOTIFICATION_DELIVERY_CHANNELS = ["in_app", "email", "sms", "push"] as const;
export type NotificationDeliveryChannel = (typeof NOTIFICATION_DELIVERY_CHANNELS)[number];

export const MEDIA_STORAGE_DISKS = ["uploads", "documents", "temp"] as const;
export type MediaStorageDisk = (typeof MEDIA_STORAGE_DISKS)[number];

export const UPLOADED_FILE_STATUSES = ["pending", "linked", "expired", "deleted"] as const;
export type UploadedFileStatus = (typeof UPLOADED_FILE_STATUSES)[number];
