// SCR-ADM-16 Plan editor (docs/design/web/admin/SCR-ADM-16.dc.html): one plan's limits, feature
// flags, prices and trial, with what a saved change affects.
import { useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { AdminButton, AdminLink, useAdminNavigate, useAdminParam } from "../common/admin-actions";
import { AdminCheckbox, AdminInput, AdminSelect } from "../common/admin-form";
import { getSelectedAdminPlanId } from "../common/admin-selection";
import { AdminEmpty, AdminQueryState } from "../common/admin-states";
import { AdminAlert, AdminBadge, AdminCard, AdminPage, AdminSplit } from "../common/admin-ui";
import { planFeatureLabel, planLimitLabel, planName, planRoleLabel } from "./plan-labels";

const MIN_GRACE_DAYS = 1;
const MAX_GRACE_DAYS = 30;
const BPS_PER_PERCENT = 100;
const MINOR_PER_MAJOR = 100;

type Draft = Readonly<Record<string, string>>;
type FlagDraft = Readonly<Record<string, boolean>>;

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>;
}

function parseGraceDays(value: string): number | null {
  const days = Number(value);
  if (!Number.isInteger(days) || days < MIN_GRACE_DAYS || days > MAX_GRACE_DAYS) return null;
  return days;
}

/** Key/value pairs of a JSON object column; anything else (null, arrays) has none. */
function jsonEntries(value: unknown): [string, unknown][] {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return [];
  return Object.entries(value);
}

function PlanEffect() {
  return (
    <>
      <AdminCard title={t("screen.admin.plans.planEditor.effect")}>
        <p className="te-body">{t("screen.admin.plans.planEditor.effectBody")}</p>
      </AdminCard>
      <AdminAlert tone="info">
        {t("screen.admin.plans.planEditor.existingSubscriptions")}
      </AdminAlert>
    </>
  );
}

export function PlanEditor() {
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useAdminNavigate();
  const planId = useAdminParam("planId", getSelectedAdminPlanId);
  const [draft, setDraft] = useState<Draft>({});
  const [flags, setFlags] = useState<FlagDraft>({});

  const catalogQuery = useQuery({
    ...orpc.plans.getCatalog.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });
  const catalog = catalogQuery.data ?? [];
  const plan = catalog.find((entry) => entry.id === planId);

  const updateSettingsMutation = useMutation(
    orpc.admin.updateSystemSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.admin.key() });
      },
    }),
  );

  const setField = (key: string, value: string) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const setFlag = (key: string, value: boolean) =>
    setFlags((current) => ({ ...current, [key]: value }));

  const currencies = [...new Set(catalog.map((entry) => entry.currencyCode))];
  const limits = jsonEntries(plan?.limits).map(([key, saved]): [string, string] => [
    key,
    typeof saved === "number" ? String(saved) : "",
  ]);
  const features = jsonEntries(plan?.features).filter(
    (entry): entry is [string, boolean] => typeof entry[1] === "boolean",
  );

  const fieldValue = (key: string, saved: string) => draft[key] ?? saved;
  const graceValue = fieldValue("gracePeriodDays", String(plan?.gracePeriodDays ?? ""));
  const graceDays = parseGraceDays(graceValue);

  const save = () => {
    if (!plan || graceDays === null) return;
    updateSettingsMutation.mutate(
      {
        operational: { subscriptionGraceDays: graceDays },
        reason: `Updated plan ${plan.nameEn} (${plan.role})`,
      },
      { onSuccess: () => void goTo("SCR-ADM-15") },
    );
  };

  return (
    <AdminPage
      title={t("screen.admin.plans.planEditor.title")}
      description={
        plan
          ? t("screen.admin.plans.planEditor.description", {
              role: planRoleLabel(plan.role),
              tier: planName(plan, locale),
            })
          : undefined
      }
      actions={
        <>
          <AdminLink screen="SCR-ADM-15" variant="secondary">
            {t("screen.admin.plans.planEditor.cancel")}
          </AdminLink>
          <AdminButton
            variant="primary"
            disabled={!plan || graceDays === null || updateSettingsMutation.isPending}
            onClick={save}
          >
            {t("screen.admin.plans.planEditor.savePlan")}
          </AdminButton>
        </>
      }
    >
      {updateSettingsMutation.isError ? (
        <AdminAlert tone="danger" title={t("screen.admin.plans.planEditor.saveFailedTitle")}>
          {t("screen.admin.plans.planEditor.saveFailedBody")}
        </AdminAlert>
      ) : null}
      <AdminQueryState
        query={catalogQuery}
        loadingLabel={t("screen.admin.plans.planEditor.loading")}
      >
        {plan ? (
          <AdminSplit
            main={
              <>
                <AdminCard title={t("screen.admin.plans.planEditor.limits")}>
                  <FieldGrid>
                    {limits.map(([key, saved]) => (
                      <AdminInput
                        key={key}
                        label={planLimitLabel(key)}
                        inputMode="numeric"
                        placeholder={t("screen.admin.plans.planEditor.noLimit")}
                        value={fieldValue(`limit.${key}`, saved)}
                        onChange={(event) => setField(`limit.${key}`, event.target.value)}
                      />
                    ))}
                  </FieldGrid>
                </AdminCard>
                <AdminCard title={t("screen.admin.plans.planEditor.featureFlags")}>
                  {features.map(([key, saved]) => (
                    <AdminCheckbox
                      key={key}
                      label={planFeatureLabel(key)}
                      checked={flags[key] ?? saved}
                      onCheckedChange={(checked) => setFlag(key, checked)}
                    />
                  ))}
                </AdminCard>
                <AdminCard title={t("screen.admin.plans.planEditor.pricesAndTrial")}>
                  <FieldGrid>
                    <AdminInput
                      label={t("screen.admin.plans.planEditor.monthlyPrice")}
                      inputMode="decimal"
                      value={fieldValue(
                        "monthlyPrice",
                        (plan.monthlyPriceMinor / MINOR_PER_MAJOR).toFixed(2),
                      )}
                      onChange={(event) => setField("monthlyPrice", event.target.value)}
                    />
                    <AdminSelect
                      label={t("screen.admin.plans.planEditor.currency")}
                      options={currencies.map((code) => ({ value: code, label: code }))}
                      value={fieldValue("currency", plan.currencyCode)}
                      onValueChange={(value) => setField("currency", value)}
                    />
                    <AdminInput
                      label={t("screen.admin.plans.planEditor.annualPrice")}
                      inputMode="decimal"
                      value={fieldValue(
                        "annualPrice",
                        (plan.annualPriceMinor / MINOR_PER_MAJOR).toFixed(2),
                      )}
                      onChange={(event) => setField("annualPrice", event.target.value)}
                    />
                    <div className="flex flex-col gap-1.5">
                      <AdminInput
                        label={t("screen.admin.plans.planEditor.annualDiscount")}
                        value={fieldValue(
                          "annualDiscount",
                          `${plan.annualDiscountBps / BPS_PER_PERCENT}%`,
                        )}
                        onChange={(event) => setField("annualDiscount", event.target.value)}
                      />
                      <AdminBadge tone="warn" icon={false}>
                        {t("screen.admin.plans.planEditor.discountPlaceholder")}
                      </AdminBadge>
                    </div>
                    <AdminInput
                      label={t("screen.admin.plans.planEditor.trialLength")}
                      inputMode="numeric"
                      value={fieldValue("trialDays", String(plan.trialDays))}
                      onChange={(event) => setField("trialDays", event.target.value)}
                    />
                    <AdminInput
                      label={t("screen.admin.plans.planEditor.gracePeriod")}
                      inputMode="numeric"
                      value={graceValue}
                      aria-invalid={graceDays === null}
                      help={
                        graceDays === null
                          ? t("screen.admin.plans.planEditor.graceInvalid")
                          : t("screen.admin.plans.planEditor.graceHelp")
                      }
                      onChange={(event) => setField("gracePeriodDays", event.target.value)}
                    />
                  </FieldGrid>
                </AdminCard>
              </>
            }
            side={<PlanEffect />}
          />
        ) : (
          <AdminCard>
            <AdminEmpty
              title={t("screen.admin.plans.planEditor.notFoundTitle")}
              description={t("screen.admin.plans.planEditor.notFoundBody")}
            />
            <AdminLink screen="SCR-ADM-15">
              {t("screen.admin.plans.planEditor.backToPlans")}
            </AdminLink>
          </AdminCard>
        )}
      </AdminQueryState>
    </AdminPage>
  );
}
