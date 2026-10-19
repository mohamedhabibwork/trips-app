// SCR-PUB-04 Platform driver sign-up: details and vehicle on the left, documents and consent on the
// right. Submitting opens the supplier session if needed, then the application status page.
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, CheckField, Notice, TextField } from "@/components/kit/controls";
import { PageIntro, PageMain, Panel, PanelTitle, TwoColumns } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

import { uploadApplicationDocuments } from "../common/application-documents";
import { CountrySelect } from "../common/country-select";
import { DocumentDrop } from "../common/document-drop";
import { SupplierPasswordField, dateInputToIso, isFutureDate } from "./supplier-fields";
import { useSupplierOnboarding } from "./supplier-onboarding";

const LAB_RESULT_MAX_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_YEARS_DRIVING = 1;
const MAX_YEARS_DRIVING = 60;

interface DriverUploads {
  registration: readonly File[];
  insurance: readonly File[];
}

const NO_UPLOADS: DriverUploads = { registration: [], insurance: [] };

/** The lab result must be dated today or within the last 30 days. */
export function isRecentLabDate(value: string, now: number = Date.now()): boolean {
  const iso = dateInputToIso(value);
  if (!iso) return false;
  const age = now - new Date(iso).getTime();
  return age >= -DAY_MS && age <= LAB_RESULT_MAX_AGE_DAYS * DAY_MS;
}

/** Driver application. Access starts only after approval; the status page follows submission. */
export function PlatformDriverSignUp() {
  const { t } = useAuth();
  const onboarding = useSupplierOnboarding(
    "platform_driver",
    "screen.public.signUp.driver.submitFailed",
  );
  const [country, setCountry] = useState("");
  const [uploads, setUploads] = useState<DriverUploads>(NO_UPLOADS);
  const [backgroundConsent, setBackgroundConsent] = useState(false);
  const [labConsent, setLabConsent] = useState(false);
  const [labDate, setLabDate] = useState("");
  const [licenseExpiry, setLicenseExpiry] = useState("");
  const { submitting } = onboarding;

  const labDateValid = labDate.length === 0 || isRecentLabDate(labDate);
  const licenseExpired = licenseExpiry.length > 0 && !isFutureDate(licenseExpiry);
  const ready =
    country.length > 0 &&
    uploads.registration.length > 0 &&
    uploads.insurance.length > 0 &&
    backgroundConsent &&
    labConsent &&
    labDate.length > 0 &&
    labDateValid &&
    isFutureDate(licenseExpiry);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const labIso = dateInputToIso(labDate);
    const licenseIso = dateInputToIso(licenseExpiry);
    if (!ready || !labIso || !licenseIso) return;
    const formData = new FormData(event.currentTarget);
    const read = (name: string) => String(formData.get(name) ?? "").trim();
    const files = uploads;

    void onboarding.start(
      {
        fullName: read("fullName"),
        email: read("email"),
        phone: read("phone"),
        password: String(formData.get("password") ?? ""),
      },
      async () => {
        const documents = [
          ...(await uploadApplicationDocuments(files.registration, "vehicle_registration")),
          ...(await uploadApplicationDocuments(files.insurance, "insurance_certificate")),
        ];
        return orpc.onboarding.submitDriverApplication.call({
          nationalId: read("nationalId"),
          licenseNumber: read("licenseNumber"),
          licenseCategory: read("licenseCategory"),
          licenseExpiry: licenseIso,
          yearsOfExperience: Number(read("yearsOfExperience")),
          serviceAreas: [country],
          hasOwnVehicle: true,
          vehicleMakeModel: read("model"),
          vehiclePlateNumber: read("plate"),
          labResultSubmittedAt: labIso,
          labTestConsentSigned: labConsent,
          backgroundCheckConsentSigned: backgroundConsent,
          documents,
        });
      },
    );
  }

  return (
    <>
      {onboarding.panel}
      <PageMain className={onboarding.verifying ? "hidden" : undefined}>
        <PageIntro
          title={t("screen.public.signUp.driver.title")}
          description={t("screen.public.signUp.driver.lead")}
        />
        <form onSubmit={handleSubmit}>
          <TwoColumns>
            <Panel>
              <PanelTitle>{t("screen.public.signUp.driver.yourDetails")}</PanelTitle>
              <TextField
                name="fullName"
                label={t("screen.public.signUp.driver.fullName")}
                placeholder={t("screen.public.signUp.driver.fullNamePlaceholder")}
                autoComplete="name"
                required
                disabled={submitting}
              />
              <TextField
                name="email"
                type="email"
                dir="ltr"
                label={t("screen.public.signUp.driver.email")}
                placeholder={t("screen.auth.signUp.emailPlaceholder")}
                autoComplete="email"
                required
                disabled={submitting}
              />
              <TextField
                name="phone"
                type="tel"
                dir="ltr"
                label={t("screen.public.signUp.driver.phone")}
                placeholder={t("screen.auth.signUp.phonePlaceholder")}
                autoComplete="tel"
                required
                disabled={submitting}
              />
              <SupplierPasswordField disabled={submitting} />
              <CountrySelect value={country} onChange={setCountry} disabled={submitting} />
              <TextField
                name="nationalId"
                dir="ltr"
                label={t("screen.public.signUp.driver.nationalId")}
                required
                minLength={6}
                maxLength={30}
                disabled={submitting}
              />
              <PanelTitle className="mt-2">
                {t("screen.public.signUp.driver.yourLicense")}
              </PanelTitle>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <TextField
                  name="licenseNumber"
                  dir="ltr"
                  label={t("screen.public.signUp.driver.licenseNumber")}
                  required
                  minLength={3}
                  maxLength={40}
                  disabled={submitting}
                />
                <TextField
                  name="licenseCategory"
                  label={t("screen.public.signUp.driver.licenseCategory")}
                  required
                  minLength={2}
                  maxLength={60}
                  disabled={submitting}
                />
                <TextField
                  name="licenseExpiry"
                  type="date"
                  label={t("screen.public.signUp.driver.licenseExpiry")}
                  value={licenseExpiry}
                  onChange={(event) => setLicenseExpiry(event.target.value)}
                  errors={licenseExpired ? [t("screen.public.signUp.driver.licenseExpired")] : []}
                  required
                  disabled={submitting}
                />
                <TextField
                  name="yearsOfExperience"
                  type="number"
                  inputMode="numeric"
                  label={t("screen.public.signUp.driver.yearsOfExperience")}
                  min={MIN_YEARS_DRIVING}
                  max={MAX_YEARS_DRIVING}
                  step={1}
                  required
                  disabled={submitting}
                />
              </div>
              <PanelTitle className="mt-2">
                {t("screen.public.signUp.driver.yourVehicle")}
              </PanelTitle>
              <div className="grid grid-cols-2 gap-3.5">
                <TextField
                  name="plate"
                  label={t("screen.public.signUp.driver.plate")}
                  required
                  disabled={submitting}
                />
                <TextField
                  name="model"
                  label={t("screen.public.signUp.driver.model")}
                  required
                  disabled={submitting}
                />
              </div>
            </Panel>

            <Panel>
              <PanelTitle>{t("screen.public.signUp.driver.documentsAndConsent")}</PanelTitle>
              <DocumentDrop
                title={t("screen.public.signUp.driver.registrationDocument")}
                hint={t("screen.public.signUp.driver.registrationHint")}
                files={uploads.registration}
                disabled={submitting}
                onChange={(files) => setUploads((current) => ({ ...current, registration: files }))}
              />
              <DocumentDrop
                title={t("screen.public.signUp.driver.insuranceDocument")}
                hint={t("screen.public.signUp.driver.insuranceHint")}
                files={uploads.insurance}
                disabled={submitting}
                onChange={(files) => setUploads((current) => ({ ...current, insurance: files }))}
              />
              <CheckField
                label={t("screen.public.signUp.driver.backgroundConsent")}
                checked={backgroundConsent}
                disabled={submitting}
                onChange={(event) => setBackgroundConsent(event.target.checked)}
              />
              <CheckField
                label={t("screen.public.signUp.driver.labConsent")}
                checked={labConsent}
                disabled={submitting}
                onChange={(event) => setLabConsent(event.target.checked)}
              />
              <TextField
                name="labTestDate"
                type="date"
                label={t("screen.public.signUp.driver.labDate")}
                value={labDate}
                onChange={(event) => setLabDate(event.target.value)}
                hint={t("screen.public.signUp.driver.labDateHint")}
                errors={labDateValid ? [] : [t("screen.public.signUp.driver.labDateTooOld")]}
                required
                disabled={submitting}
              />
              {onboarding.errorMessage ? (
                <Notice tone="danger">{onboarding.errorMessage}</Notice>
              ) : null}
              <Button type="submit" className="mt-1" disabled={!ready || submitting}>
                {submitting
                  ? t("screen.public.signUp.driver.submitting")
                  : t("screen.public.signUp.driver.submit")}
              </Button>
            </Panel>
          </TwoColumns>
        </form>
      </PageMain>
    </>
  );
}
