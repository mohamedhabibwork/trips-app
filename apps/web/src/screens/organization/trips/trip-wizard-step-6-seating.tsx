import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function TripWizardStep6Seating() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [selfSelect, setSelfSelect] = useState(false);
  const [priorityWindowHours, setPriorityWindowHours] = useState("24");

  const tripId = getActiveWizardTripId();
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(tripId),
  });

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
    if (authStatus !== "authenticated") return true;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return true;
    const parsedWindow = Number.parseInt(priorityWindowHours, 10);
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "seating",
        seatAssignmentMode: selfSelect ? "traveler_choice" : "organization_assigned",
        seatPriorityWindowHours: Number.isNaN(parsedWindow) ? 24 : parsedWindow,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t("screen.organization.trips.tripWizardStep6Seating.tripWizardStep6Seating")}
        stepId="seating"
        previousSlug="trip-wizard-step-5-programs"
        nextSlug="trip-wizard-step-7-pricing-and-capacity"
        beforeNext={saveStep}
        onSaveDraft={async () => {
          await saveStep();
        }}
      >
        <TeSwitch
          checked={selfSelect}
          onCheckedChange={setSelfSelect}
          label={t("screen.organization.trips.tripWizardStep6Seating.travelersChooseTheirOwnSeats")}
          onLabel={t("screen.organization.trips.tripWizardStep6Seating.selfSelect")}
          offLabel={t("screen.organization.trips.tripWizardStep6Seating.organizationAssignsSeats")}
        />
        <TeInlineAlert tone="info">
          {t("screen.organization.trips.tripWizardStep6Seating.organizationAssignedSeatsAreThe")}
        </TeInlineAlert>
        <TeInput
          label={t("screen.organization.trips.tripWizardStep6Seating.priorityWindowForExplorerAnd")}
          placeholder={t("screen.organization.trips.tripWizardStep6Seating.windowLength")}
          value={priorityWindowHours}
          onChange={(event) => setPriorityWindowHours(event.target.value)}
          supportingText={t(
            "screen.organization.trips.tripWizardStep6Seating.theLengthOfTheWindow",
          )}
        />
      </TripWizardFrame>
    </StatePreview>
  );
}
