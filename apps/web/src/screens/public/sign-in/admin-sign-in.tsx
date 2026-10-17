import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { useFormReady } from "../common/use-form-ready";

function AdminSignInForm() {
  const { submitDisabled, formProps } = useFormReady();

  return (
    <form
      action={AUTH_ROUTES.adminSignIn}
      method="post"
      className="flex flex-col gap-4"
      {...formProps}
    >
      <TeInput label="Email" name="email" type="email" autoComplete="username" required />
      <TeInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        passwordToggle
        supportingText="At least 12 characters. Passwords found in breached lists are refused."
        required
      />
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={submitDisabled}>
          Continue
        </TeButton>
      </div>
      <p className="te-body">
        Authenticator not set up yet?{" "}
        <ScreenLink surface="public" slug="admin-authenticator-set-up-and-code">
          Set it up
        </ScreenLink>
      </p>
    </form>
  );
}

/** Admin console entry. Staff only, on its own route. The authenticator step follows. */
export function AdminSignIn() {
  return (
    <AuthFrame
      title="Admin sign-in"
      description="Staff only. There is no public sign-up for administrators."
    >
      <StatePreview
        main={<AdminSignInForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Sign-in refused">
            The email or password is wrong. Five failed attempts lock sign-in for 15 minutes.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
