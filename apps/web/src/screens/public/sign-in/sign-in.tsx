import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { useFormReady } from "../common/use-form-ready";

type SignInMethod = "code" | "password";

const METHOD_TABS: readonly TeTab[] = [
  { id: "code", label: "One-time code" },
  { id: "password", label: "Password" },
];

const OTHER_OUTCOMES: readonly { slug: string; label: string }[] = [
  { slug: "session-expired", label: "Session expired" },
  { slug: "account-suspended", label: "Account suspended" },
  { slug: "deletion-grace-period", label: "Deletion requested" },
  { slug: "application-status-and-changes-response", label: "Application pending" },
];

function SignInForm() {
  const [method, setMethod] = useState<SignInMethod>("code");
  const { submitDisabled, formProps } = useFormReady();

  return (
    <form action={AUTH_ROUTES.signIn} method="post" className="flex flex-col gap-4" {...formProps}>
      <input type="hidden" name="method" value={method} />
      <TeInput label="Email or phone" name="identifier" autoComplete="username" required />
      <TeTabs
        tabs={METHOD_TABS}
        activeId={method}
        onSelect={(id) => setMethod(id === "password" ? "password" : "code")}
        ariaLabel="Sign-in method"
      />
      {method === "password" ? (
        <TeInput
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          passwordToggle
          required
        />
      ) : (
        <p className="te-body">We send a one-time code to the email or phone you enter.</p>
      )}
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={submitDisabled}>
          Sign in
        </TeButton>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link to={AUTH_ROUTES.signUp} className="te-link">
          Create an account
        </Link>
        <ScreenLink surface="public" slug="password-reset">
          Forgot password?
        </ScreenLink>
      </div>
    </form>
  );
}

function SignInOutcomes() {
  return (
    <nav aria-label="Other sign-in outcomes" className="flex flex-col gap-3">
      <h2 className="te-h3">Other outcomes</h2>
      <ul className="flex flex-wrap gap-4">
        {OTHER_OUTCOMES.map((outcome) => (
          <li key={outcome.slug}>
            <ScreenLink surface="public" slug={outcome.slug}>
              {outcome.label}
            </ScreenLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Sign-in for travelers and approved suppliers. Sign-in is by one-time code or password. */
export function SignIn() {
  return (
    <AuthFrame
      title="Sign-in (traveler and supplier)"
      description="Travelers and approved suppliers sign in here."
    >
      <StatePreview
        main={<SignInForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Details do not match">
            Check your details and try again. Repeated failures pause sign-in for a short time.
          </TeInlineAlert>
        }
      />
      <SignInOutcomes />
    </AuthFrame>
  );
}
