// Shared TypeScript interfaces and types for @trips-app/api.
import type { AnyProcedure, RouterClient } from "@orpc/server";

import type { appRouter } from "../routers/index";

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
} from "@trips-app/db";
export type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
  AuthActor,
  Context,
  ErrorCategory,
  ErrorHttpStatus,
  SharedErrorCode,
} from "@trips-app/rpc";

export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;

export interface CreateOpenAPISpecOptions {
  title?: string;
  version?: string;
  serverUrl?: string;
}

export type ProcedureEntry = {
  /** Nested router keys, for example ["admin", "updateSystemSettings"]. */
  path: readonly string[];
  procedure: AnyProcedure;
};
