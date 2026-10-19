import type { ComponentType } from "react";
import type { QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import type { orpc } from "@/utils/orpc";

export type ScreenSurface = "organization" | "admin" | "public" | "shared" | "traveler";

export interface ScreenLoaderContext {
  queryClient: QueryClient;
  orpc: typeof orpc;
  auth: SessionController;
  params: Record<string, string>;
  search: Record<string, unknown>;
}

export type ScreenLoaderFn = (context: ScreenLoaderContext) => Promise<unknown> | void;

// One generated screen. Screens take no props and render placeholder data from docs/screens.
export interface ScreenEntry {
  id: string;
  slug: string;
  /** Translation key for the screen name; the copy lives in `@trips-app/i18n`. */
  titleKey: string;
  surface: ScreenSurface;
  component: ComponentType;
  /**
   * Optional SSR/client loader function called by TanStack Router route loaders
   * to ensure/prefetch initial query data.
   */
  loader?: ScreenLoaderFn;
}
