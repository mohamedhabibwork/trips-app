import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { authController } from "./auth/instance";
import Loader from "./components/loader";
import { ScrShr03NotFound } from "./screens/shared/scr-shr-03-not-found";
import { ScrShr05ServerError } from "./screens/shared/scr-shr-05-server-error";
import { routeTree } from "./routeTree.gen";
import { createQueryClient, orpc } from "./utils/orpc";

export const getRouter = () => {
  const queryClient = createQueryClient();

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    // The controller is the module singleton (correction 3): constructing it here would create an
    // import cycle with utils/orpc.ts, which needs it to build the link.
    context: { orpc, queryClient, auth: authController },
    defaultPendingComponent: () => <Loader />,
    // A route that throws shows the server-error page (SCR-SHR-05); an unknown path inside a
    // layout shows the 404 page (SCR-SHR-03), like the root.
    defaultErrorComponent: ({ error, reset }) => (
      <ScrShr05ServerError error={error} reset={reset} />
    ),
    defaultNotFoundComponent: () => <ScrShr03NotFound />,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
