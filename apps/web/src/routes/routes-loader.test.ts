import { describe, expect, mock, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";

import { authController } from "@/auth/instance";
import { screenLoader } from "@/navigation/load-screen";
import type { SessionController } from "@/auth/session-controller";
import { ALL_SCREENS, findScreen } from "@/screens/registry";
import type { ScreenEntry, ScreenLoaderContext, ScreenLoaderFn } from "@/screens/types";
import { createQueryClient, orpc } from "@/utils/orpc";

import { Route as IndexRoute } from "./index";
import { Route as AdminRoute } from "./admin";
import { Route as BusinessRoute } from "./business";
import { Route as CrewRoute } from "./crew";
import { Route as StudioRoute } from "./studio";

describe("Unit: Route SSR Loaders & Screen Registry (M2)", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
      ...authController,
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
    } as unknown as SessionController;
  }

  test("ScreenEntry type allows defining an optional loader matching ScreenLoaderFn", async () => {
    let loaderRan = false;
    const testScreen: ScreenEntry = {
      id: "SCR-TEST-01",
      slug: "test-screen",
      titleKey: "test",
      surface: "shared",
      component: () => null,
      loader: async (ctx: ScreenLoaderContext) => {
        expect(ctx.queryClient).toBeDefined();
        expect(ctx.orpc).toBeDefined();
        expect(ctx.auth).toBeDefined();
        loaderRan = true;
      },
    };

    expect(testScreen.loader).toBeDefined();
    await testScreen.loader?.({
      queryClient: createQueryClient(),
      orpc,
      auth: createMockAuth(),
      params: { surface: "shared", slug: "test-screen" },
      search: {},
    });
    expect(loaderRan).toBe(true);
  });

  describe("Screen route loader (screenLoader)", () => {
    test("runs the screen loader with the route params and search", async () => {
      const queryClient = createQueryClient();
      const mockAuth = createMockAuth();
      const targetScreen = ALL_SCREENS[0];
      expect(targetScreen).toBeDefined();

      let loaderCalledWith: ScreenLoaderContext | null = null;
      const originalLoader = targetScreen.loader;

      try {
        const testLoader: ScreenLoaderFn = async (ctx) => {
          loaderCalledWith = ctx;
        };
        (targetScreen as { loader?: ScreenLoaderFn }).loader = testLoader;

        const loader = screenLoader(targetScreen.id);

        await loader?.({
          context: { queryClient, orpc, auth: mockAuth },
          params: { tripId: "trip-1" },
          location: { search: { page: 1 } } as any,
          abortController: new AbortController(),
          preload: false,
          cause: "enter",
        } as any);

        expect(loaderCalledWith).not.toBeNull();
        expect(loaderCalledWith?.params).toEqual({ tripId: "trip-1" });
        expect(loaderCalledWith?.search).toEqual({ page: 1 });
        expect(loaderCalledWith?.queryClient).toBe(queryClient);
      } finally {
        (targetScreen as { loader?: ScreenLoaderFn }).loader = originalLoader;
      }
    });

    test("refuses a screen ID that has no web route", () => {
      expect(() => screenLoader("SCR-XXX-99")).toThrow(/SCR-XXX-99/);
    });

    test("handles screen loader errors gracefully without crashing route load", async () => {
      const queryClient = createQueryClient();
      const mockAuth = createMockAuth();
      const targetScreen = ALL_SCREENS[1];
      expect(targetScreen).toBeDefined();

      const originalLoader = targetScreen.loader;
      try {
        (targetScreen as { loader?: ScreenLoaderFn }).loader = async () => {
          throw new Error("401 Unauthorized during unauthenticated SSR");
        };

        const loader = screenLoader(targetScreen.id);
        await expect(
          loader?.({
            context: { queryClient, orpc, auth: mockAuth },
            params: { tripId: "trip-1" },
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
          } as any),
        ).resolves.toBeUndefined();
      } finally {
        (targetScreen as { loader?: ScreenLoaderFn }).loader = originalLoader;
      }
    });
  });

  describe("Index Route (/)", () => {
    test("prefetches api status and public trips in loader", async () => {
      const queryClient = createQueryClient();
      const ensureSpy = mock(async (options: any) => ({ success: true, options }));
      const customQueryClient = {
        ...queryClient,
        ensureQueryData: ensureSpy as any,
      } as QueryClient;

      const loader = IndexRoute.options.loader;
      expect(typeof loader).toBe("function");

      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth() },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: IndexRoute,
      } as any);

      // Must ensure loadApiStatus (healthCheck) and browsePublicTrips
      expect(ensureSpy).toHaveBeenCalled();
      expect(ensureSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    test("delegates to landing screen loader if registered", async () => {
      const queryClient = createQueryClient();
      const landingScreen = findScreen("public", "landing");
      expect(landingScreen).toBeDefined();

      let landingLoaderRan = false;
      const originalLoader = landingScreen?.loader;
      try {
        if (landingScreen) {
          (landingScreen as { loader?: ScreenLoaderFn }).loader = async () => {
            landingLoaderRan = true;
          };
        }

        const loader = IndexRoute.options.loader;
        await loader?.({
          context: {
            queryClient: {
              ...queryClient,
              ensureQueryData: mock(async () => ({})) as any,
            } as any,
            orpc,
            auth: createMockAuth(),
          },
          location: { search: {} } as any,
          abortController: new AbortController(),
          preload: false,
          cause: "enter",
          route: IndexRoute,
        } as any);

        expect(landingLoaderRan).toBe(true);
      } finally {
        if (landingScreen) {
          (landingScreen as { loader?: ScreenLoaderFn }).loader = originalLoader;
        }
      }
    });
  });

  describe("Protected Surface Routes: SSR Auth Safety", () => {
    test("/admin skips protected prefetching on unauthenticated SSR", async () => {
      const ensureSpy = mock(async () => ({ ok: true }));
      const prefetchSpy = mock(async () => {});
      const customQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const unauthenticatedAuth = createMockAuth(null);
      const loader = AdminRoute.options.loader;

      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: unauthenticatedAuth },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: AdminRoute,
      } as any);

      // Health status was ensured
      expect(ensureSpy).toHaveBeenCalled();
      // Protected prefetch was skipped to prevent 401 cache dehydration
      expect(prefetchSpy).not.toHaveBeenCalled();
    });

    test("/admin prefetches AdminHome queries when authenticated", async () => {
      const ensureSpy = mock(async () => ({ ok: true }));
      const prefetchSpy = mock(async () => {});
      const customQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const authenticatedAuth = createMockAuth("admin-jwt-token");
      const loader = AdminRoute.options.loader;

      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: authenticatedAuth },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: AdminRoute,
      } as any);

      expect(ensureSpy).toHaveBeenCalled();
      expect(prefetchSpy).toHaveBeenCalled();
    });

    test("/business skips protected prefetch on unauthenticated SSR and prefetches when authenticated", async () => {
      const ensureSpy = mock(async () => ({ ok: true }));
      const prefetchSpy = mock(async () => {});
      const customQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const loader = BusinessRoute.options.loader;

      // 1. Unauthenticated SSR
      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth(null) },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: BusinessRoute,
      } as any);
      expect(ensureSpy).toHaveBeenCalledTimes(1);
      expect(prefetchSpy).not.toHaveBeenCalled();

      // 2. Authenticated
      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth("business-jwt") },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: BusinessRoute,
      } as any);
      expect(prefetchSpy).toHaveBeenCalled();
    });

    test("/crew skips protected prefetch on unauthenticated SSR and prefetches when authenticated", async () => {
      const ensureSpy = mock(async () => ({ ok: true }));
      const prefetchSpy = mock(async () => {});
      const customQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const loader = CrewRoute.options.loader;

      // 1. Unauthenticated SSR
      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth(null) },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: CrewRoute,
      } as any);
      expect(ensureSpy).toHaveBeenCalledTimes(1);
      expect(prefetchSpy).not.toHaveBeenCalled();

      // 2. Authenticated
      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth("crew-jwt") },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: CrewRoute,
      } as any);
      expect(prefetchSpy).toHaveBeenCalled();
    });

    test("/studio skips protected prefetch on unauthenticated SSR and prefetches when authenticated", async () => {
      const ensureSpy = mock(async () => ({ ok: true }));
      const prefetchSpy = mock(async () => {});
      const customQueryClient = {
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
      } as unknown as QueryClient;

      const loader = StudioRoute.options.loader;

      // 1. Unauthenticated SSR
      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth(null) },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: StudioRoute,
      } as any);
      expect(ensureSpy).toHaveBeenCalledTimes(1);
      expect(prefetchSpy).not.toHaveBeenCalled();

      // 2. Authenticated
      await loader?.({
        context: { queryClient: customQueryClient, orpc, auth: createMockAuth("studio-jwt") },
        location: { search: {} } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route: StudioRoute,
      } as any);
      expect(prefetchSpy).toHaveBeenCalled();
    });
  });
});
