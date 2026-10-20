import { OpenAPIGenerator, type OpenAPIGeneratorGenerateOptions } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import {
  buildOpenAPIErrorResponseBodySchema,
  COMMON_OPENAPI_SCHEMAS,
  ERROR_CATEGORIES,
  SHARED_ERROR_CODES,
} from "@trips-app/rpc";

import { appRouter } from "./routers/index";
import type { CreateOpenAPISpecOptions } from "./types";

export type { CreateOpenAPISpecOptions } from "./types";

/**
 * OpenAPI tag metadata for the platform system routes and all 26 Trips Enjoy domain services.
 */
export const OPENAPI_SERVICE_TAGS = [
  {
    name: "system",
    description: "Platform health, readiness, and system status endpoints",
  },
  {
    name: "accounting",
    description: "Tenant financial ledger, payouts, invoices, and accounting operations",
  },
  {
    name: "admin",
    description: "Platform administration, RBAC sub-roles, system settings, and audit logs",
  },
  {
    name: "auth",
    description: "Authentication, OTP, MFA, sessions, and role-context switching",
  },
  {
    name: "availability",
    description: "Driver and vehicle schedule availability and conflict detection",
  },
  {
    name: "booking",
    description: "Traveler and parent trip bookings, holds, and lifecycle transitions",
  },
  {
    name: "check-in",
    description: "QR boarding passes, passenger check-in, and manifest verification",
  },
  {
    name: "coupons",
    description: "Promotional codes, discount rules, and redemption validation",
  },
  {
    name: "driver",
    description: "Driver profile, compliance documents, and trip execution",
  },
  {
    name: "documents",
    description:
      "PDF document rendering (invoices, tickets, itineraries, manifests, statements) and client email delivery",
  },
  {
    name: "employees",
    description: "Organization staff invitations, 9-area permission matrices, and roles",
  },
  {
    name: "fleet",
    description: "Vehicle registry, inspections, maintenance, and capacity management",
  },
  {
    name: "media",
    description: "Signed uploads, trip galleries, and media asset management",
  },
  {
    name: "moderator",
    description: "Vehicle-scoped trip moderation, attendance, and safety checkpoints",
  },
  {
    name: "negotiation",
    description: "Driver/staff compensation negotiation and counter-offer workflows",
  },
  {
    name: "notifications",
    description: "Multi-channel push, SMS, WhatsApp, and in-app notification delivery",
  },
  {
    name: "onboarding",
    description: "User and organization onboarding flows, KYC, and tour state",
  },
  {
    name: "organization",
    description: "Multi-tenant organization settings, branding, policies, and verification",
  },
  {
    name: "parent",
    description: "Parent/guardian minor profiles, consents, and live trip monitoring",
  },
  {
    name: "payments",
    description: "Payment intents, gateways, refunds, and webhook reconciliation",
  },
  {
    name: "photographer",
    description: "Trip photographer assignments, portfolios, and media deliveries",
  },
  {
    name: "plans",
    description: "SaaS subscription tiers, quotas, and feature entitlements",
  },
  {
    name: "programs",
    description: "Multi-day and recurring trip programs and school/group packages",
  },
  {
    name: "seats",
    description: "Vehicle seat maps, seat selection, and lock management",
  },
  {
    name: "staffing",
    description: "Trip staffing requirements, job postings, and shift assignments",
  },
  {
    name: "tracking",
    description: "Real-time GPS telemetry, route geofences, and ETA broadcasting",
  },
  {
    name: "traveler",
    description: "Traveler discovery, saved trips, reviews, and profile preferences",
  },
  {
    name: "trips",
    description: "Core trip creation, itineraries, pricing, and publishing lifecycle",
  },
] as const;

/**
 * Builds the `OpenAPIGeneratorGenerateOptions` following the oRPC OpenAPI specification guide:
 * https://orpc.dev/docs/openapi/specification
 */
export function createOpenAPISpecGenerateOptions(
  options?: CreateOpenAPISpecOptions,
): OpenAPIGeneratorGenerateOptions {
  return {
    info: {
      title: options?.title ?? "Trips Enjoy Platform API",
      version: options?.version ?? "1.0.0",
      description:
        "Unified OpenAPI 3.1.1 specification for the Trips Enjoy multi-tenant platform. " +
        "All endpoints return the standardized ApiResponse envelope (ApiSuccessResponse on 2xx, " +
        "ApiErrorResponse on 4xx/5xx) and use centralized SharedErrorCode values mapped to SRS IF-04 categories.",
    },
    servers: [
      {
        url: options?.serverUrl ?? "/api",
        description: "Trips Enjoy OpenAPI REST Gateway",
      },
      {
        url: "/api-reference",
        description: "Trips Enjoy OpenAPI Reference Gateway",
      },
    ],
    tags: [...OPENAPI_SERVICE_TAGS],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "RS256/HS256 Bearer access token containing activeRole, tenantId, and session claims.",
        },
      },
      schemas: {
        SharedErrorCode: {
          type: "string",
          description: "Centralized error code catalog shared across all 26 platform services.",
          enum: [...SHARED_ERROR_CODES],
        },
        ErrorCategory: {
          type: "string",
          description: "SRS IF-04 error category determining HTTP status and retry semantics.",
          enum: [...ERROR_CATEGORIES],
        },
      },
    },
    commonSchemas: COMMON_OPENAPI_SCHEMAS,
    customErrorResponseBodySchema: buildOpenAPIErrorResponseBodySchema,
  };
}

/**
 * Shared `OpenAPIGenerator` instance configured with `ZodToJsonSchemaConverter` (Zod v4).
 */
export const openAPIGenerator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

/**
 * Generates the complete OpenAPI 3.1.1 specification document from `appRouter`.
 */
export async function generateOpenAPISpec(options?: CreateOpenAPISpecOptions) {
  return openAPIGenerator.generate(appRouter, createOpenAPISpecGenerateOptions(options));
}
