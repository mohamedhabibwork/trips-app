import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeCheckbox } from "@trips-app/ui/components/te-checkbox";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import {
  getActiveWizardTripId,
  getSelectedProgramId,
  OrgSection,
  setActiveWizardTripId,
  setSelectedProgramId,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const FLAG_IDS = ["optional", "preRequired", "capacityLimited", "vipOnly"] as const;

type FlagId = (typeof FLAG_IDS)[number];

const FLAG_LABELS: Record<FlagId, string> = {
  get optional() {
    return t("screen.organization.trips.programEditor.labels.optional");
  },
  get preRequired() {
    return t("screen.organization.trips.programEditor.labels.preRequired");
  },
  get capacityLimited() {
    return t("screen.organization.trips.programEditor.labels.capacityLimitedWithCap");
  },
  get vipOnly() {
    return t("screen.organization.trips.programEditor.labels.vipOnly");
  },
};

const PRICING_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "free", label: t("screen.organization.trips.programEditor.free") },
  { value: "per-person", label: t("screen.organization.trips.programEditor.perPerson") },
  { value: "by-quantity", label: t("screen.organization.trips.programEditor.byQuantity") },
  { value: "per-group", label: t("screen.organization.trips.programEditor.perGroup") },
  { value: "tiered", label: t("screen.organization.trips.programEditor.tiered") },
];

const INITIAL_FLAGS: Record<FlagId, boolean> = {
  optional: false,
  preRequired: false,
  capacityLimited: false,
  vipOnly: false,
};

export function ProgramEditor() {
  const goTo = useOrgNavigate();
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [programId, setProgramId] = useState<string | null>(getSelectedProgramId());
  const [programName, setProgramName] = useState("");
  const [pricingModel, setPricingModel] = useState("per-person");
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState<"EGP" | "SAR" | "AED" | "USD">("SAR");
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeTripId = getActiveWizardTripId();

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated" && !activeTripId,
  });

  const effectiveTripId = activeTripId || tripsQuery.data?.items[0]?.id || null;

  useEffect(() => {
    if (!activeTripId && tripsQuery.data?.items[0]?.id) {
      setActiveWizardTripId(tripsQuery.data.items[0].id);
    }
  }, [activeTripId, tripsQuery.data]);

  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
  });

  useEffect(() => {
    if (programsQuery.data) {
      const selectedId = getSelectedProgramId();
      const found = selectedId
        ? programsQuery.data.items.find((p) => p.id === selectedId)
        : programsQuery.data.items[0];
      if (found) {
        setProgramId(found.id);
        setProgramName(found.titleEn || found.titleAr);
        setPricingModel(found.isIncludedInBase ? "free" : "per-person");
        setPrice(String((found.priceMinor / 100).toFixed(2)));
        setCurrency(found.currencyCode);
        setFlags({
          optional: !found.isIncludedInBase,
          preRequired: found.isIncludedInBase,
          capacityLimited: found.capacity !== null,
          vipOnly: false,
        });
      }
    }
  }, [programsQuery.data]);

  const updateProgramMutation = useMutation(
    orpc.programs.updateProgram.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.programs.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const createProgramMutation = useMutation(
    orpc.programs.createProgram.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.programs.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const setFlag = (flag: FlagId, checked: boolean) => {
    setFlags((current) => ({ ...current, [flag]: checked }));
  };

  async function handleSave() {
    if (authStatus === "authenticated" && programName.trim()) {
      setBusy(true);
      setErrorMsg(null);
      try {
        const tripId = getActiveWizardTripId() || effectiveTripId;
        if (tripId) {
          const priceMinor =
            pricingModel === "free"
              ? 0
              : Math.max(0, Math.round((Number.parseFloat(price) || 0) * 100));
          const isIncludedInBase = pricingModel === "free" || !flags.optional;
          const capacity = flags.capacityLimited ? 30 : null;
          const supportedCurrency = currency === "USD" ? "SAR" : currency;
          if (programId) {
            await updateProgramMutation.mutateAsync({
              programId,
              titleEn: programName.trim(),
              titleAr: programName.trim(),
              priceMinor,
              currencyCode: supportedCurrency,
              isIncludedInBase,
              capacity,
            });
          } else {
            await createProgramMutation.mutateAsync({
              tripId,
              titleEn: programName.trim(),
              titleAr: programName.trim(),
              priceMinor,
              currencyCode: supportedCurrency,
              isIncludedInBase,
              capacity,
            });
          }
          setSelectedProgramId(null);
        }
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not save program.");
        setBusy(false);
        return;
      }
      setBusy(false);
    }
    void goTo("trip-wizard-step-5-programs");
  }

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "trip-wizard-step-5-programs",
            label: t("screen.organization.trips.programEditor.backToPrograms"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.trips.programEditor.programEditor")}
          actions={
            <TeButton disabled={busy} onClick={() => void handleSave()}>
              {t("screen.organization.trips.programEditor.save")}
            </TeButton>
          }
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <OrgSection title={t("screen.organization.trips.programEditor.details")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.trips.programEditor.programName")}
                placeholder={t("screen.organization.trips.programEditor.programNamePlaceholder")}
                dir="auto"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
              />
              <TeSelect
                label={t("screen.organization.trips.programEditor.pricingModel")}
                options={PRICING_OPTIONS()}
                value={pricingModel}
                onValueChange={setPricingModel}
                supportingText={t(
                  "screen.organization.trips.programEditor.chooseExactlyOnePricingModel",
                )}
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.trips.programEditor.typeFlags")}>
          <TeCard>
            <div className="flex flex-col gap-4">
              {FLAG_IDS.map((flag) => (
                <TeCheckbox
                  key={flag}
                  label={FLAG_LABELS[flag]}
                  checked={flags[flag]}
                  onCheckedChange={(checked) => setFlag(flag, checked)}
                />
              ))}
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.trips.programEditor.prices")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TeInput
              label={t("screen.organization.trips.programEditor.price")}
              placeholder={t("screen.organization.trips.programEditor.amount")}
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <TeInput
              label={t("screen.organization.trips.programEditor.currency")}
              placeholder={t("screen.organization.trips.programEditor.currencyCode")}
              value={currency}
              onChange={(e) => {
                const code = e.target.value.toUpperCase();
                if (code === "EGP" || code === "SAR" || code === "AED" || code === "USD") {
                  setCurrency(code);
                }
              }}
            />
          </div>
        </OrgSection>
      </div>
    </StatePreview>
  );
}
