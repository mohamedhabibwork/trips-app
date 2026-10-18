import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
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
  const queryClient = useQueryClient();
  const submitMutation = useMutation(
    orpc.onboarding.submitOrganizationApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );
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

      const result = await submitMutation.mutateAsync({
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
          {t("screen.public.signUp.organizationSignUp.owner")}
        </h2>
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.ownerName")}
          name="ownerName"
          autoComplete="name"
          required
        />
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.ownerEmail")}
          name="ownerEmail"
          type="email"
          autoComplete="email"
          required
        />
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.ownerPhone")}
          name="ownerPhone"
          type="tel"
          autoComplete="tel"
          required
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="org-company-heading">
        <h2 id="org-company-heading" className="te-h3">
          {t("screen.public.signUp.organizationSignUp.organization")}
        </h2>
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.legalName")}
          name="legalName"
          autoComplete="organization"
          required
        />
        <TeSelect
          label={t("screen.public.signUp.organizationSignUp.country")}
          name="country"
          options={COUNTRY_OPTIONS}
          value={country}
          onValueChange={setCountry}
          supportingText={t("screen.public.signUp.organizationSignUp.required")}
          required
        />
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.commercialRegistrationNumber")}
          name="commercialRegistration"
          required
        />
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.taxNumber")}
          name="taxNumber"
          required
        />
        <TeFileUpload
          label={t("screen.public.signUp.organizationSignUp.commercialRegistrationDocument")}
          accept="image/*,application/pdf"
          multiple
          files={registration}
          onFilesSelected={(files) => setRegistration([...registration, ...toPendingItems(files)])}
          onRemove={(name) => setRegistration(withoutItem(registration, name))}
          hint={t("screen.public.signUp.organizationSignUp.aClearPhotoOrScan")}
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="org-billing-heading">
        <h2 id="org-billing-heading" className="te-h3">
          {t("screen.public.signUp.organizationSignUp.billingContact")}
        </h2>
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.billingContactName")}
          name="billingName"
          autoComplete="name"
          required
        />
        <TeInput
          label={t("screen.public.signUp.organizationSignUp.billingContactEmail")}
          name="billingEmail"
          type="email"
          required
        />
      </section>

      {errorMsg ? (
        <TeInlineAlert
          tone="error"
          title={t("screen.public.signUp.organizationSignUp.submissionFailed")}
        >
          {errorMsg}
        </TeInlineAlert>
      ) : null}

      <TeInlineAlert tone="info" title={t("screen.public.signUp.organizationSignUp.planAndReview")}>
        {t("screen.public.signUp.organizationSignUp.theStarterPlanIsAssigned")}
      </TeInlineAlert>

      <SignUpFooter
        submitLabel={
          submitting
            ? t("screen.public.signUp.organizationSignUp.submitting")
            : t("screen.public.signUp.organizationSignUp.submitForReview")
        }
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
      title={t("screen.public.signUp.organizationSignUp.organizationSignUpWebOnly")}
      description={t("screen.public.signUp.organizationSignUp.registerYourOrganizationForAdmin")}
    >
      <StatePreview
        main={<OrganizationSignUpForm onSubmitted={onSubmitted} />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert
            tone="error"
            title={t("screen.public.signUp.organizationSignUp.countryIsMissing")}
          >
            {t("screen.public.signUp.organizationSignUp.selectACountrySubmitIs")}
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
