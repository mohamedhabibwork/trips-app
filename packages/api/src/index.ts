export {
  buildOpenAPIErrorResponseBodySchema,
  COMMON_OPENAPI_SCHEMAS,
  createErrorResponse,
  createServiceErrorMapper,
  createSuccessResponse,
  encodeOpenAPIErrorResponse,
  ERROR_CATEGORIES,
  isApiResponseEnvelope,
  mapErrorCodeToSharedCode,
  normalizeErrorToEnvelope,
  o,
  oo,
  publicProcedure,
  resolveSharedErrorDefinition,
  ServiceError,
  SHARED_ERROR_CATALOG,
  SHARED_ERROR_CODES,
  toORPCError,
  wrapOpenAPIHttpResponse,
} from "@trips-app/rpc";
export {
  createOpenAPISpecGenerateOptions,
  generateOpenAPISpec,
  OPENAPI_SERVICE_TAGS,
  openAPIGenerator,
} from "./openapi";
export type * from "./types";
