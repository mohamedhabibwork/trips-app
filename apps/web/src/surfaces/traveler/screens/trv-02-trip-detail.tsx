// SCR-TRV-02 Trip detail: schedule, route, programs with pricing, seat mode, capacity and the
// book action (sign-in to book for anonymous visitors). Public: rendered on the server.
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";

import { useAuth, useAuthStatus } from "@/auth/auth-context";
import { Button, Notice, StatusPill } from "@/components/kit/controls";
import { formatDateRange, formatDateTime, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { ScreenError, ScreenLoading, ScreenNotFound } from "@/surfaces/traveler/components/states";
import { TRAVELER_PAGE_CLASS, pick } from "@/surfaces/traveler/util";

// Bookable in Published, Ready and Filling Up (SRS 7.1); the trip states here are published,
// scheduled and Selection (the operational "filling up" state).
const BOOKABLE_STATES = new Set(["published", "scheduled", "Selection"]);

export function Trv02TripDetail({ tripId: tripIdProp }: { tripId?: string } = {}) {
  const params = useParams({ strict: false });
  const tripId = tripIdProp ?? params.tripId ?? "";
  const { t, locale } = useAuth();
  const status = useAuthStatus();
  const navigate = useNavigate();
  const tripQuery = useQuery(orpc.trips.getPublicTripDetail.queryOptions({ input: { tripId } }));
  const programsQuery = useQuery(
    orpc.programs.listPublicTripPrograms.queryOptions({ input: { tripId } }),
  );

  if (tripQuery.isPending)
    return (
      <div className={TRAVELER_PAGE_CLASS}>
        <ScreenLoading />
      </div>
    );
  if (tripQuery.isError) {
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

  const bookable = BOOKABLE_STATES.has(trip.state);
  const soldOut = trip.totalCapacity > 0 && trip.remainingSeatsCount <= 0;
  const seatModeLabel =
    trip.seatAssignmentMode === "traveler_choice"
      ? t("screen.traveler.common.seatMode.selfSelect")
      : t("screen.traveler.common.seatMode.orgAssigned");

  function book() {
    if (status !== "authenticated") {
      void navigate({
        to: "/sign-in",
        search: { returnTo: pathFor("SCR-TRV-02", { tripId }) },
      });
      return;
    }
    void navigate({ to: pathFor("SCR-TRV-03", { tripId }) });
  }

  return (
    <div className={TRAVELER_PAGE_CLASS}>
      <StatusPill
        tone={bookable && !soldOut ? "success" : "warning"}
        icon={soldOut ? "lock" : undefined}
      >
        {soldOut
          ? t("screen.traveler.browse.soldOutBadge")
          : t(`screen.traveler.tripState.${trip.state}`)}
      </StatusPill>
      <h1 className="m-0 text-[30px] leading-10 font-bold">
        {pick(locale, trip.titleAr, trip.titleEn)}
      </h1>
      <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">
        {pick(locale, trip.organizerNameAr, trip.organizerNameEn)}
      </p>

      <section aria-labelledby="trv02-schedule" className="flex flex-col gap-2">
        <h2 id="trv02-schedule" className="m-0 text-xl font-semibold">
          {t("screen.traveler.detail.schedule")}
        </h2>
        <p className="m-0 text-[15px]">
          {formatDateRange(trip.startsAt, trip.endsAt, locale)}
          {trip.timezone ? ` · ${trip.timezone}` : ""}
        </p>
        <p className="m-0 text-[15px]">
          {[
            pick(locale, trip.origin?.nameAr, trip.origin?.nameEn),
            ...trip.destinations.map((point) => pick(locale, point.nameAr, point.nameEn)),
          ]
            .filter(Boolean)
            .join(" → ")}
        </p>
        <p className="m-0 text-[15px] text-[var(--te-ink-muted)]">
          {seatModeLabel}
          {" · "}
          {t("screen.traveler.detail.capacity", {
            left: trip.remainingSeatsCount,
            total: trip.totalCapacity,
          })}
          {trip.childTrackingEnabled ? ` · ${t("screen.traveler.detail.childTracking")}` : ""}
        </p>
        {trip.descriptionAr || trip.descriptionEn ? (
          <p className="m-0 text-[15px] leading-6">
            {pick(locale, trip.descriptionAr, trip.descriptionEn)}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="trv02-programs" className="flex flex-col gap-3">
        <h2 id="trv02-programs" className="m-0 text-xl font-semibold">
          {t("screen.traveler.detail.programs")}
        </h2>
        {programsQuery.isPending ? (
          <ScreenLoading />
        ) : (programsQuery.data?.items ?? []).length === 0 ? (
          <p className="m-0 text-sm text-[var(--te-ink-muted)]">
            {t("screen.traveler.detail.noPrograms")}
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-2 p-0">
            {(programsQuery.data?.items ?? []).map((program) => (
              <li
                key={program.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-4 shadow-[var(--te-card-shadow)]"
              >
                <div className="min-w-0">
                  <p className="m-0 text-[15px] font-semibold">
                    {pick(locale, program.titleAr, program.titleEn)}
                  </p>
                  {program.startsAt ? (
                    <p className="m-0 text-[13px] text-[var(--te-ink-muted)]">
                      {formatDateTime(program.startsAt, locale)}
                    </p>
                  ) : null}
                </div>
                <span className="text-[15px] font-bold">
                  {program.isIncludedInBase
                    ? t("screen.traveler.detail.programIncluded")
                    : formatMinorAmount(program.priceMinor, program.currencyCode, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bookable && !soldOut ? (
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={book}>
            {status === "authenticated"
              ? t("screen.traveler.detail.book")
              : t("screen.traveler.detail.signInToBook")}
          </Button>
          <span className="text-lg font-bold">
            {formatMinorAmount(trip.basePriceMinor, trip.currencyCode, locale)}
          </span>
        </div>
      ) : (
        <Notice tone="warning" strong>
          {soldOut
            ? t("screen.traveler.detail.soldOutNotice")
            : t("screen.traveler.detail.notBookableNotice")}
        </Notice>
      )}
    </div>
  );
}
