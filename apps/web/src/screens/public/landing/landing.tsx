import { useQuery } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { t } from "@trips-app/i18n";
import { orpc } from "@/utils/orpc";
import { buttonLinkClass } from "../../shared/button-link";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";

interface RoleEntry {
  id: string;
  label: string;
  description: string;
  icon: TeIconName;
}

const ROLE_ENTRIES = (): readonly RoleEntry[] => [
  {
    id: "traveler",
    label: t("screen.public.landing.landing.traveler"),
    description: t("screen.public.landing.landing.createATravelerAccountAnd"),
    icon: "ticket",
  },
  {
    id: "driver",
    label: t("screen.public.landing.landing.platformDriver"),
    description: t("screen.public.landing.landing.applyToJoinThePlatform"),
    icon: "bus",
  },
  {
    id: "photographer",
    label: t("screen.public.landing.landing.photographer"),
    description: t("screen.public.landing.landing.applyToJoinThePlatformDescription"),
    icon: "camera",
  },
  {
    id: "organization",
    label: t("screen.public.landing.landing.organization"),
    description: t("screen.public.landing.landing.registerYourOrganizationWebOnly"),
    icon: "users",
  },
];

const SHARED_STATES = (): readonly { slug: string; label: string }[] => [
  { slug: "permission-denied", label: t("screen.public.landing.landing.permissionDenied") },
  { slug: "not-found", label: t("screen.public.landing.landing.notFound") },
  { slug: "unauthorized", label: t("screen.public.landing.landing.unauthorized") },
  { slug: "server-error", label: t("screen.public.landing.landing.serverError") },
  { slug: "service-unavailable", label: t("screen.public.landing.landing.serviceUnavailable") },
  { slug: "maintenance-page", label: t("screen.public.landing.landing.maintenancePage") },
];

function SharedStateLinks() {
  return (
    <footer className="flex flex-col gap-3">
      <h2 className="te-h3">{t("screen.public.landing.landing.sharedStates")}</h2>
      <ul className="flex flex-wrap gap-4">
        {SHARED_STATES().map((state) => (
          <li key={state.slug}>
            <ScreenLink surface="shared" slug={state.slug}>
              {state.label}
            </ScreenLink>
          </li>
        ))}
      </ul>
    </footer>
  );
}

/** Public entry point. It only routes: browse trips, or sign up for a role. */
export function Landing() {
  const tripsQuery = useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));
  const trips = (tripsQuery.data?.items ?? []).map((trip) => ({
    id: trip.id,
    title: trip.titleEn || trip.titleAr || trip.id,
    destination:
      trip.destinations[0]?.nameEn || trip.destinations[0]?.nameAr || trip.origin?.nameEn || "-",
    departure: trip.startsAt ? new Date(trip.startsAt).toISOString().slice(0, 10) : "-",
  }));

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-10 px-4 py-8 md:px-12 md:py-12">
      <section className="flex flex-col gap-4" aria-labelledby="landing-trips-heading">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 id="landing-trips-heading" className="te-h1">
              {t("screen.public.landing.landing.publicTrips")}
            </h1>
            <p className="te-body mt-2 text-[var(--te-ink-muted)]">
              {t("screen.public.landing.landing.browseTheTripsThatAre")}
            </p>
          </div>
          <TeButton variant="primary" size="lg">
            {t("screen.public.landing.landing.browseTrips")}
          </TeButton>
        </div>
        <StatePreview
          main={
            <div className="flex flex-col gap-4">
              {trips.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {trips.map((trip) => (
                    <TeCard key={trip.id}>
                      <p className="te-h3">{trip.title}</p>
                      <p className="te-caption">
                        {trip.destination} · {trip.departure}
                      </p>
                    </TeCard>
                  ))}
                </div>
              ) : null}
            </div>
          }
          loading={<StateLoading lines={2} />}
          empty={
            <TeEmptyState
              title={t("screen.public.landing.landing.noPublicTripsRightNow")}
              description={t("screen.public.landing.landing.tripsAppearHereOnceThey")}
            />
          }
          error={
            <TeInlineAlert
              tone="error"
              title={t("screen.public.landing.landing.tripsCouldNotLoad")}
            >
              {t("screen.public.landing.landing.tryAgainInAFew")}
            </TeInlineAlert>
          }
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="landing-roles-heading">
        <h2 id="landing-roles-heading" className="te-h2">
          {t("screen.public.landing.landing.signUpAs")}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_ENTRIES().map((role) => (
            <TeCard as="article" key={role.id}>
              <div className="flex h-full flex-col gap-3">
                <TeIcon name={role.icon} />
                <h3 className="te-h3">{role.label}</h3>
                <p className="te-body text-[var(--te-ink-muted)]">{role.description}</p>
                <div className="mt-auto pt-2">
                  <ScreenLink
                    surface="public"
                    slug="sign-up-chooser"
                    className={buttonLinkClass("secondary")}
                  >
                    {t("screen.public.landing.landing.signUpAs2")} {role.label.toLowerCase()}
                  </ScreenLink>
                </div>
              </div>
            </TeCard>
          ))}
        </div>
      </section>

      <SharedStateLinks />
    </div>
  );
}
