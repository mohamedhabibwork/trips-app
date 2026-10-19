// SCR-PUB-01 Landing: hero, the first public trips and the four sign-up roles, per the
// public-shared artboard (docs/design/web/public-shared/SCR-PUB-01.dc.html). Trips come from the
// public API the traveler surface uses (PUB-01 -> TRV-01/TRV-02). The page draws its own header,
// so the public shell does not frame it (routes/__root.tsx).
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { useAuth } from "@/auth/auth-context";
import { OfflineBanner } from "@/screens/shared/offline-banner";
import { MAIN_CONTENT_ID, SkipLink } from "@/components/shells/shell-parts";
import { formatDateRange, formatMinorAmount } from "@/components/kit/format";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";
import { pick } from "@/surfaces/traveler/util";

const INK = "text-[#262a67]";
const MUTED = "text-[#5b5f86]";

/** The artboard shows three trip cards. */
const TRIPS_SHOWN = 3;
const COVER_FALLBACKS = [
  "/design/traveler/cover-alula.svg",
  "/design/traveler/cover-red-sea.svg",
  "/design/traveler/cover-edge-of-world.svg",
] as const;

type TripDto = ReturnType<typeof useLandingTrips>["data"] extends
  | { items: readonly (infer T)[] }
  | undefined
  ? T
  : never;

function useLandingTrips() {
  return useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));
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
        <Hero />
        <PublicTrips trips={trips} loading={tripsQuery.isPending} failed={tripsQuery.isError} />
        <RolesBand />
      </main>
    </div>
  );
}

/* Header ------------------------------------------------------------------ */

function LandingHeader({ signedIn }: { signedIn: boolean }) {
  const { t } = useAuth();
  return (
    <header className="border-b border-[#e3dfc9]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-end gap-3 px-6 py-3.5 max-md:px-4">
        <Link to="/" aria-label="Trips Enjoy home" className="mr-auto inline-flex shrink-0">
          <img
            src="/brand/trips-enjoy-horizontal-fullcolor.svg"
            alt="Trips Enjoy"
            className="h-10 w-auto"
          />
        </Link>
        <LanguageLink />
        {signedIn ? null : (
          <Link
            to={pathFor("SCR-PUB-08")}
            className="inline-flex h-12 items-center rounded-xl border border-[#7b7fa6] bg-white px-5 text-[15px] font-semibold text-[#262a67] no-underline hover:border-[#262a67]"
          >
            {t("screen.public.landing.signIn")}
          </Link>
        )}
      </div>
    </header>
  );
}

/** The العربية link is the same locale switch the shell uses, so the SSR'd page flips with it. */
function LanguageLink() {
  const { locale, setLocale, t } = useAuth();
  const next = locale === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      lang={next}
      onClick={() => setLocale(next)}
      className="inline-flex h-11 items-center px-3 text-[15px] font-semibold text-[#262a67] hover:text-[#c93a00]"
    >
      {next === "ar" ? t("component.shell.language.arabic") : t("component.shell.language.english")}
    </button>
  );
}

/* Hero -------------------------------------------------------------------- */

function Hero() {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="landing-hero"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 pt-12 max-md:px-4 max-md:pt-8"
    >
      <h1
        id="landing-hero"
        className="m-0 text-[52px] leading-[58px] font-bold tracking-[-0.5px] max-md:text-[36px] max-md:leading-[42px]"
      >
        {t("screen.public.landing.title")}
      </h1>
      <p className={`m-0 max-w-[560px] text-[18px] leading-[27px] ${MUTED}`}>
        {t("screen.public.landing.lead")}
      </p>
      <div>
        <Link
          to={pathFor("SCR-TRV-01")}
          className="inline-flex h-12 items-center rounded-xl bg-[#ff6c2e] px-6 text-[15px] font-bold text-[#262a67] no-underline hover:bg-[#ff8655]"
        >
          {t("screen.public.landing.browseTrips")}
        </Link>
      </div>
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
  const { t, locale } = useAuth();
  return (
    <section
      aria-labelledby="landing-public-trips"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 pt-14 max-md:px-4"
    >
      <h2 id="landing-public-trips" className="m-0 text-[32px] leading-10 font-bold">
        {t("screen.public.landing.publicTrips")}
      </h2>
      {failed ? (
        <p className={`m-0 text-[15px] ${MUTED}`}>{t("screen.public.landing.tripsFailed")}</p>
      ) : loading ? (
        <div
          role="status"
          aria-label={t("screen.public.landing.loading")}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {Array.from({ length: TRIPS_SHOWN }, (_, index) => (
            <div key={index} className="h-[330px] animate-pulse rounded-[20px] bg-[#e3dfc9]" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <p className={`m-0 text-[15px] ${MUTED}`}>{t("screen.public.landing.noTripsBody")}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip, index) => (
            <TripCard
              key={trip.id}
              trip={trip}
              cover={COVER_FALLBACKS[index % COVER_FALLBACKS.length]}
              locale={locale}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TripCard({ trip, cover, locale }: { trip: TripDto; cover: string; locale: string }) {
  const { t } = useAuth();
  const title = pick(locale, trip.titleAr, trip.titleEn) || trip.id;
  const destination = pick(locale, trip.destinations[0]?.nameAr, trip.destinations[0]?.nameEn);
  const origin = pick(locale, trip.origin?.nameAr, trip.origin?.nameEn);
  const place = destination ?? origin;
  const dates = formatDateRange(trip.startsAt, trip.endsAt, locale);
  const soldOut = trip.totalCapacity > 0 && trip.remainingSeatsCount <= 0;
  const seatsLine = soldOut
    ? t("screen.public.landing.fullyBooked")
    : t("screen.public.landing.seatsLeft", { count: trip.remainingSeatsCount });

  return (
    <Link
      to={pathFor("SCR-TRV-02", { tripId: trip.id })}
      className="te-card flex flex-col overflow-hidden rounded-[20px] bg-white text-[#262a67] no-underline hover:shadow-[0_8px_24px_rgba(38,42,103,0.12)]"
    >
      <span className="relative flex h-[180px] items-center justify-center overflow-hidden bg-[#262a67]">
        <img
          src={cover}
          alt={t("screen.public.landing.groupPhoto")}
          className="absolute inset-0 size-full object-cover"
        />
      </span>
      <span className="flex flex-col gap-1 px-4 pt-3.5 pb-4">
        <span className="text-[17px] leading-[23px] font-semibold">{title}</span>
        <span className={`truncate text-sm ${MUTED}`}>
          {[place, dates].filter(Boolean).join(" · ")}
        </span>
        <span className="mt-1.5 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-[#1f7a4d]">{seatsLine}</span>
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

/* Sign-up roles ------------------------------------------------------------- */

const ROLES = [
  { screenId: "SCR-PUB-03", titleKey: "role.traveler", bodyKey: "role.travelerBody" },
  { screenId: "SCR-PUB-04", titleKey: "role.driver", bodyKey: "role.driverBody" },
  { screenId: "SCR-PUB-05", titleKey: "role.photographer", bodyKey: "role.photographerBody" },
  { screenId: "SCR-PUB-06", titleKey: "role.organization", bodyKey: "role.organizationBody" },
] as const;

function RolesBand() {
  const { t } = useAuth();
  return (
    <section
      aria-labelledby="landing-roles"
      className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-6 pt-14 pb-16 max-md:px-4"
    >
      <h2 id="landing-roles" className="m-0 text-[32px] leading-10 font-bold">
        {t("screen.public.landing.signUpForRole")}
      </h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => (
          <div
            key={role.screenId}
            className="te-card flex flex-col gap-3 rounded-[20px] bg-white p-6"
          >
            <h3 className={`m-0 text-[19px] leading-6 font-semibold ${INK}`}>
              {t(`screen.public.landing.${role.titleKey}`)}
            </h3>
            <p className={`m-0 grow text-[15px] leading-[22px] ${MUTED}`}>
              {t(`screen.public.landing.${role.bodyKey}`)}
            </p>
            <Link
              to={pathFor(role.screenId)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ff6c2e] px-5 text-[15px] font-bold text-[#262a67] no-underline hover:bg-[#ff8655]"
            >
              {t("screen.public.landing.signUp")}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
