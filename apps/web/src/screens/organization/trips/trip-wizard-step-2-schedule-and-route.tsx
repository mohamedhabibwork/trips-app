import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeCard } from "@trips-app/ui/components/te-card";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { TeInput } from "@trips-app/ui/components/te-input";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function TripWizardStep2ScheduleAndRoute() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("2026-11-01");
  const [endDate, setEndDate] = useState("2026-11-03");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [timezone, setTimezone] = useState("Africa/Cairo");
  const [originLabel, setOriginLabel] = useState("Cairo");
  const [destinationLabel, setDestinationLabel] = useState("Luxor");

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
      if (detail.startsAt) {
        const iso = new Date(detail.startsAt).toISOString();
        setStartDate(iso.slice(0, 10));
        setStartTime(iso.slice(11, 16));
      }
      if (detail.endsAt) {
        const iso = new Date(detail.endsAt).toISOString();
        setEndDate(iso.slice(0, 10));
        setEndTime(iso.slice(11, 16));
      }
      if (detail.timezone) setTimezone(detail.timezone);
      if (detail.origin?.nameEn) setOriginLabel(detail.origin.nameEn);
      if (detail.destinations[0]?.nameEn) setDestinationLabel(detail.destinations[0].nameEn);
    }
  }, [tripQuery.data]);

  const saveWizardStepMutation = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const saveStep = async (): Promise<boolean> => {
    if (authStatus !== "authenticated") return true;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return true;
    try {
      const startsAtIso = new Date(`${startDate}T${startTime}:00.000Z`).toISOString();
      const endsAtIso = new Date(`${endDate}T${endTime}:00.000Z`).toISOString();
      const orig = originLabel.trim() || "Cairo";
      const dest = destinationLabel.trim() || "Luxor";
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "schedule",
        startsAt: startsAtIso,
        endsAt: endsAtIso,
        timezone,
        origin: {
          nameAr: orig,
          nameEn: orig,
          latitude: 30.0444,
          longitude: 31.2357,
        },
        destinations: [
          {
            nameAr: dest,
            nameEn: dest,
            latitude: 25.6872,
            longitude: 32.6396,
          },
        ],
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t(
          "screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripWizardStep2Schedule",
        )}
        stepId="schedule"
        previousSlug="trip-wizard-step-1-basics"
        nextSlug="trip-wizard-step-3-vehicles"
        beforeNext={saveStep}
        onSaveDraft={async () => {
          await saveStep();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.startDate")}
            placeholder={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.yyyyMmDd")}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <TeInput
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.endDate")}
            placeholder={t(
              "screen.organization.trips.tripWizardStep2ScheduleAndRoute.yyyyMmDdPlaceholder",
            )}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <TeInput
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.startTime")}
            placeholder={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.hhMm")}
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
          <TeInput
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.endTime")}
            placeholder={t(
              "screen.organization.trips.tripWizardStep2ScheduleAndRoute.hhMmPlaceholder",
            )}
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
          <TeInput
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripTimeZone")}
            placeholder={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.timeZone")}
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
          />
        </div>
        <TeInput
          label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.origin")}
          placeholder={t(
            "screen.organization.trips.tripWizardStep2ScheduleAndRoute.originPlaceholder",
          )}
          dir="auto"
          value={originLabel}
          onChange={(event) => setOriginLabel(event.target.value)}
        />
        <TeInput
          label={t(
            "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops",
          )}
          placeholder={t(
            "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationOrStop",
          )}
          dir="auto"
          value={destinationLabel}
          onChange={(event) => setDestinationLabel(event.target.value)}
        />
        <TeCard>
          <div className="flex flex-col items-center gap-3 text-center">
            <TeIcon name="pin" />
            <p className="te-body">
              {t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.theMapPickerFromThe")}
            </p>
          </div>
        </TeCard>
      </TripWizardFrame>
    </StatePreview>
  );
}
