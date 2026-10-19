// SCR-PUB-06 Organization sign-up: the organization on the left, owner and billing on the right.
// No plan choice: the Starter plan is assigned when the registration is approved. Every value the
// onboarding service requires is asked for here; nothing is filled in on the applicant's behalf.
import { useState, type FormEvent } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice, SelectField, TextField } from "@/components/kit/controls";
import { PageIntro, PageMain, Panel, PanelTitle, TwoColumns } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

import { uploadApplicationDocuments } from "../common/application-documents";
import { CountrySelect } from "../common/country-select";
import { DocumentDrop } from "../common/document-drop";
import { SupplierPasswordField, dateInputToIso, isFutureDate } from "./supplier-fields";
import { useSupplierOnboarding } from "./supplier-onboarding";

/** Countries an organization can register in (the onboarding service accepts these). */
const ORGANIZATION_COUNTRIES = ["EG", "SA", "AE"] as const;
type OrganizationCountry = (typeof ORGANIZATION_COUNTRIES)[number];

function organizationCountry(code: string): OrganizationCountry | null {
  return (ORGANIZATION_COUNTRIES as readonly string[]).includes(code)
    ? (code as OrganizationCountry)
    : null;
}

type PayoutMethod = "bank_transfer" | "mobile_wallet";

/** Organization registration, reviewed by admin. Staff access opens after approval. */
export function OrganizationSignUp() {
  const { t, locale } = useAuth();
  const onboarding = useSupplierOnboarding(
    "organization_owner",
    "screen.public.signUp.organization.submitFailed",
  );
  const [country, setCountry] = useState("");
  const [registration, setRegistration] = useState<readonly File[]>([]);
  const [licenceExpiry, setLicenceExpiry] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>("bank_transfer");
  const { submitting } = onboarding;

  const countryCode = organizationCountry(country);
  const countryUnsupported = country.length > 0 && countryCode === null;
  const licenceExpired = licenceExpiry.length > 0 && !isFutureDate(licenceExpiry);
  const ready = registration.length > 0 && countryCode !== null && isFutureDate(licenceExpiry);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const expiryIso = dateInputToIso(licenceExpiry);
    if (!ready || !countryCode || !expiryIso) return;
    const formData = new FormData(event.currentTarget);
    const read = (name: string) => String(formData.get(name) ?? "").trim();
    const ownerName = read("ownerName");
    const ownerPhone = read("ownerPhone");
    const legalName = read("legalName");
    const files = registration;

    void onboarding.start(
      {
        fullName: ownerName,
        email: read("ownerEmail"),
        phone: ownerPhone,
        password: String(formData.get("password") ?? ""),
      },
      async () =>
        orpc.onboarding.submitOrganizationApplication.call({
          legalEntityName: legalName,
          displayNameAr: legalName,
          displayNameEn: legalName,
          commercialRegNumber: read("commercialRegistration"),
          taxNumber: read("taxNumber"),
          tourismLicenseNumber: read("tourismLicenseNumber"),
          tourismLicenseExpiry: expiryIso,
          countryCode,
          headquartersAddress: read("headquartersAddress"),
          signatoryFullName: ownerName,
          signatoryNationalId: read("ownerNationalId"),
          signatoryRoleTitle: read("ownerRoleTitle"),
          payoutMethod,
          payoutIbanOrWallet: read("payoutAccount"),
          billingContactName: ownerName,
          billingContactEmail: read("billingEmail"),
          billingContactPhone: ownerPhone,
          billingAddress: read("billingAddress"),
          invoiceLanguage: locale,
          childSafetyProgramOptIn: false,
          documents: await uploadApplicationDocuments(files, "commercial_registry"),
        }),
    );
  }

  return (
    <>
      {onboarding.panel}
      <PageMain className={onboarding.verifying ? "hidden" : undefined}>
        <PageIntro
          title={t("screen.public.signUp.organization.title")}
          description={t("screen.public.signUp.organization.lead")}
        />
        <form onSubmit={handleSubmit}>
          <TwoColumns>
            <Panel>
              <PanelTitle>{t("screen.public.signUp.organization.organization")}</PanelTitle>
              <TextField
                name="legalName"
                label={t("screen.public.signUp.organization.legalName")}
                autoComplete="organization"
                required
                minLength={2}
                maxLength={120}
                disabled={submitting}
              />
              <CountrySelect
                value={country}
                onChange={setCountry}
                disabled={submitting}
                errors={
                  countryUnsupported
                    ? [t("screen.public.signUp.organization.countryUnsupported")]
                    : []
                }
              />
              <TextField
                name="commercialRegistration"
                dir="ltr"
                label={t("screen.public.signUp.organization.registrationNumber")}
                required
                minLength={2}
                maxLength={80}
                disabled={submitting}
              />
              <TextField
                name="taxNumber"
                dir="ltr"
                label={t("screen.public.signUp.organization.taxNumber")}
                required
                minLength={2}
                maxLength={80}
                disabled={submitting}
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <TextField
                  name="tourismLicenseNumber"
                  dir="ltr"
                  label={t("screen.public.signUp.organization.tourismLicense")}
                  required
                  minLength={2}
                  maxLength={80}
                  disabled={submitting}
                />
                <TextField
                  name="tourismLicenseExpiry"
                  type="date"
                  label={t("screen.public.signUp.organization.tourismLicenseExpiry")}
                  value={licenceExpiry}
                  onChange={(event) => setLicenceExpiry(event.target.value)}
                  errors={
                    licenceExpired ? [t("screen.public.signUp.organization.licenseExpired")] : []
                  }
                  required
                  disabled={submitting}
                />
              </div>
              <TextField
                name="headquartersAddress"
                label={t("screen.public.signUp.organization.headquartersAddress")}
                autoComplete="street-address"
                required
                minLength={5}
                maxLength={300}
                disabled={submitting}
              />
              <DocumentDrop
                title={t("screen.public.signUp.organization.certificate")}
                hint={t("screen.public.signUp.organization.certificateHint")}
                files={registration}
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
                minLength={2}
                maxLength={120}
                disabled={submitting}
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <TextField
                  name="ownerNationalId"
                  dir="ltr"
                  label={t("screen.public.signUp.organization.ownerNationalId")}
                  required
                  minLength={6}
                  maxLength={30}
                  disabled={submitting}
                />
                <TextField
                  name="ownerRoleTitle"
                  label={t("screen.public.signUp.organization.ownerRoleTitle")}
                  autoComplete="organization-title"
                  required
                  minLength={2}
                  maxLength={80}
                  disabled={submitting}
                />
              </div>
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
                minLength={8}
                maxLength={20}
                disabled={submitting}
              />
              <SupplierPasswordField disabled={submitting} />
              <TextField
                name="billingEmail"
                type="email"
                dir="ltr"
                label={t("screen.public.signUp.organization.billingEmail")}
                placeholder={t("screen.public.signUp.organization.billingEmailPlaceholder")}
                required
                disabled={submitting}
              />
              <TextField
                name="billingAddress"
                label={t("screen.public.signUp.organization.billingAddress")}
                required
                minLength={5}
                maxLength={300}
                disabled={submitting}
              />
              <div className="grid gap-3.5 sm:grid-cols-2">
                <SelectField
                  name="payoutMethod"
                  label={t("screen.public.signUp.organization.payoutMethod")}
                  value={payoutMethod}
                  onChange={(event) =>
                    setPayoutMethod(
                      event.target.value === "mobile_wallet" ? "mobile_wallet" : "bank_transfer",
                    )
                  }
                  disabled={submitting}
                >
                  <option value="bank_transfer">
                    {t("screen.public.signUp.organization.payoutBank")}
                  </option>
                  <option value="mobile_wallet">
                    {t("screen.public.signUp.organization.payoutWallet")}
                  </option>
                </SelectField>
                <TextField
                  name="payoutAccount"
                  dir="ltr"
                  label={
                    payoutMethod === "bank_transfer"
                      ? t("screen.public.signUp.organization.payoutIban")
                      : t("screen.public.signUp.organization.payoutWalletNumber")
                  }
                  required
                  minLength={6}
                  maxLength={64}
                  disabled={submitting}
                />
              </div>
              <Notice tone="info">{t("screen.public.signUp.organization.planNote")}</Notice>
              {onboarding.errorMessage ? (
                <Notice tone="danger">{onboarding.errorMessage}</Notice>
              ) : null}
              <Button type="submit" disabled={!ready || submitting}>
                {submitting
                  ? t("screen.public.signUp.organization.submitting")
                  : t("screen.public.signUp.organization.submit")}
              </Button>
            </Panel>
          </TwoColumns>
        </form>
      </PageMain>
    </>
  );
}
