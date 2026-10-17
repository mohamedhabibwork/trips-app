import { useState } from "react";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSelect } from "@trips-app/ui/components/te-select";
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
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("en");
  const { submitDisabled, formProps } = useFormReady(hasEmailOrPhone);

  return (
    <form action={AUTH_ROUTES.signUp} method="post" className="flex flex-col gap-4" {...formProps}>
      <input type="hidden" name="role" value="traveler" />
      <TeInput label="Full name" name="fullName" autoComplete="name" required />
      <TeInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        supportingText="Enter an email, a phone number, or both. At least one is required."
      />
      <TeInput label="Phone" name="phone" type="tel" autoComplete="tel" />
      <TeSelect
        label="Country"
        name="country"
        options={COUNTRY_OPTIONS}
        value={country}
        onValueChange={setCountry}
        supportingText="Required."
        required
      />
      <TeSelect
        label="Language"
        name="language"
        options={LANGUAGE_OPTIONS}
        value={language}
        onValueChange={setLanguage}
      />
      <TeInput
        label="Password (optional)"
        name="password"
        type="password"
        autoComplete="new-password"
        passwordToggle
        supportingText="Leave empty to sign in with a one-time code."
      />
      <SignUpFooter submitLabel="Create account" disabled={submitDisabled} />
    </form>
  );
}

/** Traveler account on the Free plan. Email or phone is required; verification follows. */
export function TravelerSignUp() {
  return (
    <AuthFrame title="Traveler sign-up" description="Create a traveler account on the Free plan.">
      <StatePreview
        main={<TravelerSignUpForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Account already exists">
            An account already uses this email or phone. Sign in instead.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
