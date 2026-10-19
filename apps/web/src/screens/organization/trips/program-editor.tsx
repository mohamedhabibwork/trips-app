// SCR-ORG-13 Program editor: name, pricing model, type flags and price of one trip program.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgChoice, OrgInput, OrgSelect } from "../common/org-form";
import { useOrgNavigate, useOrgParams } from "../common/org-link";
import {
  getSelectedTripId,
  getSelectedProgramId,
  setSelectedTripId,
  setSelectedProgramId,
  tripTitle,
} from "../common/org-shared";
import {
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  CURRENCY_OPTIONS,
  NEW_PROGRAM_ID,
  OrgOptionCard,
  toMinorUnits,
  toTripCurrency,
  type TripCurrency,
} from "./trip-parts";

const PRICING_MODELS = ["per-person", "free", "by-quantity", "per-group", "tiered"] as const;
type PricingModel = (typeof PRICING_MODELS)[number];

/** Pricing models a program row can store today (a price per person, or free). */
const SAVED_PRICING_MODELS: ReadonlySet<PricingModel> = new Set(["per-person", "free"]);

const PRICING_KEY: Record<PricingModel, string> = {
  "per-person": "screen.organization.trips.programEditor.perPerson",
  free: "screen.organization.trips.programEditor.free",
  "by-quantity": "screen.organization.trips.programEditor.byQuantity",
  "per-group": "screen.organization.trips.programEditor.perGroup",
  tiered: "screen.organization.trips.programEditor.tiered",
};

const FLAG_IDS = ["optional", "preRequired", "capacityLimited", "vipOnly"] as const;
type FlagId = (typeof FLAG_IDS)[number];

const FLAG_KEY: Record<FlagId, string> = {
  optional: "screen.organization.trips.programEditor.optional",
  preRequired: "screen.organization.trips.programEditor.preRequired",
  capacityLimited: "screen.organization.trips.programEditor.capacityLimited",
  vipOnly: "screen.organization.trips.programEditor.vipOnly",
};

/** Flags a program row can store: optional or pre-required (`isIncludedInBase`) and a cap. */
const SAVED_FLAGS: ReadonlySet<FlagId> = new Set(["optional", "preRequired", "capacityLimited"]);

const INITIAL_FLAGS: Record<FlagId, boolean> = {
  optional: true,
  preRequired: false,
  capacityLimited: false,
  vipOnly: false,
};

const PRICE_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;
const CAP_PATTERN = /^\d{1,5}$/;

export function ProgramEditor() {
  const goTo = useOrgNavigate();
  const params = useOrgParams();
  const { status: authStatus, locale } = useAuth();
  const queryClient = useQueryClient();
  const isNew = params.programId === NEW_PROGRAM_ID;
  const requestedProgramId = isNew ? null : (params.programId ?? getSelectedProgramId());
  const [programId, setProgramId] = useState<string | null>(requestedProgramId);
  const [programName, setProgramName] = useState("");
  const [pricingModel, setPricingModel] = useState<PricingModel>("per-person");
  const [flags, setFlags] = useState(INITIAL_FLAGS);
  const [cap, setCap] = useState("");
  const [capError, setCapError] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<TripCurrency>("EGP");
  const [busy, setBusy] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const signedIn = authStatus === "authenticated";
  const knownTripId = params.tripId ?? getSelectedTripId();
  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: signedIn && !knownTripId,
  });
  const effectiveTripId = knownTripId || tripsQuery.data?.items[0]?.id || null;

  useEffect(() => {
    if (!getSelectedTripId() && effectiveTripId) setSelectedTripId(effectiveTripId);
  }, [effectiveTripId]);

  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: effectiveTripId ?? "" } }),
    enabled: signedIn && Boolean(effectiveTripId),
  });
  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({ input: { tripId: effectiveTripId ?? "" } }),
    enabled: signedIn && Boolean(effectiveTripId),
  });

  const program = programsQuery.data
    ? isNew
      ? undefined
      : requestedProgramId
        ? programsQuery.data.items.find((item) => item.id === requestedProgramId)
        : programsQuery.data.items[0]
    : undefined;

  useEffect(() => {
    if (!program) return;
    setProgramId(program.id);
    setProgramName(program.titleEn || program.titleAr);
    setPricingModel(program.priceMinor === 0 ? "free" : "per-person");
    setPrice((program.priceMinor / 100).toFixed(2));
    setCurrency(toTripCurrency(program.currencyCode));
    if (program.capacity !== null) setCap(String(program.capacity));
    setFlags({
      optional: !program.isIncludedInBase,
      preRequired: program.isIncludedInBase,
      capacityLimited: program.capacity !== null,
      vipOnly: false,
    });
  }, [program]);

  const onSuccess = () => {
    void queryClient.invalidateQueries({ queryKey: orpc.programs.key() });
    void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
  };
  const updateProgramMutation = useMutation(
    orpc.programs.updateProgram.mutationOptions({ onSuccess }),
  );
  const createProgramMutation = useMutation(
    orpc.programs.createProgram.mutationOptions({ onSuccess }),
  );

  const setFlag = (flag: FlagId, checked: boolean) => {
    setFlags((current) => {
      // Optional and pre-required are the two values of one stored field.
      if (flag === "optional") return { ...current, optional: checked, preRequired: !checked };
      if (flag === "preRequired") return { ...current, preRequired: checked, optional: !checked };
      return { ...current, [flag]: checked };
    });
  };

  /** Checks the form; returns the fields to save, or null with the field errors shown. */
  function readFields() {
    const name = programName.trim();
    const priceText = price.trim();
    const capText = cap.trim();
    const nameMessage = name
      ? undefined
      : t("screen.organization.trips.programEditor.nameRequired");
    const priceMessage =
      pricingModel === "free" || PRICE_PATTERN.test(priceText)
        ? undefined
        : t("screen.organization.trips.programEditor.priceInvalid");
    const capMessage =
      !flags.capacityLimited || (CAP_PATTERN.test(capText) && Number(capText) >= 1)
        ? undefined
        : t("screen.organization.trips.programEditor.capInvalid");
    setNameError(nameMessage);
    setPriceError(priceMessage);
    setCapError(capMessage);
    if (nameMessage || priceMessage || capMessage) return null;
    return {
      titleEn: name,
      titleAr: name,
      priceMinor: pricingModel === "free" ? 0 : toMinorUnits(priceText),
      currencyCode: currency,
      isIncludedInBase: !flags.optional,
      capacity: flags.capacityLimited ? Number(capText) : null,
    };
  }

  async function handleSave() {
    const fields = readFields();
    if (!fields) return;
    const tripId = effectiveTripId;
    if (!signedIn || !tripId) {
      setSaveFailed(true);
      return;
    }
    setBusy(true);
    setSaveFailed(false);
    try {
      if (programId) {
        await updateProgramMutation.mutateAsync({ programId, ...fields });
      } else {
        await createProgramMutation.mutateAsync({ tripId, ...fields });
      }
      setSelectedProgramId(null);
    } catch {
      setSaveFailed(true);
      return;
    } finally {
      setBusy(false);
    }
    void goTo("trip-wizard-step-5-programs", { tripId });
  }

  const tripName = tripQuery.data ? tripTitle(tripQuery.data, locale) : "";
  const caption = [
    tripName,
    programName.trim()
      ? t("screen.organization.trips.programEditor.programCaption", { name: programName.trim() })
      : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const hasBookings =
    (program?.bookedCount ?? 0) > 0 || (tripQuery.data?.confirmedSeatsCount ?? 0) > 0;
  const loadingProgram = programsQuery.isLoading && Boolean(requestedProgramId);

  return (
    <OrgPage>
      <OrgPageHeader
        title={
          isNew
            ? t("screen.organization.trips.programEditor.newProgram")
            : t("screen.organization.trips.programEditor.editProgram")
        }
        caption={caption || undefined}
        actions={
          <OrgButton disabled={busy} onClick={() => void handleSave()}>
            {t("screen.organization.trips.programEditor.saveProgram")}
          </OrgButton>
        }
      />
      {hasBookings ? (
        <OrgAlert
          tone="warn"
          title={t("screen.organization.trips.programEditor.bookingsAffectedTitle")}
        >
          {t("screen.organization.trips.programEditor.bookingsAffectedBody")}
        </OrgAlert>
      ) : null}
      {saveFailed ? (
        <OrgAlert tone="err" title={t("screen.organization.trips.programEditor.saveFailedTitle")}>
          {t("screen.organization.trips.programEditor.saveFailedBody")}
        </OrgAlert>
      ) : null}
      {programsQuery.isError ? <OrgError onRetry={() => void programsQuery.refetch()} /> : null}
      {loadingProgram ? (
        <OrgLoading rows={6} />
      ) : (
        <>
          <OrgRow align="start">
            <OrgCard
              title={t("screen.organization.trips.programEditor.programDetails")}
              className="flex-1"
            >
              <OrgInput
                label={t("screen.organization.trips.programEditor.programName")}
                dir="auto"
                required
                value={programName}
                error={nameError}
                onChange={(event) => setProgramName(event.target.value)}
              />
              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className="mb-2 p-0 text-sm leading-5 font-semibold">
                  {t("screen.organization.trips.programEditor.pricingModelChooseOne")}
                </legend>
                {PRICING_MODELS.map((model) => (
                  <OrgOptionCard
                    key={model}
                    name="pricing-model"
                    checked={pricingModel === model}
                    disabled={!SAVED_PRICING_MODELS.has(model)}
                    aria-describedby={
                      SAVED_PRICING_MODELS.has(model) ? undefined : "program-unsaved-options"
                    }
                    onChange={() => setPricingModel(model)}
                    className="items-center"
                  >
                    {t(PRICING_KEY[model])}
                  </OrgOptionCard>
                ))}
              </fieldset>
              <p id="program-unsaved-options" className="te-caption m-0 text-[var(--te-ink-muted)]">
                {t("screen.organization.trips.programEditor.unsavedOptionsNote")}
              </p>
            </OrgCard>
            <OrgCard
              title={t("screen.organization.trips.programEditor.typeFlags")}
              className="flex-1"
            >
              <div className="flex flex-col">
                {FLAG_IDS.map((flag) => (
                  <div key={flag} className="flex flex-col gap-2">
                    <OrgChoice
                      type="checkbox"
                      checked={flags[flag]}
                      disabled={!SAVED_FLAGS.has(flag)}
                      aria-describedby={
                        SAVED_FLAGS.has(flag) ? undefined : "program-unsaved-options"
                      }
                      onChange={(event) => setFlag(flag, event.target.checked)}
                    >
                      {t(FLAG_KEY[flag])}
                    </OrgChoice>
                    {flag === "capacityLimited" && flags.capacityLimited ? (
                      <OrgInput
                        label={t("screen.organization.trips.programEditor.cap")}
                        hint={t("screen.organization.trips.programEditor.capHint")}
                        inputMode="numeric"
                        required
                        error={capError}
                        fieldClassName="ms-8 max-w-[240px] pb-2"
                        value={cap}
                        onChange={(event) => setCap(event.target.value)}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            </OrgCard>
          </OrgRow>
          <OrgCard title={t("screen.organization.trips.programEditor.prices")}>
            <div className="grid max-w-[620px] gap-4 sm:grid-cols-[2fr_1fr]">
              <OrgInput
                label={t("screen.organization.trips.programEditor.pricePerPerson")}
                inputMode="decimal"
                required={pricingModel !== "free"}
                error={priceError}
                disabled={pricingModel === "free"}
                value={pricingModel === "free" ? "0.00" : price}
                onChange={(event) => setPrice(event.target.value)}
              />
              <OrgSelect
                label={t("screen.organization.trips.programEditor.currency")}
                options={CURRENCY_OPTIONS}
                value={currency}
                onValueChange={(value) => setCurrency(toTripCurrency(value))}
              />
            </div>
          </OrgCard>
        </>
      )}
    </OrgPage>
  );
}
