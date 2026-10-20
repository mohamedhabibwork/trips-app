// SCR-PUB-01 Landing (docs/design/web/WebHome.dc.html): hero with image and live badge, the
// find-a-trip search card (forwards "Where to" to /trips?q=), trust cards, popular trips, how it
// works, the parents band, the navy partners band and the footer. Trips come from the public API
// the traveler surface uses (PUB-01 -> TRV-01/TRV-02). The page draws its own header and footer,
// so the public shell does not frame it (routes/__root.tsx).
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { OfflineBanner } from "@/screens/shared/offline-banner";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/shells/shell-parts";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions } from "@/utils/server-rpc";
import { pick } from "@/surfaces/traveler/util";

const INK = "text-[#262a67]";
const MUTED = "text-[#5b5f86]";
const NAVY_MUTED = "text-[#b8bad6]";

/** The artboard shows four trip cards. */
const TRIPS_SHOWN = 4;
const COVER_FALLBACKS = [
  "/design/traveler/cover-alula.svg",
  "/design/traveler/cover-red-sea.svg",
  "/design/traveler/cover-edge-of-world.svg",
  "/design/traveler/cover-taif-roses.svg",
] as const;

const TRAVELLERS_MIN = 1;
const TRAVELLERS_MAX = 12;

/** A trip counts as "almost full" once a tenth of the capacity or less remains. */
function isAlmostFull(remaining: number, capacity: number): boolean {
  if (capacity <= 0 || remaining <= 0) return false;
  return remaining <= Math.max(1, Math.round(capacity * 0.1));
}

type TripDto = ReturnType<typeof useLandingTrips>["data"] extends
  | { items: readonly (infer T)[] }
  | undefined
  ? T
  : never;

function useLandingTrips() {
  return useQuery(
    serverQueryOptions(orpc.trips.browsePublicTrips, "trips/browsePublicTrips", { input: {} }),
  );
}

export function Landing() {
  const { direction, status } = useAuth();
  const tripsQuery = useLandingTrips();
  const trips = (tripsQuery.data?.items ?? []).slice(0, TRIPS_SHOWN);

  return (
    <div dir={direction} className="flex min-h-svh flex-col bg-[#f6f3e4] text-[#262a67]">
      <SkipLink />
      <LandingHeader signedIn={status === "authenticated"} />
      <main id={MAIN_CONTENT_ID} className="flex flex-1 flex-col">
        <OfflineBanner />
        <Hero trips={trips} />
        <SearchCard />
        <TrustCards />
        <PublicTrips trips={trips} loading={tripsQuery.isPending} failed={tripsQuery.isError} />
        <HowItWorks />
        <ParentsBand />
        <PartnersBand />
      </main>
      <LandingFooter />
    </div>
  );
}

/* Icon helpers --------------------------------------------------------------- */

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={path} />
    </svg>
  );
}

const ICON = {
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  people:
    "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM3 20a6 6 0 0 1 12 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14.5a6 6 0 0 1 3 5.5",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  minus: "M5 12h14",
  plus: "M12 5v14M5 12h14",
  tracking:
    "M12 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7M5.6 18.4a9 9 0 0 1 0-12.8M18.4 5.6a9 9 0 0 1 0 12.8",
  shield: "M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6zM9 12l2 2 4-4",
  lock: "M6 11h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1zM8 11V7a4 4 0 0 1 8 0v4",
  check: "M5 12.5l4.5 4.5L19 7",
  arrow: "M5 12h14M13 6l6 6-6 6",
  bus: "M6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM4 11h16M8 18v2M16 18v2M8 14.5h.01M16 14.5h.01",
  camera:
    "M4 8a2 2 0 0 1 2-2h2l2-2h4l2 2h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM12 9.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z",
} as const;

/* Header ------------------------------------------------------------------ */

function LandingHeader({ signedIn }: { signedIn: boolean }) {
  const { t } = useAuth();
  return (
    <header className="border-b border-[#e3dfc9]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-3 px-6 py-3.5 max-md:px-4">
        <Link to="/" aria-label="Trips Enjoy home" className="mr-4 inline-flex shrink-0">
          <img
            src="/brand/trips-enjoy-horizontal-fullcolor.svg"
            alt="Trips Enjoy"
            className="h-10 w-auto"
          />
        </Link>
        <nav
          aria-label={t("component.shell.public.primaryNav")}
          className="flex grow flex-wrap gap-x-6 gap-y-1"
        >
          <Link
            to={pathFor("SCR-TRV-01")}
            className="py-2.5 text-[15px] font-semibold text-[#262a67] no-underline hover:text-[#c93a00]"
          >
            {t("screen.public.landing.nav.exploreTrips")}
          </Link>
          <a
            href="#organizers"
            className="py-2.5 text-[15px] font-semibold text-[#262a67] no-underline hover:text-[#c93a00]"
          >
            {t("screen.public.landing.nav.forOrganizers")}
          </a>
          <a
            href="#organizers"
            className="py-2.5 text-[15px] font-semibold text-[#262a67] no-underline hover:text-[#c93a00]"
          >
            {t("screen.public.landing.nav.forDriversPhotographers")}
          </a>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <LanguageLink />
          {signedIn ? null : (
            <Link
              to={pathFor("SCR-PUB-08")}
              className="inline-flex h-12 items-center rounded-xl border border-[#7b7fa6] bg-white px-5 text-[15px] font-semibold text-[#262a67] no-underline hover:border-[#262a67]"
            >
              {t("screen.public.landing.signIn")}
            </Link>
          )}
          <Link
            to={pathFor("SCR-TRV-01")}
            className="inline-flex h-12 items-center rounded-xl bg-[#ff6c2e] px-5 text-[15px] font-bold text-[#262a67] no-underline hover:bg-[#ff8655]"
          >
            {t("screen.public.landing.bookTrip")}
          </Link>
        </div>
      </div>
    </header>
  );
}

/** The العربية link is the same locale switch the shell uses, so the SSR'd page flips with it. */
function LanguageLink({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useAuth();
  const next = locale === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      lang={next}
      onClick={() => setLocale(next)}
      className={
        compact
          ? "cursor-pointer border-0 bg-transparent p-0 text-[13px] font-normal text-[#b8bad6] hover:text-[#f89e23]"
          : "inline-flex h-11 cursor-pointer items-center border-0 bg-transparent px-3 text-[15px] font-semibold text-[#262a67] hover:text-[#c93a00]"
      }
    >
      {next === "ar" ? t("component.shell.language.arabic") : t("component.shell.language.english")}
    </button>
  );
}

/* Hero -------------------------------------------------------------------- */

function Hero({ trips }: { trips: readonly TripDto[] }) {
  const { t, locale } = useAuth();
  const scarce = [...trips]
    .filter((trip) => trip.remainingSeatsCount > 0)
    .sort((a, b) => a.remainingSeatsCount - b.remainingSeatsCount)[0];
  const caption = scarce
    ? `${pick(locale, scarce.titleAr, scarce.titleEn) || scarce.id} · ${t("screen.public.landing.seatsLeft", { count: scarce.remainingSeatsCount })}`
    : t("screen.public.landing.hero.captionFallback");

  return (
    <section
      aria-labelledby="landing-hero"
      className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center gap-10 px-6 pt-12 max-md:px-4 max-md:pt-8"
    >
      <div className="flex min-w-0 flex-col gap-5 max-lg:basis-[420px] max-lg:grow">
        <span className="self-start rounded-full bg-[#ffe7dc] px-3 py-1 text-[13px] font-bold text-[#c93a00]">
          {t("screen.public.landing.hero.eyebrow")}
        </span>
        <h1
          id="landing-hero"
          className="m-0 text-[52px] leading-[58px] font-bold tracking-[-0.5px] max-md:text-[36px] max-md:leading-[42px]"
        >
          {t("screen.public.landing.hero.title")}
        </h1>
        <p className={`m-0 max-w-[520px] text-[18px] leading-[27px] ${MUTED}`}>
          {t("screen.public.landing.hero.body")}
        </p>
        <div className={`flex flex-wrap gap-5 text-sm ${MUTED}`}>
          <span className="flex items-center gap-1.5">
            <Icon path={ICON.star} className="size-[18px] text-[#c93a00]" />
            <strong className={INK}>{t("screen.public.landing.hero.ratingValue")}</strong>
            {t("screen.public.landing.hero.ratingLabel")}
          </span>
          <span className="flex items-center gap-1.5">
            <Icon path={ICON.people} className="size-[18px] text-[#c93a00]" />
            {t("screen.public.landing.hero.organizers")}
          </span>
        </div>
      </div>
      <div className="relative min-w-0 grow basis-[440px]">
        <img
          src="/design/traveler/hero-beach.png"
          alt={t("screen.public.landing.hero.imageAlt")}
          className="block h-[420px] w-full rounded-[20px] object-cover max-md:h-[280px]"
        />
        <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-white/70 bg-white/78 px-4 py-2.5 text-sm font-semibold text-[#262a67] shadow-[0_10px_30px_rgba(38,42,103,0.18)] backdrop-blur-xl">
          <span className="size-2 rounded-full bg-[#c93a00]" />
          {caption}
        </span>
      </div>
    </section>
  );
}

/* Search card --------------------------------------------------------------- */

function SearchCard() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const [where, setWhere] = useState("");
  const [travellers, setTravellers] = useState(2);

  // `/trips` validates the `q` search param (SCR-TRV-01); the dates and traveller count stay on
  // this page, matching the artboard, and the explore page narrows from there.
  const search = (event: FormEvent) => {
    event.preventDefault();
    void navigate({ to: pathFor("SCR-TRV-01"), search: where.trim() ? { q: where.trim() } : {} });
  };

  return (
    <section
      aria-label={t("screen.public.landing.search.sectionLabel")}
      className="mx-auto w-full max-w-[1200px] px-6 pt-8 max-md:px-4"
    >
      <form
        role="search"
        aria-label={t("screen.public.landing.search.formLabel")}
        onSubmit={search}
        className="flex flex-wrap items-end gap-3 rounded-[20px] bg-white p-4 shadow-[0_10px_30px_rgba(38,42,103,0.10)]"
      >
        <div className="flex grow basis-[240px] flex-col gap-1.5 max-[420px]:grow-[2]">
          <label htmlFor="landing-where" className="text-sm font-semibold">
            {t("screen.public.landing.search.where")}
          </label>
          <input
            id="landing-where"
            type="text"
            value={where}
            placeholder={t("screen.public.landing.search.wherePlaceholder")}
            onChange={(event) => setWhere(event.target.value)}
            className="h-[52px] rounded-lg border border-[#7b7fa6] bg-white px-3.5 text-base text-[#262a67]"
          />
        </div>
        <div className="flex grow basis-[180px] flex-col gap-1.5">
          <label htmlFor="landing-dates" className="text-sm font-semibold">
            {t("screen.public.landing.search.dates")}
          </label>
          <input
            id="landing-dates"
            type="text"
            placeholder={t("screen.public.landing.search.datesPlaceholder")}
            className="h-[52px] rounded-lg border border-[#7b7fa6] bg-white px-3.5 text-base text-[#262a67]"
          />
        </div>
        <div className="flex grow basis-[180px] flex-col gap-1.5">
          <span id="landing-trav" className="text-sm font-semibold">
            {t("screen.public.landing.search.travellers")}
          </span>
          <div
            role="group"
            aria-labelledby="landing-trav"
            className="flex h-[52px] items-center justify-between rounded-lg border border-[#7b7fa6] px-1"
          >
            <button
              type="button"
              aria-label={t("screen.public.landing.search.fewer")}
              disabled={travellers <= TRAVELLERS_MIN}
              onClick={() => setTravellers((count) => Math.max(TRAVELLERS_MIN, count - 1))}
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#262a67] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon path={ICON.minus} className="size-[18px]" />
            </button>
            <span aria-live="polite" className="text-base font-semibold">
              {travellers === 1
                ? t("screen.public.landing.search.oneTraveller")
                : t("screen.public.landing.search.travellersCount", { count: travellers })}
            </span>
            <button
              type="button"
              aria-label={t("screen.public.landing.search.more")}
              disabled={travellers >= TRAVELLERS_MAX}
              onClick={() => setTravellers((count) => Math.min(TRAVELLERS_MAX, count + 1))}
              className="flex size-11 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-[#262a67] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon path={ICON.plus} className="size-[18px]" />
            </button>
          </div>
        </div>
        <button
          type="submit"
          className="inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff6c2e] px-7 text-base font-bold text-[#262a67] hover:bg-[#ff8655]"
        >
          <Icon path={ICON.search} className="size-5" />
          {t("screen.public.landing.search.submit")}
        </button>
      </form>
    </section>
  );
}

/* Trust cards --------------------------------------------------------------- */

const TRUST_CARDS = [
  { key: "tracking", icon: ICON.tracking },
  { key: "drivers", icon: ICON.shield },
  { key: "payments", icon: ICON.lock },
] as const;

function TrustCards() {
  const { t } = useAuth();
  return (
    <section
      aria-label={t("screen.public.landing.trust.sectionLabel")}
      className="mx-auto grid w-full max-w-[1200px] grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4 px-6 pt-8 max-md:px-4"
    >
      {TRUST_CARDS.map((card) => (
        <div
          key={card.key}
          className="flex items-center gap-3.5 rounded-[20px] border border-[#e3dfc9] p-4 pe-[18px]"
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#ffe7dc] text-[#c93a00]">
            <Icon path={card.icon} className="size-[22px]" />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-base font-semibold">
              {t(`screen.public.landing.trust.${card.key}.title`)}
            </span>
            <span className={`text-sm leading-[19px] ${MUTED}`}>
              {t(`screen.public.landing.trust.${card.key}.body`)}
            </span>
          </span>
        </div>
      ))}
    </section>
  );
}

/* Public trips ------------------------------------------------------------ */

interface PublicTripsProps {
  trips: readonly TripDto[];
  loading: boolean;
  failed: boolean;
}

function PublicTrips({ trips, loading, failed }: PublicTripsProps) {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="landing-public-trips"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 pt-16 max-md:px-4 max-md:pt-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="landing-public-trips" className="m-0 text-[32px] leading-10 font-bold">
          {t("screen.public.landing.popular.title")}
        </h2>
        <Link
          to={pathFor("SCR-TRV-01")}
          className="text-[15px] font-semibold text-[#c93a00] no-underline hover:text-[#262a67]"
        >
          {t("screen.public.landing.browseAllTrips")}
        </Link>
      </div>
      {failed ? (
        <p className={`m-0 text-[15px] ${MUTED}`}>{t("screen.public.landing.tripsFailed")}</p>
      ) : loading ? (
        <div
          role="status"
          aria-label={t("screen.public.landing.loading")}
          className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5"
        >
          {Array.from({ length: TRIPS_SHOWN }, (_, index) => (
            <div key={index} className="h-[330px] animate-pulse rounded-[20px] bg-[#e3dfc9]" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <p className={`m-0 text-[15px] ${MUTED}`}>{t("screen.public.landing.noTripsBody")}</p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-5">
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              cover={trip.coverImageUrl ?? COVER_FALLBACKS[index % COVER_FALLBACKS.length]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TripCard({ trip, cover }: { trip: TripDto; cover: string }) {
  const { t, locale } = useAuth();
  const title = pick(locale, trip.titleAr, trip.titleEn) || trip.id;
  const organizer = pick(locale, trip.organizerNameAr, trip.organizerNameEn);
  const origin = pick(locale, trip.origin?.nameAr, trip.origin?.nameEn);
  const dates = formatDateRange(trip.startsAt, trip.endsAt, locale);
  const soldOut = trip.totalCapacity > 0 && trip.remainingSeatsCount <= 0;
  const almostFull = isAlmostFull(trip.remainingSeatsCount, trip.totalCapacity);
  const seatsLine = soldOut
    ? t("screen.public.landing.card.seatsSoldOut")
    : t("screen.public.landing.seatsLeft", { count: trip.remainingSeatsCount });

  return (
    <Link
      to={pathFor("SCR-TRV-02", { tripId: trip.id })}
      className="te-card flex flex-col overflow-hidden rounded-[20px] bg-white text-[#262a67] no-underline hover:shadow-[0_8px_24px_rgba(38,42,103,0.12)]"
    >
      <span className="relative flex h-[180px] items-center justify-center overflow-hidden bg-[#262a67]">
        <img
          src={cover}
          alt={t("screen.public.landing.card.coverAlt")}
          className="absolute inset-0 size-full object-cover"
        />
        {almostFull ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#f89e23] px-2.5 py-0.5 text-xs font-bold text-[#262a67]">
            {t("screen.public.landing.card.seatsAlmostFull")}
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-1 px-4 pt-3.5 pb-4">
        <span className="text-[17px] leading-[23px] font-semibold">{title}</span>
        {organizer ? <span className={`text-sm ${MUTED}`}>{organizer}</span> : null}
        <span className={`truncate text-sm ${MUTED}`}>
          {[dates, origin ? t("screen.public.landing.card.fromCity", { city: origin }) : null]
            .filter(Boolean)
            .join(" · ")}
        </span>
        <span className="mt-1.5 flex items-baseline justify-between">
          <span
            className={`text-[13px] font-semibold ${soldOut || almostFull ? "text-[#b42318]" : "text-[#1f7a4d]"}`}
          >
            {seatsLine}
          </span>
          <span className={`text-[13px] ${MUTED}`}>
            {t("screen.public.landing.fromPrice", {
              price: formatMinorAmount(trip.basePriceMinor, trip.currencyCode, locale),
            })}
          </span>
        </span>
      </span>
    </Link>
  );
}

/* How it works --------------------------------------------------------------- */

const STEPS = [1, 2, 3] as const;

function HowItWorks() {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="landing-how"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 pt-16 max-md:px-4 max-md:pt-10"
    >
      <h2 id="landing-how" className="m-0 text-[32px] leading-10 font-bold">
        {t("screen.public.landing.how.title")}
      </h2>
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5 p-0">
        {STEPS.map((step) => (
          <li key={step} className="flex flex-col gap-2.5 rounded-[20px] bg-white p-5">
            <span className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-[#262a67] text-base font-bold text-[#f6f3e4]">
                {step}
              </span>
              <span className="text-[20px] font-semibold">
                {t(`screen.public.landing.how.step${step}.title`)}
              </span>
            </span>
            <span className={`text-[15px] leading-[22px] ${MUTED}`}>
              {t(`screen.public.landing.how.step${step}.body`)}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* Parents band --------------------------------------------------------------- */

const PARENTS_POINTS = ["b1", "b2", "b3"] as const;

function ParentsBand() {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="landing-parents"
      className="mx-auto w-full max-w-[1200px] px-6 pt-16 max-md:px-4 max-md:pt-10"
    >
      <div className="flex flex-wrap items-stretch overflow-hidden rounded-[20px] bg-white">
        <img
          src="/design/traveler/parents-city.png"
          alt={t("screen.public.landing.parents.imageAlt")}
          className="h-[340px] min-w-0 grow basis-[380px] object-cover max-md:h-[240px]"
        />
        <div className="flex min-w-0 grow basis-[420px] flex-col justify-center gap-4 px-6 py-9 md:px-10">
          <span className="text-[13px] font-bold tracking-[0.5px] text-[#c93a00]">
            {t("screen.public.landing.parents.eyebrow")}
          </span>
          <h2 id="landing-parents" className="m-0 text-[30px] leading-[38px] font-bold">
            {t("screen.public.landing.parents.title")}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0 text-[15px] leading-[21px]">
            {PARENTS_POINTS.map((point) => (
              <li key={point} className="flex gap-2.5">
                <Icon path={ICON.check} className="size-5 shrink-0 text-[#1f7a4d]" />
                {t(`screen.public.landing.parents.${point}`)}
              </li>
            ))}
          </ul>
          <span className={`text-sm ${MUTED}`}>{t("screen.public.landing.parents.note")}</span>
          <a
            href="#"
            className="inline-flex h-12 items-center gap-2 self-start rounded-xl bg-[#262a67] px-5 text-[15px] font-semibold text-[#f6f3e4] no-underline hover:bg-[#31367a]"
          >
            {t("screen.public.landing.parents.cta")}
            <Icon path={ICON.arrow} className="size-[18px]" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* Partners band --------------------------------------------------------------- */

const PROVIDERS = [
  { key: "org", icon: ICON.people, to: pathFor("SCR-PUB-22") },
  { key: "driver", icon: ICON.bus, to: pathFor("SCR-PUB-22") },
  { key: "photo", icon: ICON.camera, to: pathFor("SCR-PUB-22") },
] as const;

function PartnersBand() {
  const { t } = useAuth();
  return (
    <section
      id="organizers"
      aria-labelledby="landing-partners"
      className="mx-auto w-full max-w-[1200px] px-6 pt-16 pb-[72px] max-md:px-4 max-md:pt-10"
    >
      <div className="flex flex-col gap-6 rounded-[20px] bg-[#262a67] p-10 text-[#f6f3e4] max-md:p-6">
        <div className="flex max-w-[640px] flex-col gap-2">
          <h2 id="landing-partners" className="m-0 text-[32px] leading-10 font-bold">
            {t("screen.public.landing.partners.title")}
          </h2>
          <p className={`m-0 text-base leading-6 ${NAVY_MUTED}`}>
            {t("screen.public.landing.partners.lead")}
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {PROVIDERS.map((provider) => (
            <div
              key={provider.key}
              className="flex flex-col gap-2.5 rounded-[20px] bg-[#31367a] p-5"
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-[#262a67] text-[#ff8655]">
                <Icon path={provider.icon} className="size-[22px]" />
              </span>
              <span className="text-[20px] font-semibold">
                {t(`screen.public.landing.partners.${provider.key}.title`)}
              </span>
              <span className={`grow text-[15px] leading-[22px] ${NAVY_MUTED}`}>
                {t(`screen.public.landing.partners.${provider.key}.body`)}
              </span>
              <Link
                to={provider.to}
                className="inline-flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold text-[#ff8655] no-underline hover:text-[#f89e23]"
              >
                {t(`screen.public.landing.partners.${provider.key}.cta`)}
                <Icon path={ICON.arrow} className="size-[18px]" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Footer ------------------------------------------------------------------ */

const FOOTER_COLUMNS = [
  {
    key: "travellers",
    links: [
      { key: "exploreTrips", to: pathFor("SCR-TRV-01") },
      { key: "myBookings", to: pathFor("SCR-TRV-10") },
      { key: "plans" },
      { key: "help" },
    ],
  },
  {
    key: "partners",
    links: [
      { key: "forOrganizers", to: pathFor("SCR-PUB-22") },
      { key: "forDrivers", to: pathFor("SCR-PUB-22") },
      { key: "forPhotographers", to: pathFor("SCR-PUB-22") },
      { key: "partnerSignIn", to: pathFor("SCR-PUB-11") },
    ],
  },
  {
    key: "company",
    links: [{ key: "aboutUs" }, { key: "safety" }, { key: "careers" }, { key: "contact" }],
  },
] as const;

function LandingFooter() {
  const { t } = useAuth();
  return (
    <footer className="bg-[#262a67] text-[#f6f3e4]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 pt-12 pb-8 max-md:px-4">
        <div className="flex flex-wrap gap-x-12 gap-y-8">
          <div className="flex grow basis-[260px] grow-[2] flex-col gap-3">
            <img
              src="/brand/trips-enjoy-horizontal-reversed.svg"
              alt="Trips Enjoy"
              className="h-10 w-auto self-start"
            />
            <span className={`max-w-[320px] text-[15px] leading-[22px] ${NAVY_MUTED}`}>
              {t("screen.public.landing.footer.tagline")}
            </span>
          </div>
          {FOOTER_COLUMNS.map((column) => (
            <nav
              key={column.key}
              aria-label={t(`screen.public.landing.footer.col.${column.key}`)}
              className="flex grow basis-[160px] flex-col gap-1.5"
            >
              <span className="mb-1 text-sm font-bold">
                {t(`screen.public.landing.footer.col.${column.key}`)}
              </span>
              {column.links.map((link) => {
                const label = t(
                  link.key in FOOTER_LINK_KEYS
                    ? FOOTER_LINK_KEYS[link.key as keyof typeof FOOTER_LINK_KEYS]
                    : `screen.public.landing.footer.${link.key}`,
                );
                return "to" in link && link.to ? (
                  <Link
                    key={link.key}
                    to={link.to}
                    className={`text-sm leading-7 ${NAVY_MUTED} no-underline hover:text-[#f89e23]`}
                  >
                    {label}
                  </Link>
                ) : (
                  <a
                    key={link.key}
                    href="#"
                    className={`text-sm leading-7 ${NAVY_MUTED} no-underline hover:text-[#f89e23]`}
                  >
                    {label}
                  </a>
                );
              })}
            </nav>
          ))}
        </div>
        <div
          className={`flex flex-wrap justify-between gap-3 border-t border-[#31367a] pt-5 text-[13px] ${NAVY_MUTED}`}
        >
          <span>{t("screen.public.landing.footer.copyright")}</span>
          <span className="flex gap-5">
            <Link to={pathFor("SCR-PUB-20")} className={`${NAVY_MUTED} hover:text-[#f89e23]`}>
              {t("screen.public.landing.footer.privacy")}
            </Link>
            <Link to={pathFor("SCR-PUB-20")} className={`${NAVY_MUTED} hover:text-[#f89e23]`}>
              {t("screen.public.landing.footer.terms")}
            </Link>
            <LanguageLink compact />
          </span>
        </div>
      </div>
    </footer>
  );
}

/** Footer link labels whose translation keys are not `footer.<key>` itself. */
const FOOTER_LINK_KEYS = {
  exploreTrips: "screen.public.landing.nav.exploreTrips",
  forOrganizers: "screen.public.landing.nav.forOrganizers",
  forDrivers: "screen.public.landing.footer.forDrivers",
  forPhotographers: "screen.public.landing.footer.forPhotographers",
  partnerSignIn: "screen.public.landing.footer.partnerSignIn",
} as const;
