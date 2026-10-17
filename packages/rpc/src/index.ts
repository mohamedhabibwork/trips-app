import { type JSONSchema, oo, type OpenAPIGeneratorGenerateOptions } from "@orpc/openapi";
import { ORPCError, os } from "@orpc/server";
import {
  createErrorResponse,
  createServiceErrorMapper,
  createSuccessResponse,
  ERROR_CATEGORIES,
  hasAdminSubRolePermission,
  hasEmployeePermission,
  isApiResponseEnvelope,
  mapErrorCodeToSharedCode,
  normalizeErrorToEnvelope,
  resolveSharedErrorDefinition,
  ServiceError,
  SHARED_ERROR_CATALOG,
  SHARED_ERROR_CODES,
} from "@trips-app/domain";
import { z } from "zod/v4";

import type {
  AdminSubRole,
  ApiErrorResponse,
  Context,
  OrgPermissionArea,
  SharedErrorCode,
  SharedORPCErrorDefMap,
  SupportedLocale,
  UserRole,
} from "./types";

export type * from "./types";
export {
  createErrorResponse,
  createServiceErrorMapper,
  createSuccessResponse,
  ERROR_CATEGORIES,
  isApiResponseEnvelope,
  mapErrorCodeToSharedCode,
  normalizeErrorToEnvelope,
  oo,
  resolveSharedErrorDefinition,
  ServiceError,
  SHARED_ERROR_CATALOG,
  SHARED_ERROR_CODES,
};

/**
 * Zod schemas for the standardized backend response structure (SRS IF-03, IF-04).
 */
export const apiPaginationMetaSchema = z
  .object({
    cursor: z.string().nullable().optional(),
    nextCursor: z.string().nullable().optional(),
    hasMore: z.boolean().optional(),
    limit: z.number().int().positive().optional(),
    total: z.number().int().nonnegative().optional(),
  })
  .meta({
    description: "Cursor pagination metadata (SRS IF-05).",
  });

export const apiResponseMetaSchema = z
  .object({
    requestId: z.string(),
    timestamp: z.string(),
    locale: z.enum(["ar", "en"]),
    service: z.string().optional(),
    pagination: apiPaginationMetaSchema.optional(),
  })
  .meta({
    description: "Standardized response metadata attached to every response (SRS IF-03).",
  });

export const apiErrorFieldDetailSchema = z
  .object({
    field: z.string(),
    code: z.string(),
    message: z.string(),
  })
  .meta({
    description: "Field-level validation issue detail (SRS IF-03).",
  });

export const apiErrorPayloadSchema = z
  .object({
    code: z.enum(SHARED_ERROR_CODES),
    category: z.enum(ERROR_CATEGORIES),
    status: z.number().int(),
    message: z.string(),
    fieldErrors: z.array(apiErrorFieldDetailSchema).optional(),
    details: z.record(z.string(), z.unknown()).optional(),
    retryAfterSeconds: z.number().nonnegative().optional(),
  })
  .meta({
    description:
      "Standardized error payload carrying unified SharedErrorCode and SRS IF-04 category.",
  });

export const apiErrorResponseSchema = z
  .object({
    success: z.literal(false),
    data: z.null(),
    error: apiErrorPayloadSchema,
    requestId: z.string(),
    meta: apiResponseMetaSchema,
  })
  .meta({
    description: "Standardized failure response envelope (SRS IF-03, IF-04).",
  });

export function createApiSuccessResponseSchema<TSchema extends z.ZodTypeAny>(dataSchema: TSchema) {
  return z
    .object({
      success: z.literal(true),
      data: dataSchema,
      error: z.null(),
      requestId: z.string(),
      meta: apiResponseMetaSchema,
    })
    .meta({
      description: "Standardized success response envelope (SRS IF-03).",
    });
}

/**
 * Common reusable OpenAPI schema components registered in `OpenAPIGenerator.generate(..., { commonSchemas })`.
 * Follows https://orpc.dev/docs/openapi/specification#common-schemas.
 */
export const COMMON_OPENAPI_SCHEMAS: NonNullable<OpenAPIGeneratorGenerateOptions["commonSchemas"]> =
  {
    ApiPaginationMeta: {
      strategy: "output",
      schema: apiPaginationMetaSchema,
    },
    ApiResponseMeta: {
      strategy: "output",
      schema: apiResponseMetaSchema,
    },
    ApiErrorFieldDetail: {
      strategy: "output",
      schema: apiErrorFieldDetailSchema,
    },
    ApiErrorPayload: {
      strategy: "output",
      schema: apiErrorPayloadSchema,
    },
    ApiErrorResponse: {
      strategy: "output",
      schema: apiErrorResponseSchema,
    },
    UndefinedError: {
      error: "UndefinedError",
    },
  };

/**
 * Builds the custom OpenAPI error response JSON Schema for any HTTP status code so that
 * generated OpenAPI 3.1 docs reflect the standardized `ApiErrorResponse` envelope.
 * Follows https://orpc.dev/docs/openapi/specification#custom-error-response-schemas.
 */
export function buildOpenAPIErrorResponseBodySchema(
  definedErrors: [
    code: string,
    defaultMessage: string,
    dataRequired: boolean,
    dataSchema: JSONSchema,
  ][],
  status: number,
): JSONSchema {
  const codes = definedErrors.map(([code]) => code);
  const categories = Array.from(
    new Set(codes.map((code) => resolveSharedErrorDefinition(code).category)),
  );

  return {
    type: "object",
    description: `Standardized failure response envelope for HTTP ${status} (SRS IF-03, IF-04).`,
    properties: {
      success: { const: false },
      data: { type: "null" },
      error: {
        type: "object",
        properties: {
          code:
            codes.length > 0
              ? { type: "string", enum: codes }
              : { type: "string", enum: [...SHARED_ERROR_CODES] },
          category:
            categories.length > 0
              ? { type: "string", enum: categories }
              : { type: "string", enum: [...ERROR_CATEGORIES] },
          status: { const: status },
          message: {
            type: "string",
            default: definedErrors[0]?.[1] ?? "Request failed.",
          },
          fieldErrors: {
            type: "array",
            items: { $ref: "#/components/schemas/ApiErrorFieldDetail" },
          },
          details: {
            type: "object",
            additionalProperties: true,
          },
          retryAfterSeconds: {
            type: "number",
          },
        },
        required: ["code", "category", "status", "message"],
      },
      requestId: { type: "string" },
      meta: { $ref: "#/components/schemas/ApiResponseMeta" },
    },
    required: ["success", "data", "error", "requestId", "meta"],
  };
}

/**
 * Encodes an `ORPCError` into the standardized `ApiErrorResponse` envelope for `OpenAPIHandler`.
 */
export function encodeOpenAPIErrorResponse(
  error: ORPCError<string, unknown>,
  fallbackOptions?: { requestId?: string; locale?: SupportedLocale },
): ApiErrorResponse {
  if (isApiResponseEnvelope(error.data) && !error.data.success) {
    return error.data;
  }

  const sharedCode = mapErrorCodeToSharedCode(error.code);
  const detailsRecord =
    typeof error.data === "object" && error.data !== null && !isApiResponseEnvelope(error.data)
      ? (error.data as Record<string, unknown>)
      : undefined;

  return createErrorResponse({
    code: sharedCode,
    message: error.message,
    requestId:
      (typeof detailsRecord?.requestId === "string" ? detailsRecord.requestId : undefined) ??
      fallbackOptions?.requestId ??
      "req_openapi",
    locale:
      (detailsRecord?.locale === "en" || detailsRecord?.locale === "ar"
        ? detailsRecord.locale
        : undefined) ??
      fallbackOptions?.locale ??
      "ar",
    service: typeof detailsRecord?.service === "string" ? detailsRecord.service : undefined,
    details: detailsRecord,
  });
}

/**
 * Wraps an HTTP Response returned by `OpenAPIHandler` into the standardized `ApiResponse` envelope
 * across all cases (2xx success and 4xx/5xx failure), attaching `x-request-id`.
 */
export async function wrapOpenAPIHttpResponse(
  response: Response | undefined,
  options: { requestId: string; locale: SupportedLocale },
): Promise<Response> {
  if (!response) {
    const notFoundEnvelope = createErrorResponse({
      code: "RESOURCE_NOT_FOUND",
      locale: options.locale,
      requestId: options.requestId,
    });
    return new Response(JSON.stringify(notFoundEnvelope), {
      status: 404,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-request-id": options.requestId,
      },
    });
  }

  const contentType = response.headers.get("content-type") ?? "";
  // Leave HTML/JS/CSS (such as Scalar/Swagger UI pages) untouched
  if (!contentType.includes("application/json")) {
    const headers = new Headers(response.headers);
    headers.set("x-request-id", options.requestId);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const rawText = await response.text();
  let parsed: unknown = null;
  try {
    parsed = rawText.length > 0 ? JSON.parse(rawText) : null;
  } catch {
    parsed = rawText;
  }

  // Do not wrap raw OpenAPI 3.x specification documents (e.g. `/spec.json`)
  if (
    parsed &&
    typeof parsed === "object" &&
    "openapi" in parsed &&
    "paths" in parsed &&
    "info" in parsed
  ) {
    const headers = new Headers(response.headers);
    headers.set("x-request-id", options.requestId);
    return new Response(rawText, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const headers = new Headers(response.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  headers.set("x-request-id", options.requestId);

  if (isApiResponseEnvelope(parsed)) {
    return new Response(JSON.stringify(parsed), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  if (response.ok) {
    const envelope = createSuccessResponse(parsed, {
      requestId: options.requestId,
      locale: options.locale,
    });
    return new Response(JSON.stringify(envelope), {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  const errorEnvelope = normalizeErrorToEnvelope(parsed, {
    requestId: options.requestId,
    locale: options.locale,
  });
  return new Response(JSON.stringify(errorEnvelope), {
    status: errorEnvelope.error.status,
    statusText: response.statusText,
    headers,
  });
}

export const SHARED_ORPC_ERROR_DEFS: SharedORPCErrorDefMap = Object.fromEntries(
  SHARED_ERROR_CODES.map((code) => {
    const def = SHARED_ERROR_CATALOG[code];
    return [
      code,
      {
        status: def.status,
        message: def.defaultMessage.en,
      },
    ];
  }),
) as SharedORPCErrorDefMap;

/**
 * Converts a `ServiceError` or unknown error into a unified `ORPCError` whose:
 * - `code` is the central `SharedErrorCode`
 * - `status` is the canonical SRS IF-04 HTTP status code
 * - `message` is localized to `context.locale`
 * - `data` is the standardized `ApiErrorResponse` envelope (with any `details` also accessible)
 */
export function toORPCError(
  error: unknown,
  context?: Partial<Context>,
  serviceId?: string,
  customCodeMap?: Readonly<Record<string, SharedErrorCode>>,
): ORPCError<SharedErrorCode, ApiErrorResponse & Record<string, unknown>> {
  if (error instanceof ORPCError && isApiResponseEnvelope(error.data) && !error.data.success) {
    return error as ORPCError<SharedErrorCode, ApiErrorResponse & Record<string, unknown>>;
  }

  const mapper = createServiceErrorMapper(serviceId ?? "api", customCodeMap);
  const serviceError = error instanceof ServiceError ? error : mapper(error);
  const envelope = createErrorResponse({
    code: serviceError.code,
    message: serviceError.message,
    locale: context?.locale ?? "ar",
    requestId: context?.requestId ?? "req_rpc",
    service: serviceError.serviceId ?? serviceId,
    fieldErrors: serviceError.fieldErrors,
    details: serviceError.details,
    retryAfterSeconds: serviceError.retryAfterSeconds,
  });

  return new ORPCError(serviceError.code, {
    status: serviceError.status,
    message: envelope.error.message,
    data: {
      ...serviceError.details,
      ...envelope,
    },
    cause: error,
  });
}

export const o = os.$context<Context>().errors(SHARED_ORPC_ERROR_DEFS);

/**
 * Base middleware attached to `publicProcedure`.
 * 1. Maps any uncaught service/domain/database/validation error into the unified `SharedErrorCode` & `ApiErrorResponse` envelope.
 * 2. Customizes the OpenAPI 3.1 operation object via `oo.spec` (https://orpc.dev/docs/openapi/specification)
 *    so that every procedure documents the standardized `ApiSuccessResponse` envelope on 200 responses.
 */
export const baseErrorAndEnvelopeMiddleware = oo.spec(
  o.middleware(async ({ context, next }) => {
    try {
      return await next();
    } catch (error) {
      throw toORPCError(error, context);
    }
  }),
  (operation) => {
    const responses = { ...operation.responses };
    const response200 = responses["200"];
    if (
      response200 &&
      typeof response200 === "object" &&
      "content" in response200 &&
      response200.content?.["application/json"]?.schema
    ) {
      const dataSchema = response200.content["application/json"].schema;
      responses["200"] = {
        ...response200,
        description: response200.description || "Standardized success response envelope (IF-03)",
        content: {
          ...response200.content,
          "application/json": {
            ...response200.content["application/json"],
            schema: {
              type: "object",
              properties: {
                success: { const: true },
                data: dataSchema,
                error: { type: "null" },
                requestId: { type: "string" },
                meta: { $ref: "#/components/schemas/ApiResponseMeta" },
              },
              required: ["success", "data", "error", "requestId", "meta"],
            },
          },
        },
      };
    }
    return {
      ...operation,
      responses,
    };
  },
);

export const publicProcedure = o.use(baseErrorAndEnvelopeMiddleware);

/**
 * Creates a service-scoped error mapping middleware that maps service errors using the service's
 * mapper function into the shared error code catalog and standardized error envelope.
 */
export function createServiceErrorMiddleware(
  mapError: (error: unknown) => ServiceError,
  serviceId?: string,
) {
  return o.middleware(async ({ context, next }) => {
    try {
      return await next();
    } catch (error) {
      if (error instanceof ORPCError && isApiResponseEnvelope(error.data) && !error.data.success) {
        throw error;
      }
      const mapped = mapError(error);
      throw toORPCError(mapped, context, serviceId ?? mapped.serviceId);
    }
  });
}

export const requireAuthMiddleware = oo.spec(
  o.middleware(async ({ context, next }) => {
    if (!context.auth) {
      throw toORPCError(
        new ServiceError("UNAUTHORIZED", "Authentication is required to access this procedure."),
        context,
      );
    }
    return next({
      context: {
        ...context,
        auth: context.auth,
      },
    });
  }),
  {
    security: [{ bearerAuth: [] }],
  },
);

export const authenticatedProcedure = publicProcedure.use(requireAuthMiddleware);

export function requireRoles(...allowedRoles: readonly UserRole[]) {
  return authenticatedProcedure.use(async ({ context, next }) => {
    const actor = context.auth;
    if (!actor || !allowedRoles.includes(actor.activeRole)) {
      throw toORPCError(
        new ServiceError(
          "ROLE_FORBIDDEN",
          `Active role "${actor?.activeRole ?? "anonymous"}" is not permitted. Required one of: ${allowedRoles.join(", ")}.`,
          { allowedRoles, activeRole: actor?.activeRole ?? null },
        ),
        context,
      );
    }
    return next({ context: { ...context, auth: actor } });
  });
}

export function requireAdminSubRoles(...allowedSubRoles: readonly AdminSubRole[]) {
  return authenticatedProcedure.use(async ({ context, next }) => {
    const actor = context.auth;
    if (!actor || actor.activeRole !== "admin" || !actor.adminSubRole) {
      throw toORPCError(
        new ServiceError("ADMIN_SUBROLE_FORBIDDEN", "Platform admin privileges are required."),
        context,
      );
    }
    if (!allowedSubRoles.includes(actor.adminSubRole)) {
      throw toORPCError(
        new ServiceError(
          "ADMIN_SUBROLE_FORBIDDEN",
          `Admin sub-role "${actor.adminSubRole}" cannot perform this action. Required: ${allowedSubRoles.join(", ")}.`,
          { allowedSubRoles, adminSubRole: actor.adminSubRole },
        ),
        context,
      );
    }
    return next({ context: { ...context, auth: actor } });
  });
}

export function requireAdminAction(action: string) {
  return authenticatedProcedure.use(async ({ context, next }) => {
    const actor = context.auth;
    if (!actor || actor.activeRole !== "admin" || !actor.adminSubRole) {
      throw toORPCError(
        new ServiceError("ADMIN_SUBROLE_FORBIDDEN", "Platform admin privileges are required."),
        context,
      );
    }
    if (!hasAdminSubRolePermission(actor.adminSubRole, action)) {
      throw toORPCError(
        new ServiceError(
          "ADMIN_SUBROLE_FORBIDDEN",
          `Admin sub-role "${actor.adminSubRole}" does not have permission for "${action}".`,
          { action, adminSubRole: actor.adminSubRole },
        ),
        context,
      );
    }
    return next({ context: { ...context, auth: actor } });
  });
}

/**
 * Enforces tenant scope (DAT-01) and 9-area employee permissions (D-284).
 * Per SRS IF-12 / FR-ORG-01, cross-tenant or missing tenant context returns TENANT_NOT_FOUND (404) so existence is not leaked.
 */
export function requireTenantScope(
  area?: OrgPermissionArea,
  requiredLevel: "view" | "manage" = "view",
) {
  return authenticatedProcedure.use(async ({ context, next }) => {
    const actor = context.auth;
    if (!actor || !actor.activeTenantId) {
      throw toORPCError(
        new ServiceError("TENANT_NOT_FOUND", "Organization resource not found."),
        context,
      );
    }
    if (actor.activeRole !== "organization_owner" && actor.activeRole !== "organization_employee") {
      throw toORPCError(
        new ServiceError("ROLE_FORBIDDEN", "Organization owner or employee role is required."),
        context,
      );
    }
    if (actor.activeRole === "organization_employee" && area) {
      if (!hasEmployeePermission(actor.permissions, area, requiredLevel)) {
        throw toORPCError(
          new ServiceError(
            "PERMISSION_DENIED",
            `Insufficient employee permissions for area "${area}" (requires "${requiredLevel}").`,
            { area, requiredLevel },
          ),
          context,
        );
      }
    }
    return next({
      context: {
        ...context,
        auth: {
          ...actor,
          activeTenantId: actor.activeTenantId,
        },
      },
    });
  });
}

export function requireModeratorVehicleScope() {
  return authenticatedProcedure.use(async ({ context, next }) => {
    const actor = context.auth;
    if (
      !actor ||
      actor.activeRole !== "moderator" ||
      !actor.moderatorVehicleId ||
      !actor.moderatorTripId
    ) {
      throw toORPCError(
        new ServiceError(
          "MODERATOR_SCOPE_FORBIDDEN",
          "Active vehicle moderator session is required.",
        ),
        context,
      );
    }
    return next({ context: { ...context, auth: actor } });
  });
}
