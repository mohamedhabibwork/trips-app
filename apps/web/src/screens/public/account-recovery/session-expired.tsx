import { Link } from "@tanstack/react-router";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { buttonLinkClass } from "../../shared/button-link";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";

/** Shown after 12 hours of web use or a refused token. Drafts are kept. Sign-in returns to the same app. */
export function SessionExpired() {
  return (
    <AuthFrame
      title="Session expired"
      description="For your security you were signed out. Your unsaved drafts are kept."
    >
      <TeInlineAlert tone="info" title="Drafts kept">
        Sign in to continue where you left off, in the same app.
      </TeInlineAlert>
      <div>
        <Link to={AUTH_ROUTES.signIn} className={buttonLinkClass("primary", "lg")}>
          Sign in
        </Link>
      </div>
    </AuthFrame>
  );
}
