import { describe, expect, test } from "bun:test";
import { QueryClient } from "@tanstack/react-query";

import { createQueryClient, orpc } from "./orpc";
import { getRouter } from "../router";

describe("Unit: Core oRPC Query Utils & Router Setup (M1)", () => {
  test("orpc instance is created with createTanstackQueryUtils and provides typed queryOptions", () => {
    expect(orpc).toBeDefined();
    expect(typeof orpc.healthCheck.queryOptions).toBe("function");
    expect(typeof orpc.lookups.listTypes.queryOptions).toBe("function");

    const healthOptions = orpc.healthCheck.queryOptions();
    expect(healthOptions).toBeDefined();
    expect(Array.isArray(healthOptions.queryKey)).toBe(true);
    expect(typeof healthOptions.queryFn).toBe("function");
  });

  test("orpc instance provides procedure mutationOptions and domain key helpers", () => {
    expect(typeof orpc.auth.signIn.mutationOptions).toBe("function");
    const mutationOpts = orpc.auth.signIn.mutationOptions();
    expect(mutationOpts).toBeDefined();
    expect(Array.isArray(mutationOpts.mutationKey)).toBe(true);
    expect(typeof mutationOpts.mutationFn).toBe("function");

    // Domain key helper for query cache invalidation
    const tripsKey = orpc.trips.key();
    expect(Array.isArray(tripsKey)).toBe(true);

    const lookupsKey = orpc.lookups.key();
    expect(Array.isArray(lookupsKey)).toBe(true);
  });

  test("createQueryClient sets default staleTime and custom query cache", () => {
    const qc = createQueryClient();
    expect(qc).toBeInstanceOf(QueryClient);
    expect(qc.getDefaultOptions().queries?.staleTime).toBe(60_000);
  });

  test("getRouter returns a TanStack router configured with orpc, queryClient, and auth in context", () => {
    const router = getRouter();
    expect(router).toBeDefined();
    expect(router.options.context).toBeDefined();
    expect(router.options.context?.orpc).toBe(orpc);
    expect(router.options.context?.queryClient).toBeInstanceOf(QueryClient);
    expect(router.options.context?.auth).toBeDefined();
  });
});
