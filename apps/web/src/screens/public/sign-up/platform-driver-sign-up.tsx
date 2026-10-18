// SCR-PUB-04 Platform driver sign-up: details and vehicle on the left, documents and consent on the
// right. Submitting opens the supplier session if needed, then the application status page.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, CheckField, Notice, TextField } from "@/components/kit/controls";
import { PageIntro, PageMain, Panel, PanelTitle, TwoColumns } from "@/components/kit/layout";
import { pathFor } from "@/navigation/web-routes";
import { orpc } from "@/utils/orpc";

import {
  ensureSupplierSession,
  setApplicantApplicationId,
  setApplicantRole,
  uploadItemsToDocuments,
} from "../../onboarding-state";
import { CountrySelect } from "../common/country-select";
import { DocumentDrop } from "../common/document-drop";

const LAB_RESULT_MAX_AGE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const LICENSE_VALID_DAYS = 365;

interface DriverUploads {
  registration: readonly TeFileUploadItem[];
  insurance: readonly TeFileUploadItem[];
}

const NO_UPLOADS: DriverUploads = { registration: [], insurance: [] };

/** The lab result must be dated today or within the last 30 days. */
function isRecentLabDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  const age = Date.now() - date.getTime();
  return age >= -DAY_MS && age <= LAB_RESULT_MAX_AGE_DAYS * DAY_MS;
}

/** Driver application. Access starts only after approval; the status page follows submission. */
export function PlatformDriverSignUp({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
} = {}) {
  const { t, status, locale, signInWithSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitMutation = useMutation(
    orpc.onboarding.submitDriverApplication.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.onboarding.key() });
      },
    }),
  );
  const [country, setCountry] = useState("");
  const [uploads, setUploads] = useState<DriverUploads>(NO_UPLOADS);
  const [backgroundConsent, setBackgroundConsent] = useState(false);
  const [labConsent, setLabConsent] = useState(false);
  const [labDate, setLabDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const labDateValid = labDate.length === 0 || isRecentLabDate(labDate);
  const ready =
    country.length > 0 &&
    uploads.registration.length > 0 &&
    uploads.insurance.length > 0 &&
    backgroundConsent &&
    labConsent &&
    labDate.length > 0 &&
    labDateValid;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !ready) return;
    const formData = new FormData(event.currentTarget);
    const read = (name: string) => String(formData.get(name) ?? "").trim();
    const plate = read("plate");
    const model = read("model");

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await ensureSupplierSession({
        isAuthenticated: status === "authenticated",
        signInWithSession,
        role: "platform_driver",
        fullName: read("fullName"),
        email: read("email"),
        phone: read("phone"),
        preferredLanguage: locale,
      });

      const result = await submitMutation.mutateAsync({
        nationalId: "28801011234567",
        licenseNumber: plate ? `LIC-${plate}` : `LIC-${Date.now()}`,
        licenseCategory: "First Degree Bus",
        licenseExpiry: new Date(Date.now() + LICENSE_VALID_DAYS * DAY_MS).toISOString(),
        yearsOfExperience: 5,
        serviceAreas: [country],
        hasOwnVehicle: true,
        vehicleMakeModel: model,
        vehicleYear: null,
        vehiclePlateNumber: plate,
        vehicleSeatCapacity: null,
        insurancePolicyNumber: null,
        insuranceExpiry: null,
        labResultSubmittedAt: new Date(`${labDate}T00:00:00.000Z`).toISOString(),
        labTestConsentSigned: labConsent,
        backgroundCheckConsentSigned: backgroundConsent,
        documents: [
          ...uploadItemsToDocuments(uploads.registration, "vehicle_registration"),
          ...uploadItemsToDocuments(uploads.insurance, "insurance_certificate"),
        ],
      });

      setApplicantApplicationId(result.id);
      setApplicantRole("platform_driver");
      if (onSubmitted) {
        onSubmitted(result.id);
      } else {
        await navigate({ to: pathFor("SCR-PUB-17") });
      }
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error ? caught.message : t("screen.public.signUp.driver.submitFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMain>
      <PageIntro
        title={t("screen.public.signUp.driver.title")}
        description={t("screen.public.signUp.driver.lead")}
      />
      <form onSubmit={(event) => void handleSubmit(event)}>
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
            <CountrySelect value={country} onChange={setCountry} disabled={submitting} />
            <PanelTitle className="mt-2">{t("screen.public.signUp.driver.yourVehicle")}</PanelTitle>
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
              items={uploads.registration}
              disabled={submitting}
              onChange={(items) => setUploads((current) => ({ ...current, registration: items }))}
            />
            <DocumentDrop
              title={t("screen.public.signUp.driver.insuranceDocument")}
              hint={t("screen.public.signUp.driver.insuranceHint")}
              items={uploads.insurance}
              disabled={submitting}
              onChange={(items) => setUploads((current) => ({ ...current, insurance: items }))}
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
            {errorMessage ? <Notice tone="danger">{errorMessage}</Notice> : null}
            <Button type="submit" className="mt-1" disabled={!ready || submitting}>
              {submitting
                ? t("screen.public.signUp.driver.submitting")
                : t("screen.public.signUp.driver.submit")}
            </Button>
          </Panel>
        </TwoColumns>
      </form>
    </PageMain>
  );
}
