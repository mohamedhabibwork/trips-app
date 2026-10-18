import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeTabs, type TeTab } from "@trips-app/ui/components/te-tabs";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { ScreenLink } from "../../shared/screen-link";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { useFormReady } from "../common/use-form-ready";

type SignInMethod = "code" | "password";

const METHOD_TABS = (): readonly TeTab[] => [
  { id: "code", label: t("screen.public.signIn.signIn.oneTimeCode") },
  { id: "password", label: t("screen.public.signIn.signIn.password") },
];

const OTHER_OUTCOMES = (): readonly { slug: string; label: string }[] => [
  { slug: "session-expired", label: t("screen.public.signIn.signIn.sessionExpired") },
  { slug: "account-suspended", label: t("screen.public.signIn.signIn.accountSuspended") },
  { slug: "deletion-grace-period", label: t("screen.public.signIn.signIn.deletionRequested") },
  {
    slug: "application-status-and-changes-response",
    label: t("screen.public.signIn.signIn.applicationPending"),
  },
];

function SignInForm() {
  const queryClient = useQueryClient();
  const signInMutation = useMutation(
    orpc.auth.signIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [method, setMethod] = useState<SignInMethod>("code");
  const [submitting, setSubmitting] = useState(false);
  const { submitDisabled, formProps } = useFormReady();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formData = new FormData(event.currentTarget);
    const identifier = String(formData.get("identifier") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (!identifier) return;
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("te:lastOtpTarget", identifier);
    }
    setSubmitting(true);
    try {
      await signInMutation.mutateAsync({
        identifier,
        method: method === "password" ? "password" : "otp",
        ...(method === "password" ? { password } : {}),
        surface: "web",
      });
    } catch {
      // Handled via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      action={AUTH_ROUTES.signIn}
      method="post"
      className="flex flex-col gap-4"
      {...formProps}
      onSubmit={(e) => void handleSubmit(e)}
    >
      <input type="hidden" name="method" value={method} />
      <TeInput
        label={t("screen.public.signIn.signIn.emailOrPhone")}
        name="identifier"
        autoComplete="username"
        required
      />
      <TeTabs
        tabs={METHOD_TABS()}
        activeId={method}
        onSelect={(id) => setMethod(id === "password" ? "password" : "code")}
        ariaLabel={t("screen.public.signIn.signIn.signInMethod")}
      />
      {method === "password" ? (
        <TeInput
          label={t("screen.public.signIn.signIn.passwordLabel")}
          name="password"
          type="password"
          autoComplete="current-password"
          passwordToggle
          required
        />
      ) : (
        <p className="te-body">{t("screen.public.signIn.signIn.weSendAOneTime")}</p>
      )}
      <div>
        <TeButton type="submit" variant="primary" size="lg" disabled={submitDisabled || submitting}>
          {t("screen.public.signIn.signIn.signIn")}
        </TeButton>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link to={AUTH_ROUTES.signUp} className="te-link">
          {t("screen.public.signIn.signIn.createAnAccount")}
        </Link>
        <ScreenLink surface="public" slug="password-reset">
          {t("screen.public.signIn.signIn.forgotPassword")}
        </ScreenLink>
      </div>
    </form>
  );
}

function SignInOutcomes() {
  return (
    <nav
      aria-label={t("screen.public.signIn.signIn.otherSignInOutcomes")}
      className="flex flex-col gap-3"
    >
      <h2 className="te-h3">{t("screen.public.signIn.signIn.otherOutcomes")}</h2>
      <ul className="flex flex-wrap gap-4">
        {OTHER_OUTCOMES().map((outcome) => (
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
      title={t("screen.public.signIn.signIn.signInTravelerAndSupplier")}
      description={t("screen.public.signIn.signIn.travelersAndApprovedSuppliersSign")}
    >
      <StatePreview
        main={<SignInForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title={t("screen.public.signIn.signIn.detailsDoNotMatch")}>
            {t("screen.public.signIn.signIn.checkYourDetailsAndTry")}
          </TeInlineAlert>
        }
      />
      <SignInOutcomes />
    </AuthFrame>
  );
}
