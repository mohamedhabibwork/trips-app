import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TePlanGate } from "@trips-app/ui/components/te-plan-gate";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink } from "../common/org-link";
import { OrgSection } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function OrganizationProfileSettingsAndBranding() {
  const { status: authStatus, actor } = useAuth();
  const queryClient = useQueryClient();
  const [legalNameAr, setLegalNameAr] = useState("");
  const [legalNameEn, setLegalNameEn] = useState("");
  const [tradeNameAr, setTradeNameAr] = useState("");
  const [tradeNameEn, setTradeNameEn] = useState("");
  const [country, setCountry] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [invoiceAddress, setInvoiceAddress] = useState("");
  const [planTier, setPlanTier] = useState("starter");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState(false);

  const settingsQuery = useQuery({
    ...orpc.organization.getOrganizationSettings.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated" && Boolean(actor?.activeTenantId),
  });

  useEffect(() => {
    if (settingsQuery.data) {
      const res = settingsQuery.data;
      setLegalNameEn(res.organization.legalEntityName ?? "");
      setLegalNameAr(res.organization.displayNameAr ?? "");
      setTradeNameAr(res.organization.displayNameAr ?? "");
      setTradeNameEn(res.organization.displayNameEn ?? "");
      setCountry(res.organization.countryCode ?? "");
      setTimeZone(res.settings.timeZone ?? "");
      setTaxNumber(res.settings.taxNumber ?? "");
      setInvoiceAddress(res.settings.billingAddress ?? res.organization.headquartersAddress ?? "");
      setPlanTier(res.organization.planTier ?? "starter");
    }
  }, [settingsQuery.data]);

  const updateMutation = useMutation(
    orpc.organization.updateOrganizationSettings.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
      },
    }),
  );

  async function handleSave() {
    if (authStatus !== "authenticated" || !actor?.activeTenantId) return;
    setBusy(true);
    setErrorMsg(null);
    setSavedMsg(false);
    try {
      await updateMutation.mutateAsync({
        displayNameEn: tradeNameEn.trim() || legalNameEn.trim() || undefined,
        displayNameAr: tradeNameAr.trim() || legalNameAr.trim() || undefined,
        timeZone: timeZone.trim() || undefined,
        taxNumber: taxNumber.trim() || null,
        billingAddress: invoiceAddress.trim() || null,
      });
      setSavedMsg(true);
    } catch (caught) {
      setErrorMsg(caught instanceof Error ? caught.message : "Could not save settings.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink />
        <TePageHeader
          title={t(
            "screen.organization.workspace.organizationProfileSettingsAndBranding.organizationProfileSettingsAndBranding",
          )}
          actions={
            <TeButton disabled={busy} onClick={() => void handleSave()}>
              {t("screen.organization.workspace.organizationProfileSettingsAndBranding.save")}
            </TeButton>
          }
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        {savedMsg ? (
          <TeInlineAlert tone="success">
            {t("screen.organization.workspace.organizationProfileSettingsAndBranding.save")}
          </TeInlineAlert>
        ) : null}
        <OrgSection
          title={t(
            "screen.organization.workspace.organizationProfileSettingsAndBranding.legalDetails",
          )}
        >
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNameArabic",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalName",
                )}
                dir="auto"
                value={legalNameAr}
                onChange={(e) => setLegalNameAr(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNameEnglish",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.legalNamePlaceholder",
                )}
                dir="auto"
                value={legalNameEn}
                onChange={(e) => setLegalNameEn(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameArabic",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeName",
                )}
                dir="auto"
                value={tradeNameAr}
                onChange={(e) => setTradeNameAr(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNameEnglish",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.tradeNamePlaceholder",
                )}
                dir="auto"
                value={tradeNameEn}
                onChange={(e) => setTradeNameEn(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.country",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.countryPlaceholder",
                )}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZone",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.timeZonePlaceholder",
                )}
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumber",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.registrationNumberPlaceholder",
                )}
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
              />
              <TeInput
                label={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxNumber",
                )}
                placeholder={t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.taxNumberPlaceholder",
                )}
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection
          title={t(
            "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceDetails",
          )}
        >
          <TeCard>
            <TeInput
              label={t(
                "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddress",
              )}
              placeholder={t(
                "screen.organization.workspace.organizationProfileSettingsAndBranding.invoiceAddressPlaceholder",
              )}
              dir="auto"
              value={invoiceAddress}
              onChange={(e) => setInvoiceAddress(e.target.value)}
            />
          </TeCard>
        </OrgSection>
        <OrgSection
          title={t(
            "screen.organization.workspace.organizationProfileSettingsAndBranding.integrations",
          )}
        >
          <TeCard>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="te-body">
                {t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.crmConnectionAndOutboundWebhooks",
                )}
              </p>
              <OrgButtonLink slug="crm-and-webhooks" variant="secondary">
                {t(
                  "screen.organization.workspace.organizationProfileSettingsAndBranding.openCrmAndWebhooks",
                )}
              </OrgButtonLink>
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection
          title={t("screen.organization.workspace.organizationProfileSettingsAndBranding.branding")}
        >
          {planTier === "enterprise" ? (
            <TeCard>
              <p className="te-body">Enterprise custom branding is enabled for this workspace.</p>
            </TeCard>
          ) : (
            <TePlanGate
              plan="Enterprise"
              lockedLabel={t(
                "screen.organization.workspace.organizationProfileSettingsAndBranding.logoAndColorsAreAvailable",
              )}
            />
          )}
        </OrgSection>
      </div>
    </StatePreview>
  );
}
