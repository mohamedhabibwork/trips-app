// SCR-PUB-10 Admin authenticator set-up (`/admin/sign-in/authenticator`): add the key to an
// authenticator app, then enter the 6-digit code. The set-up comes from the admin sign-in step
// (SCR-PUB-09) in memory; without it the page sends the admin back to sign in.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AuthErrorView } from "@trips-app/auth";
import { useState, type FormEvent } from "react";

import { getAdminEnrollment, isOtpAuthUri, setAdminEnrollment } from "@/auth/admin-enrollment";
import { useAuth } from "@/auth/auth-context";
import { SubmitBanner } from "@/auth/components/submit-banner";
import { toAuthErrorView } from "@/auth/errors";
import {
  Button,
  Notice,
  StatusPill,
  TextField,
  TextLink,
  linkClass,
} from "@/components/kit/controls";
import { CenteredPanel, Lead, PanelHeading } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

const CODE_LENGTH = 6;

/** First admin sign-in: enrol the authenticator, then the code opens the console. */
export function AdminAuthenticatorSetUpAndCode() {
  const { t, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const enrollMutation = useMutation(
    orpc.auth.adminEnrollTotp.mutationOptions({
      onSuccess: () => queryClient.invalidateQueries({ queryKey: orpc.auth.key() }),
    }),
  );
  const [enrollment] = useState(getAdminEnrollment);
  const [code, setCode] = useState("");
  const [error, setError] = useState<AuthErrorView | null>(null);
  const submitting = enrollMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enrollment || submitting || code.length !== CODE_LENGTH) return;
    setError(null);
    try {
      const result = await enrollMutation.mutateAsync({
        enrollmentToken: enrollment.enrollmentToken,
        totpCode: code,
      });
      setAdminEnrollment(null);
      signInWithSession(result.session);
      await navigate({ to: "/admin" });
    } catch (caught) {
      setCode("");
      setError(toAuthErrorView(caught, { locale, procedure: "auth/adminEnrollTotp" }));
    }
  }

  if (!enrollment) {
    return (
      <CenteredPanel width={620}>
        <PanelHeading>{t("screen.public.signIn.adminAuthenticator.title")}</PanelHeading>
        <Notice tone="info">{t("screen.public.signIn.adminAuthenticator.startOver")}</Notice>
        <TextLink to={pathFor("SCR-PUB-09")}>
          {t("screen.public.signIn.adminAuthenticator.backToSignIn")}
        </TextLink>
      </CenteredPanel>
    );
  }

  return (
    <CenteredPanel width={620}>
      <StatusPill tone="warning" icon="lock">
        {t("screen.public.signIn.adminAuthenticator.setUpRequired")}
      </StatusPill>
      <PanelHeading>{t("screen.public.signIn.adminAuthenticator.title")}</PanelHeading>
      <Lead>{t("screen.public.signIn.adminAuthenticator.lead")}</Lead>
      <div className="flex flex-col gap-1.5 rounded-[var(--te-radius-md)] border-[1.5px] border-[var(--te-hairline)] bg-[var(--te-surface)] p-4 text-sm leading-5">
        <span className="font-semibold">
          {t("screen.public.signIn.adminAuthenticator.enterKey")}
        </span>
        <span dir="ltr" className="font-mono text-base break-all select-all">
          {enrollment.secret}
        </span>
        {isOtpAuthUri(enrollment.otpauthUri) ? (
          <a href={enrollment.otpauthUri} className={linkClass()}>
            {t("screen.public.signIn.adminAuthenticator.openInApp")}
          </a>
        ) : null}
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
