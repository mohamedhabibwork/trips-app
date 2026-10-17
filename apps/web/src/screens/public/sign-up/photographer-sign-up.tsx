import { useState } from "react";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { toPendingItems, withoutItem } from "../../shared/upload-items";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { COUNTRY_OPTIONS } from "../common/country-options";
import { SignUpFooter } from "../common/sign-up-footer";
import { useFormReady } from "../common/use-form-ready";

const MIN_PORTFOLIO_PHOTOS = 8;

function PhotographerSignUpForm() {
  const [country, setCountry] = useState("");
  const [portfolio, setPortfolio] = useState<readonly TeFileUploadItem[]>([]);
  const { submitDisabled, formProps } = useFormReady();
  const portfolioReady = portfolio.length >= MIN_PORTFOLIO_PHOTOS;

  return (
    <form action={AUTH_ROUTES.signUp} method="post" className="flex flex-col gap-4" {...formProps}>
      <input type="hidden" name="role" value="photographer" />
      <TeInput
        label="Name or studio name"
        name="displayName"
        autoComplete="organization"
        required
      />
      <TeInput label="Email" name="email" type="email" autoComplete="email" required />
      <TeInput label="Phone" name="phone" type="tel" autoComplete="tel" required />
      <TeSelect
        label="Country"
        name="country"
        options={COUNTRY_OPTIONS}
        value={country}
        onValueChange={setCountry}
        supportingText="Required."
        required
      />
      <TeInlineAlert tone="info" title="Portfolio photos needed">
        Upload at least {MIN_PORTFOLIO_PHOTOS} photos. Uploaded: {portfolio.length} of{" "}
        {MIN_PORTFOLIO_PHOTOS}.
      </TeInlineAlert>
      <TeFileUpload
        label="Portfolio photos"
        accept="image/*"
        multiple
        files={portfolio}
        onFilesSelected={(files) => setPortfolio([...portfolio, ...toPendingItems(files)])}
        onRemove={(name) => setPortfolio(withoutItem(portfolio, name))}
        hint={`Minimum ${MIN_PORTFOLIO_PHOTOS} photos. Submit stays blocked until the minimum is met.`}
      />
      <SignUpFooter submitLabel="Submit application" disabled={submitDisabled || !portfolioReady} />
    </form>
  );
}

/** Photographer application with a portfolio of at least 8 photos. Access starts after approval. */
export function PhotographerSignUp() {
  return (
    <AuthFrame
      title="Photographer sign-up"
      description="Apply to join the platform photographer pool. Photographers verify both email and phone."
    >
      <StatePreview
        main={<PhotographerSignUpForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="warning" title="Add more photos">
            Your portfolio has fewer than {MIN_PORTFOLIO_PHOTOS} photos. Add more to submit.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
