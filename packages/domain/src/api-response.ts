import {
  createServiceErrorMapper,
  resolveSharedErrorDefinition,
  SHARED_ERROR_CATALOG,
} from "./error-codes";
import type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  CreateErrorResponseInput,
  CreateSuccessResponseOptions,
  SharedErrorCode,
  SupportedLocale,
} from "./types";

export type {
  ApiErrorPayload,
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  CreateErrorResponseInput,
  CreateSuccessResponseOptions,
} from "./types";

export function createSuccessResponse<TData>(
  data: TData,
  options: CreateSuccessResponseOptions = {},
): ApiSuccessResponse<TData> {
  const requestId = options.requestId ?? "req_anonymous";
  const locale = options.locale ?? "ar";
  const timestamp = options.timestamp ?? new Date().toISOString();

  return {
    success: true,
    data,
    error: null,
    requestId,
    meta: {
      requestId,
      timestamp,
      locale,
      ...(options.service ? { service: options.service } : {}),
      ...(options.pagination ? { pagination: options.pagination } : {}),
    },
  };
}

export function createErrorResponse(input: CreateErrorResponseInput): ApiErrorResponse {
  const def = resolveSharedErrorDefinition(input.code);
  const locale = input.locale ?? "ar";
  const requestId = input.requestId ?? "req_anonymous";
  const timestamp = input.timestamp ?? new Date().toISOString();

  // If no custom message is supplied, or if the message matches the English default and caller requested Arabic, localize it (SRS IF-08)
  const resolvedMessage =
    input.message &&
    input.message.trim().length > 0 &&
    !(locale === "ar" && input.message === def.defaultMessage.en)
      ? input.message
      : def.defaultMessage[locale];

  return {
    success: false,
    data: null,
    error: {
      code: def.code,
      category: def.category,
      status: def.status,
      message: resolvedMessage,
      ...(input.fieldErrors && input.fieldErrors.length > 0
        ? { fieldErrors: input.fieldErrors }
        : {}),
      ...(input.details && Object.keys(input.details).length > 0 ? { details: input.details } : {}),
      ...(input.retryAfterSeconds !== undefined
        ? { retryAfterSeconds: input.retryAfterSeconds }
        : {}),
    },
    requestId,
    meta: {
      requestId,
      timestamp,
      locale,
      ...(input.service ? { service: input.service } : {}),
    },
  };
}

export function isApiResponseEnvelope(value: unknown): value is ApiResponse<unknown> {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.success === "boolean" &&
    "data" in obj &&
    "error" in obj &&
    typeof obj.requestId === "string" &&
    typeof obj.meta === "object" &&
    obj.meta !== null
  );
}

/**
 * Converts any thrown error into the standardized `ApiErrorResponse` envelope.
 */
export function normalizeErrorToEnvelope(
  error: unknown,
  options: {
    requestId?: string;
    locale?: SupportedLocale;
    service?: string;
    customCodeMap?: Readonly<Record<string, SharedErrorCode>>;
  } = {},
): ApiErrorResponse {
  if (isApiResponseEnvelope(error) && !error.success) {
    return error;
  }

  // If an ORPCError or wrapper already embedded an ApiErrorResponse in `data`, return it
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (isApiResponseEnvelope(data) && !data.success) {
      return data;
    }
  }

  const mapper = createServiceErrorMapper(options.service ?? "api", options.customCodeMap);
  const serviceError = mapper(error);
  const def = SHARED_ERROR_CATALOG[serviceError.code];
  const locale = options.locale ?? "ar";

  return createErrorResponse({
    code: serviceError.code,
    message:
      locale === "ar" && serviceError.message === def.defaultMessage.en
        ? def.defaultMessage.ar
        : serviceError.message,
    locale,
    requestId: options.requestId,
    service: serviceError.serviceId ?? options.service,
    fieldErrors: serviceError.fieldErrors,
    details: serviceError.details,
    retryAfterSeconds: serviceError.retryAfterSeconds,
  });
}
