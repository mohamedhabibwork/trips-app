// /crew/sign-in — vehicle moderator with a staff code (SCR-PUB-19).
//
// The staff code *is* the second factor; the server enforces a single active device (D-107).
import { Link, useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { Button } from "@trips-app/ui/components/button";
import { useState } from "react";

import { client } from "../../utils/orpc";
import { useAuth } from "../auth-context";
import { AuthField, AuthLinkRow, AuthShell } from "../components/auth-shell";
import { SubmitBanner } from "../components/submit-banner";
import { toAuthErrorView } from "../errors";

interface ModeratorSignInResult {
  step: "authenticated";
  session?: SessionTokenPayload;
}

export function CrewSignInScreen() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [staffCode, setStaffCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);

  const submit = async (): Promise<void> => {
    setSubmitting(true);
    setError(null);
    try {
      const result = (await client.auth.moderatorSignIn({
        identifier: identifier.trim(),
        staffCode: staffCode.trim(),
        surface: "pwa",
      })) as unknown as ModeratorSignInResult;

      if (result.session) {
        signInWithSession(result.session);
        await navigate({ to: "/crew" });
        return;
      }
      setError(
        toAuthErrorView(new Error("Unexpected moderator sign-in result."), {
          locale,
          procedure: "auth/moderatorSignIn",
        }),
      );
    } catch (caught) {
      setError(toAuthErrorView(caught, { locale, procedure: "auth/moderatorSignIn" }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={t("auth.crew.title")}
      subtitle={t("auth.crew.subtitle")}
      footer={
        <AuthLinkRow>
          <Link to="/sign-in" className="underline underline-offset-4">
            {t("auth.signIn.title")}
          </Link>
        </AuthLinkRow>
      }
    >
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <AuthField
          id="crewIdentifier"
          label={t("auth.crew.identifier")}
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
          inputMode="email"
          required
          disabled={submitting}
        />
        <AuthField
          id="staffCode"
          label={t("auth.crew.staffCode")}
          value={staffCode}
          onChange={setStaffCode}
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          disabled={submitting}
        />
        <SubmitBanner view={error} locale={locale} />
        <Button
          type="submit"
          disabled={submitting || identifier.trim().length === 0 || staffCode.trim().length === 0}
        >
          {submitting ? t("auth.common.submitting") : t("auth.crew.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
