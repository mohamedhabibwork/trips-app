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

const MIN_PORTFOLIO_PHOTOS = 8;

function PhotographerSignUpForm({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
}) {
  const { status, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [portfolio, setPortfolio] = useState<readonly TeFileUploadItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { submitDisabled, formProps } = useFormReady();
  const portfolioReady = portfolio.length >= MIN_PORTFOLIO_PHOTOS;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !portfolioReady) return;
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("displayName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await ensureSupplierSession({
        isAuthenticated: status === "authenticated",
        signInWithSession,
        role: "platform_photographer",
        fullName: displayName,
        email,
        phone,
        preferredLanguage: locale,
      });

      const portfolioDocuments = uploadItemsToDocuments(
        portfolio,
        "portfolio_sample",
        "image/jpeg",
      );
      const result = await client.onboarding.submitPhotographerApplication({
        nationalId: "29201011234567",
        yearsOfExperience: 4,
        cameraBodies: [`${displayName || "Pro"} Camera Kit`],
        lenses: ["24-70mm f/2.8", "70-200mm f/2.8"],
        hasDroneLicense: false,
        serviceRegions: [country || "Cairo"],
        specialties: ["Adventure", "Group Trips"],
        portfolioPhotoCount: portfolio.length,
        sampleAlbums: [
          { title: `${displayName || "Studio"} Portfolio`, photoCount: portfolio.length },
        ],
        documents: portfolioDocuments,
      });

      setApplicantApplicationId(result.id);
      setApplicantRole("platform_photographer");
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
        caught instanceof Error ? caught.message : "Could not submit photographer application.",
      );
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
      {errorMsg ? (
        <TeInlineAlert tone="error" title="Submission failed">
          {errorMsg}
        </TeInlineAlert>
      ) : null}
      <SignUpFooter
        submitLabel={submitting ? "Submitting..." : "Submit application"}
        disabled={submitDisabled || !portfolioReady || submitting}
      />
    </form>
  );
}

/** Photographer application with a portfolio of at least 8 photos. Access starts after approval. */
export function PhotographerSignUp({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
} = {}) {
  return (
    <AuthFrame
      title="Photographer sign-up"
      description="Apply to join the platform photographer pool. Photographers verify both email and phone."
    >
      <StatePreview
        main={<PhotographerSignUpForm onSubmitted={onSubmitted} />}
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
