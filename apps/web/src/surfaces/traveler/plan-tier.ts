// The signed-in traveler's plan tier, shared by every plan gate in the surface
// (VIP early access, Explorer/VIP seat priority window, receipt export, history depth).
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";

export type PlanTier = "free" | "explorer" | "vip";

export const PLAN_TIER_RANK: Readonly<Record<PlanTier, number>> = {
  free: 0,
  explorer: 1,
  vip: 2,
};

/**
 * The traveler profile. On the server the memory-only token store usually means no session, so the
 * query is disabled there and the page renders its client-side state after hydration.
 */
export function useTravelerProfile() {
  return useQuery({
    ...orpc.traveler.getProfile.queryOptions({ input: undefined }),
    enabled: typeof window !== "undefined",
    retry: false,
  });
}

/** The plan tier, or `undefined` while loading / for an anonymous viewer. */
export function usePlanTier(): PlanTier | undefined {
  const profile = useTravelerProfile();
  const tier = profile.data?.travelerPlanTier;
  return tier === "free" || tier === "explorer" || tier === "vip" ? tier : undefined;
}
