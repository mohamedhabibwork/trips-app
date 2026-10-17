import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { useAuth } from "@/auth/auth-context";
import { client } from "@/utils/orpc";
import {
  ensureSupplierSession,
  setApplicantApplicationId,
  setApplicantRole,
  uploadItemsToDocuments,
} from "../../onboarding-state";
import { StateLoading, StatePreview } from "../../shared/state-preview";
import { toPendingItems, withoutItem } from "../../shared/upload-items";
import { AuthFrame } from "../common/auth-frame";
import { AUTH_ROUTES } from "../common/auth-routes";
import { COUNTRY_OPTIONS } from "../common/country-options";
import { SignUpFooter } from "../common/sign-up-footer";
import { useFormReady } from "../common/use-form-ready";

function normalizeOrgCountry(raw: string): "EG" | "SA" | "AE" {
  const upper = raw.toUpperCase();
  if (upper === "SA" || upper === "AE") return upper;
  return "EG";
}

function OrganizationSignUpForm({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
}) {
  const { status, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [registration, setRegistration] = useState<readonly TeFileUploadItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { submitDisabled, formProps } = useFormReady();
  const registrationReady = registration.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !registrationReady) return;
    const formData = new FormData(event.currentTarget);
    const ownerName = String(formData.get("ownerName") ?? "").trim();
    const ownerEmail = String(formData.get("ownerEmail") ?? "").trim();
    const ownerPhone = String(formData.get("ownerPhone") ?? "").trim();
    const legalName = String(formData.get("legalName") ?? "").trim();
    const commercialRegNumber = String(formData.get("commercialRegistration") ?? "").trim();
    const taxNumber = String(formData.get("taxNumber") ?? "").trim();
    const billingContactName = String(formData.get("billingName") ?? "").trim();
    const billingContactEmail = String(formData.get("billingEmail") ?? "").trim();
    const countryCode = normalizeOrgCountry(country || String(formData.get("country") ?? "EG"));

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await ensureSupplierSession({
        isAuthenticated: status === "authenticated",
        signInWithSession,
        role: "organization_owner",
        fullName: ownerName,
        email: ownerEmail,
        phone: ownerPhone,
        preferredLanguage: locale,
      });

      const result = await client.onboarding.submitOrganizationApplication({
        legalEntityName: legalName,
        displayNameAr: legalName,
        displayNameEn: legalName,
        commercialRegNumber,
        taxNumber,
        tourismLicenseNumber: `TL-${commercialRegNumber}`,
        tourismLicenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        countryCode,
        headquartersAddress: `${legalName} Headquarters`,
        signatoryFullName: ownerName,
        signatoryNationalId: "29001011234567",
        signatoryRoleTitle: "Managing Director",
        payoutMethod: "bank_transfer",
        payoutIbanOrWallet: "EG380019000500000000263180002",
        billingContactName,
        billingContactEmail,
        billingContactPhone: ownerPhone,
        billingAddress: `${legalName} Billing Office`,
        invoiceLanguage: locale === "ar" ? "ar" : "en",
        childSafetyProgramOptIn: false,
        documents: uploadItemsToDocuments(registration, "commercial_registry"),
      });

      setApplicantApplicationId(result.id);
      setApplicantRole("organization_owner");
      if (onSubmitted) {
        onSubmitted(result.id);
      } else {
        await navigate({
          to: "/screens/$surface/$slug",
          params: { surface: "public", slug: "application-status-and-changes-response" },
        });
      }
    } catch (caught) {
      setErrorMsg(
        caught instanceof Error ? caught.message : "Could not submit organization application.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      action={AUTH_ROUTES.signUp}
      method="post"
      className="flex flex-col gap-6"
      {...formProps}
      onSubmit={(e) => void handleSubmit(e)}
    >
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

      {errorMsg ? (
        <TeInlineAlert tone="error" title="Submission failed">
          {errorMsg}
        </TeInlineAlert>
      ) : null}

      <TeInlineAlert tone="info" title="Plan and review">
        The Starter plan is assigned when your organization is approved. The registry check is
        manual. No staff access is granted before approval.
      </TeInlineAlert>

      <SignUpFooter
        submitLabel={submitting ? "Submitting..." : "Submit for review"}
        disabled={submitDisabled || !registrationReady || submitting}
      />
    </form>
  );
}

/** Organization registration, web only. Staff access waits for admin approval. */
export function OrganizationSignUp({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
} = {}) {
  return (
    <AuthFrame
      title="Organization sign-up (web only)"
      description="Register your organization for admin review. Owners verify both email and phone."
    >
      <StatePreview
        main={<OrganizationSignUpForm onSubmitted={onSubmitted} />}
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
