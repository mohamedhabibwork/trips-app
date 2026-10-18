// SCR-PUB-10 Admin authenticator set-up (`/admin/sign-in/authenticator`): scan, then enter the
// 6-digit code. The enrollment or challenge token is left in session storage by the sign-in step.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView, SessionTokenPayload } from "@trips-app/auth";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { toAuthErrorView } from "@/auth/errors";
import { Button, StatusPill, TextField } from "@/components/kit/controls";
import { CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

const CODE_LENGTH = 6;
const ENROLLMENT_TOKEN_KEY = "te:adminEnrollmentToken";
const CHALLENGE_TOKEN_KEY = "te:adminChallengeToken";
const SETUP_KEY_KEY = "te:adminTotpSetupKey";

function readSession(key: string): string | null {
  return typeof sessionStorage === "undefined" ? null : sessionStorage.getItem(key);
}

/** Second factor for admins. Set-up is required once; later sign-ins need the code only. */
export function AdminAuthenticatorSetUpAndCode() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const onSuccess = () => queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
  const enrollMutation = useMutation(orpc.auth.adminEnrollTotp.mutationOptions({ onSuccess }));
  const verifyMutation = useMutation(orpc.auth.adminVerifyTotp.mutationOptions({ onSuccess }));
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<AuthErrorView | null>(null);
  const setupKey = readSession(SETUP_KEY_KEY);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || code.length !== CODE_LENGTH) return;
    setSubmitting(true);
    setError(null);
    try {
      const enrollmentToken = readSession(ENROLLMENT_TOKEN_KEY);
      const result = (
        enrollmentToken
          ? await enrollMutation.mutateAsync({ enrollmentToken, totpCode: code })
          : await verifyMutation.mutateAsync({
              challengeToken: readSession(CHALLENGE_TOKEN_KEY) ?? "admin-challenge-token",
              totpCode: code,
            })
      ) as { session?: SessionTokenPayload };
      if (result.session) {
        signInWithSession(result.session);
        await navigate({ to: "/admin" });
      }
    } catch (caught) {
      setError(
        toAuthErrorView(caught, {
          locale,
          procedure: readSession(ENROLLMENT_TOKEN_KEY)
            ? "auth/adminEnrollTotp"
            : "auth/adminVerifyTotp",
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <CenteredPanel width={620}>
      <StatusPill tone="warning" icon="lock">
        {t("screen.public.signIn.adminAuthenticator.setUpRequired")}
      </StatusPill>
      <PanelHeading>{t("screen.public.signIn.adminAuthenticator.title")}</PanelHeading>
      <Lead>{t("screen.public.signIn.adminAuthenticator.lead")}</Lead>
      <div className="flex flex-wrap items-center gap-6">
        <div
          role="img"
          aria-label={t("screen.public.signIn.adminAuthenticator.qrLabel")}
          className="flex size-[168px] flex-none items-center justify-center rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] bg-[var(--te-surface)] p-3 text-center text-[13px] text-[var(--te-ink-muted)]"
        >
          {t("screen.public.signIn.adminAuthenticator.qrCode")}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm leading-5">
          <span className="font-semibold">
            {t("screen.public.signIn.adminAuthenticator.cannotScan")}
          </span>
          <span className="text-[var(--te-ink-muted)]">
            {t("screen.public.signIn.adminAuthenticator.enterKey")}
          </span>
          {setupKey ? (
            <span dir="ltr" className="font-mono text-base break-all">
              {setupKey}
            </span>
          ) : (
            <span className="text-[var(--te-ink-muted)]">
              {t("screen.public.signIn.adminAuthenticator.keyMissing")}
            </span>
          )}
        </div>
      </div>
      <form className="flex flex-col gap-5" onSubmit={(event) => void handleSubmit(event)}>
        <TextField
          name="totpCode"
          label={t("screen.public.signIn.adminAuthenticator.codeLabel")}
          placeholder={t("screen.auth.code.placeholder")}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={CODE_LENGTH}
          code
          dir="ltr"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH))}
          disabled={submitting}
        />
        <SubmitBanner view={error} locale={locale} />
        <Button type="submit" disabled={code.length !== CODE_LENGTH || submitting}>
          {submitting ? t("auth.common.submitting") : t("auth.otp.submit")}
        </Button>
      </form>
    </CenteredPanel>
  );
}
