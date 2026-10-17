import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { ScreenLink } from "../../shared/screen-link";
import { AUTH_ROUTES } from "./auth-routes";

interface SignUpFooterProps {
  submitLabel: string;
  disabled: boolean;
}

/** Submit for a sign-up form, the next step after it, and the way back to sign-in. */
export function SignUpFooter({ submitLabel, disabled }: SignUpFooterProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={disabled}>
          {submitLabel}
        </TeButton>
      </div>
      <p className="te-body">
        Next, confirm your details with a code:{" "}
        <ScreenLink surface="public" slug="verification-by-code">
          Verification by code
        </ScreenLink>
      </p>
      <p className="te-body">
        Already have an account?{" "}
        <Link to={AUTH_ROUTES.signIn} className="te-link">
          Sign in
        </Link>
      </p>
    </div>
  );
}
