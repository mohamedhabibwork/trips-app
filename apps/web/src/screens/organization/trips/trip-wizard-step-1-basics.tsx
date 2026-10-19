// SCR-ORG-05 Trip wizard step 1: name, description, trip type and language of a new trip.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { lookupTypeByCodeQueryOptions, toLookupSelectOptions } from "@/utils/lookups";
import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect, OrgTextarea } from "../common/org-form";
import {
  TripWizardFrame,
  getActiveWizardTripId,
  setActiveWizardTripId,
} from "../common/org-shared";
import { OrgAlert, OrgCard } from "../common/org-ui";
import { useWizardTrip } from "./trip-parts";

const FALLBACK_CATEGORY = "CULTURAL_HERITAGE";
const CHOOSE_VALUE = "";

export function TripWizardStep1Basics() {
  const { authStatus, locale, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tripType, setTripType] = useState("");
  const [language, setLanguage] = useState("ar");
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [saveFailed, setSaveFailed] = useState(false);

  const categoriesQuery = useQuery({
    ...lookupTypeByCodeQueryOptions("TRIP_CATEGORY"),
    enabled: authStatus === "authenticated",
  });

  useEffect(() => {
    if (tripQuery.data) {
      setName(tripQuery.data.titleEn || tripQuery.data.titleAr);
      setDescription(tripQuery.data.descriptionEn || tripQuery.data.descriptionAr || "");
      setTripType(tripQuery.data.categoryLookupCode);
      setLanguage(tripQuery.data.language);
    }
  }, [tripQuery.data]);

  const saveWizardStepMutation = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const createDraftMutation = useMutation(
    orpc.trips.createDraft.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const persistStep = async (): Promise<boolean> => {
    if (authStatus !== "authenticated") return true;
    const currentTripId = getActiveWizardTripId();
    const trimmedName = name.trim();
    const trimmedDesc = description.trim();
    const categoryCode = tripType.trim() || FALLBACK_CATEGORY;
    const resolvedLanguage = language === "en" ? ("en" as const) : ("ar" as const);
    setSaveFailed(false);
    try {
      if (currentTripId) {
        await saveWizardStepMutation.mutateAsync({
          tripId: currentTripId,
          step: "basics",
          titleAr: trimmedName,
          titleEn: trimmedName,
          descriptionAr: trimmedDesc,
          descriptionEn: trimmedDesc,
          categoryLookupCode: categoryCode,
          language: resolvedLanguage,
        });
      } else {
        const created = await createDraftMutation.mutateAsync({
          titleAr: trimmedName,
          titleEn: trimmedName,
          descriptionAr: trimmedDesc,
          descriptionEn: trimmedDesc,
          categoryLookupCode: categoryCode,
          language: resolvedLanguage,
        });
        setActiveWizardTripId(created.id);
      }
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  };

  const requireName = (): boolean | Promise<boolean> => {
    const isValid = name.trim().length > 0;
    setNameError(
      isValid ? undefined : t("screen.organization.trips.tripWizardStep1Basics.nameRequired"),
    );
    if (!isValid) return false;
    return persistStep();
  };

  const categoryOptions = toLookupSelectOptions(
    categoriesQuery.data?.lookupType?.items,
    locale === "en" ? "en" : "ar",
  ).map((option) => ({ value: option.code, label: option.label }));
  const knownType = categoryOptions.some((option) => option.value === tripType);
  // Until the type is one of the lookup items, the first option names it (or asks for one).
  const typeOptions = knownType
    ? categoryOptions
    : [
        {
          value: tripType || CHOOSE_VALUE,
          label: tripType || t("screen.organization.trips.tripWizardStep1Basics.chooseTripType"),
        },
        ...categoryOptions,
      ];

  const languageOptions = [
    { value: "ar", label: t("screen.organization.trips.tripWizardStep1Basics.arabic") },
    { value: "en", label: t("screen.organization.trips.tripWizardStep1Basics.english") },
  ];

  return (
    <TripWizardFrame
      stepId="basics"
      tripName={tripName}
      beforeNext={requireName}
      onSaveDraft={async () => {
        if (name.trim().length > 0) {
          await persistStep();
        } else {
          requireName();
        }
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
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={nameError}
        />
        <OrgTextarea
          label={t("screen.organization.trips.tripWizardStep1Basics.description")}
          placeholder={t("screen.organization.trips.tripWizardStep1Basics.descriptionPlaceholder")}
          dir="auto"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <OrgSelect
            label={t("screen.organization.trips.tripWizardStep1Basics.tripType")}
            options={typeOptions}
            value={tripType}
            onValueChange={setTripType}
          />
          <OrgSelect
            label={t("screen.organization.trips.tripWizardStep1Basics.language")}
            options={languageOptions}
            value={language}
            onValueChange={setLanguage}
          />
        </div>
      </OrgCard>
      {saveFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep1Basics.saveFailedTitle")}
          className="max-w-[760px]"
        >
          {t("screen.organization.trips.tripWizardStep1Basics.saveFailedBody")}
        </OrgAlert>
      ) : null}
      <OrgAlert tone="info" className="max-w-[760px]">
        {t("screen.organization.trips.tripWizardStep1Basics.draftSavedNote")}
      </OrgAlert>
    </TripWizardFrame>
  );
}
