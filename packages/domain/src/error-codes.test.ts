import { describe, expect, it } from "bun:test";

import {
  createErrorResponse,
  createServiceErrorMapper,
  createSuccessResponse,
  ERROR_CATEGORIES,
  ERROR_CATEGORY_STATUS_MAP,
  extractValidationFieldErrors,
  isApiResponseEnvelope,
  isServiceError,
  mapErrorCodeToSharedCode,
  normalizeErrorToEnvelope,
  resolveSharedErrorDefinition,
  ServiceError,
  SHARED_ERROR_CATALOG,
  SHARED_ERROR_CODES,
} from "./index";

describe("Centralized Shared Error Code System (@trips-app/domain)", () => {
  it("defines all 11 SRS IF-04 error categories with canonical HTTP status codes", () => {
    expect(ERROR_CATEGORIES).toEqual([
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
    ]);

    expect(ERROR_CATEGORY_STATUS_MAP).toEqual({
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
    });
  });

  it("ensures every SharedErrorCode has a complete bilingual catalog entry and canonical HTTP status", () => {
    expect(SHARED_ERROR_CODES.length).toBeGreaterThanOrEqual(40);

    for (const code of SHARED_ERROR_CODES) {
      const def = SHARED_ERROR_CATALOG[code];
      expect(def).toBeDefined();
      expect(def.code).toBe(code);
      expect(ERROR_CATEGORIES).toContain(def.category);
      expect(def.status).toBe(ERROR_CATEGORY_STATUS_MAP[def.category]);
      expect(typeof def.retryable).toBe("boolean");
      expect(def.defaultMessage.en.length).toBeGreaterThan(3);
      expect(def.defaultMessage.ar.length).toBeGreaterThan(3);
    }
  });

  it("creates ServiceError instances with resolved category, HTTP status, details, and fieldErrors", () => {
    const err = new ServiceError(
      "INVALID_INPUT",
      "Phone number must use E.164 format.",
      { field: "phoneE164" },
      "auth",
    );

    expect(isServiceError(err)).toBe(true);
    expect(err.code).toBe("INVALID_INPUT");
    expect(err.category).toBe("VALIDATION_ERROR");
    expect(err.status).toBe(400);
    expect(err.serviceId).toBe("auth");
    expect(err.fieldErrors).toEqual([
      {
        field: "phoneE164",
        code: "INVALID_INPUT",
        message: "Phone number must use E.164 format.",
      },
    ]);
  });

  it("maps legacy/service-specific codes, Zod validation errors, and PostgreSQL constraint errors to SharedErrorCode without leaking SQL", () => {
    const mapTripsError = createServiceErrorMapper("trips", {
      TRIP_CAPACITY_EXCEEDED: "BUSINESS_RULE_VIOLATION",
      TRIP_NOT_FOUND: "RESOURCE_NOT_FOUND",
    });

    // 1. Custom domain code mapping
    const customErr = mapTripsError({
      code: "TRIP_CAPACITY_EXCEEDED",
      message: "Trip capacity cannot be reduced below confirmed bookings.",
    });
    expect(customErr.code).toBe("BUSINESS_RULE_VIOLATION");
    expect(customErr.category).toBe("BUSINESS_RULE_VIOLATION");
    expect(customErr.status).toBe(422);
    expect(customErr.serviceId).toBe("trips");

    // 2. Standard Schema / Zod validation error mapping
    const zodLikeError = {
      issues: [
        {
          path: ["pricing", "adultHalalas"],
          code: "too_small",
          message: "Price must be >= 0",
        },
      ],
    };
    const validationErr = mapTripsError(zodLikeError);
    expect(validationErr.code).toBe("VALIDATION_ERROR");
    expect(validationErr.status).toBe(400);
    expect(validationErr.fieldErrors).toEqual([
      {
        field: "pricing.adultHalalas",
        code: "too_small",
        message: "Price must be >= 0",
      },
    ]);

    // 3. PostgreSQL unique violation (23505) without leaking raw SQL
    const pgUniqueErr = mapTripsError({
      code: "23505",
      message: 'duplicate key value violates unique constraint "organizations_slug_unique"',
      detail: "Key (slug)=(desert-falcon) already exists.",
    });
    expect(pgUniqueErr.code).toBe("DUPLICATE_RESOURCE");
    expect(pgUniqueErr.category).toBe("CONFLICT");
    expect(pgUniqueErr.status).toBe(409);
    expect(pgUniqueErr.message).not.toContain("organizations_slug_unique");

    // 4. PostgreSQL foreign key violation (23503)
    const pgFkErr = mapTripsError({
      code: "23503",
      message: 'insert or update on table "trips" violates foreign key constraint',
    });
    expect(pgFkErr.code).toBe("VALIDATION_ERROR");
    expect(pgFkErr.status).toBe(400);

    // 5. Unknown unexpected error -> INTERNAL_ERROR (500)
    const unknownErr = mapTripsError(new Error("Unexpected null pointer"));
    expect(unknownErr.code).toBe("INTERNAL_ERROR");
    expect(unknownErr.status).toBe(500);
  });

  it("extracts field errors and maps fallback codes accurately", () => {
    expect(mapErrorCodeToSharedCode("UNAUTHORIZED")).toBe("UNAUTHORIZED");
    expect(mapErrorCodeToSharedCode("TOO_MANY_REQUESTS")).toBe("RATE_LIMITED");
    expect(mapErrorCodeToSharedCode("NON_EXISTENT_CUSTOM_CODE")).toBe("INTERNAL_ERROR");
    expect(resolveSharedErrorDefinition("TENANT_NOT_FOUND").status).toBe(404);
    expect(extractValidationFieldErrors(null)).toBeUndefined();
  });
});

describe("Standardized Backend Response Envelope (@trips-app/domain)", () => {
  it("builds standardized ApiSuccessResponse envelopes for all success payloads", () => {
    const response = createSuccessResponse(
      { tripId: "trip_01", status: "published" },
      {
        requestId: "req_test_123",
        locale: "en",
        service: "trips",
        timestamp: "2026-10-17T12:00:00.000Z",
        pagination: {
          limit: 20,
          hasMore: false,
          nextCursor: null,
        },
      },
    );

    expect(isApiResponseEnvelope(response)).toBe(true);
    expect(response).toEqual({
      success: true,
      data: { tripId: "trip_01", status: "published" },
      error: null,
      requestId: "req_test_123",
      meta: {
        requestId: "req_test_123",
        timestamp: "2026-10-17T12:00:00.000Z",
        locale: "en",
        service: "trips",
        pagination: {
          limit: 20,
          hasMore: false,
          nextCursor: null,
        },
      },
    });
  });

  it("builds standardized ApiErrorResponse envelopes with bilingual localization (AR/EN)", () => {
    const arError = createErrorResponse({
      code: "TENANT_NOT_FOUND",
      locale: "ar",
      requestId: "req_ar_404",
      service: "organization",
    });

    expect(isApiResponseEnvelope(arError)).toBe(true);
    expect(arError.success).toBe(false);
    expect(arError.data).toBeNull();
    expect(arError.error.code).toBe("TENANT_NOT_FOUND");
    expect(arError.error.category).toBe("NOT_FOUND");
    expect(arError.error.status).toBe(404);
    expect(arError.error.message).toBe(SHARED_ERROR_CATALOG.TENANT_NOT_FOUND.defaultMessage.ar);
    expect(arError.meta.locale).toBe("ar");

    const normalized = normalizeErrorToEnvelope(
      new ServiceError("PLAN_LIMIT_EXCEEDED", undefined, { limit: 10 }, "plans"),
      {
        locale: "en",
        requestId: "req_plan_402",
      },
    );

    expect(normalized.success).toBe(false);
    expect(normalized.error.code).toBe("PLAN_LIMIT_EXCEEDED");
    expect(normalized.error.category).toBe("PLAN_REQUIRED");
    expect(normalized.error.status).toBe(402);
    expect(normalized.error.details).toEqual({ limit: 10 });
    expect(normalized.meta.service).toBe("plans");
  });
});
