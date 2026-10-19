// SCR-ORG-05 Trip wizard step 1: name, description, trip type and language of a new trip.
// `/business/trips/new` creates the draft; `/business/trips/$tripId/edit` edits a saved one.
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { t } from "@trips-app/i18n";

import { lookupTypeByCodeQueryOptions, toLookupSelectOptions } from "@/utils/lookups";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect, OrgTextarea } from "../common/org-form";
import { TripWizardFrame, wizardStepHref } from "../common/org-shared";
import { OrgAlert, OrgCard } from "../common/org-ui";
import { WizardSaveAlert, useWizardStepSave, useWizardTrip } from "./trip-parts";

const CHOOSE_VALUE = "";
/** Quiet time after the last keystroke before the draft is saved. */
const AUTOSAVE_DELAY_MS = 800;

interface BasicsForm {
  name: string;
  description: string;
  tripType: string;
  language: "ar" | "en";
}

type FieldErrors = Partial<Record<"name" | "tripType", string>>;

function validate(form: BasicsForm): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.name.trim()) {
    errors.name = t("screen.organization.trips.tripWizardStep1Basics.nameRequired");
  }
  if (!form.tripType.trim()) {
    errors.tripType = t("screen.organization.trips.tripWizardStep1Basics.tripTypeRequired");
  }
  return errors;
}

function toPayload(values: BasicsForm) {
  const name = values.name.trim();
  const description = values.description.trim();
  return {
    titleAr: name,
    titleEn: name,
    descriptionAr: description,
    descriptionEn: description,
    categoryLookupCode: values.tripType.trim(),
    language: values.language,
  };
}

export function TripWizardStep1Basics() {
  const { authStatus, locale, tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form, setForm] = useState<BasicsForm>({
    name: "",
    description: "",
    tripType: CHOOSE_VALUE,
    language: locale === "en" ? "en" : "ar",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [autosaveState, setAutosaveState] = useState<"idle" | "saving" | "saved">("idle");
  // True after the user edits the form; autosave never runs on the loaded values alone.
  const dirty = useRef(false);
  // The pending create, so a second keystroke cannot create a second draft.
  const creating = useRef<Promise<string> | null>(null);
  const [createFailed, setCreateFailed] = useState(false);

  // Updating a saved draft: no session or a failed call shows an error, never "saved".
  const { error: saveError, run } = useWizardStepSave(tripId);

  const categoriesQuery = useQuery({
    ...lookupTypeByCodeQueryOptions("TRIP_CATEGORY"),
    enabled: authStatus === "authenticated",
  });

  useEffect(() => {
    const trip = tripQuery.data;
    if (!trip) return;
    dirty.current = false;
    setForm({
      name: trip.titleEn || trip.titleAr,
      description: trip.descriptionEn || trip.descriptionAr || "",
      tripType: trip.categoryLookupCode,
      language: trip.language === "en" ? "en" : "ar",
    });
  }, [tripQuery.data]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
  const saveWizardStep = useMutation(orpc.trips.saveWizardStep.mutationOptions());
  const createDraft = useMutation(orpc.trips.createDraft.mutationOptions());

  /** Creates the draft once. Returns the new trip id, or null when it was not created. */
  const createOnce = async (values: BasicsForm): Promise<string | null> => {
    if (authStatus !== "authenticated") {
      setCreateFailed(true);
      return null;
    }
    creating.current ??= createDraft.mutateAsync(toPayload(values)).then((created) => created.id);
    try {
      const id = await creating.current;
      setCreateFailed(false);
      void invalidate();
      return id;
    } catch {
      creating.current = null;
      setCreateFailed(true);
      return null;
    }
  };

  /** Saves the step. Returns the trip id when the API saved it, false otherwise. */
  const save = async (values: BasicsForm): Promise<string | false> => {
    if (!tripId) return (await createOnce(values)) ?? false;
    const saved = await run((id) =>
      saveWizardStep.mutateAsync({ tripId: id, step: "basics", ...toPayload(values) }),
    );
    if (saved) void invalidate();
    return saved ? tripId : false;
  };

  const saveIfValid = async (): Promise<string | false> => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return false;
    return save(form);
  };

  /** A new draft moves to its own URL, so a reload or a shared link opens the same trip. */
  const openSavedDraft = (savedId: string) => {
    if (!tripId) void navigate({ to: wizardStepHref("basics", savedId), replace: true });
  };

  // "Your draft is saved as you type": once the form is valid, each pause saves it.
  useEffect(() => {
    if (!dirty.current || Object.keys(validate(form)).length > 0) return;
    const timer = window.setTimeout(() => {
      setAutosaveState("saving");
      void save(form).then((savedId) => {
        setAutosaveState(savedId ? "saved" : "idle");
        if (savedId) openSavedDraft(savedId);
      });
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
    // `save` reads the latest form; the timer restarts only when the form changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const update = (patch: Partial<BasicsForm>) => {
    dirty.current = true;
    setAutosaveState("idle");
    setForm((current) => ({ ...current, ...patch }));
  };

  const categoryOptions = toLookupSelectOptions(
    categoriesQuery.data?.lookupType?.items,
    locale === "en" ? "en" : "ar",
  ).map((option) => ({ value: option.code, label: option.label }));
  const knownType = categoryOptions.some((option) => option.value === form.tripType);
  // Until a lookup item is chosen, the first option asks for one (or names a retired code).
  const typeOptions = knownType
    ? categoryOptions
    : [
        {
          value: form.tripType || CHOOSE_VALUE,
          label:
            form.tripType || t("screen.organization.trips.tripWizardStep1Basics.chooseTripType"),
        },
        ...categoryOptions,
      ];

  const languageOptions = [
    { value: "ar", label: t("screen.organization.trips.tripWizardStep1Basics.arabic") },
    { value: "en", label: t("screen.organization.trips.tripWizardStep1Basics.english") },
  ];

  const draftNote =
    autosaveState === "saving"
      ? t("screen.organization.trips.tripWizardStep1Basics.savingDraft")
      : autosaveState === "saved"
        ? t("screen.organization.trips.tripWizardStep1Basics.draftSaved")
        : t("screen.organization.trips.tripWizardStep1Basics.draftSavedNote");

  return (
    <TripWizardFrame
      stepId="basics"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStep.isPending || createDraft.isPending}
      beforeNext={saveIfValid}
      onSaveDraft={async () => {
        const savedId = await saveIfValid();
        if (!savedId) return;
        setAutosaveState("saved");
        openSavedDraft(savedId);
      }}
    >
      <OrgCard
        title={t("screen.organization.trips.tripWizardStep1Basics.tripBasics")}
        className="max-w-[760px]"
      >
        <OrgInput
          label={t("screen.organization.trips.tripWizardStep1Basics.tripName")}
          dir="auto"
          required
          value={form.name}
          onChange={(event) => update({ name: event.target.value })}
          error={errors.name}
        />
        <OrgTextarea
          label={t("screen.organization.trips.tripWizardStep1Basics.description")}
          placeholder={t("screen.organization.trips.tripWizardStep1Basics.descriptionPlaceholder")}
          dir="auto"
          value={form.description}
          onChange={(event) => update({ description: event.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <OrgSelect
            label={t("screen.organization.trips.tripWizardStep1Basics.tripType")}
            options={typeOptions}
            value={form.tripType}
            required
            error={errors.tripType}
            onValueChange={(value) => update({ tripType: value })}
          />
          <OrgSelect
            label={t("screen.organization.trips.tripWizardStep1Basics.language")}
            options={languageOptions}
            value={form.language}
            onValueChange={(value) => update({ language: value === "en" ? "en" : "ar" })}
          />
        </div>
      </OrgCard>
      <WizardSaveAlert error={saveError} className="max-w-[760px]" />
      {createFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep1Basics.saveFailedTitle")}
          className="max-w-[760px]"
        >
          {t("screen.organization.trips.tripWizardStep1Basics.saveFailedBody")}
        </OrgAlert>
      ) : null}
      <OrgAlert tone="info" className="max-w-[760px]">
        <span aria-live="polite">{draftNote}</span>
      </OrgAlert>
    </TripWizardFrame>
  );
}
