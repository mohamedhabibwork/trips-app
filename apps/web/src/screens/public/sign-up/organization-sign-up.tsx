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

function OrganizationSignUpForm() {
  const [country, setCountry] = useState("");
  const [registration, setRegistration] = useState<readonly TeFileUploadItem[]>([]);
  const { submitDisabled, formProps } = useFormReady();
  const registrationReady = registration.length > 0;

  return (
    <form action={AUTH_ROUTES.signUp} method="post" className="flex flex-col gap-6" {...formProps}>
      <input type="hidden" name="role" value="organization" />

      <section className="flex flex-col gap-4" aria-labelledby="org-owner-heading">
        <h2 id="org-owner-heading" className="te-h3">
          Owner
        </h2>
        <TeInput label="Owner name" name="ownerName" autoComplete="name" required />
        <TeInput label="Owner email" name="ownerEmail" type="email" autoComplete="email" required />
        <TeInput label="Owner phone" name="ownerPhone" type="tel" autoComplete="tel" required />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="org-company-heading">
        <h2 id="org-company-heading" className="te-h3">
          Organization
        </h2>
        <TeInput label="Legal name" name="legalName" autoComplete="organization" required />
        <TeSelect
          label="Country"
          name="country"
          options={COUNTRY_OPTIONS}
          value={country}
          onValueChange={setCountry}
          supportingText="Required."
          required
        />
        <TeInput label="Commercial registration number" name="commercialRegistration" required />
        <TeInput label="Tax number" name="taxNumber" required />
        <TeFileUpload
          label="Commercial registration document"
          accept="image/*,application/pdf"
          multiple
          files={registration}
          onFilesSelected={(files) => setRegistration([...registration, ...toPendingItems(files)])}
          onRemove={(name) => setRegistration(withoutItem(registration, name))}
          hint="A clear photo or scan."
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="org-billing-heading">
        <h2 id="org-billing-heading" className="te-h3">
          Billing contact
        </h2>
        <TeInput label="Billing contact name" name="billingName" autoComplete="name" required />
        <TeInput label="Billing contact email" name="billingEmail" type="email" required />
      </section>

      <TeInlineAlert tone="info" title="Plan and review">
        The Starter plan is assigned when your organization is approved. The registry check is
        manual. No staff access is granted before approval.
      </TeInlineAlert>

      <SignUpFooter
        submitLabel="Submit for review"
        disabled={submitDisabled || !registrationReady}
      />
    </form>
  );
}

/** Organization registration, web only. Staff access waits for admin approval. */
export function OrganizationSignUp() {
  return (
    <AuthFrame
      title="Organization sign-up (web only)"
      description="Register your organization for admin review. Owners verify both email and phone."
    >
      <StatePreview
        main={<OrganizationSignUpForm />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Country is missing">
            Select a country. Submit is refused until it is set.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
