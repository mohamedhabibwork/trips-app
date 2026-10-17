import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { isCodeComplete, OtpEntryPanel } from "../../shared/otp-entry-panel";
import { preventSubmit } from "../../shared/screen-actions";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";

// No real verification route exists for this step yet, so the submit is inert.
function VerificationForm() {
  const [code, setCode] = useState("");

  return (
    <form className="flex flex-col gap-6" onSubmit={preventSubmit}>
      <OtpEntryPanel destination="a***@example.com" code={code} onCodeChange={setCode} />
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={!isCodeComplete(code)}>
          Verify
        </TeButton>
      </div>
      <section className="flex flex-col gap-2" aria-labelledby="after-verify-heading">
        <h2 id="after-verify-heading" className="te-h3">
          After verification
        </h2>
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link to={AUTH_ROUTES.signIn} className="te-link">
              Sign in
            </Link>
          </li>
          <li>
            <ScreenLink surface="public" slug="application-status-and-changes-response">
              Application status
            </ScreenLink>
          </li>
        </ul>
      </section>
    </form>
  );
}

/** Confirms the email or phone before the account can act. The destination is partly masked. */
export function VerificationByCode() {
  return (
    <AuthFrame
      title="Verification by code"
      description="Confirm your email or phone before your account can act."
    >
      <StatePreview
        main={<VerificationForm />}
        loading={<StateLoading lines={2} />}
        error={
          <TeInlineAlert tone="error" title="Wrong code">
            That code does not match. Five wrong codes pause verification for 15 minutes.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
