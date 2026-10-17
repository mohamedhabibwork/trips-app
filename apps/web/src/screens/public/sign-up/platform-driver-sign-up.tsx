import { useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeFileUpload, type TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSelect } from "@trips-app/ui/components/te-select";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
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

// TeInput has no date type yet, so dates are typed as YYYY-MM-DD and checked by pattern.
const DATE_PATTERN = "\\d{4}-\\d{2}-\\d{2}";

type DriverDocumentKey = "registration" | "insurance" | "lab";

const DRIVER_DOCUMENTS: readonly { key: DriverDocumentKey; label: string }[] = [
  { key: "registration", label: "Registration document" },
  { key: "insurance", label: "Insurance document" },
  { key: "lab", label: "Lab result" },
];

type DriverUploads = Readonly<Record<DriverDocumentKey, readonly TeFileUploadItem[]>>;

const NO_UPLOADS: DriverUploads = { registration: [], insurance: [], lab: [] };

interface DriverConsents {
  backgroundCheck: boolean;
  labTest: boolean;
}

const NO_CONSENTS: DriverConsents = { backgroundCheck: false, labTest: false };

function DriverDocuments({
  uploads,
  onChange,
}: {
  uploads: DriverUploads;
  onChange: (key: DriverDocumentKey, items: readonly TeFileUploadItem[]) => void;
}) {
  return (
    <>
      {DRIVER_DOCUMENTS.map((doc) => (
        <TeFileUpload
          key={doc.key}
          label={doc.label}
          accept="image/*,application/pdf"
          files={uploads[doc.key]}
          onFilesSelected={(files) =>
            onChange(doc.key, [...uploads[doc.key], ...toPendingItems(files)])
          }
          onRemove={(name) => onChange(doc.key, withoutItem(uploads[doc.key], name))}
          hint="A clear photo or scan."
        />
      ))}
    </>
  );
}

function DriverSignUpForm({ onSubmitted }: { onSubmitted?: (applicationId: string) => void }) {
  const { status, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const [country, setCountry] = useState("");
  const [hasOwnVehicle, setHasOwnVehicle] = useState(true);
  const [uploads, setUploads] = useState<DriverUploads>(NO_UPLOADS);
  const [consents, setConsents] = useState<DriverConsents>(NO_CONSENTS);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { submitDisabled, formProps } = useFormReady();

  const documentsReady = DRIVER_DOCUMENTS.every((doc) => uploads[doc.key].length > 0);
  const consentsReady = consents.backgroundCheck && consents.labTest;

  function setUpload(key: DriverDocumentKey, items: readonly TeFileUploadItem[]) {
    setUploads((current) => ({ ...current, [key]: items }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !documentsReady || !consentsReady) return;
    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const plate = String(formData.get("plate") ?? "").trim();
    const model = String(formData.get("model") ?? "").trim();
    const year = Number(formData.get("year") ?? 2023);
    const seats = Number(formData.get("seats") ?? 14);
    const insuranceExpiry = String(formData.get("insuranceExpiry") ?? "").trim();
    const labTestDate = String(formData.get("labTestDate") ?? "").trim();

    setSubmitting(true);
    setErrorMsg(null);
    try {
      await ensureSupplierSession({
        isAuthenticated: status === "authenticated",
        signInWithSession,
        role: "platform_driver",
        fullName,
        email,
        phone,
        preferredLanguage: locale,
      });

      const documents = [
        ...uploadItemsToDocuments(uploads.registration, "national_id"),
        ...uploadItemsToDocuments(uploads.registration, "driver_license"),
        ...uploadItemsToDocuments(uploads.insurance, "insurance_certificate"),
        ...uploadItemsToDocuments(uploads.lab, "lab_test_result"),
      ];

      const result = await client.onboarding.submitDriverApplication({
        nationalId: "28801011234567",
        licenseNumber: plate ? `LIC-${plate}` : `LIC-${Date.now()}`,
        licenseCategory: "First Degree Bus",
        licenseExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        yearsOfExperience: 5,
        serviceAreas: [country || "Cairo"],
        hasOwnVehicle,
        vehicleMakeModel: hasOwnVehicle ? model || "Toyota Coaster" : null,
        vehicleYear: hasOwnVehicle && Number.isFinite(year) && year >= 2000 ? year : null,
        vehiclePlateNumber: hasOwnVehicle ? plate || "ABC-123" : null,
        vehicleSeatCapacity: hasOwnVehicle && Number.isFinite(seats) && seats >= 1 ? seats : null,
        insurancePolicyNumber: hasOwnVehicle ? "INS-2026-001" : null,
        insuranceExpiry: new Date(`${insuranceExpiry}T00:00:00.000Z`).toISOString(),
        labResultSubmittedAt: new Date(`${labTestDate}T00:00:00.000Z`).toISOString(),
        labTestConsentSigned: consents.labTest,
        backgroundCheckConsentSigned: consents.backgroundCheck,
        documents,
      });

      setApplicantApplicationId(result.id);
      setApplicantRole("platform_driver");
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
        caught instanceof Error ? caught.message : "Could not submit driver application.",
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
      <input type="hidden" name="role" value="driver" />

      <section className="flex flex-col gap-4" aria-labelledby="driver-identity-heading">
        <h2 id="driver-identity-heading" className="te-h3">
          Identity
        </h2>
        <TeInput label="Full name" name="fullName" autoComplete="name" required />
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
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="driver-vehicle-heading">
        <h2 id="driver-vehicle-heading" className="te-h3">
          Vehicle
        </h2>
        <TeSwitch
          label="I drive my own vehicle"
          checked={hasOwnVehicle}
          onCheckedChange={setHasOwnVehicle}
        />
        {hasOwnVehicle ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <TeInput label="Plate number" name="plate" required />
            <TeInput label="Model" name="model" required />
            <TeInput label="Year" name="year" inputMode="numeric" required />
            <TeInput label="Seats" name="seats" inputMode="numeric" required />
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="driver-documents-heading">
        <h2 id="driver-documents-heading" className="te-h3">
          Documents
        </h2>
        <DriverDocuments uploads={uploads} onChange={setUpload} />
        <TeInput
          label="Insurance valid until"
          name="insuranceExpiry"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          pattern={DATE_PATTERN}
          supportingText="Insurance must be valid for at least 3 more months."
          required
        />
        <TeInput
          label="Lab test date"
          name="labTestDate"
          inputMode="numeric"
          placeholder="YYYY-MM-DD"
          pattern={DATE_PATTERN}
          supportingText="The lab result must be less than 30 days old."
          required
        />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="driver-consent-heading">
        <h2 id="driver-consent-heading" className="te-h3">
          Consent
        </h2>
        <TeCheckbox
          label="I consent to a background check"
          description="Required to join the driver pool."
          checked={consents.backgroundCheck}
          onCheckedChange={(checked) =>
            setConsents((current) => ({ ...current, backgroundCheck: checked }))
          }
        />
        <TeCheckbox
          label="I consent to a lab test"
          description="Required to join the driver pool."
          checked={consents.labTest}
          onCheckedChange={(checked) =>
            setConsents((current) => ({ ...current, labTest: checked }))
          }
        />
      </section>

      {errorMsg ? (
        <TeInlineAlert tone="error" title="Application blocked">
          {errorMsg}
        </TeInlineAlert>
      ) : null}

      <SignUpFooter
        submitLabel={submitting ? "Submitting..." : "Submit application"}
        disabled={submitDisabled || !documentsReady || !consentsReady || submitting}
      />
    </form>
  );
}

/** Driver application. Access starts only after approval; the status screen follows submission. */
export function PlatformDriverSignUp({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
} = {}) {
  return (
    <AuthFrame
      title="Platform driver sign-up"
      description="Apply to join the platform driver pool. Drivers verify both email and phone."
    >
      <StatePreview
        main={<DriverSignUpForm onSubmitted={onSubmitted} />}
        loading={<StateLoading />}
        error={
          <TeInlineAlert tone="error" title="Application blocked">
            Insurance must be valid for at least 3 more months, and the lab result must be less than
            30 days old.
          </TeInlineAlert>
        }
      />
    </AuthFrame>
  );
}
