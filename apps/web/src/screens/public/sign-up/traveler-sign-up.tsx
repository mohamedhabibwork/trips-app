import { useState, type FormEvent } from "react";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "@/utils/orpc";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { COUNTRY_OPTIONS } from "../common/country-options";
import { LANGUAGE_OPTIONS } from "../common/language-select";
import { SignUpFooter } from "../common/sign-up-footer";
import { hasValue, useFormReady } from "../common/use-form-ready";

// Travelers verify at least one of email or phone (D-20).
function hasEmailOrPhone(form: HTMLFormElement): boolean {
  return hasValue(form, "email") || hasValue(form, "phone");
}

function TravelerSignUpForm() {
  const queryClient = useQueryClient();
  const registerMutation = useMutation(
    orpc.auth.registerTraveler.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.auth.key() });
      },
    }),
  );
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const [submitting, setSubmitting] = useState(false);
  const { submitDisabled, formProps } = useFormReady(hasEmailOrPhone);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const target = email || phone;
    if (target && typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("te:lastOtpTarget", target);
    }
    setSubmitting(true);
    try {
      await registerMutation.mutateAsync({
        fullName,
        email: email || null,
        phone: phone || null,
        password: password || null,
        preferredSignInMethod: password ? "password" : "otp",
        preferredLanguage: language === "ar" ? "ar" : "en",
        surface: "web",
        enableParentRole: false,
      });
    } catch {
      // Errors are surfaced via StatePreview or caller
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      action={AUTH_ROUTES.signUp}
      method="post"
      className="flex flex-col gap-4"
      {...formProps}
      onSubmit={(e) => void handleSubmit(e)}
    >
      <input type="hidden" name="role" value="traveler" />
      <TeInput
        label={t("screen.public.signUp.travelerSignUp.fullName")}
        name="fullName"
        autoComplete="name"
        required
      />
      <TeInput
        label={t("screen.public.signUp.travelerSignUp.email")}
        name="email"
        type="email"
        autoComplete="email"
        supportingText={t("screen.public.signUp.travelerSignUp.enterAnEmailAPhone")}
      />
      <TeInput
        label={t("screen.public.signUp.travelerSignUp.phone")}
        name="phone"
        type="tel"
        autoComplete="tel"
      />
      <TeSelect
        label={t("screen.public.signUp.travelerSignUp.country")}
        name="country"
        options={COUNTRY_OPTIONS}
        value={country}
        onValueChange={setCountry}
        supportingText={t("screen.public.signUp.travelerSignUp.required")}
        required
      />
      <TeSelect
        label={t("screen.public.signUp.travelerSignUp.language")}
        name="language"
        options={LANGUAGE_OPTIONS}
        value={language}
        onValueChange={setLanguage}
      />
      <TeInput
        label={t("screen.public.signUp.travelerSignUp.passwordOptional")}
        name="password"
        type="password"
        autoComplete="new-password"
        passwordToggle
        supportingText={t("screen.public.signUp.travelerSignUp.leaveEmptyToSignIn")}
      />
      <SignUpFooter
        submitLabel={t("screen.public.signUp.travelerSignUp.createAccount")}
        disabled={submitDisabled || submitting}
      />
    </form>
  );
}

/** Traveler account on the Free plan. Email or phone is required; verification follows. */
export function TravelerSignUp() {
  return (
    <AuthFrame
      title={t("screen.public.signUp.travelerSignUp.travelerSignUp")}
      description={t("screen.public.signUp.travelerSignUp.createATravelerAccountOn")}
    >
      <StatePreview
        main={<TravelerSignUpForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.public.signUp.travelerSignUp.accountAlreadyExists")}
          >
            {t("screen.public.signUp.travelerSignUp.anAccountAlreadyUsesThis")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
