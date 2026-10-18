import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import {
  TripWizardFrame,
  getActiveWizardTripId,
  setActiveWizardTripId,
} from "../common/org-shared";

const NAME_REQUIRED_MESSAGE = "Enter a trip name to continue.";

export function TripWizardStep1Basics() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tripType, setTripType] = useState("day_trip");
  const [language, setLanguage] = useState("ar");
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  const existingId = getActiveWizardTripId();
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: existingId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(existingId),
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
    const categoryCode = tripType.trim() || "CULTURAL_HERITAGE";
    const resolvedLanguage = language === "en" ? ("en" as const) : ("ar" as const);
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
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Failed to save draft");
      return false;
    }
  };

  const requireName = (): boolean | Promise<boolean> => {
    const isValid = name.trim().length > 0;
    setNameError(isValid ? undefined : NAME_REQUIRED_MESSAGE);
    if (!isValid) return false;
    if (authStatus === "authenticated") {
      return persistStep();
    }
    return true;
  };

  return (
    <TripWizardFrame
      title={t("screen.organization.trips.tripWizardStep1Basics.tripWizardStep1Basics")}
      stepId="basics"
      previousSlug="trips-list"
      nextSlug="trip-wizard-step-2-schedule-and-route"
      beforeNext={requireName}
      onSaveDraft={async () => {
        if (name.trim().length > 0) {
          await persistStep();
        }
      }}
    >
      <TeKpiTile
        label={t("screen.organization.trips.tripWizardStep1Basics.activeTripsThisMonth")}
        value="0"
        hint={t("screen.organization.trips.tripWizardStep1Basics.monthlyLimitPlanLimit")}
      />
      <TeInlineAlert tone="info">
        {t("screen.organization.trips.tripWizardStep1Basics.yourDraftIsSavedAs")}
      </TeInlineAlert>
      <TeInput
        label={t("screen.organization.trips.tripWizardStep1Basics.tripName")}
        placeholder={t("screen.organization.trips.tripWizardStep1Basics.tripNamePlaceholder")}
        dir="auto"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={nameError}
      />
      <TeInput
        label={t("screen.organization.trips.tripWizardStep1Basics.description")}
        placeholder={t("screen.organization.trips.tripWizardStep1Basics.shortDescription")}
        dir="auto"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <TeInput
        label={t("screen.organization.trips.tripWizardStep1Basics.tripType")}
        placeholder={t("screen.organization.trips.tripWizardStep1Basics.tripTypePlaceholder")}
        value={tripType}
        onChange={(event) => setTripType(event.target.value)}
      />
      <TeInput
        label={t("screen.organization.trips.tripWizardStep1Basics.language")}
        placeholder={t("screen.organization.trips.tripWizardStep1Basics.languagePlaceholder")}
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
      />
    </TripWizardFrame>
  );
}
