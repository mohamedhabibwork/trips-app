// SCR-PUB-06 Organization sign-up: the organization on the left, owner and billing on the right.
// No plan choice: the Starter plan is assigned when the registration is approved.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { TeFileUploadItem } from "@trips-app/ui/components/te-file-upload";
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, TextField } from "@/components/kit/controls";
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

const LICENSE_VALID_MS = 365 * 24 * 60 * 60 * 1000;

function normalizeOrgCountry(raw: string): "EG" | "SA" | "AE" {
  const upper = raw.toUpperCase();
  if (upper === "SA" || upper === "AE") return upper;
  return "EG";
}

/** Organization registration, reviewed by admin. Staff access opens after approval. */
export function OrganizationSignUp({
  onSubmitted,
}: {
  onSubmitted?: (applicationId: string) => void;
} = {}) {
  const { t, status, locale, signInWithSession } = useAuth();
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ready = registration.length > 0 && country.length > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !ready) return;
    const formData = new FormData(event.currentTarget);
    const read = (name: string) => String(formData.get(name) ?? "").trim();
    const ownerName = read("ownerName");
    const ownerPhone = read("ownerPhone");
    const legalName = read("legalName");
    const commercialRegNumber = read("commercialRegistration");

    setSubmitting(true);
    setErrorMessage(null);
    try {
      await ensureSupplierSession({
        isAuthenticated: status === "authenticated",
        signInWithSession,
        role: "organization_owner",
        fullName: ownerName,
        email: read("ownerEmail"),
        phone: ownerPhone,
        preferredLanguage: locale,
      });

      const result = await submitMutation.mutateAsync({
        legalEntityName: legalName,
        displayNameAr: legalName,
        displayNameEn: legalName,
        commercialRegNumber,
        taxNumber: read("taxNumber"),
        tourismLicenseNumber: `TL-${commercialRegNumber}`,
        tourismLicenseExpiry: new Date(Date.now() + LICENSE_VALID_MS).toISOString(),
        countryCode: normalizeOrgCountry(country),
        headquartersAddress: `${legalName} Headquarters`,
        signatoryFullName: ownerName,
        signatoryNationalId: "29001011234567",
        signatoryRoleTitle: "Managing Director",
        payoutMethod: "bank_transfer",
        payoutIbanOrWallet: "EG380019000500000000263180002",
        billingContactName: ownerName,
        billingContactEmail: read("billingEmail"),
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
        await navigate({ to: pathFor("SCR-PUB-17") });
      }
    } catch (caught) {
      setErrorMessage(
        caught instanceof Error
          ? caught.message
          : t("screen.public.signUp.organization.submitFailed"),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageMain>
      <PageIntro
        title={t("screen.public.signUp.organization.title")}
        description={t("screen.public.signUp.organization.lead")}
      />
      <form onSubmit={(event) => void handleSubmit(event)}>
        <TwoColumns>
          <Panel>
            <PanelTitle>{t("screen.public.signUp.organization.organization")}</PanelTitle>
            <TextField
              name="legalName"
              label={t("screen.public.signUp.organization.legalName")}
              autoComplete="organization"
              required
              disabled={submitting}
            />
            <CountrySelect value={country} onChange={setCountry} disabled={submitting} />
            <TextField
              name="commercialRegistration"
              dir="ltr"
              label={t("screen.public.signUp.organization.registrationNumber")}
              required
              minLength={2}
              disabled={submitting}
            />
            <TextField
              name="taxNumber"
              dir="ltr"
              label={t("screen.public.signUp.organization.taxNumber")}
              required
              minLength={2}
              disabled={submitting}
            />
            <DocumentDrop
              title={t("screen.public.signUp.organization.certificate")}
              hint={t("screen.public.signUp.organization.certificateHint")}
              items={registration}
              onChange={setRegistration}
              disabled={submitting}
            />
          </Panel>

          <Panel>
            <PanelTitle>{t("screen.public.signUp.organization.ownerAndBilling")}</PanelTitle>
            <TextField
              name="ownerName"
              label={t("screen.public.signUp.organization.ownerName")}
              autoComplete="name"
              required
              disabled={submitting}
            />
            <TextField
              name="ownerEmail"
              type="email"
              dir="ltr"
              label={t("screen.public.signUp.organization.ownerEmail")}
              placeholder={t("screen.auth.signUp.emailPlaceholder")}
              autoComplete="email"
              required
              disabled={submitting}
            />
            <TextField
              name="ownerPhone"
              type="tel"
              dir="ltr"
              label={t("screen.public.signUp.organization.ownerPhone")}
              placeholder={t("screen.auth.signUp.phonePlaceholder")}
              autoComplete="tel"
              required
              disabled={submitting}
            />
            <TextField
              name="billingEmail"
              type="email"
              dir="ltr"
              label={t("screen.public.signUp.organization.billingEmail")}
              placeholder={t("screen.public.signUp.organization.billingEmailPlaceholder")}
              required
              disabled={submitting}
            />
            <Notice tone="info">{t("screen.public.signUp.organization.planNote")}</Notice>
            {errorMessage ? <Notice tone="danger">{errorMessage}</Notice> : null}
            <Button type="submit" disabled={!ready || submitting}>
              {submitting
                ? t("screen.public.signUp.organization.submitting")
                : t("screen.public.signUp.organization.submit")}
            </Button>
          </Panel>
        </TwoColumns>
      </form>
    </PageMain>
  );
}
