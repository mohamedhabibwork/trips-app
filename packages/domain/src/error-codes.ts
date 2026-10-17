import type {
  ApiErrorFieldDetail,
  ErrorCategory,
  ErrorHttpStatus,
  ServiceErrorOptions,
  SharedErrorCode,
  SharedErrorDefinition,
} from "./types";

export type {
  ApiErrorFieldDetail,
  ErrorCategory,
  ErrorHttpStatus,
  ServiceErrorOptions,
  SharedErrorCode,
  SharedErrorDefinition,
} from "./types";

/**
 * SRS IF-04 Top-Level Error Categories.
 * Every shared error code resolves to one of these canonical categories and HTTP status codes.
 */
export const ERROR_CATEGORIES = [
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "PLAN_REQUIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "PRECONDITION_FAILED",
  "BUSINESS_RULE_VIOLATION",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
] as const satisfies readonly ErrorCategory[];

export const ERROR_CATEGORY_STATUS_MAP = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  PLAN_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  BUSINESS_RULE_VIOLATION: 422,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const satisfies Record<ErrorCategory, ErrorHttpStatus>;

/**
 * Centrally defined shared error codes referenced across all 26 backend services.
 * Services use these unified codes rather than service-specific error code unions.
 */
export const SHARED_ERROR_CODES = [
  // Canonical SRS IF-04 category codes
  "VALIDATION_ERROR",
  "UNAUTHORIZED",
  "PLAN_REQUIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "PRECONDITION_FAILED",
  "BUSINESS_RULE_VIOLATION",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",

  // Boundary & Request Integrity (IF-03, IF-06)
  "INVALID_INPUT",
  "IDEMPOTENCY_KEY_CONFLICT",

  // Authentication, Verification & Sessions (AUTH)
  "AUTH_INVALID_CREDENTIALS",
  "AUTH_TOKEN_EXPIRED",
  "AUTH_SESSION_EXPIRED",
  "AUTH_ACCOUNT_LOCKED",
  "AUTH_ACCOUNT_SUSPENDED",
  "AUTH_DELETION_PENDING",
  "AUTH_OTP_EXPIRED",
  "AUTH_OTP_INVALID",
  "AUTH_OTP_PAUSED",
  "AUTH_OTP_COOLDOWN",
  "AUTH_MFA_REQUIRED",
  "AUTH_VERIFICATION_REQUIRED",
  "AUTH_WEB_ONLY_REGISTRATION",

  // Authorization, Multi-Tenancy & Plans (ORG, EMP, SUB, ADM, MOD)
  "ROLE_FORBIDDEN",
  "PERMISSION_DENIED",
  "ADMIN_SUBROLE_FORBIDDEN",
  "MODERATOR_SCOPE_FORBIDDEN",
  "RESOURCE_NOT_FOUND",
  "TENANT_NOT_FOUND",
  "PLAN_LIMIT_EXCEEDED",
  "SUBSCRIPTION_INACTIVE",
  "FOUR_EYES_APPROVAL_REQUIRED",

  // Domain State, Onboarding & Business Rules (ONB, TRIP, BKG, PAY, SEAT, NEG, CPN, CHK, DRV)
  "DUPLICATE_RESOURCE",
  "INVALID_STATE_TRANSITION",
  "ONBOARDING_COOLDOWN_ACTIVE",
  "ONBOARDING_CHANGES_WINDOW_EXPIRED",
  "SEAT_NOT_AVAILABLE",
  "SEAT_HOLD_EXPIRED",
  "COUPON_INVALID_OR_EXPIRED",
  "DRIVER_LAB_TEST_RESTRICTED",
  "PAYMENT_GATEWAY_ERROR",
] as const satisfies readonly SharedErrorCode[];

export const SHARED_ERROR_CATALOG: Record<SharedErrorCode, SharedErrorDefinition> = {
  VALIDATION_ERROR: {
    code: "VALIDATION_ERROR",
    category: "VALIDATION_ERROR",
    status: 400,
    retryable: false,
    defaultMessage: {
      en: "The request input is invalid.",
      ar: "بيانات الطلب غير صالحة.",
    },
  },
  INVALID_INPUT: {
    code: "INVALID_INPUT",
    category: "VALIDATION_ERROR",
    status: 400,
    retryable: false,
    defaultMessage: {
      en: "One or more fields failed validation.",
      ar: "حقل واحد أو أكثر غير صالح.",
    },
  },
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    category: "UNAUTHORIZED",
    status: 401,
    retryable: false,
    defaultMessage: {
      en: "Authentication is required to access this resource.",
      ar: "يجب تسجيل الدخول للوصول إلى هذا المورد.",
    },
  },
  AUTH_INVALID_CREDENTIALS: {
    code: "AUTH_INVALID_CREDENTIALS",
    category: "UNAUTHORIZED",
    status: 401,
    retryable: false,
    defaultMessage: {
      en: "Invalid credentials.",
      ar: "بيانات الدخول غير صحيحة.",
    },
  },
  AUTH_TOKEN_EXPIRED: {
    code: "AUTH_TOKEN_EXPIRED",
    category: "UNAUTHORIZED",
    status: 401,
    retryable: false,
    defaultMessage: {
      en: "Access token has expired or is invalid.",
      ar: "انتهت صلاحية رمز الوصول أو أنه غير صالح.",
    },
  },
  AUTH_SESSION_EXPIRED: {
    code: "AUTH_SESSION_EXPIRED",
    category: "UNAUTHORIZED",
    status: 401,
    retryable: false,
    defaultMessage: {
      en: "Your session has expired. Please sign in again.",
      ar: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
    },
  },
  PLAN_REQUIRED: {
    code: "PLAN_REQUIRED",
    category: "PLAN_REQUIRED",
    status: 402,
    retryable: false,
    defaultMessage: {
      en: "Your current subscription plan does not include this feature.",
      ar: "باقتك الحالية لا تتضمن هذه الميزة.",
    },
  },
  PLAN_LIMIT_EXCEEDED: {
    code: "PLAN_LIMIT_EXCEEDED",
    category: "PLAN_REQUIRED",
    status: 402,
    retryable: false,
    defaultMessage: {
      en: "You have reached the limit allowed by your current plan.",
      ar: "لقد وصلت إلى الحد الأقصى المسموح به في باقتك الحالية.",
    },
  },
  SUBSCRIPTION_INACTIVE: {
    code: "SUBSCRIPTION_INACTIVE",
    category: "PLAN_REQUIRED",
    status: 402,
    retryable: false,
    defaultMessage: {
      en: "An active subscription is required to perform this action.",
      ar: "يتطلب هذا الإجراء اشتراكاً نشطاً.",
    },
  },
  FORBIDDEN: {
    code: "FORBIDDEN",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "You do not have permission to perform this action.",
      ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
    },
  },
  ROLE_FORBIDDEN: {
    code: "ROLE_FORBIDDEN",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "Your active role is not permitted to perform this action.",
      ar: "دورك الحالي غير مخول لتنفيذ هذا الإجراء.",
    },
  },
  PERMISSION_DENIED: {
    code: "PERMISSION_DENIED",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "Insufficient permissions for this workspace area.",
      ar: "صلاحيات غير كافية لهذا القسم.",
    },
  },
  ADMIN_SUBROLE_FORBIDDEN: {
    code: "ADMIN_SUBROLE_FORBIDDEN",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "Your platform admin sub-role is not permitted to perform this action.",
      ar: "الدور الإداري الفرعي غير مخول لتنفيذ هذا الإجراء.",
    },
  },
  MODERATOR_SCOPE_FORBIDDEN: {
    code: "MODERATOR_SCOPE_FORBIDDEN",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "Moderator access is restricted to the assigned vehicle and trip.",
      ar: "صلاحية المشرف مقتصرة على المركبة والرحلة المعينة له.",
    },
  },
  AUTH_ACCOUNT_SUSPENDED: {
    code: "AUTH_ACCOUNT_SUSPENDED",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "This account is currently suspended.",
      ar: "هذا الحساب موقوف حالياً.",
    },
  },
  AUTH_WEB_ONLY_REGISTRATION: {
    code: "AUTH_WEB_ONLY_REGISTRATION",
    category: "FORBIDDEN",
    status: 403,
    retryable: false,
    defaultMessage: {
      en: "Organization registration is available on the web surface only.",
      ar: "تسجيل الشركات متاح عبر الموقع الإلكتروني فقط.",
    },
  },
  NOT_FOUND: {
    code: "NOT_FOUND",
    category: "NOT_FOUND",
    status: 404,
    retryable: false,
    defaultMessage: {
      en: "The requested resource was not found.",
      ar: "المورد المطلوب غير موجود.",
    },
  },
  RESOURCE_NOT_FOUND: {
    code: "RESOURCE_NOT_FOUND",
    category: "NOT_FOUND",
    status: 404,
    retryable: false,
    defaultMessage: {
      en: "The requested record does not exist.",
      ar: "السجل المطلوب غير موجود.",
    },
  },
  TENANT_NOT_FOUND: {
    code: "TENANT_NOT_FOUND",
    category: "NOT_FOUND",
    status: 404,
    retryable: false,
    defaultMessage: {
      en: "Organization resource not found.",
      ar: "مورد المؤسسة غير موجود.",
    },
  },
  CONFLICT: {
    code: "CONFLICT",
    category: "CONFLICT",
    status: 409,
    retryable: false,
    defaultMessage: {
      en: "The request conflicts with the current state of the resource.",
      ar: "يتعارض الطلب مع الحالة الحالية للمورد.",
    },
  },
  IDEMPOTENCY_KEY_CONFLICT: {
    code: "IDEMPOTENCY_KEY_CONFLICT",
    category: "CONFLICT",
    status: 409,
    retryable: false,
    defaultMessage: {
      en: "This idempotency key was already used with a different request payload.",
      ar: "تم استخدام مفتاح عدم التكرار هذا مسبقاً مع بيانات طلب مختلفة.",
    },
  },
  DUPLICATE_RESOURCE: {
    code: "DUPLICATE_RESOURCE",
    category: "CONFLICT",
    status: 409,
    retryable: false,
    defaultMessage: {
      en: "A record with the same unique identifier already exists.",
      ar: "يوجد سجل بنفس المعرف الفريد بالفعل.",
    },
  },
  INVALID_STATE_TRANSITION: {
    code: "INVALID_STATE_TRANSITION",
    category: "CONFLICT",
    status: 409,
    retryable: false,
    defaultMessage: {
      en: "The requested state transition is not allowed from the current state.",
      ar: "الانتقال المطلوب للحالة غير مسموح به من الحالة الحالية.",
    },
  },
  SEAT_NOT_AVAILABLE: {
    code: "SEAT_NOT_AVAILABLE",
    category: "CONFLICT",
    status: 409,
    retryable: false,
    defaultMessage: {
      en: "The selected seat is already held or reserved.",
      ar: "المقعد المحدد محجوز أو قيد الحجز بالفعل.",
    },
  },
  PRECONDITION_FAILED: {
    code: "PRECONDITION_FAILED",
    category: "PRECONDITION_FAILED",
    status: 412,
    retryable: false,
    defaultMessage: {
      en: "A required precondition for this action was not met.",
      ar: "لم يتم استيفاء شرط مسبق مطلوب لهذا الإجراء.",
    },
  },
  AUTH_DELETION_PENDING: {
    code: "AUTH_DELETION_PENDING",
    category: "PRECONDITION_FAILED",
    status: 412,
    retryable: false,
    defaultMessage: {
      en: "This account is pending deletion.",
      ar: "هذا الحساب قيد الحذف.",
    },
  },
  AUTH_MFA_REQUIRED: {
    code: "AUTH_MFA_REQUIRED",
    category: "PRECONDITION_FAILED",
    status: 412,
    retryable: false,
    defaultMessage: {
      en: "Multi-factor authentication verification is required.",
      ar: "مطلوب التحقق الثنائي.",
    },
  },
  AUTH_VERIFICATION_REQUIRED: {
    code: "AUTH_VERIFICATION_REQUIRED",
    category: "PRECONDITION_FAILED",
    status: 412,
    retryable: false,
    defaultMessage: {
      en: "Email and phone verification must be completed before proceeding.",
      ar: "يجب إكمال التحقق من البريد الإلكتروني ورقم الهاتف قبل المتابعة.",
    },
  },
  FOUR_EYES_APPROVAL_REQUIRED: {
    code: "FOUR_EYES_APPROVAL_REQUIRED",
    category: "PRECONDITION_FAILED",
    status: 412,
    retryable: false,
    defaultMessage: {
      en: "Four-eyes approval from a second Super Admin is required for this change.",
      ar: "مطلوب موافقة مشرف عام ثانٍ لتنفيذ هذا التغيير الحساس.",
    },
  },
  SEAT_HOLD_EXPIRED: {
    code: "SEAT_HOLD_EXPIRED",
    category: "PRECONDITION_FAILED",
    status: 412,
    retryable: false,
    defaultMessage: {
      en: "Your 15-minute seat hold has expired.",
      ar: "انتهت مهلة حجز المقعد المؤقتة (15 دقيقة).",
    },
  },
  BUSINESS_RULE_VIOLATION: {
    code: "BUSINESS_RULE_VIOLATION",
    category: "BUSINESS_RULE_VIOLATION",
    status: 422,
    retryable: false,
    defaultMessage: {
      en: "The request violates a platform business rule.",
      ar: "يخالف الطلب إحدى قواعد العمل في المنصة.",
    },
  },
  ONBOARDING_COOLDOWN_ACTIVE: {
    code: "ONBOARDING_COOLDOWN_ACTIVE",
    category: "BUSINESS_RULE_VIOLATION",
    status: 422,
    retryable: false,
    defaultMessage: {
      en: "You cannot re-apply before the 30-day rejection cooldown period ends.",
      ar: "لا يمكنك إعادة التقديم قبل انتهاء فترة الانتظار البالغة 30 يوماً.",
    },
  },
  ONBOARDING_CHANGES_WINDOW_EXPIRED: {
    code: "ONBOARDING_CHANGES_WINDOW_EXPIRED",
    category: "BUSINESS_RULE_VIOLATION",
    status: 422,
    retryable: false,
    defaultMessage: {
      en: "The response window for requested application changes has expired.",
      ar: "انتهت المهلة المحددة للرد على التعديلات المطلوبة في الطلب.",
    },
  },
  COUPON_INVALID_OR_EXPIRED: {
    code: "COUPON_INVALID_OR_EXPIRED",
    category: "BUSINESS_RULE_VIOLATION",
    status: 422,
    retryable: false,
    defaultMessage: {
      en: "The coupon code is invalid, expired, or not applicable to this booking.",
      ar: "رمز القسيمة غير صالح أو منتهي الصلاحية أو لا ينطبق على هذا الحجز.",
    },
  },
  DRIVER_LAB_TEST_RESTRICTED: {
    code: "DRIVER_LAB_TEST_RESTRICTED",
    category: "BUSINESS_RULE_VIOLATION",
    status: 422,
    retryable: false,
    defaultMessage: {
      en: "Driver actions are restricted while a mandatory lab test is pending.",
      ar: "إجراءات السائق مقيدة لحين إتمام الفحص المخبري المطلوب.",
    },
  },
  AUTH_OTP_EXPIRED: {
    code: "AUTH_OTP_EXPIRED",
    category: "VALIDATION_ERROR",
    status: 400,
    retryable: false,
    defaultMessage: {
      en: "The one-time verification code has expired.",
      ar: "انتهت صلاحية رمز التحقق.",
    },
  },
  AUTH_OTP_INVALID: {
    code: "AUTH_OTP_INVALID",
    category: "VALIDATION_ERROR",
    status: 400,
    retryable: false,
    defaultMessage: {
      en: "The verification code entered is incorrect.",
      ar: "رمز التحقق المدخل غير صحيح.",
    },
  },
  RATE_LIMITED: {
    code: "RATE_LIMITED",
    category: "RATE_LIMITED",
    status: 429,
    retryable: true,
    defaultMessage: {
      en: "Too many requests. Please wait before trying again.",
      ar: "طلبات كثيرة جداً. يرجى الانتظار قبل المحاولة مرة أخرى.",
    },
  },
  AUTH_ACCOUNT_LOCKED: {
    code: "AUTH_ACCOUNT_LOCKED",
    category: "RATE_LIMITED",
    status: 429,
    retryable: true,
    defaultMessage: {
      en: "Account is temporarily locked due to repeated failed sign-in attempts.",
      ar: "تم قفل الحساب مؤقتاً بسبب تكرار محاولات الدخول الفاشلة.",
    },
  },
  AUTH_OTP_PAUSED: {
    code: "AUTH_OTP_PAUSED",
    category: "RATE_LIMITED",
    status: 429,
    retryable: true,
    defaultMessage: {
      en: "Verification is temporarily paused after 5 incorrect attempts.",
      ar: "تم إيقاف التحقق مؤقتاً بعد 5 محاولات خاطئة.",
    },
  },
  AUTH_OTP_COOLDOWN: {
    code: "AUTH_OTP_COOLDOWN",
    category: "RATE_LIMITED",
    status: 429,
    retryable: true,
    defaultMessage: {
      en: "Please wait for the resend countdown before requesting another code.",
      ar: "يرجى الانتظار حتى انتهاء العد التنازلي قبل طلب رمز جديد.",
    },
  },
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    category: "INTERNAL_ERROR",
    status: 500,
    retryable: true,
    defaultMessage: {
      en: "An unexpected internal server error occurred.",
      ar: "حدث خطأ داخلي غير متوقع في الخادم.",
    },
  },
  SERVICE_UNAVAILABLE: {
    code: "SERVICE_UNAVAILABLE",
    category: "SERVICE_UNAVAILABLE",
    status: 503,
    retryable: true,
    defaultMessage: {
      en: "The service is temporarily unavailable. Please try again shortly.",
      ar: "الخدمة غير متاحة مؤقتاً. يرجى المحاولة بعد قليل.",
    },
  },
  PAYMENT_GATEWAY_ERROR: {
    code: "PAYMENT_GATEWAY_ERROR",
    category: "SERVICE_UNAVAILABLE",
    status: 503,
    retryable: true,
    defaultMessage: {
      en: "Payment provider is temporarily unreachable.",
      ar: "مزود خدمة الدفع غير متاح مؤقتاً.",
    },
  },
};

const SHARED_ERROR_CODE_SET = new Set<string>(SHARED_ERROR_CODES);

export function isSharedErrorCode(code: unknown): code is SharedErrorCode {
  return typeof code === "string" && SHARED_ERROR_CODE_SET.has(code);
}

/**
 * Maps legacy, oRPC built-in, or service-local error strings to the unified SharedErrorCode catalog.
 */
const ALIAS_TO_SHARED_ERROR_CODE: Record<string, SharedErrorCode> = {
  BAD_REQUEST: "VALIDATION_ERROR",
  INPUT_VALIDATION_FAILED: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHORIZED",
  PAYMENT_REQUIRED: "PLAN_REQUIRED",
  UNPROCESSABLE_ENTITY: "BUSINESS_RULE_VIOLATION",
  UNPROCESSABLE_CONTENT: "BUSINESS_RULE_VIOLATION",
  TOO_MANY_REQUESTS: "RATE_LIMITED",
  INTERNAL_SERVER_ERROR: "INTERNAL_ERROR",
};

export function mapErrorCodeToSharedCode(
  code: string | undefined | null,
  customCodeMap?: Readonly<Record<string, SharedErrorCode>>,
): SharedErrorCode {
  if (!code) return "INTERNAL_ERROR";
  if (customCodeMap && code in customCodeMap) {
    return customCodeMap[code]!;
  }
  if (isSharedErrorCode(code)) {
    return code;
  }
  const normalized = code.trim().toUpperCase();
  if (customCodeMap && normalized in customCodeMap) {
    return customCodeMap[normalized]!;
  }
  if (isSharedErrorCode(normalized)) {
    return normalized;
  }
  if (normalized in ALIAS_TO_SHARED_ERROR_CODE) {
    return ALIAS_TO_SHARED_ERROR_CODE[normalized]!;
  }
  if (normalized.endsWith("_NOT_FOUND")) {
    return "RESOURCE_NOT_FOUND";
  }
  if (normalized.endsWith("_FORBIDDEN") || normalized.endsWith("_DENIED")) {
    return "FORBIDDEN";
  }
  if (normalized.endsWith("_UNAUTHORIZED") || normalized.endsWith("_UNAUTHENTICATED")) {
    return "UNAUTHORIZED";
  }
  if (normalized.endsWith("_DUPLICATE") || normalized.endsWith("_ALREADY_EXISTS")) {
    return "DUPLICATE_RESOURCE";
  }
  if (normalized.endsWith("_CONFLICT")) {
    return "CONFLICT";
  }
  if (normalized.endsWith("_RATE_LIMITED")) {
    return "RATE_LIMITED";
  }
  return "INTERNAL_ERROR";
}

export function resolveSharedErrorDefinition(
  code: string | undefined | null,
  customCodeMap?: Readonly<Record<string, SharedErrorCode>>,
): SharedErrorDefinition {
  const sharedCode = mapErrorCodeToSharedCode(code, customCodeMap);
  return SHARED_ERROR_CATALOG[sharedCode];
}

/**
 * Base error class thrown by all 26 services.
 * Always carries a unified `SharedErrorCode`, its SRS IF-04 `ErrorCategory`, and its HTTP status code.
 */
export class ServiceError extends Error {
  readonly code: SharedErrorCode;
  readonly category: ErrorCategory;
  readonly status: ErrorHttpStatus;
  readonly details?: Record<string, unknown>;
  readonly fieldErrors?: ApiErrorFieldDetail[];
  readonly retryAfterSeconds?: number;
  readonly serviceId?: string;

  constructor(
    code: SharedErrorCode,
    message?: string,
    detailsOrOptions?: Record<string, unknown> | ServiceErrorOptions,
    serviceId?: string,
  ) {
    const def = SHARED_ERROR_CATALOG[code] ?? SHARED_ERROR_CATALOG.INTERNAL_ERROR;
    const resolvedMessage = message && message.trim().length > 0 ? message : def.defaultMessage.en;
    super(resolvedMessage);
    this.name = "ServiceError";
    this.code = def.code;
    this.category = def.category;
    this.status = def.status;

    if (detailsOrOptions && isServiceErrorOptions(detailsOrOptions)) {
      this.details = detailsOrOptions.details;
      this.fieldErrors = detailsOrOptions.fieldErrors;
      this.retryAfterSeconds = detailsOrOptions.retryAfterSeconds;
      this.serviceId = detailsOrOptions.serviceId ?? serviceId;
      if (detailsOrOptions.cause !== undefined) {
        this.cause = detailsOrOptions.cause;
      }
    } else {
      this.details = detailsOrOptions;
      this.serviceId = serviceId;
      if (
        detailsOrOptions &&
        typeof detailsOrOptions.field === "string" &&
        resolvedMessage.length > 0
      ) {
        this.fieldErrors = [
          {
            field: detailsOrOptions.field,
            code: def.code,
            message: resolvedMessage,
          },
        ];
      }
      if (detailsOrOptions && typeof detailsOrOptions.retryAfterSeconds === "number") {
        this.retryAfterSeconds = detailsOrOptions.retryAfterSeconds;
      }
    }
  }
}

function isServiceErrorOptions(
  val: Record<string, unknown> | ServiceErrorOptions,
): val is ServiceErrorOptions {
  const keys = Object.keys(val);
  return (
    keys.length > 0 &&
    keys.every((k) =>
      ["details", "fieldErrors", "retryAfterSeconds", "serviceId", "cause"].includes(k),
    ) &&
    ("fieldErrors" in val || "serviceId" in val || "details" in val)
  );
}

export function isServiceError(error: unknown): error is ServiceError {
  return (
    error instanceof ServiceError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      "category" in error &&
      "status" in error &&
      isSharedErrorCode((error as { code: unknown }).code))
  );
}

/**
 * Extracts field-level validation issues from Zod or Standard Schema errors (SRS IF-03).
 */
export function extractValidationFieldErrors(error: unknown): ApiErrorFieldDetail[] | undefined {
  if (!error || typeof error !== "object") return undefined;

  const candidateIssues =
    (error as { issues?: unknown }).issues ??
    ((error as { cause?: { issues?: unknown } }).cause as { issues?: unknown } | undefined)
      ?.issues ??
    ((error as { data?: { issues?: unknown } }).data as { issues?: unknown } | undefined)?.issues;

  if (!Array.isArray(candidateIssues) || candidateIssues.length === 0) {
    return undefined;
  }

  return candidateIssues.map((issue: unknown) => {
    if (!issue || typeof issue !== "object") {
      return { field: "root", code: "INVALID_INPUT", message: "Invalid value." };
    }
    const rawPath = (issue as { path?: unknown }).path;
    const field =
      Array.isArray(rawPath) && rawPath.length > 0
        ? rawPath
            .map((segment) =>
              typeof segment === "object" && segment !== null && "key" in segment
                ? String((segment as { key: unknown }).key)
                : String(segment),
            )
            .join(".")
        : "root";
    const code =
      typeof (issue as { code?: unknown }).code === "string"
        ? String((issue as { code: string }).code)
        : "INVALID_INPUT";
    const message =
      typeof (issue as { message?: unknown }).message === "string"
        ? String((issue as { message: string }).message)
        : "Invalid value.";
    return { field, code, message };
  });
}

/**
 * Factory used by every service's `src/errors/index.ts` to map service, domain, validation,
 * and database errors into a unified `ServiceError` referencing `SharedErrorCode`.
 * Raw database errors are scrubbed so internal SQL details never leak to clients (.claude/rules/service-architecture.md Rule 8).
 */
export function createServiceErrorMapper(
  serviceId: string,
  customCodeMap?: Readonly<Record<string, SharedErrorCode>>,
): (error: unknown) => ServiceError {
  return (error: unknown): ServiceError => {
    if (error instanceof ServiceError) {
      if (error.serviceId) return error;
      return new ServiceError(error.code, error.message, {
        details: error.details,
        fieldErrors: error.fieldErrors,
        retryAfterSeconds: error.retryAfterSeconds,
        serviceId,
        cause: error,
      });
    }

    const fieldErrors = extractValidationFieldErrors(error);
    if (fieldErrors && fieldErrors.length > 0) {
      return new ServiceError(
        "VALIDATION_ERROR",
        fieldErrors[0]?.message ?? SHARED_ERROR_CATALOG.VALIDATION_ERROR.defaultMessage.en,
        {
          fieldErrors,
          serviceId,
          cause: error,
        },
      );
    }

    if (error && typeof error === "object") {
      const errObj = error as {
        code?: unknown;
        message?: unknown;
        details?: unknown;
        data?: unknown;
        cause?: unknown;
      };

      // Handle PostgreSQL / database constraint codes safely without leaking SQL (Rule 8)
      const pgCode =
        typeof errObj.code === "string"
          ? errObj.code
          : typeof (errObj.cause as { code?: unknown } | undefined)?.code === "string"
            ? ((errObj.cause as { code: string }).code ?? undefined)
            : undefined;

      if (pgCode === "23505") {
        return new ServiceError(
          "DUPLICATE_RESOURCE",
          SHARED_ERROR_CATALOG.DUPLICATE_RESOURCE.defaultMessage.en,
          { serviceId, cause: error },
        );
      }
      if (pgCode === "23503" || pgCode === "23514" || pgCode === "23502") {
        return new ServiceError(
          "VALIDATION_ERROR",
          SHARED_ERROR_CATALOG.VALIDATION_ERROR.defaultMessage.en,
          { serviceId, cause: error },
        );
      }
      if (pgCode === "40001") {
        return new ServiceError("CONFLICT", SHARED_ERROR_CATALOG.CONFLICT.defaultMessage.en, {
          serviceId,
          cause: error,
        });
      }

      if (typeof errObj.code === "string") {
        const mappedCode = mapErrorCodeToSharedCode(errObj.code, customCodeMap);
        const message =
          typeof errObj.message === "string" && errObj.message.trim().length > 0
            ? errObj.message
            : SHARED_ERROR_CATALOG[mappedCode].defaultMessage.en;
        const details =
          typeof errObj.details === "object" && errObj.details !== null
            ? (errObj.details as Record<string, unknown>)
            : typeof errObj.data === "object" && errObj.data !== null
              ? (errObj.data as Record<string, unknown>)
              : undefined;

        return new ServiceError(mappedCode, message, {
          details,
          serviceId,
          cause: error,
        });
      }
    }

    return new ServiceError(
      "INTERNAL_ERROR",
      SHARED_ERROR_CATALOG.INTERNAL_ERROR.defaultMessage.en,
      {
        serviceId,
        cause: error,
      },
    );
  };
}
