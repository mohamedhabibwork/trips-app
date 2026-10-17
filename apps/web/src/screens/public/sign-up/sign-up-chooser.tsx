import { Link } from "@tanstack/react-router";
import { TeBadge } from "@trips-app/ui/components/te-badge";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon, type TeIconName } from "@trips-app/ui/components/te-icon";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { buttonLinkClass } from "../../shared/button-link";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";

interface RoleChoice {
  slug: string;
  title: string;
  description: string;
  icon: TeIconName;
  webOnly: boolean;
}

const ROLE_CHOICES: readonly RoleChoice[] = [
  {
    slug: "traveler-sign-up",
    title: "Traveler",
    description: "Create a traveler account on the Free plan.",
    icon: "ticket",
    webOnly: false,
  },
  {
    slug: "platform-driver-sign-up",
    title: "Platform driver",
    description: "Apply to join the platform driver pool.",
    icon: "bus",
    webOnly: false,
  },
  {
    slug: "photographer-sign-up",
    title: "Photographer",
    description: "Apply to join the platform photographer pool.",
    icon: "camera",
    webOnly: false,
  },
  {
    slug: "organization-sign-up",
    title: "Organization",
    description: "Register an organization for admin review.",
    icon: "users",
    webOnly: true,
  },
];

function RoleCards() {
  return (
    <div className="flex flex-col gap-4">
      {ROLE_CHOICES.map((choice) => (
        <TeCard as="article" key={choice.slug}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <TeIcon name={choice.icon} />
              <h2 className="te-h3">{choice.title}</h2>
              {choice.webOnly ? (
                <TeBadge tone="info">
                  <TeIcon name="info" />
                  Web only
                </TeBadge>
              ) : null}
            </div>
            <p className="te-body">{choice.description}</p>
            <div>
              <ScreenLink
                surface="public"
                slug={choice.slug}
                className={buttonLinkClass("primary")}
              >
                Continue as {choice.title.toLowerCase()}
              </ScreenLink>
            </div>
          </div>
        </TeCard>
      ))}
    </div>
  );
}

/** One card per role. Choosing a card opens only that role's form. */
export function SignUpChooser() {
  return (
    <AuthFrame title="Sign-up chooser (/register)" description="Pick the role that fits you.">
      <StatePreview
        main={<RoleCards />}
        loading={<StateLoading lines={4} />}
        error={
          <TeInlineAlert tone="error" title="Roles could not load">
            Refresh the page to try again.
          </TeInlineAlert>
        }
      />
      <p className="te-body">
        Already have an account?{" "}
        <Link to={AUTH_ROUTES.signIn} className="te-link">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
