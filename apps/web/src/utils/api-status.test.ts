import { describe, expect, mock, test } from "bun:test";
import type { QueryClient } from "@tanstack/react-query";

import { apiStatusQueryOptions, loadApiStatus } from "./api-status";
import { orpc } from "./orpc";

describe("Unit: API Status Query Helpers (M1)", () => {
  test("apiStatusQueryOptions produces valid queryKey and queryFn for healthCheck", () => {
    const opts = apiStatusQueryOptions();
    expect(opts).toBeDefined();
    expect(Array.isArray(opts.queryKey)).toBe(true);
    expect(typeof opts.queryFn).toBe("function");
  });

  test("loadApiStatus ensures healthCheck query data using context.queryClient", async () => {
    const ensureSpy = mock(async () => "OK");
    const fakeContext = {
      queryClient: {
        ensureQueryData: ensureSpy,
      } as unknown as QueryClient,
      orpc,
      auth: {} as any,
    };

    const result = await loadApiStatus({ context: fakeContext });
    expect(result).toBe("OK");
    expect(ensureSpy).toHaveBeenCalledTimes(1);
  });
});
