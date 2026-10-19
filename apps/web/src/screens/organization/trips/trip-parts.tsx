// Pieces shared by the trip wizard, program editor and trip pages: the wizard draft, the
// organization plan limits, money text, a bordered option card and the seat layout preview.
import { useState, type ComponentProps, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@trips-app/ui/lib/utils";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { useOrgParams } from "../common/org-link";
import { tripTitle } from "../common/org-shared";
import { NO_VALUE, OrgAlert } from "../common/org-ui";

/** Program id in the editor URL that means "create a new program". */
export const NEW_PROGRAM_ID = "new";

/** Currencies the trips and programs services accept. */
export const TRIP_CURRENCIES = ["EGP", "SAR", "AED"] as const;
export type TripCurrency = (typeof TRIP_CURRENCIES)[number];

export const CURRENCY_OPTIONS = TRIP_CURRENCIES.map((code) => ({ value: code, label: code }));

export function toTripCurrency(value: string | null | undefined): TripCurrency {
  const upper = (value ?? "").trim().toUpperCase();
  return (TRIP_CURRENCIES as readonly string[]).includes(upper) ? (upper as TripCurrency) : "EGP";
}

/** "250.00 EGP" from minor units. */
export function formatMoney(amountMinor: number, currency: string): string {
  return t("screen.organization.trips.tripParts.money", {
    amount: (amountMinor / 100).toFixed(2),
    currency,
  });
}

/** Major-unit text ("250.00") to minor units, never negative. */
export function toMinorUnits(value: string): number {
  return Math.max(0, Math.round((Number.parseFloat(value) || 0) * 100));
}

/** The trip the wizard is editing (the `tripId` in the URL; none on step 1 of a new trip). */
export function useWizardTrip() {
  const { status: authStatus, locale } = useAuth();
  const tripId = useOrgParams().tripId ?? null;
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: authStatus === "authenticated" && Boolean(tripId),
  });
  const tripName = tripQuery.data ? tripTitle(tripQuery.data, locale) : "";
  return { authStatus, locale, tripId, tripQuery, tripName };
}

/** Why a wizard step was not saved; every case keeps the user on the step with an alert. */
export type WizardSaveError = "signedOut" | "noTrip" | "failed";

/**
 * Saves a wizard step through the API. It never reports success without a saved response: no
 * session, no trip in the URL or a failed call each return false and set `error`.
 */
export function useWizardStepSave(tripId: string | null) {
  const { status } = useAuth();
  const [error, setError] = useState<WizardSaveError | null>(null);
  const run = async (save: (tripId: string) => Promise<unknown>): Promise<boolean> => {
    if (status !== "authenticated") {
      setError("signedOut");
      return false;
    }
    if (!tripId) {
      setError("noTrip");
      return false;
    }
    setError(null);
    try {
      await save(tripId);
      return true;
    } catch {
      setError("failed");
      return false;
    }
  };
  return { error, run, clearError: () => setError(null) };
}

/** The alert for a step that was not saved. */
export function WizardSaveAlert({
  error,
  className,
}: {
  error: WizardSaveError | null;
  className?: string;
}) {
  if (!error) return null;
  return (
    <OrgAlert
      tone="err"
      title={t(`screen.organization.trips.tripParts.saveError.${error}.title`)}
      className={className}
    >
      {t(`screen.organization.trips.tripParts.saveError.${error}.body`)}
    </OrgAlert>
  );
}

export interface OrgPlanLimits {
  activeTripsPerMonth: number | null;
  activeCouponsMax: number | null;
  vehiclesPerTrip: number | null;
  programsPerTrip: number | null;
}

export interface OrgPlanFeatures {
  platformSuppliers: boolean;
  seatSelfSelection: boolean;
  childTracking: boolean;
}

function readLimit(source: Record<string, unknown>, key: string): number | null {
  const value = source[key];
  return typeof value === "number" ? value : null;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

/**
 * The organization's usage against its plan limits, counted on the server the way each limit is
 * enforced (plans.getOrganizationUsage). Undefined while loading or after an error.
 */
export function useOrgUsage() {
  const { status: authStatus } = useAuth();
  return useQuery({
    ...orpc.plans.getOrganizationUsage.queryOptions({ input: undefined }),
    enabled: authStatus === "authenticated",
  });
}

/** Limits and features of the organization's current plan; null until both reads succeed. */
export function useOrgPlan() {
  const { status: authStatus } = useAuth();
  const enabled = authStatus === "authenticated";
  const subscriptionQuery = useQuery({
    ...orpc.plans.getOrganizationSubscription.queryOptions({ input: undefined }),
    enabled,
  });
  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: { role: "organization" } }),
    enabled,
  });
  const planId = subscriptionQuery.data?.planId;
  const catalog: readonly { id: string; limits: unknown; features: unknown }[] =
    catalogQuery.data ?? [];
  const entry = catalog.find((plan) => plan.id === planId);
  if (!entry) return { limits: null, features: null };
  const limits = asRecord(entry.limits);
  const features = asRecord(entry.features);
  return {
    limits: {
      activeTripsPerMonth: readLimit(limits, "activeTripsPerMonth"),
      activeCouponsMax: readLimit(limits, "activeCouponsMax"),
      vehiclesPerTrip: readLimit(limits, "vehiclesPerTrip"),
      programsPerTrip: readLimit(limits, "programsPerTrip"),
    } satisfies OrgPlanLimits,
    features: {
      platformSuppliers: features.platformSuppliers === true,
      seatSelfSelection: features.seatSelfSelection === true,
      childTracking: features.childTracking === true,
    } satisfies OrgPlanFeatures,
  };
}

/** A plan limit as text: the number, "Unlimited" for no limit, or "—" while unknown. */
export function limitText(limits: OrgPlanLimits | null, key: keyof OrgPlanLimits): string {
  if (!limits) return NO_VALUE;
  const value = limits[key];
  return value === null ? t("screen.organization.trips.tripParts.unlimited") : String(value);
}

interface OrgOptionCardProps extends Omit<ComponentProps<"input">, "type"> {
  type?: "radio" | "checkbox";
  children: ReactNode;
}

/** A radio in a bordered box (artboard `.opt`); the chosen one has a 2 px ink border. */
export function OrgOptionCard({
  type = "radio",
  children,
  className,
  checked,
  disabled,
  ...props
}: OrgOptionCardProps) {
  return (
    <label
      className={cn(
        "flex items-start gap-3 rounded-xl bg-[var(--te-surface-raised)] p-4 text-sm leading-5",
        checked ? "border-2 border-[var(--te-ink)]" : "border border-[var(--te-control-border)]",
        disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer",
        className,
      )}
    >
      <input
        type={type}
        checked={checked}
        disabled={disabled}
        className="mt-0.5 size-5 shrink-0 accent-[var(--te-primary)]"
        {...props}
      />
      <span className="min-w-0">{children}</span>
    </label>
  );
}

interface SeatLayoutLike {
  rows: number;
  cols: number;
  cells: readonly { row: number; col: number; type: string }[];
}

/** Two seats, an aisle and two seats per row, for a vehicle without a stored layout. */
function fallbackLayout(seatCount: number): SeatLayoutLike {
  const rows = Math.max(1, Math.ceil(seatCount / 4));
  const cells: { row: number; col: number; type: string }[] = [];
  let placed = 0;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < 5; col += 1) {
      const isSeat = col !== 2 && placed < seatCount;
      if (isSeat) placed += 1;
      cells.push({ row, col, type: isSeat ? "seat" : "aisle" });
    }
  }
  return { rows, cols: 5, cells };
}

const MAX_PREVIEW_ROWS = 14;

/** Schematic seat map of a vehicle type (artboard SCR-ORG-07 "Seat layout preview"). */
export function SeatLayoutPreview({
  layout,
  seatCount,
}: {
  layout: SeatLayoutLike | null | undefined;
  seatCount: number;
}) {
  const source = layout && layout.cells.length > 0 ? layout : fallbackLayout(seatCount);
  const rows = Math.min(source.rows, MAX_PREVIEW_ROWS);
  const byPosition = new Map(source.cells.map((cell) => [`${cell.row}:${cell.col}`, cell.type]));
  return (
    <div
      role="img"
      aria-label={t("screen.organization.trips.tripParts.seatLayoutPreviewLabel", {
        n: seatCount,
      })}
      className="grid justify-center gap-2 py-4"
      style={{ gridTemplateColumns: `repeat(${source.cols}, 28px)` }}
    >
      {Array.from({ length: rows * source.cols }, (_, index) => {
        const row = Math.floor(index / source.cols);
        const col = index % source.cols;
        const type = byPosition.get(`${row}:${col}`) ?? "empty";
        return (
          <span
            key={`${row}:${col}`}
            className={cn(
              "h-7 rounded-lg",
              type === "seat" && "border border-[var(--te-control-border)]",
              (type === "driver" || type === "moderator") &&
                "border border-[var(--te-control-border)] bg-[var(--te-surface)]",
            )}
          />
        );
      })}
    </div>
  );
}

/** Label of a 14 px semibold field caption used inside cards (artboard `.lbl`). */
export function OrgFieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm leading-5 font-semibold">{children}</span>;
}
