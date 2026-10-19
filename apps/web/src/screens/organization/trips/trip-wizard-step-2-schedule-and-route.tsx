// SCR-ORG-06 Trip wizard step 2: dates, time zone, origin and the ordered stops of the route.
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import { TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { OrgAlert, OrgBadge, OrgButton, OrgCard, OrgRow } from "../common/org-ui";
import { useWizardTrip } from "./trip-parts";

const TIME_ZONES = ["Africa/Cairo", "Asia/Riyadh", "Asia/Dubai"];

/** Coordinates the draft has always sent for the origin and the first stop. */
const ORIGIN_POINT = { latitude: 30.0444, longitude: 31.2357 };
const FIRST_STOP_POINT = { latitude: 25.6872, longitude: 32.6396 };

interface StopRow {
  id: string;
  name: string;
  order: number;
}

function toUtcIso(date: string, time: string): string {
  return new Date(`${date}T${time}:00.000Z`).toISOString();
}

/** Decorative route strip with the map picker note (artboard SCR-ORG-06). */
function MapPickerStrip() {
  return (
    <div className="relative h-[200px] overflow-hidden rounded-xl border border-[var(--te-hairline)] bg-[var(--te-map-ground)]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        aria-hidden="true"
        className="absolute inset-0"
      >
        <path
          d="M0 150 C 200 60, 380 170, 560 90 S 880 40, 1000 110"
          fill="none"
          stroke="var(--te-map-road)"
          strokeWidth="18"
        />
        <path
          d="M0 150 C 200 60, 380 170, 560 90 S 880 40, 1000 110"
          fill="none"
          stroke="var(--te-brand-navy)"
          strokeWidth="3"
          strokeDasharray="10 8"
        />
      </svg>
      <OrgBadge tone="info" icon="pin" className="absolute start-4 top-4">
        {t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.mapPickerNote")}
      </OrgBadge>
    </div>
  );
}

export function TripWizardStep2ScheduleAndRoute() {
  const { authStatus, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const [startDate, setStartDate] = useState("2026-11-01");
  const [endDate, setEndDate] = useState("2026-11-03");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("18:00");
  const [timezone, setTimezone] = useState("Africa/Cairo");
  const [originLabel, setOriginLabel] = useState("Cairo");
  const [stops, setStops] = useState<readonly string[]>(["Luxor"]);
  const [newStop, setNewStop] = useState("");
  const [saveFailed, setSaveFailed] = useState(false);

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
      const names = detail.destinations.map((stop) => stop.nameEn).filter(Boolean);
      if (names.length > 0) setStops(names);
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
    setSaveFailed(false);
    try {
      const orig = originLabel.trim() || "Cairo";
      const stopNames = stops.map((stop) => stop.trim()).filter(Boolean);
      const destinations = (stopNames.length > 0 ? stopNames : ["Luxor"]).map((stop, index) => ({
        nameAr: stop,
        nameEn: stop,
        ...(index === 0 ? FIRST_STOP_POINT : {}),
      }));
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "schedule",
        startsAt: toUtcIso(startDate, startTime),
        endsAt: toUtcIso(endDate, endTime),
        timezone,
        origin: { nameAr: orig, nameEn: orig, ...ORIGIN_POINT },
        destinations,
      });
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  };

  const addStop = () => {
    const stop = newStop.trim();
    if (!stop) return;
    setStops((current) => [...current, stop]);
    setNewStop("");
  };

  const stopRows: readonly StopRow[] = stops.map((name, index) => ({
    id: `${index}-${name}`,
    name,
    order: index + 1,
  }));

  const stopColumns: readonly OrgColumn<StopRow>[] = [
    { key: "name", header: t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.stop") },
    {
      key: "order",
      header: t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.order"),
    },
    {
      key: "action",
      header: t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.action"),
      render: (row) => (
        <OrgButton
          variant="text"
          aria-label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.removeStop", {
            name: row.name,
          })}
          onClick={() =>
            setStops((current) => current.filter((_, index) => index !== row.order - 1))
          }
        >
          {t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.remove")}
        </OrgButton>
      ),
    },
  ];

  const timeZoneOptions = (
    TIME_ZONES.includes(timezone) ? TIME_ZONES : [timezone, ...TIME_ZONES]
  ).map((zone) => ({ value: zone, label: zone }));

  return (
    <TripWizardFrame
      stepId="schedule"
      tripName={tripName}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      {saveFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.saveFailedTitle")}
        >
          {t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.saveFailedBody")}
        </OrgAlert>
      ) : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.datesAndTimes")}
          className="flex-1"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <OrgInput
              type="date"
              label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.startDate")}
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <OrgInput
              type="time"
              label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.startTime")}
              value={startTime}
              onChange={(event) => setStartTime(event.target.value)}
            />
            <OrgInput
              type="date"
              label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.endDate")}
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
            />
            <OrgInput
              type="time"
              label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.endTime")}
              value={endTime}
              onChange={(event) => setEndTime(event.target.value)}
            />
          </div>
          <OrgSelect
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.tripTimeZone")}
            options={timeZoneOptions}
            value={timezone}
            onValueChange={setTimezone}
          />
          <OrgInput
            label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.origin")}
            dir="auto"
            value={originLabel}
            onChange={(event) => setOriginLabel(event.target.value)}
          />
        </OrgCard>
        <OrgCard
          title={t(
            "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops",
          )}
          className="flex-1"
        >
          <OrgTable
            columns={stopColumns}
            rows={stopRows}
            rowKey={(row) => row.id}
            caption={t(
              "screen.organization.trips.tripWizardStep2ScheduleAndRoute.destinationsAndStops",
            )}
            empty={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.noStops")}
          />
          <div className="flex flex-wrap items-end gap-3">
            <OrgInput
              label={t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.newStop")}
              dir="auto"
              fieldClassName="min-w-[200px] flex-1"
              value={newStop}
              onChange={(event) => setNewStop(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addStop();
                }
              }}
            />
            <OrgButton variant="secondary" disabled={!newStop.trim()} onClick={addStop}>
              {t("screen.organization.trips.tripWizardStep2ScheduleAndRoute.addStop")}
            </OrgButton>
          </div>
        </OrgCard>
      </OrgRow>
      <MapPickerStrip />
    </TripWizardFrame>
  );
}
