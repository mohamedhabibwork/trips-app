import { Link } from "@tanstack/react-router";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { buttonLinkClass } from "../../shared/button-link";
import { AuthFrame } from "../common/auth-frame";

/** Account in the 30-day deletion grace period. Signing in restores the account. */
export function DeletionGracePeriod() {
  return (
    <AuthFrame
      title="Deletion grace period"
      description="Your account is in the 30-day grace period after a deletion request."
    >
      <TeKpiTile
        label="Grace period ends"
        value="16 Nov 2026"
        hint="30 days after the deletion request"
      />
      <TeInlineAlert tone="info" title="Sign in to restore">
        Signing in restores your account and cancels the deletion request.
      </TeInlineAlert>
      <p className="te-body">
        If the deletion becomes permanent, future bookings are cancelled and refunded.
      </p>
      <div>
        <Link to="/" className={buttonLinkClass("primary", "lg")}>
          Continue to app home
        </Link>
      </div>
    </AuthFrame>
  );
}
