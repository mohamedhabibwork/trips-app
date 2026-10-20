// SCR-TRV-03 Booking step 1: traveler count and optional programs with the live total bar
// (FR-PRG-03). The plan discount applies to programs only, never the trip base price (FR-TRV-04).
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextField } from "@/components/kit/controls";
import { formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { serverQueryOptions } from "@/utils/server-rpc";
import { orpc } from "@/utils/orpc";
import { estimatePricing, parseProgramIds, wizardTier } from "@/surfaces/traveler/booking-wizard";
import { useTravelerProfile } from "@/surfaces/traveler/plan-tier";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";
import { useState } from "react";

export function Trv03BookingPrograms({ tripId: tripIdProp }: { tripId?: string } = {}) {
  const { t, locale } = useAuth();
  const routeParams = useParams({ strict: false });
  const tripId = tripIdProp ?? routeParams.tripId ?? "";
  const search = useSearch({ from: "/traveler/book/$tripId/" });
  const navigate = useNavigate();
  const profile = useTravelerProfile();

  const [travelers, setTravelers] = useState(search.travelers ?? 1);
  const [selected, setSelected] = useState<string[]>(parseProgramIds(search.programs));
  const [quantityError, setQuantityError] = useState<string | null>(null);

  const tripQuery = useQuery(
    serverQueryOptions(orpc.trips.getPublicTripDetail, "trips/getPublicTripDetail", {
      input: { tripId },
    }),
  );
  const programsQuery = useQuery(
    serverQueryOptions(orpc.programs.listPublicTripPrograms, "programs/listPublicTripPrograms", {
      input: { tripId },
    }),
  );

  if (tripQuery.isPending || programsQuery.isPending) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  }
  if (tripQuery.isError || programsQuery.isError) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenError onRetry={() => void tripQuery.refetch()} />
      </div>
    );
  }
  const trip = tripQuery.data.trip;
  if (!trip) {
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenNotFound />
      </div>
    );
  }

  const programs = programsQuery.data?.items ?? [];
  const tier = wizardTier(profile.data?.travelerPlanTier);
  const pricing = estimatePricing({
    basePriceMinor: trip.basePriceMinor,
    travelers,
    programs,
    selectedProgramIds: selected,
    planTier: tier,
    currencyCode: trip.currencyCode,
  });

  const planDiscountLabel =
    tier === "vip"
      ? t("screen.traveler.wizard.discountVip")
      : tier === "explorer"
        ? t("screen.traveler.wizard.discountExplorer")
        : null;

  function toggleProgram(id: string) {
    setQuantityError(null);
    const program = programs.find((item) => item.id === id);
    if (
      program?.remainingCapacity !== null &&
      program !== undefined &&
      program.remainingCapacity !== undefined &&
      program.remainingCapacity <= 0
    ) {
      return; // Program at capacity (FR-PRG-05): shown unavailable, not selectable.
    }
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  // Seats already held by pending bookings count against availability, same as the server
  // availability calc: remaining = totalCapacity - confirmed - held.
  const maxTravelers = trip.totalCapacity > 0 ? Math.max(0, trip.remainingSeatsCount) : 20;
  const soldOut = trip.totalCapacity > 0 && maxTravelers <= 0;

  const tripData = trip;
  function changeTravelers(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 20) {
      setQuantityError(t("screen.traveler.wizard.invalidTravelers"));
      return;
    }
    if (tripData.totalCapacity > 0 && value > maxTravelers) {
      setQuantityError(t("screen.traveler.wizard.maxTravelers", { count: maxTravelers }));
      return;
    }
    setQuantityError(null);
    setTravelers(value);
  }

  const tripForNav = trip;
  function goNext() {
    if (tripForNav.totalCapacity > 0 && travelers > maxTravelers) {
      setQuantityError(t("screen.traveler.wizard.maxTravelers", { count: maxTravelers }));
      return;
    }
    const params = {
      travelers,
      programs: selected.join(","),
    };
    if (tripForNav.seatAssignmentMode === "traveler_choice") {
      void navigate({
        to: pathFor("SCR-TRV-04", { tripId }),
        search: params,
      });
    } else {
      void navigate({ to: pathFor("SCR-TRV-05", { tripId }), search: params });
    }
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <p className="m-0 text-sm font-semibold text-[var(--te-ink-muted)]">
        {t("screen.traveler.wizard.step", { step: 1, of: 4 })}
      </p>
      <h1 className="m-0 text-[26px] leading-9 font-bold">{t("screen.traveler.wizard.title1")}</h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">
        {pick(locale, trip.titleAr, trip.titleEn)}
      </p>

      <TextField
        label={t("screen.traveler.wizard.travelers")}
        type="number"
        min={1}
        max={Math.max(1, maxTravelers)}
        value={travelers}
        disabled={soldOut}
        onChange={(event) => changeTravelers(Number(event.target.value))}
        errors={
          soldOut ? [t("screen.traveler.wizard.tripSoldOut")] : quantityError ? [quantityError] : []
        }
      />

      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {programs.map((program) => {
          const atCapacity = program.remainingCapacity !== null && program.remainingCapacity <= 0;
          const checked = selected.includes(program.id);
          return (
            <li key={program.id}>
              <label
                className={`flex flex-col gap-1 rounded-[var(--te-radius-md)] border-[1.5px] p-4 ${
                  checked
                    ? "border-[var(--te-primary)] bg-[var(--te-surface-raised)]"
                    : "border-[var(--te-hairline)]"
                } ${atCapacity ? "opacity-60" : "cursor-pointer"}`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={atCapacity}
                    onChange={() => toggleProgram(program.id)}
                    className="size-5"
                  />
                  <span className="text-[15px] font-semibold">
                    {pick(locale, program.titleAr, program.titleEn)}
                  </span>
                </span>
                <span className="flex flex-wrap items-center justify-between gap-2 ps-8">
                  <span className="text-[13px] text-[var(--te-ink-muted)]">
                    {atCapacity
                      ? t("screen.traveler.wizard.programFull")
                      : program.isIncludedInBase
                        ? t("screen.traveler.detail.programIncluded")
                        : formatMinorAmount(program.priceMinor, program.currencyCode, locale)}
                  </span>
                  {!atCapacity && program.remainingCapacity !== null ? (
                    <span className="text-[13px] text-[var(--te-ink-muted)]">
                      {t("screen.traveler.wizard.programSeats", {
                        count: program.remainingCapacity,
                      })}
                    </span>
                  ) : null}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {/* Live total bar: updated before the next step (FR-PRG-03). */}
      <div className="sticky bottom-16 flex flex-col gap-1 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)] md:bottom-4">
        <div className="flex justify-between text-sm">
          <span>{t("screen.traveler.wizard.subtotal")}</span>
          <span>{formatMinorAmount(pricing.subtotalMinor, trip.currencyCode, locale)}</span>
        </div>
        {pricing.programsTotalMinor > 0 ? (
          <div className="flex justify-between text-sm">
            <span>{t("screen.traveler.wizard.programsTotal")}</span>
            <span>{formatMinorAmount(pricing.programsTotalMinor, trip.currencyCode, locale)}</span>
          </div>
        ) : null}
        {planDiscountLabel && pricing.planDiscountMinor > 0 ? (
          <div className="flex justify-between text-sm text-[var(--te-success)]">
            <span>{planDiscountLabel}</span>
            <span>−{formatMinorAmount(pricing.planDiscountMinor, trip.currencyCode, locale)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-[var(--te-hairline)] pt-1 text-base font-bold">
          <span>{t("screen.traveler.wizard.estimatedTotal")}</span>
          <span>{formatMinorAmount(pricing.estimatedTotalMinor, trip.currencyCode, locale)}</span>
        </div>
        <Button block onClick={goNext} disabled={soldOut} className="mt-2">
          {t("screen.traveler.common.continue")}
        </Button>
      </div>

      <Notice tone="info">{t("screen.traveler.wizard.planDiscountNote")}</Notice>
    </div>
  );
}
