import { describe, expect, it } from "bun:test";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import type { Database } from "@trips-app/db";
import { mapAccountingError } from "@trips-app/service-accounting";
import { mapAdminError } from "@trips-app/service-admin";
import { mapAuthError } from "@trips-app/service-auth";
import { mapAvailabilityError } from "@trips-app/service-availability";
import { mapBookingError } from "@trips-app/service-booking";
import { mapCheckInError } from "@trips-app/service-check-in";
import { mapCouponsError } from "@trips-app/service-coupons";
import { mapDriverError } from "@trips-app/service-driver";
import { mapEmployeesError } from "@trips-app/service-employees";
import { mapFleetError } from "@trips-app/service-fleet";
import { mapMediaError } from "@trips-app/service-media";
import { mapModeratorError } from "@trips-app/service-moderator";
import { mapNegotiationError } from "@trips-app/service-negotiation";
import { mapNotificationsError } from "@trips-app/service-notifications";
import { mapOnboardingError } from "@trips-app/service-onboarding";
import { mapOrganizationError } from "@trips-app/service-organization";
import { mapParentError } from "@trips-app/service-parent";
import { mapPaymentsError } from "@trips-app/service-payments";
import { mapPhotographerError } from "@trips-app/service-photographer";
import { mapPlansError } from "@trips-app/service-plans";
import { mapProgramsError } from "@trips-app/service-programs";
import { mapSeatsError } from "@trips-app/service-seats";
import { mapStaffingError } from "@trips-app/service-staffing";
import { mapTrackingError } from "@trips-app/service-tracking";
import { mapTravelerError } from "@trips-app/service-traveler";
import { mapTripsError } from "@trips-app/service-trips";

import {
  createOpenAPISpecGenerateOptions,
  encodeOpenAPIErrorResponse,
  ERROR_CATEGORIES,
  generateOpenAPISpec,
  isApiResponseEnvelope,
  OPENAPI_SERVICE_TAGS,
  ServiceError,
  SHARED_ERROR_CODES,
  wrapOpenAPIHttpResponse,
} from "./index";
import { appRouter } from "./routers/index";

describe("oRPC OpenAPI 3.1 Specification & Standardized Envelope (@trips-app/api)", () => {
  it("generates a complete OpenAPI 3.1.1 specification covering all 26 services and common schemas", async () => {
    const spec = await generateOpenAPISpec();

    expect(spec.openapi).toBe("3.1.1");
    expect(spec.info.title).toBe("Trips Enjoy Platform API");
    expect(spec.tags?.length).toBe(OPENAPI_SERVICE_TAGS.length);

    // Security schemes & reusable envelope schemas
    expect(spec.components?.securitySchemes?.bearerAuth).toEqual({
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
      description:
        "RS256/HS256 Bearer access token containing activeRole, tenantId, and session claims.",
    });

    const schemas = spec.components?.schemas ?? {};
    expect(schemas.ApiResponseMeta).toBeDefined();
    expect(schemas.ApiPaginationMeta).toBeDefined();
    expect(schemas.ApiErrorFieldDetail).toBeDefined();
    expect(schemas.ApiErrorPayload).toBeDefined();
    expect(schemas.ApiErrorResponse).toBeDefined();
    expect(schemas.SharedErrorCode).toBeDefined();
    expect(schemas.ErrorCategory).toBeDefined();

    // Verify paths exist for system + core services + all 22 domain services
    const paths = spec.paths ?? {};
    expect(paths["/healthCheck"]?.get).toBeDefined();
    expect(paths["/auth/signIn"]?.post).toBeDefined();
    expect(paths["/organization/getOrganizationSettings"]?.post).toBeDefined();
    expect(paths["/admin/getSystemSettings"]?.get).toBeDefined();
    expect(paths["/onboarding/submitOrganizationApplication"]?.post).toBeDefined();
    expect(paths["/trips/status"]?.get).toBeDefined();
    expect(paths["/booking/status"]?.get).toBeDefined();
    expect(paths["/payments/status"]?.get).toBeDefined();

    // Verify oo.spec standardized 200 envelope on operations
    const healthOp = paths["/healthCheck"]?.get;
    const health200 = healthOp?.responses?.["200"] as {
      content?: { "application/json"?: { schema?: Record<string, unknown> } };
    };
    const healthSchema = health200?.content?.["application/json"]?.schema;
    expect(healthSchema).toBeDefined();
    expect((healthSchema as { required?: string[] }).required).toEqual([
      "success",
      "data",
      "error",
      "requestId",
      "meta",
    ]);

    // Verify oo.spec security requirement on authenticated procedures
    const orgGetSettingsOp = paths["/organization/getOrganizationSettings"]?.post;
    expect(orgGetSettingsOp?.security).toEqual([{ bearerAuth: [] }]);
  });

  it("serves standardized ApiSuccessResponse and ApiErrorResponse envelopes via OpenAPIHandler", async () => {
    const handler = new OpenAPIHandler(appRouter, {
      customErrorResponseBodyEncoder: (err) => encodeOpenAPIErrorResponse(err),
      plugins: [
        new OpenAPIReferencePlugin({
          schemaConverters: [new ZodToJsonSchemaConverter()],
          specGenerateOptions: createOpenAPISpecGenerateOptions(),
        }),
      ],
    });

    const mockDb = {} as Database;

    // 1. 200 Success on /api/trips/status
    const pingReq = new Request("http://localhost/api/trips/status", {
      method: "GET",
      headers: {
        "x-request-id": "req_ping_001",
        "accept-language": "en",
      },
    });
    const pingResult = await handler.handle(pingReq, {
      prefix: "/api",
      context: {
        db: mockDb,
        requestId: "req_ping_001",
        locale: "en",
        auth: null,
      },
    });
    const wrappedPing = await wrapOpenAPIHttpResponse(pingResult.response, {
      requestId: "req_ping_001",
      locale: "en",
    });

    expect(wrappedPing.status).toBe(200);
    expect(wrappedPing.headers.get("x-request-id")).toBe("req_ping_001");
    const pingBody = (await wrappedPing.json()) as {
      success: true;
      data: { service: string; status: string };
      error: null;
      requestId: string;
      meta: { locale: string };
    };
    expect(isApiResponseEnvelope(pingBody)).toBe(true);
    expect(pingBody.success).toBe(true);
    expect(pingBody.data).toEqual({
      service: "trips",
      status: "ok",
    });
    expect(pingBody.error).toBeNull();
    expect(pingBody.requestId).toBe("req_ping_001");
    expect(pingBody.meta.locale).toBe("en");

    // 2. 401 Unauthorized on protected endpoint (/api/admin/getSystemSettings)
    const unauthReq = new Request("http://localhost/api/admin/getSystemSettings", {
      method: "GET",
      headers: {
        "x-request-id": "req_unauth_401",
        "accept-language": "ar",
      },
    });
    const unauthResult = await handler.handle(unauthReq, {
      prefix: "/api",
      context: {
        db: mockDb,
        requestId: "req_unauth_401",
        locale: "ar",
        auth: null,
      },
    });
    const wrappedUnauth = await wrapOpenAPIHttpResponse(unauthResult.response, {
      requestId: "req_unauth_401",
      locale: "ar",
    });

    expect(wrappedUnauth.status).toBe(401);
    expect(wrappedUnauth.headers.get("x-request-id")).toBe("req_unauth_401");
    const unauthBody = (await wrappedUnauth.json()) as {
      success: false;
      data: null;
      error: { code: string; category: string; status: number; message: string };
      requestId: string;
    };
    expect(isApiResponseEnvelope(unauthBody)).toBe(true);
    expect(unauthBody.success).toBe(false);
    expect(unauthBody.data).toBeNull();
    expect(unauthBody.error.code).toBe("UNAUTHORIZED");
    expect(unauthBody.error.category).toBe("UNAUTHORIZED");
    expect(unauthBody.error.status).toBe(401);
    expect(unauthBody.requestId).toBe("req_unauth_401");

    // 3. 404 Not Found on unknown route
    const notFoundReq = new Request("http://localhost/api/unknown/route", {
      method: "GET",
    });
    const notFoundResult = await handler.handle(notFoundReq, {
      prefix: "/api",
      context: {
        db: mockDb,
        requestId: "req_404",
        locale: "en",
        auth: null,
      },
    });
    const wrappedNotFound = await wrapOpenAPIHttpResponse(notFoundResult.response, {
      requestId: "req_404",
      locale: "en",
    });

    expect(wrappedNotFound.status).toBe(404);
    const notFoundBody = (await wrappedNotFound.json()) as {
      success: false;
      error: { code: string; status: number };
    };
    expect(notFoundBody.success).toBe(false);
    expect(notFoundBody.error.code).toBe("RESOURCE_NOT_FOUND");
    expect(notFoundBody.error.status).toBe(404);

    // 4. OpenAPI /spec.json remains a valid unwrapped OpenAPI 3.1.1 document
    const specReq = new Request("http://localhost/api/spec.json", {
      method: "GET",
    });
    const specResult = await handler.handle(specReq, {
      prefix: "/api",
      context: {
        db: mockDb,
        requestId: "req_spec",
        locale: "en",
        auth: null,
      },
    });
    const wrappedSpec = await wrapOpenAPIHttpResponse(specResult.response, {
      requestId: "req_spec",
      locale: "en",
    });

    expect(wrappedSpec.status).toBe(200);
    const specJson = (await wrappedSpec.json()) as {
      openapi: string;
      paths: Record<string, unknown>;
    };
    expect(specJson.openapi).toBe("3.1.1");
    expect(specJson.paths["/healthCheck"]).toBeDefined();
  });

  it("verifies all 26 services map errors to the centralized SharedErrorCode catalog", () => {
    const serviceMappers = [
      ["accounting", mapAccountingError],
      ["admin", mapAdminError],
      ["auth", mapAuthError],
      ["availability", mapAvailabilityError],
      ["booking", mapBookingError],
      ["check-in", mapCheckInError],
      ["coupons", mapCouponsError],
      ["driver", mapDriverError],
      ["employees", mapEmployeesError],
      ["fleet", mapFleetError],
      ["media", mapMediaError],
      ["moderator", mapModeratorError],
      ["negotiation", mapNegotiationError],
      ["notifications", mapNotificationsError],
      ["onboarding", mapOnboardingError],
      ["organization", mapOrganizationError],
      ["parent", mapParentError],
      ["payments", mapPaymentsError],
      ["photographer", mapPhotographerError],
      ["plans", mapPlansError],
      ["programs", mapProgramsError],
      ["seats", mapSeatsError],
      ["staffing", mapStaffingError],
      ["tracking", mapTrackingError],
      ["traveler", mapTravelerError],
      ["trips", mapTripsError],
    ] as const;

    expect(serviceMappers.length).toBe(26);

    for (const [serviceId, mapError] of serviceMappers) {
      const mappedNotFound = mapError({
        code: `${serviceId.toUpperCase().replace("-", "_")}_NOT_FOUND`,
        message: `Missing resource in ${serviceId}`,
      });
      expect(mappedNotFound).toBeInstanceOf(ServiceError);
      expect(SHARED_ERROR_CODES).toContain(mappedNotFound.code);
      expect(ERROR_CATEGORIES).toContain(mappedNotFound.category);
      expect(mappedNotFound.category).toBe("NOT_FOUND");
      expect(["RESOURCE_NOT_FOUND", "TENANT_NOT_FOUND"]).toContain(mappedNotFound.code);
      expect(mappedNotFound.status).toBe(404);
      expect(mappedNotFound.serviceId).toBe(serviceId);
    }
  });
});
