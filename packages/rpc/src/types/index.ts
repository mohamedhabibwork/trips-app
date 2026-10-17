// Shared TypeScript interfaces and types for @trips-app/rpc.
import type { Database } from "@trips-app/db";
import type {
  AdminSubRole,
  ApiErrorFieldDetail,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  CreateErrorResponseInput,
  CreateSuccessResponseOptions,
  ErrorCategory,
  ErrorHttpStatus,
  OrgPermissionArea,
  OrgPermissionMatrix,
  ServiceErrorOptions,
  SHARED_ERROR_CATALOG,
  SharedErrorCode,
  SharedErrorDefinition,
  SupportedLocale,
  UserRole,
} from "@trips-app/domain";

export type {
  AdminSubRole,
  ApiErrorFieldDetail,
  ApiErrorPayload,
  ApiErrorResponse,
  ApiPaginationMeta,
  ApiResponse,
  ApiResponseMeta,
  ApiSuccessResponse,
  CreateErrorResponseInput,
  CreateSuccessResponseOptions,
  ErrorCategory,
  ErrorHttpStatus,
  OrgPermissionArea,
  OrgPermissionMatrix,
  ServiceErrorOptions,
  SharedErrorCode,
  SharedErrorDefinition,
  SupportedLocale,
  UserRole,
};

export interface AuthActor {
  accountId: string;
  sessionId: string;
  activeRole: UserRole;
  adminSubRole?: AdminSubRole | null;
  activeTenantId?: string | null;
  planTier?: string | null;
  permissions?: Partial<OrgPermissionMatrix> | null;
  moderatorVehicleId?: string | null;
  moderatorTripId?: string | null;
}

// Procedure context shared by every router. Routes read db and auth from here and pass them to services.
export type Context = {
  db: Database;
  requestId?: string;
  locale?: SupportedLocale;
  ipAddress?: string;
  userAgent?: string;
  deviceFingerprint?: string;
  idempotencyKey?: string | null;
  auth?: AuthActor | null;
};

/**
 * Shared oRPC error map built from the central `SHARED_ERROR_CATALOG`.
 */
export type SharedORPCErrorDefMap = {
  [K in SharedErrorCode]: {
    status: (typeof SHARED_ERROR_CATALOG)[K]["status"];
    message: string;
  };
};
