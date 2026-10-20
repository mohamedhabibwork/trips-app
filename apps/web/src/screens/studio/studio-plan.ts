// The studio's plan context: which tier the photographer is on and what that tier allows.
//
// Sources: `photographer.getProfile` (profile tier + portfolio count), `plans.getMySubscription`
// (the active subscription record, if any) and `plans.getCatalog` (the Basic/Studio/Pro limits and
// feature gates, seeded in packages/domain/src/roles-and-plans.ts). Nothing here invents a number:
// a limit a plan does not define stays `null` (unlimited / not applicable).
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

export type StudioTier = "basic" | "studio" | "pro";

export const STUDIO_TIERS: readonly StudioTier[] = ["basic", "studio", "pro"];

/** A plan's numeric limits (packages/domain PlanLimits, stored as JSON on the catalog row). */
interface PlanLimitsJson {
  portfolioPhotosMax?: number | null;
  activeCouponsMax?: number | null;
}

/** A plan's feature gates (packages/domain PlanFeatures, stored as JSON on the catalog row). */
interface PlanFeaturesJson {
  watermarks?: boolean;
  receiptExport?: boolean;
}

export interface StudioPlanContext {
  /** The profile's plan tier; `null` while loading or when the profile has none. */
  tier: StudioTier | null;
  /** The active subscription's period end, when a paid subscription exists. */
  renewsAt: string | Date | null;
  /** Max portfolio photos (Basic 10, Studio 50, Pro unlimited = null). */
  portfolioPhotosMax: number | null;
  /** Max active coupons (Basic 3, Studio 10, Pro unlimited = null). */
  activeCouponsMax: number | null;
  /** Whether the plan may watermark albums (Studio and Pro). */
  watermarkAllowed: boolean;
  /** Whether the plan may export ledgers/receipts (Studio and Pro). */
  exportAllowed: boolean;
  /** Photographer profile fields used by several screens. */
  profile: {
    scope: string;
    status: string;
    specialties: string[];
    serviceRegions: string[];
    portfolioPhotoCount: number;
    yearsOfExperience: number;
  } | null;
  loading: boolean;
}

function tierOf(value: string | null | undefined): StudioTier | null {
  return STUDIO_TIERS.find((tier) => tier === value) ?? null;
}

/** The profile's JSON arrays are typed `Json` by the table schema; keep the strings only. */
function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/**
 * The signed-in photographer's plan gates. On the server the memory-only token store usually means
 * no session, so the queries are disabled there and pages render their loading/unknown states.
 */
export function useStudioPlan(): StudioPlanContext {
  const enabled = typeof window !== "undefined";

  const profileQuery = useQuery({
    ...serverQueryOptions(orpc.photographer.getProfile, "photographer/getProfile", {
      input: undefined,
      enabled,
      retry: false,
    }),
  });
  const subscriptionQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getMySubscription, "plans/getMySubscription", {
      input: undefined,
      enabled,
      retry: false,
    }),
  });
  const catalogQuery = useQuery({
    ...serverQueryOptions(orpc.plans.getCatalog, "plans/getCatalog", {
      input: { role: "platform_photographer" },
      enabled,
      retry: false,
    }),
  });

  const profile = profileQuery.data ?? null;
  const subscription = subscriptionQuery.data ?? null;
  const tier = tierOf(subscription?.tier ?? profile?.planTier ?? null);
  const plan = catalogQuery.data?.find((row) => row.tier === tier) ?? null;
  const limits = (plan?.limits ?? null) as PlanLimitsJson | null;
  const features = (plan?.features ?? null) as PlanFeaturesJson | null;

  return {
    tier,
    renewsAt: subscription?.currentPeriodEnd ?? null,
    portfolioPhotosMax: limits?.portfolioPhotosMax ?? null,
    activeCouponsMax: limits?.activeCouponsMax ?? null,
    watermarkAllowed: features?.watermarks === true,
    exportAllowed: features?.receiptExport === true,
    profile: profile
      ? {
          scope: profile.scope,
          status: profile.status,
          specialties: stringList(profile.specialties),
          serviceRegions: stringList(profile.serviceRegions),
          portfolioPhotoCount: profile.portfolioPhotoCount,
          yearsOfExperience: profile.yearsOfExperience,
        }
      : null,
    loading: profileQuery.isPending || catalogQuery.isPending,
  };
}
