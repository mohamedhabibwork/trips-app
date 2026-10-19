// SCR-PUB-01 Landing: public trips from the API, then one sign-up card per role.
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/auth/auth-context";
import { Notice, buttonClass, TextLink } from "@/components/kit/controls";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

const TRIPS_SHOWN = 3;
const TRIPS_SECTION_ID = "public-trips";

interface TripCardView {
  id: string;
  title: string;
  place: string;
  dates: string;
  price: string;
  seatsLeft: number;
  coverImageUrl: string | null;
}

const ROLE_CARDS = [
  { key: "traveler", screenId: "SCR-PUB-03" },
  { key: "driver", screenId: "SCR-PUB-04" },
  { key: "photographer", screenId: "SCR-PUB-05" },
  { key: "organization", screenId: "SCR-PUB-06" },
] as const;

export function Landing() {
  const { t, locale } = useAuth();
  const tripsQuery = useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));
  const pick = (ar: string | null | undefined, en: string | null | undefined) =>
    (locale === "ar" ? ar || en : en || ar) ?? "";

  const trips: TripCardView[] = (tripsQuery.data?.items ?? [])
    .slice(0, TRIPS_SHOWN)
    .map((trip) => ({
      id: trip.id,
      title: pick(trip.titleAr, trip.titleEn) || trip.id,
      place: pick(
        trip.destinations[0]?.nameAr ?? trip.origin?.nameAr,
        trip.destinations[0]?.nameEn ?? trip.origin?.nameEn,
      ),
      dates: formatDateRange(trip.startsAt, trip.endsAt, locale),
      price: formatMinorAmount(trip.basePriceMinor, trip.currencyCode, locale),
      seatsLeft: trip.remainingSeatsCount,
      coverImageUrl: trip.coverImageUrl ?? null,
    }));

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-8 md:p-12">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <h1 className="m-0 text-[32px] leading-10 font-bold md:text-[40px] md:leading-[48px]">
            {t("screen.public.landing.title")}
          </h1>
          <p className="m-0 mt-2 text-base leading-6 text-[var(--te-ink-muted)]">
            {t("screen.public.landing.lead")}
          </p>
        </div>
        <a href={`#${TRIPS_SECTION_ID}`} className={buttonClass("primary")}>
          {t("screen.public.landing.browseTrips")}
        </a>
      </section>

      <section
        id={TRIPS_SECTION_ID}
        aria-labelledby="landing-trips"
        className="flex scroll-mt-6 flex-col gap-4"
      >
        <h2 id="landing-trips" className="m-0 text-[28px] leading-9 font-semibold">
          {t("screen.public.landing.publicTrips")}
        </h2>
        {tripsQuery.isPending ? (
          <TripGridLoading label={t("screen.public.landing.loading")} />
        ) : tripsQuery.isError ? (
          <Notice tone="danger">{t("screen.public.landing.tripsFailed")}</Notice>
        ) : trips.length === 0 ? (
          <div className="rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-6 shadow-[var(--te-card-shadow)]">
            <p className="m-0 text-base font-semibold">{t("screen.public.landing.noTrips")}</p>
            <p className="m-0 mt-1 text-sm text-[var(--te-ink-muted)]">
              {t("screen.public.landing.noTripsBody")}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="landing-roles" className="flex flex-col gap-4">
        <h2 id="landing-roles" className="m-0 text-[28px] leading-9 font-semibold">
          {t("screen.public.landing.signUpForRole")}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_CARDS.map((role) => (
            <div
              key={role.key}
              className="flex flex-col gap-2 rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] p-5 shadow-[var(--te-card-shadow)]"
            >
              <h3 className="m-0 text-xl leading-7 font-semibold">
                {t(`screen.public.landing.role.${role.key}`)}
              </h3>
              <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
                {t(`screen.public.landing.role.${role.key}Body`)}
              </p>
              <TextLink to={pathFor(role.screenId)} className="mt-auto self-start pt-2">
                {t("screen.public.landing.signUp")}
              </TextLink>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function TripCard({ trip }: { trip: TripCardView }) {
  const { t } = useAuth();
  return (
    <article className="overflow-hidden rounded-[var(--te-radius-md)] bg-[var(--te-surface-raised)] shadow-[var(--te-card-shadow)]">
      {trip.coverImageUrl ? (
        <img
          src={trip.coverImageUrl}
          alt=""
          loading="lazy"
          className="block h-[140px] w-full object-cover"
        />
      ) : (
        <div className="flex h-[140px] items-center justify-center bg-[var(--te-hairline)] text-[13px] text-[var(--te-ink-muted)]">
          {t("screen.public.landing.groupPhoto")}
        </div>
      )}
      <div className="flex flex-col gap-2 px-5 py-4">
        <h3 className="m-0 text-xl leading-7 font-semibold">{trip.title}</h3>
        <p className="m-0 text-[13px] leading-[18px] font-medium text-[var(--te-ink-muted)]">
          {[trip.place, trip.dates].filter(Boolean).join(" · ")}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-base font-medium">
            {t("screen.public.landing.fromPrice", { price: trip.price })}
          </span>
          <span className="rounded-[var(--te-radius-pill)] bg-[var(--te-info-soft)] px-2.5 py-1 text-[13px] font-medium">
            {trip.seatsLeft > 0
              ? t("screen.public.landing.seatsLeft", { count: trip.seatsLeft })
              : t("screen.public.landing.fullyBooked")}
          </span>
        </div>
      </div>
    </article>
  );
}

function TripGridLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-label={label} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, index) => (
        <div
          key={index}
          className="h-[252px] animate-pulse rounded-[var(--te-radius-md)] bg-[var(--te-hairline)]"
        />
      ))}
    </div>
  );
}
