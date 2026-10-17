// Shared TypeScript interfaces and types for apps/web.
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import type { orpc } from "@/utils/orpc";

export type { CoercedEnvSchema, EnvSchemaAsStrings, PublicCoercedEnvSchema } from "../env";
export type {
  FileRoutesByFullPath,
  FileRoutesById,
  FileRoutesByTo,
  FileRouteTypes,
  RootRouteChildren,
} from "../routeTree.gen";

export type SurfaceInfo = {
  id: string;
  domain: string;
};

export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
  /**
   * The session controller (ARCHITECTURE §4.1). Guards read it synchronously in `beforeLoad`, which
   * is why it lives on the router context instead of in a React hook.
   */
  auth: SessionController;
}

export type {
  LookupItemDto,
  LookupLocalizedText,
  LookupSelectOption,
  LookupTypeCode,
  LookupTypeDto,
  LookupTypeWithItemsDto,
} from "@/utils/lookups";
