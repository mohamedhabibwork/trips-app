// Shared TypeScript interfaces and types for @trips-app/domain. No I/O.

export type CurrencyCode = "EGP" | "SAR" | "AED";

export type Money = {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
};

export type SupportedCountryCode = "EG" | "SA" | "AE";
export type SupportedLocale = "ar" | "en";
export type PaymentGatewayCode = "stripe" | "paymob" | "fawry";

export type UserRole =
  | "traveler"
  | "parent"
  | "platform_driver"
  | "org_driver"
  | "platform_photographer"
  | "org_photographer"
  | "organization_owner"
  | "organization_employee"
  | "moderator"
  | "admin";

export type AdminSubRole = "super_admin" | "operations" | "finance";

export type ClientSurface = "web" | "mobile" | "pwa";

export type VerificationChannelRule =
  | "either_email_or_phone"
  | "both_email_and_phone"
  | "phone_only"
  | "invite_link_and_email"
  | "invite_link_and_phone";

export type PrimarySignInMethod = "otp" | "password" | "staff_code";

export type SecondFactorRule = "none" | "totp" | "sms_or_totp" | "staff_code";

export type PlanScope = "account" | "organization" | "none";

export type OrgPermissionArea =
  | "trips"
  | "bookings"
  | "accounting"
  | "coupons"
  | "employees"
  | "fleet"
  | "subscription"
  | "tracking"
  | "settings";

export type OrgPermissionLevel = "none" | "view" | "manage";

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

export type AccountStatus =
  | "pending_verification"
  | "active"
  | "suspended"
  | "deletion_requested"
  | "deleted";

export type AccountRoleStatus = "pending_approval" | "active" | "paused" | "suspended" | "revoked";

export type OtpChannel = "sms" | "email";

export type OtpPurpose =
  | "registration"
  | "sign_in"
  | "password_reset"
  | "contact_change"
  | "staff_2fa";

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

export type ApplicationState =
  | "Submitted"
  | "Pending Review"
  | "Changes Requested"
  | "Approved"
  | "Rejected"
  | "Appealed"
  | "Closed";

export type SupplierApplicationType = "organization" | "platform_driver" | "platform_photographer";

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
  | "CANCELLATION_REASON";

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
  code: string;
  value: string;
  name: LookupLocalizedText;
  description: LookupLocalizedText | null;
  lookupTypeId: number;
  typeCode: string;
  parentId: number | null;
  parentCode: string | null;
  sortBy: number;
  isPublic: boolean;
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
}

export interface LookupTypeWithItemsDto extends LookupTypeDto {
  items: LookupItemDto[];
}
