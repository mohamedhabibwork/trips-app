import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { AuthFrame } from "../common/auth-frame";

/** Access is stopped by an admin. No data is shown and sign-in is refused while the suspension lasts. */
export function AccountSuspended() {
  return (
    <AuthFrame
      title="Account suspended"
      description="Access to this account is stopped. No data has been deleted."
    >
      <TeInlineAlert tone="error" title="Reason">
        The reason from the suspension notice is shown here.
      </TeInlineAlert>
      <p className="te-body">
        To ask for a review, contact support. Sign-in stays refused while the suspension is active.
      </p>
    </AuthFrame>
  );
}
