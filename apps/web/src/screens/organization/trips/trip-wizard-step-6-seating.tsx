// SCR-ORG-10 Trip wizard step 6: seat mode and the priority window for Explorer and VIP travelers.
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgInput } from "../common/org-form";
import { TripWizardFrame } from "../common/org-shared";
import { OrgAlert, OrgBadge, OrgCard, OrgError } from "../common/org-ui";
import {
  OrgOptionCard,
  WizardSaveAlert,
  useOrgPlan,
  useWizardStepSave,
  useWizardTrip,
} from "./trip-parts";

/** Longest priority window the trips API accepts (30 days). */
const MAX_WINDOW_HOURS = 720;

export function TripWizardStep6Seating() {
  const { tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { features } = useOrgPlan();
  const [selfSelect, setSelfSelect] = useState(false);
  // Filled from the saved trip; the trips API holds the default window for a new draft.
  const [priorityWindowHours, setPriorityWindowHours] = useState("");
  const [windowError, setWindowError] = useState<string | undefined>(undefined);
  const { error: saveError, run } = useWizardStepSave(tripId);

  useEffect(() => {
    if (tripQuery.data) {
      const detail = tripQuery.data;
      setSelfSelect(detail.seatAssignmentMode === "traveler_choice");
      setPriorityWindowHours(String(detail.seatPriorityWindowHours));
    }
  }, [tripQuery.data]);

  const saveWizardStepMutation = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.seats.key() });
      },
    }),
  );

  const saveStep = async (): Promise<boolean> => {
    const text = priorityWindowHours.trim();
    const hours = Number(text);
    if (!/^\d+$/.test(text) || hours > MAX_WINDOW_HOURS) {
      setWindowError(
        t("screen.organization.trips.tripWizardStep6Seating.windowInvalid", {
          max: MAX_WINDOW_HOURS,
        }),
      );
      return false;
    }
    setWindowError(undefined);
    return run((id) =>
      saveWizardStepMutation.mutateAsync({
        tripId: id,
        step: "seating",
        seatAssignmentMode: selfSelect ? "traveler_choice" : "organization_assigned",
        seatPriorityWindowHours: hours,
      }),
    );
  };

  // Self-select stays locked until the plan is known to include it.
  const selfSelectLocked = !features?.seatSelfSelection;

  return (
    <TripWizardFrame
      stepId="seating"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStepMutation.isPending}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      <WizardSaveAlert error={saveError} className="max-w-[860px]" />
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
      <OrgCard
        title={t("screen.organization.trips.tripWizardStep6Seating.seatMode")}
        className="max-w-[860px]"
      >
        <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
          <legend className="mb-2 p-0 text-sm leading-5 font-semibold">
            {t("screen.organization.trips.tripWizardStep6Seating.chooseHowTravelersGetSeats")}
          </legend>
          <OrgOptionCard
            name="seat-mode"
            checked={!selfSelect}
            onChange={() => setSelfSelect(false)}
          >
            <b className="block">
              {t("screen.organization.trips.tripWizardStep6Seating.organizationAssigned")}
            </b>
            <span className="te-caption text-[var(--te-ink-muted)]">
              {t("screen.organization.trips.tripWizardStep6Seating.organizationAssignedBody")}
            </span>
          </OrgOptionCard>
          <OrgOptionCard
            name="seat-mode"
            checked={selfSelect}
            disabled={selfSelectLocked && !selfSelect}
            onChange={() => setSelfSelect(true)}
          >
            <span className="flex flex-wrap items-center gap-2">
              <b>{t("screen.organization.trips.tripWizardStep6Seating.travelerSelfSelect")}</b>
              {selfSelectLocked ? (
                <OrgBadge tone="neu" icon="lock">
                  {t("screen.organization.trips.tripWizardStep6Seating.growthOrEnterprise")}
                </OrgBadge>
              ) : null}
            </span>
            <span className="te-caption block text-[var(--te-ink-muted)]">
              {selfSelectLocked
                ? t("screen.organization.trips.tripWizardStep6Seating.travelerSelfSelectLocked")
                : t("screen.organization.trips.tripWizardStep6Seating.travelerSelfSelectBody")}
            </span>
          </OrgOptionCard>
        </fieldset>
      </OrgCard>
      <OrgCard
        title={t("screen.organization.trips.tripWizardStep6Seating.priorityWindow")}
        className="max-w-[860px]"
      >
        <OrgInput
          label={t("screen.organization.trips.tripWizardStep6Seating.priorityWindowLabel")}
          hint={t("screen.organization.trips.tripWizardStep6Seating.windowHoursHint")}
          inputMode="numeric"
          fieldClassName="max-w-[360px]"
          required
          value={priorityWindowHours}
          error={windowError}
          onChange={(event) => setPriorityWindowHours(event.target.value)}
        />
        <p className="te-caption m-0 text-[var(--te-ink-muted)]">
          {t("screen.organization.trips.tripWizardStep6Seating.windowTbc")}
        </p>
      </OrgCard>
      <OrgAlert tone="info" className="max-w-[860px]">
        {t("screen.organization.trips.tripWizardStep6Seating.changeRulesNote")}
      </OrgAlert>
    </TripWizardFrame>
  );
}
