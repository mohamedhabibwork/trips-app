// Booking wizard helpers (SCR-TRV-03..06): search-param state shared by the steps, the live
// total computation (plan discount on programs only, FR-TRV-04) and the 15-minute hold
// countdown (BRL-08).
import { useQuery } from "@tanstack/react-query";

import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";

import type { PlanTier } from "./plan-tier";

export interface WizardSearch {
  travelers?: number;
  programs?: string;
  vehicle?: string;
  seats?: string;
  coupon?: string;
}

export function parseProgramIds(raw: string | undefined): string[] {
  return (raw ?? "").split(",").filter(Boolean);
}

/** Client-side mirror of the booking pricing preview (subtotal / programs / plan discount). */
export function estimatePricing(options: {
  basePriceMinor: number;
  travelers: number;
  programs: readonly { id: string; priceMinor: number; isIncludedInBase: boolean }[];
  selectedProgramIds: readonly string[];
  planTier: PlanTier;
  currencyCode: string;
}): {
  subtotalMinor: number;
  programsTotalMinor: number;
  planDiscountMinor: number;
  estimatedTotalMinor: number;
} {
  const selected = options.programs.filter(
    (program) => options.selectedProgramIds.includes(program.id) && !program.isIncludedInBase,
  );
  const subtotalMinor = options.basePriceMinor * options.travelers;
  const programsTotalMinor = selected.reduce(
    (sum, program) => sum + program.priceMinor * options.travelers,
    0,
  );
  // Explorer 5 percent, VIP 10 percent — programs only, never the trip base price.
  const planPercent = options.planTier === "vip" ? 10 : options.planTier === "explorer" ? 5 : 0;
  const planDiscountMinor = Math.floor((programsTotalMinor * planPercent) / 100);
  return {
    subtotalMinor,
    programsTotalMinor,
    planDiscountMinor,
    estimatedTotalMinor: subtotalMinor + programsTotalMinor - planDiscountMinor,
  };
}

/** The traveler profile for wizard plan pricing; client-only (see plan-tier.ts). */
export function useWizardProfile() {
  return useQuery({
    ...serverQueryOptions(orpc.traveler.getProfile, "traveler/getProfile", { input: undefined }),
    enabled: typeof window !== "undefined",
    retry: false,
  });
}

export function wizardTier(profileTier: string | undefined): PlanTier {
  return profileTier === "vip" ? "vip" : profileTier === "explorer" ? "explorer" : "free";
}

/** Formats seconds as mm:ss for the hold timer. */
export function formatHoldTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Seconds left on a hold from its expiry timestamp. */
export function holdSecondsLeft(holdExpiresAt: string | Date | null | undefined): number {
  if (!holdExpiresAt) return 0;
  const expiry = holdExpiresAt instanceof Date ? holdExpiresAt : new Date(holdExpiresAt);
  return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000));
}

/** The seat priority window (FR-SEAT-03): Explorer and VIP may pick seats early. */
export function seatPriorityState(options: {
  startsAt: string | Date | null | undefined;
  priorityWindowHours: number;
  planTier: PlanTier | undefined;
}): "open" | "priority" | "closed" {
  if (!options.startsAt || options.priorityWindowHours <= 0 || options.planTier === undefined) {
    return "open";
  }
  if (options.planTier === "explorer" || options.planTier === "vip") return "open";
  const departure =
    options.startsAt instanceof Date ? options.startsAt : new Date(options.startsAt);
  const windowOpensAt = departure.getTime() - options.priorityWindowHours * 60 * 60 * 1000;
  return Date.now() < windowOpensAt ? "priority" : "open";
}
