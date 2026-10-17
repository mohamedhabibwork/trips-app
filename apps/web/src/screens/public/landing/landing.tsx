import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeEmptyState } from "@trips-app/ui/components/te-empty-state";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { buttonLinkClass } from "../../shared/button-link";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { LanguageSelect } from "../common/language-select";
import { PublicNav } from "../common/public-nav";

interface RoleEntry {
  id: string;
  label: string;
  description: string;
  icon: TeIconName;
}

const ROLE_ENTRIES: readonly RoleEntry[] = [
  {
    id: "traveler",
    label: "Traveler",
    description: "Create a traveler account and book trips.",
    icon: "ticket",
  },
  {
    id: "driver",
    label: "Platform driver",
    description: "Apply to join the platform driver pool.",
    icon: "bus",
  },
  {
    id: "photographer",
    label: "Photographer",
    description: "Apply to join the platform photographer pool.",
    icon: "camera",
  },
  {
    id: "organization",
    label: "Organization",
    description: "Register your organization. Web only.",
    icon: "users",
  },
];

const SHARED_STATES: readonly { slug: string; label: string }[] = [
  { slug: "permission-denied", label: "Permission denied" },
  { slug: "not-found", label: "Not found" },
  { slug: "unauthorized", label: "Unauthorized" },
  { slug: "server-error", label: "Server error" },
  { slug: "service-unavailable", label: "Service unavailable" },
  { slug: "maintenance-page", label: "Maintenance page" },
];

function SharedStateLinks() {
  return (
    <footer className="flex flex-col gap-3">
      <h2 className="te-h3">Shared states</h2>
      <ul className="flex flex-wrap gap-4">
        {SHARED_STATES.map((state) => (
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
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <a href="/" aria-label="Trips Enjoy home" className="inline-flex">
          <img
            src="/brand/trips-enjoy-horizontal-fullcolor.svg"
            alt="Trips Enjoy"
            width={962}
            height={289}
            className="h-10 w-auto"
          />
        </a>
        <div className="flex flex-wrap items-center gap-4">
          <PublicNav current="landing" />
          <LanguageSelect />
        </div>
      </header>

      <section className="flex flex-col gap-4" aria-labelledby="landing-trips-heading">
        <h1 id="landing-trips-heading" className="te-h1">
          Public trips
        </h1>
        <StatePreview
          main={
            <div className="flex flex-col gap-4">
              <p className="te-body">Browse the trips that are published to the public.</p>
              <div>
                <TeButton variant="primary" size="lg">
                  Browse trips
                </TeButton>
              </div>
            </div>
          }
          loading={<StateLoading lines={2} />}
          empty={
            <TeEmptyState
              title="No public trips right now"
              description="Trips appear here once they are published. You can still sign up for a role below."
            />
          }
          error={
            <TeInlineAlert tone="error" title="Trips could not load">
              Try again in a few minutes.
            </TeInlineAlert>
          }
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="landing-roles-heading">
        <h2 id="landing-roles-heading" className="te-h2">
          Sign up as
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {ROLE_ENTRIES.map((role) => (
            <TeCard as="article" key={role.id}>
              <div className="flex flex-col gap-3">
                <TeIcon name={role.icon} />
                <h3 className="te-h3">{role.label}</h3>
                <p className="te-body">{role.description}</p>
                <div>
                  <ScreenLink
                    surface="public"
                    slug="sign-up-chooser"
                    className={buttonLinkClass("secondary")}
                  >
                    Sign up as {role.label.toLowerCase()}
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
