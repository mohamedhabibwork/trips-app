// SCR-ORG-03 Organization profile: legal and invoice details, and branding on Enterprise.
import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgInput, OrgSelect, OrgTextarea } from "../common/org-form";
import {
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgError,
  NO_VALUE,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
} from "../common/org-ui";

import {
  brandingErrors,
  countryName,
  timeZoneOptions,
  type ProfileSettings,
} from "./organization-profile-parts";

const FORM_ID = "organization-profile-form";
const BRAND_CAPTION_ID = "organization-profile-brand-caption";

/** The settings this form sends; the trade name goes to the reader's language. */
interface SettingsUpdate {
  displayNameEn?: string;
  displayNameAr?: string;
  timeZone: string;
  taxNumber: string | null;
  billingAddress: string | null;
  logoUrl?: string | null;
  primaryColorHex?: string | null;
}

interface ProfileFormProps {
  data: ProfileSettings | null;
  locale: string;
  canSave: boolean;
  onSave: (update: SettingsUpdate) => void;
}

function ProfileForm({ data, locale, canSave, onSave }: ProfileFormProps) {
  const organization = data?.organization;
  const settings = data?.settings;
  const nameKey = locale === "ar" ? "displayNameAr" : "displayNameEn";
  const [tradeName, setTradeName] = useState(organization?.[nameKey] ?? "");
  const [timeZone, setTimeZone] = useState(settings?.timeZone ?? "Africa/Cairo");
  const [taxNumber, setTaxNumber] = useState(settings?.taxNumber ?? "");
  const [invoiceAddress, setInvoiceAddress] = useState(
    settings?.billingAddress ?? organization?.headquartersAddress ?? "",
  );
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl ?? "");
  const [brandColor, setBrandColor] = useState(settings?.primaryColorHex ?? "");
  const [submitted, setSubmitted] = useState(false);

  const brandingOn = Boolean(data?.planEntitlements.features?.customBranding);
  const nameError =
    submitted && tradeName.trim().length < 2
      ? t("screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameTooShort")
      : undefined;
  const branding = brandingErrors(logoUrl, brandColor, submitted && brandingOn);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    if (!canSave || tradeName.trim().length < 2 || branding.logo || branding.color) return;
    onSave({
      ...(nameKey === "displayNameAr"
        ? { displayNameAr: tradeName.trim() }
        : { displayNameEn: tradeName.trim() }),
      timeZone,
      taxNumber: taxNumber.trim() || null,
      billingAddress: invoiceAddress.trim() || null,
      ...(brandingOn
        ? { logoUrl: logoUrl.trim() || null, primaryColorHex: brandColor.trim() || null }
        : {}),
    });
  }

  const lockedValue = t(
    "screen.organization.workspace.organizationProfileSettingsAndBranding.lockedOnYourPlan",
  );

  return (
    <form id={FORM_ID} noValidate onSubmit={handleSubmit} className="contents">
      <OrgCard
        title={t(
          "screen.organization.workspace.organizationProfileSettingsAndBranding.legalAndInvoiceDetails",
        )}
      >
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <OrgInput
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.legalName",
            )}
            value={organization?.legalEntityName ?? ""}
            readOnly
            dir="auto"
            hint={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.setAtVerification",
            )}
          />
          <OrgInput
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeName",
            )}
            value={tradeName}
            onChange={(event) => setTradeName(event.target.value)}
            maxLength={120}
            dir="auto"
            error={nameError}
          />
          <OrgSelect
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.country",
            )}
            options={[
              {
                value: organization?.countryCode ?? "",
                label: countryName(organization?.countryCode, locale),
              },
            ]}
            value={organization?.countryCode ?? ""}
            onValueChange={() => undefined}
            disabled
            hint={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.setAtVerification",
            )}
          />
          <OrgSelect
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZone",
            )}
            options={timeZoneOptions(timeZone)}
            value={timeZone}
            onValueChange={setTimeZone}
          />
          <OrgInput
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumber",
            )}
            value=""
            readOnly
            placeholder={NO_VALUE}
            hint={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.setAtVerification",
            )}
          />
          <OrgInput
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.taxReference",
            )}
            value={taxNumber}
            onChange={(event) => setTaxNumber(event.target.value)}
            maxLength={80}
          />
          <OrgTextarea
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddress",
            )}
            fieldClassName="md:col-span-2"
            rows={2}
            value={invoiceAddress}
            onChange={(event) => setInvoiceAddress(event.target.value)}
            maxLength={300}
            dir="auto"
          />
        </div>
      </OrgCard>
      <OrgCard
        title={t("screen.organization.workspace.organizationProfileSettingsAndBranding.branding")}
        actions={
          brandingOn ? null : (
            <OrgBadge tone="neu" icon="lock">
              {t(
                "screen.organization.workspace.organizationProfileSettingsAndBranding.enterpriseOnly",
              )}
            </OrgBadge>
          )
        }
      >
        <p id={BRAND_CAPTION_ID} className="te-caption m-0 text-[var(--te-ink-muted)]">
          {t(
            "screen.organization.workspace.organizationProfileSettingsAndBranding.brandingCaption",
          )}
        </p>
        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          <OrgInput
            label={t("screen.organization.workspace.organizationProfileSettingsAndBranding.logo")}
            type={brandingOn ? "url" : "text"}
            value={brandingOn ? logoUrl : lockedValue}
            onChange={(event) => setLogoUrl(event.target.value)}
            disabled={!brandingOn}
            aria-describedby={brandingOn ? undefined : BRAND_CAPTION_ID}
            placeholder="https://"
            error={branding.logo}
          />
          <OrgInput
            label={t(
              "screen.organization.workspace.organizationProfileSettingsAndBranding.brandColor",
            )}
            value={brandingOn ? brandColor : lockedValue}
            onChange={(event) => setBrandColor(event.target.value)}
            disabled={!brandingOn}
            aria-describedby={brandingOn ? undefined : BRAND_CAPTION_ID}
            placeholder="#RRGGBB"
            error={branding.color}
          />
        </div>
      </OrgCard>
    </form>
  );
}

export function OrganizationProfileSettingsAndBranding() {
  const { status: authStatus, actor, locale } = useAuth();
  const queryClient = useQueryClient();
  const canSave = authStatus === "authenticated" && Boolean(actor?.activeTenantId);

  const settingsQuery = useQuery({
    ...serverQueryOptions(
      orpc.organization.getOrganizationSettings,
      "organization/getOrganizationSettings",
      { input: {} },
    ),
    enabled: canSave,
  });

  const updateMutation = useMutation(
    serverMutationOptions(
      orpc.organization.updateOrganizationSettings,
      "organization/updateOrganizationSettings",
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
        },
      },
    ),
  );

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.workspace.organizationProfileSettingsAndBranding.title")}
        caption={t("screen.organization.workspace.organizationProfileSettingsAndBranding.caption")}
        actions={
          <OrgButton
            type="submit"
            form={FORM_ID}
            disabled={!canSave || !settingsQuery.isSuccess || updateMutation.isPending}
          >
            {t("screen.organization.workspace.organizationProfileSettingsAndBranding.saveChanges")}
          </OrgButton>
        }
      />
      {updateMutation.isError ? (
        <OrgAlert
          tone="err"
          title={t(
            "screen.organization.workspace.organizationProfileSettingsAndBranding.notSavedTitle",
          )}
        >
          {t("screen.organization.workspace.organizationProfileSettingsAndBranding.notSavedBody")}
        </OrgAlert>
      ) : null}
      {updateMutation.isSuccess ? (
        <OrgAlert
          tone="ok"
          title={t("screen.organization.workspace.organizationProfileSettingsAndBranding.saved")}
        />
      ) : null}
      {settingsQuery.isLoading ? <OrgLoading rows={6} /> : null}
      {settingsQuery.isError ? <OrgError onRetry={() => void settingsQuery.refetch()} /> : null}
      {settingsQuery.isLoading || settingsQuery.isError ? null : (
        <ProfileForm
          key={settingsQuery.dataUpdatedAt}
          data={settingsQuery.data ?? null}
          locale={locale}
          canSave={canSave}
          onSave={(update) => updateMutation.mutate(update)}
        />
      )}
    </OrgPage>
  );
}
