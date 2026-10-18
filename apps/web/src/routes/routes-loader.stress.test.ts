import { describe, expect, mock, test } from "bun:test";
import { dehydrate, type QueryClient } from "@tanstack/react-query";

import type { SessionController } from "@/auth/session-controller";
import { ALL_SCREENS, findScreen } from "@/screens/registry";
import type { ScreenLoaderFn } from "@/screens/types";
import { createQueryClient, orpc } from "@/utils/orpc";

import { Route as AdminRoute } from "./admin";
import { Route as BusinessRoute } from "./business";
import { Route as CrewRoute } from "./crew";
import { Route as IndexRoute } from "./index";
import { Route as ScreenDetailRoute } from "./screens.$surface.$slug";
import { Route as StudioRoute } from "./studio";

describe("Empirical Challenger: SSR Loader Integration & Auth Safety Stress Test", () => {
  function createMockAuth(token: string | null = null): SessionController {
    return {
      accessToken: () => token,
      status: () => (token ? "authenticated" : "anonymous"),
      getSnapshot: () => ({
        status: token ? "authenticated" : "anonymous",
        actor: token
          ? { accountId: "acc-123", email: "test@example.com", activeRole: "admin", role: "admin" }
          : null,
        record: null,
      }),
    } as unknown as SessionController;
  }

  // 1. Stress test unauthenticated SSR on protected routes: /admin, /business, /crew, /studio
  const protectedRoutes = [
    { name: "/admin", route: AdminRoute, screenSurface: "admin", screenSlug: "admin-home" },
    {
      name: "/business",
      route: BusinessRoute,
      screenSurface: "organization",
      screenSlug: "workspace-home",
    },
    {
      name: "/crew",
      route: CrewRoute,
      screenSurface: "organization",
      screenSlug: "live-operations",
    },
    {
      name: "/studio",
      route: StudioRoute,
      screenSurface: "organization",
      screenSlug: "staffing-board",
    },
  ];

  for (const { name, route, screenSurface, screenSlug } of protectedRoutes) {
    describe(`Route: ${name}`, () => {
      test("unauthenticated SSR (accessToken() === null): zero 401 rejections, zero error dehydration", async () => {
        const qc = createQueryClient();
        const unauth = createMockAuth(null);

        const prefetchSpy = mock(async () => {
          throw new Error("401 Unauthorized: should not be called in unauthenticated SSR");
        });
        const ensureSpy = mock(async () => ({ status: "ok" }));

        const customQc = {
          ...qc,
          prefetchQuery: prefetchSpy,
          ensureQueryData: ensureSpy,
          getQueryCache: () => qc.getQueryCache(),
          getDefaultOptions: () => qc.getDefaultOptions(),
        } as unknown as QueryClient;

        const loader = route.options.loader;
        expect(typeof loader).toBe("function");

        // Execute loader under typeof window === "undefined"
        await expect(
          loader?.({
            context: { queryClient: customQc, orpc, auth: unauth },
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
            route,
          } as any),
        ).resolves.toBeUndefined();

        // 1. Public api-status / healthCheck was ensured
        expect(ensureSpy).toHaveBeenCalledTimes(1);

        // 2. Protected prefetch was NEVER initiated
        expect(prefetchSpy).not.toHaveBeenCalled();

        // 3. Dehydrated state contains NO errors
        const dehydrated = dehydrate(qc);
        for (const q of dehydrated.queries) {
          expect(q.state.status).not.toBe("error");
        }
      });

      test("unauthenticated SSR with edge-case falsy access tokens (undefined, empty string)", async () => {
        const falsyTokens: (string | null | undefined)[] = [undefined, "", null];

        for (const token of falsyTokens) {
          const qc = createQueryClient();
          const mockAuth = {
            accessToken: () => token as string | null,
            status: () => "anonymous",
          } as unknown as SessionController;

          const prefetchSpy = mock(async () => {});
          const ensureSpy = mock(async () => ({ status: "ok" }));
          const customQc = {
            ...qc,
            prefetchQuery: prefetchSpy,
            ensureQueryData: ensureSpy,
          } as unknown as QueryClient;

          const loader = route.options.loader;
          await loader?.({
            context: { queryClient: customQc, orpc, auth: mockAuth },
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
            route,
          } as any);

          expect(ensureSpy).toHaveBeenCalledTimes(1);
          expect(prefetchSpy).not.toHaveBeenCalled();
        }
      });

      test("unauthenticated SSR: screen-level loader is bypassed to prevent 401 leaks", async () => {
        const qc = createQueryClient();
        const unauth = createMockAuth(null);
        const screen = findScreen(screenSurface, screenSlug);
        expect(screen).toBeDefined();

        const originalLoader = screen?.loader;
        let screenLoaderInvoked = false;

        try {
          if (screen) {
            (screen as { loader?: ScreenLoaderFn }).loader = async () => {
              screenLoaderInvoked = true;
              throw new Error("401 Unauthorized from screen loader");
            };
          }

          const loader = route.options.loader;
          await expect(
            loader?.({
              context: {
                queryClient: {
                  ...qc,
                  ensureQueryData: mock(async () => ({ status: "ok" })) as any,
                } as any,
                orpc,
                auth: unauth,
              },
              location: { search: {} } as any,
              abortController: new AbortController(),
              preload: false,
              cause: "enter",
              route,
            } as any),
          ).resolves.toBeUndefined();

          // Screen loader MUST NOT be called during unauthenticated SSR
          expect(screenLoaderInvoked).toBe(false);
        } finally {
          if (screen) {
            (screen as { loader?: ScreenLoaderFn }).loader = originalLoader;
          }
        }
      });

      test("authenticated SSR (valid token): delegates to screen loader or prefetches with Promise.allSettled", async () => {
        const qc = createQueryClient();
        const authenticatedAuth = createMockAuth("valid-bearer-jwt");
        const screen = findScreen(screenSurface, screenSlug);
        expect(screen).toBeDefined();

        // Sub-scenario A: Screen has custom loader
        let screenLoaderRan = false;
        const originalLoader = screen?.loader;
        try {
          if (screen) {
            (screen as { loader?: ScreenLoaderFn }).loader = async () => {
              screenLoaderRan = true;
            };
          }

          const loader = route.options.loader;
          await loader?.({
            context: {
              queryClient: {
                ...qc,
                ensureQueryData: mock(async () => ({ status: "ok" })) as any,
              } as any,
              orpc,
              auth: authenticatedAuth,
            },
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
            route,
          } as any);

          expect(screenLoaderRan).toBe(true);
        } finally {
          if (screen) {
            (screen as { loader?: ScreenLoaderFn }).loader = originalLoader;
          }
        }

        // Sub-scenario B: Screen has no custom loader -> prefetches fallbacks using Promise.allSettled
        const prefetchSpy = mock(async () => {});
        const ensureSpy = mock(async () => ({ status: "ok" }));
        const customQc = {
          ...qc,
          prefetchQuery: prefetchSpy,
          ensureQueryData: ensureSpy,
        } as unknown as QueryClient;

        const loader = route.options.loader;
        await loader?.({
          context: { queryClient: customQc, orpc, auth: authenticatedAuth },
          location: { search: {} } as any,
          abortController: new AbortController(),
          preload: false,
          cause: "enter",
          route,
        } as any);

        expect(ensureSpy).toHaveBeenCalled();
        expect(prefetchSpy).toHaveBeenCalled();
      });

      test("authenticated SSR: handles 401 / server rejection inside Promise.allSettled without crashing", async () => {
        const qc = createQueryClient();
        const authenticatedAuth = createMockAuth("revoked-token");

        // Simulate backend returning 401 to prefetch queries
        const prefetchRejectSpy = mock(async () => {
          throw new Error("401 Unauthorized (Token Revoked)");
        });
        const ensureSpy = mock(async () => ({ status: "ok" }));

        const customQc = {
          ...qc,
          prefetchQuery: prefetchRejectSpy,
          ensureQueryData: ensureSpy,
          getQueryCache: () => qc.getQueryCache(),
          getDefaultOptions: () => qc.getDefaultOptions(),
        } as unknown as QueryClient;

        const loader = route.options.loader;
        // MUST resolve cleanly because Promise.allSettled is used
        await expect(
          loader?.({
            context: { queryClient: customQc, orpc, auth: authenticatedAuth },
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
            route,
          } as any),
        ).resolves.toBeUndefined();

        expect(prefetchRejectSpy).toHaveBeenCalled();
      });
    });
  }

  // 2. Stress test dynamic screen route /screens/$surface/$slug under adversarial inputs
  describe("Dynamic Screen Route (/screens/$surface/$slug) Adversarial Stress", () => {
    test("handles throwing screen loader gracefully (e.g. 401 or offline network error)", async () => {
      const qc = createQueryClient();
      const mockAuth = createMockAuth(null);
      const targetScreen = ALL_SCREENS[2];
      expect(targetScreen).toBeDefined();

      const originalLoader = targetScreen.loader;
      try {
        (targetScreen as { loader?: ScreenLoaderFn }).loader = async () => {
          throw new Error("Simulated 401 Unauthorized or Network Failure");
        };

        const loader = ScreenDetailRoute.options.loader;
        await expect(
          loader?.({
            context: { queryClient: qc, orpc, auth: mockAuth },
            params: { surface: targetScreen.surface, slug: targetScreen.slug },
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
            route: ScreenDetailRoute,
          } as any),
        ).resolves.toBeUndefined();
      } finally {
        (targetScreen as { loader?: ScreenLoaderFn }).loader = originalLoader;
      }
    });

    test("handles malicious or invalid surface and slug parameters gracefully", async () => {
      const qc = createQueryClient();
      const mockAuth = createMockAuth(null);
      const loader = ScreenDetailRoute.options.loader;

      const adversarialParams = [
        { surface: "../admin", slug: "../../secret" },
        { surface: "__proto__", slug: "toString" },
        { surface: "undefined", slug: "null" },
        { surface: "", slug: "" },
        { surface: "unknown", slug: "nonexistent-slug" },
      ];

      for (const params of adversarialParams) {
        await expect(
          loader?.({
            context: { queryClient: qc, orpc, auth: mockAuth },
            params,
            location: { search: {} } as any,
            abortController: new AbortController(),
            preload: false,
            cause: "enter",
            route: ScreenDetailRoute,
          } as any),
        ).resolves.toBeUndefined();
      }
    });
  });

  // 3. High-concurrency stress test across all route loaders in parallel
  test("Concurrency stress test: 100 parallel unauthenticated SSR loader executions", async () => {
    const unauth = createMockAuth(null);
    const routesToTest = [AdminRoute, BusinessRoute, CrewRoute, StudioRoute, IndexRoute];

    const tasks = Array.from({ length: 100 }, async (_, index) => {
      const route = routesToTest[index % routesToTest.length];
      const qc = createQueryClient();
      const ensureSpy = mock(async () => ({ status: "ok", trips: [] }));
      const prefetchSpy = mock(async () => {
        throw new Error("Should not be called in unauthenticated SSR");
      });

      const customQc = {
        ...qc,
        ensureQueryData: ensureSpy,
        prefetchQuery: prefetchSpy,
        getQueryCache: () => qc.getQueryCache(),
        getDefaultOptions: () => qc.getDefaultOptions(),
      } as unknown as QueryClient;

      await route.options.loader?.({
        context: { queryClient: customQc, orpc, auth: unauth },
        location: { search: { page: index } } as any,
        abortController: new AbortController(),
        preload: false,
        cause: "enter",
        route,
      } as any);

      // Verify no protected queries were prefetched for protected routes
      if (route !== IndexRoute) {
        expect(prefetchSpy).not.toHaveBeenCalled();
      }

      // Verify clean cache dehydration
      const dehydrated = dehydrate(qc);
      expect(dehydrated.queries.every((q) => q.state.status !== "error")).toBe(true);
    });

    await expect(Promise.all(tasks)).resolves.toBeDefined();
  });
});
