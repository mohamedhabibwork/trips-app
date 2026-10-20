// SCR-PUB-21 Organizer page (/organizers/$orgSlug): an organizer's published trips, per
// WebOrganizer.dc.html. There is no public organizer-profile procedure, so the page derives
// everything from `trips.browsePublicTrips` (whose rows carry the organizer's localized name):
// the trips are matched by slugified organizer name, and the profile facts the design shows but
// the API does not publish (rating, since-year, CR number, reviews, albums, quote requests) are
// stated honestly as "not published yet" rather than fabricated.
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";
import { pick } from "@/surfaces/traveler/util";

const INK = "text-[#262a67]";
const MUTED = "text-[#5b5f86]";

/** The artboard shows four trip cards per row band. */
const TRIPS_SHOWN = 8;
const COVER_FALLBACKS = [
  "/design/traveler/cover-alula.svg",
  "/design/traveler/cover-red-sea.svg",
  "/design/traveler/cover-edge-of-world.svg",
] as const;

type TripDto = ReturnType<typeof useOrganizerTrips>["data"] extends
  | { items: readonly (infer T)[] }
  | undefined
  ? T
  : never;

function useOrganizerTrips() {
  return useQuery(
    serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", { input: {} }),
  );
}

/** URL slug of an organizer name: letters and digits (any script) joined by single hyphens. */
function organizerSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

const SAFETY_ITEMS = [
  {
    icon: "live",
    titleKey: "screen.public.organizer.safety.tracking",
    bodyKey: "screen.public.organizer.safety.trackingBody",
  },
  {
    icon: "shield",
    titleKey: "screen.public.organizer.safety.drivers",
    bodyKey: "screen.public.organizer.safety.driversBody",
  },
  {
    icon: "users",
    titleKey: "screen.public.organizer.safety.moderator",
    bodyKey: "screen.public.organizer.safety.moderatorBody",
  },
  {
    icon: "receipt",
    titleKey: "screen.public.organizer.safety.refunds",
    bodyKey: "screen.public.organizer.safety.refundsBody",
  },
] as const;

export function OrganizerPage() {
  const { t, locale } = useAuth();
  const params = useParams({ strict: false }) as { orgSlug?: string };
  const slug = (params.orgSlug ?? "").trim().toLowerCase();
  const tripsQuery = useOrganizerTrips();

  const items = tripsQuery.data?.items ?? [];
  const matches = items.filter(
    (trip) =>
      organizerSlug(trip.organizerNameEn) === slug || organizerSlug(trip.organizerNameAr) === slug,
  );
  // Trips come newest-first from the API; the artboard lists upcoming trips first.
  const trips = matches.slice(0, TRIPS_SHOWN);
  const name =
    pick(locale, matches[0]?.organizerNameAr, matches[0]?.organizerNameEn) ||
    slug ||
    t("screen.public.organizer.fallbackName");
  const matched = matches.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-4 py-5 pb-16 md:px-6">
      <nav aria-label="Breadcrumb" className={`flex flex-wrap gap-1.5 text-sm ${MUTED}`}>
        <Link to="/" className={`${MUTED} hover:text-[#c93a00]`}>
          {t("screen.public.organizer.breadcrumbHome")}
        </Link>
        <span aria-hidden="true">/</span>
        <Link to={pathFor("SCR-TRV-01")} className={`${MUTED} hover:text-[#c93a00]`}>
          {t("screen.public.landing.nav.exploreTrips")}
        </Link>
        <span aria-hidden="true">/</span>
        <span className={INK}>{name}</span>
      </nav>

      {/* Profile hero: only the facts the public trip rows carry. */}
      <section
        aria-labelledby="organizer-title"
        className="flex flex-wrap items-end gap-4 rounded-[20px] bg-white p-6 md:p-8"
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-4">
          <h1
            id="organizer-title"
            className={`m-0 text-[28px] leading-9 font-bold md:text-[36px] md:leading-11 ${INK}`}
          >
            {name}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[15px]">
            <span className={`inline-flex items-center gap-1.5 font-semibold ${INK}`}>
              <TeIcon name="ticket" className="size-[18px] text-[#c93a00]" />
              {t("screen.public.organizer.publishedTripsCount", { count: matches.length })}
            </span>
            <span className={MUTED}>
              <TeIcon
                name="heart"
                className="me-1.5 inline size-[18px] align-[-4px] text-[#5b5f86]"
              />
              {t("screen.public.organizer.ratingPending")}
            </span>
          </div>
          <p className={`m-0 text-sm ${MUTED}`}>{t("screen.public.organizer.profilePending")}</p>
        </div>
        <Link
          to={pathFor("SCR-TRV-01")}
          className="inline-flex h-12 items-center rounded-xl bg-[#ff6c2e] px-5 text-[15px] font-bold text-[#262a67] no-underline hover:bg-[#ff8655]"
        >
          {t("screen.public.landing.browseTrips")}
        </Link>
      </section>

      <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-6">
        <section
          aria-labelledby="organizer-about"
          className="flex min-w-0 flex-1 flex-col gap-4 rounded-[20px] bg-white p-6"
        >
          <h2 id="organizer-about" className={`m-0 text-[22px] font-semibold ${INK}`}>
            {t("screen.public.organizer.aboutTitle", { name })}
          </h2>
          <p className={`m-0 max-w-[680px] text-base leading-[25px] ${MUTED}`}>
            {matched
              ? t("screen.public.organizer.aboutPending")
              : t("screen.public.organizer.tripsEmptyBody")}
          </p>
        </section>
        <section
          aria-labelledby="organizer-safety"
          className="flex min-w-0 flex-col gap-3.5 rounded-[20px] bg-[#262a67] p-6 text-[#f6f3e4] md:w-[360px] md:shrink-0"
        >
          <h2 id="organizer-safety" className="m-0 text-[22px] font-semibold">
            {t("screen.public.organizer.safetyTitle")}
          </h2>
          {SAFETY_ITEMS.map((item) => (
            <div key={item.icon} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#31367a] text-[#ff8655]">
                <TeIcon name={item.icon} className="size-5" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-base font-semibold">{t(item.titleKey)}</span>
                <span className="text-sm leading-5 text-[#b8bad6]">{t(item.bodyKey)}</span>
              </span>
            </div>
          ))}
        </section>
      </div>

      <section aria-labelledby="organizer-trips" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="organizer-trips" className={`m-0 text-[28px] leading-9 font-bold ${INK}`}>
            {t("screen.public.organizer.tripsTitle")}
          </h2>
          <Link
            to={pathFor("SCR-TRV-01")}
            className="text-[15px] font-semibold text-[#c93a00] hover:text-[#262a67]"
          >
            {t("screen.public.organizer.tripsAll", { name })}
          </Link>
        </div>
        {tripsQuery.isPending ? (
          <div
            role="status"
            aria-label={t("screen.public.landing.loading")}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-[300px] animate-pulse rounded-[20px] bg-[#e3dfc9]" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col gap-2 rounded-[20px] bg-white p-6">
            <p className={`m-0 text-lg font-semibold ${INK}`}>
              {t("screen.public.organizer.tripsEmptyTitle")}
            </p>
            <p className={`m-0 text-[15px] ${MUTED}`}>
              {t("screen.public.organizer.tripsEmptyBody")}
            </p>
            <Link
              to={pathFor("SCR-TRV-01")}
              className="mt-1 inline-flex h-11 w-fit items-center rounded-xl bg-[#ff6c2e] px-5 text-[15px] font-bold text-[#262a67] no-underline hover:bg-[#ff8655]"
            >
              {t("screen.public.organizer.browseAll")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trips.map((trip, index) => (
              <OrganizerTripCard
                key={trip.id}
                trip={trip}
                cover={COVER_FALLBACKS[index % COVER_FALLBACKS.length] as string}
              />
            ))}
          </div>
        )}
      </section>

      {/* The profile data the public site does not carry, said plainly. */}
      <section aria-labelledby="organizer-more" className="rounded-[20px] bg-[#e6e8f5] p-6">
        <h2 id="organizer-more" className={`m-0 text-[19px] font-semibold ${INK}`}>
          {t("screen.public.organizer.moreTitle")}
        </h2>
        <p className={`m-0 max-w-[720px] text-[15px] leading-[23px] ${MUTED}`}>
          {t("screen.public.organizer.moreBody")}
        </p>
      </section>

      <section
        aria-labelledby="organizer-partner"
        className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-white p-6"
      >
        <div className="flex flex-col gap-1">
          <h2 id="organizer-partner" className={`m-0 text-[19px] font-semibold ${INK}`}>
            {t("screen.public.organizer.partnerCta")}
          </h2>
          <p className={`m-0 text-[15px] ${MUTED}`}>
            {t("screen.public.organizer.partnerCtaBody")}
          </p>
        </div>
        <Link
          to={pathFor("SCR-PUB-22")}
          className="inline-flex h-11 items-center rounded-xl bg-[#262a67] px-5 text-[15px] font-semibold text-[#f6f3e4] no-underline hover:bg-[#31367a]"
        >
          {t("screen.public.organizer.partnerLink")}
        </Link>
      </section>
    </div>
  );
}

function OrganizerTripCard({ trip, cover }: { trip: TripDto; cover: string }) {
  const { t, locale } = useAuth();
  const title = pick(locale, trip.titleAr, trip.titleEn) || trip.id;
  const destination = pick(locale, trip.destinations[0]?.nameAr, trip.destinations[0]?.nameEn);
  const origin = pick(locale, trip.origin?.nameAr, trip.origin?.nameEn);
  const dates = formatDateRange(trip.startsAt, trip.endsAt, locale);
  const soldOut = trip.totalCapacity > 0 && trip.remainingSeatsCount <= 0;
  const seatsLine = soldOut
    ? t("screen.public.organizer.card.fullyBooked")
    : t("screen.public.organizer.card.seatsLeft", { count: trip.remainingSeatsCount });

  return (
    <Link
      to={pathFor("SCR-TRV-02", { tripId: trip.id })}
      className="te-card flex flex-col overflow-hidden rounded-[20px] bg-white text-[#262a67] no-underline hover:shadow-[0_8px_24px_rgba(38,42,103,0.12)]"
    >
      <span className="relative flex h-40 items-center justify-center overflow-hidden bg-[#262a67]">
        <img
          src={cover}
          alt={t("screen.public.organizer.card.coverAlt")}
          className="absolute inset-0 size-full object-cover"
        />
      </span>
      <span className="flex flex-col gap-1 px-4 pt-3 pb-4">
        <span className="text-[17px] leading-[23px] font-semibold">{title}</span>
        <span className={`truncate text-sm ${MUTED}`}>
          {[destination ?? origin, dates].filter(Boolean).join(" · ")}
        </span>
        <span className="mt-1.5 flex items-baseline justify-between">
          <span
            className={`text-[13px] font-semibold ${soldOut ? "text-[#b42318]" : "text-[#1f7a4d]"}`}
          >
            {seatsLine}
          </span>
          <span className={`text-[13px] ${MUTED}`}>
            {t("screen.public.organizer.card.fromPrice", {
              price: formatMinorAmount(trip.basePriceMinor, trip.currencyCode, locale),
            })}
          </span>
        </span>
      </span>
    </Link>
  );
}
