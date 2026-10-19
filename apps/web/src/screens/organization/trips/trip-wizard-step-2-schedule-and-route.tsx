// SCR-ORG-06 Trip wizard step 2: dates, time zone, origin and the ordered stops of the route.
// Every value is entered here or comes from the API: places from the SERVICE_REGION lookup and
// time zones from the TIMEZONE lookup. Nothing is pre-filled except what the draft already holds.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import {
  localizeLookupText,
  lookupTypeByCodeQueryOptions,
  type LookupItemDto,
} from "@/utils/lookups";
import { orpc } from "@/utils/orpc";
import { utcToZoned, zonedToUtcIso } from "@/utils/zoned-time";

import { OrgInput, OrgSelect } from "../common/org-form";
import { TripWizardFrame } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { OrgBadge, OrgButton, OrgCard, OrgError, OrgRow } from "../common/org-ui";
import { WizardSaveAlert, useWizardStepSave, useWizardTrip } from "./trip-parts";

const CHOOSE = "";
const KEY = "screen.organization.trips.tripWizardStep2ScheduleAndRoute";

/** A place on the route as the trips API stores it. */
interface RoutePoint {
  nameAr: string;
  nameEn: string;
  latitude?: number | null;
  longitude?: number | null;
  regionLookupCode?: string | null;
}

interface ScheduleForm {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timezone: string;
  origin: RoutePoint | null;
  stops: readonly RoutePoint[];
}

type FieldErrors = Partial<Record<"start" | "end" | "timezone" | "origin" | "stops", string>>;

const EMPTY_FORM: ScheduleForm = {
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  timezone: CHOOSE,
  origin: null,
  stops: [],
};

function pointFromRegion(item: LookupItemDto): RoutePoint {
  return {
    nameAr: item.name.ar || item.name.en,
    nameEn: item.name.en || item.name.ar,
    regionLookupCode: item.code,
  };
}

/** Option value of a point: its region code, or its name for an older point without one. */
function pointValue(point: RoutePoint): string {
  return point.regionLookupCode ?? `name:${point.nameEn}`;
}

function pointLabel(point: RoutePoint, locale: string): string {
  return locale === "ar" ? point.nameAr || point.nameEn : point.nameEn || point.nameAr;
}

interface CheckedSchedule {
  errors: FieldErrors;
  startsAt: string | null;
  endsAt: string | null;
}

function validate(form: ScheduleForm): CheckedSchedule {
  const errors: FieldErrors = {};
  const zone = form.timezone;
  const startsAt = zone
    ? zonedToUtcIso({ date: form.startDate, time: form.startTime }, zone)
    : null;
  const endsAt = zone ? zonedToUtcIso({ date: form.endDate, time: form.endTime }, zone) : null;
  if (!zone) errors.timezone = t(`${KEY}.timeZoneRequired`);
  if (!startsAt) errors.start = t(`${KEY}.startRequired`);
  if (!endsAt) errors.end = t(`${KEY}.endRequired`);
  if (startsAt && endsAt && endsAt <= startsAt) errors.end = t(`${KEY}.endAfterStart`);
  if (!form.origin) errors.origin = t(`${KEY}.originRequired`);
  if (form.stops.length === 0) errors.stops = t(`${KEY}.noStops`);
  return { errors, startsAt, endsAt };
}

/** Route strip (artboard SCR-ORG-06), captioned with the route the form holds. */
function RouteStrip({ caption }: { caption: string }) {
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
      <OrgBadge tone="info" icon="pin" className="absolute start-4 top-4 max-w-[calc(100%-2rem)]">
        <span className="truncate">{caption}</span>
      </OrgBadge>
    </div>
  );
}

interface StopRow {
  key: string;
  name: string;
  order: number;
}

export function TripWizardStep2ScheduleAndRoute() {
  const { authStatus, locale, tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ScheduleForm>(EMPTY_FORM);
  const [newStop, setNewStop] = useState(CHOOSE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const { error: saveError, run } = useWizardStepSave(tripId);
  const signedIn = authStatus === "authenticated";
  const lang = locale === "en" ? "en" : "ar";

  const regionsQuery = useQuery({
    ...lookupTypeByCodeQueryOptions("SERVICE_REGION"),
    enabled: signedIn,
  });
  const timeZonesQuery = useQuery({
    ...lookupTypeByCodeQueryOptions("TIMEZONE"),
    enabled: signedIn,
  });

  useEffect(() => {
    const trip = tripQuery.data;
    if (!trip) return;
    const start = trip.startsAt ? utcToZoned(trip.startsAt, trip.timezone) : null;
    const end = trip.endsAt ? utcToZoned(trip.endsAt, trip.timezone) : null;
    setForm({
      startDate: start?.date ?? "",
      startTime: start?.time ?? "",
      endDate: end?.date ?? "",
      endTime: end?.time ?? "",
      timezone: trip.timezone,
      origin: trip.origin ?? null,
      stops: trip.destinations,
    });
  }, [tripQuery.data]);

  const saveWizardStep = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const saveStep = async (): Promise<boolean> => {
    const { errors: found, startsAt, endsAt } = validate(form);
    setErrors(found);
    const origin = form.origin;
    if (Object.keys(found).length > 0 || !startsAt || !endsAt || !origin) return false;
    return run((id) =>
      saveWizardStep.mutateAsync({
        tripId: id,
        step: "schedule",
        startsAt,
        endsAt,
        timezone: form.timezone,
        origin,
        destinations: [...form.stops],
      }),
    );
  };

  const update = (patch: Partial<ScheduleForm>) => setForm((current) => ({ ...current, ...patch }));

  const regionPoints = [...(regionsQuery.data?.lookupType?.items ?? [])]
    .sort((a, b) => a.sortBy - b.sortBy || a.code.localeCompare(b.code))
    .map(pointFromRegion);
  const chooseOption = { value: CHOOSE, label: t(`${KEY}.choosePlace`) };
  const regionOptions = regionPoints.map((point) => ({
    value: pointValue(point),
    label: pointLabel(point, locale),
  }));
  const origin = form.origin;
  // A stored origin that is not a lookup region (an older draft) stays selectable.
  const originOptions = !origin
    ? [chooseOption, ...regionOptions]
    : regionOptions.some((option) => option.value === pointValue(origin))
      ? regionOptions
      : [{ value: pointValue(origin), label: pointLabel(origin, locale) }, ...regionOptions];
  const findPoint = (value: string): RoutePoint | null =>
    regionPoints.find((point) => pointValue(point) === value) ??
    (origin && pointValue(origin) === value ? origin : null);

  const zoneOptions = [...(timeZonesQuery.data?.lookupType?.items ?? [])]
    .sort((a, b) => a.sortBy - b.sortBy || a.code.localeCompare(b.code))
    .map((item) => ({ value: item.value, label: localizeLookupText(item.name, lang) }));
  const timeZoneOptions = !form.timezone
    ? [{ value: CHOOSE, label: t(`${KEY}.chooseTimeZone`) }, ...zoneOptions]
    : zoneOptions.some((option) => option.value === form.timezone)
      ? zoneOptions
      : [{ value: form.timezone, label: form.timezone }, ...zoneOptions];

  const addStop = () => {
    const point = regionPoints.find((candidate) => pointValue(candidate) === newStop);
    if (!point) return;
    update({ stops: [...form.stops, point] });
    setNewStop(CHOOSE);
  };

  const stopRows: readonly StopRow[] = form.stops.map((point, index) => ({
    key: `${index}-${pointValue(point)}`,
    name: pointLabel(point, locale),
    order: index + 1,
  }));

  const stopColumns: readonly OrgColumn<StopRow>[] = [
    { key: "name", header: t(`${KEY}.stop`) },
    { key: "order", header: t(`${KEY}.order`) },
    {
      key: "action",
      header: t(`${KEY}.action`),
      render: (row) => (
        <OrgButton
          variant="text"
          aria-label={t(`${KEY}.removeStop`, { name: row.name })}
          onClick={() =>
            update({ stops: form.stops.filter((_, index) => index !== row.order - 1) })
          }
        >
          {t(`${KEY}.remove`)}
        </OrgButton>
      ),
    },
  ];

  const routePoints = [origin, ...form.stops].filter(
    (point): point is RoutePoint => point !== null,
  );
  const routeCaption =
    routePoints.length > 0
      ? routePoints.map((point) => pointLabel(point, locale)).join(t(`${KEY}.routeSeparator`))
      : t(`${KEY}.routeEmpty`);

  return (
    <TripWizardFrame
      stepId="schedule"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStep.isPending}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      <WizardSaveAlert error={saveError} />
      {regionsQuery.isError || timeZonesQuery.isError ? (
        <OrgError
          onRetry={() => {
            void regionsQuery.refetch();
            void timeZonesQuery.refetch();
          }}
        />
      ) : null}
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
      <OrgRow align="start">
        <OrgCard title={t(`${KEY}.datesAndTimes`)} className="flex-1">
          <div className="grid gap-4 sm:grid-cols-2">
            <OrgInput
              type="date"
              required
              label={t(`${KEY}.startDate`)}
              value={form.startDate}
              error={errors.start}
              onChange={(event) => update({ startDate: event.target.value })}
            />
            <OrgInput
              type="time"
              required
              label={t(`${KEY}.startTime`)}
              value={form.startTime}
              onChange={(event) => update({ startTime: event.target.value })}
            />
            <OrgInput
              type="date"
              required
              label={t(`${KEY}.endDate`)}
              value={form.endDate}
              error={errors.end}
              onChange={(event) => update({ endDate: event.target.value })}
            />
            <OrgInput
              type="time"
              required
              label={t(`${KEY}.endTime`)}
              value={form.endTime}
              onChange={(event) => update({ endTime: event.target.value })}
            />
          </div>
          <OrgSelect
            label={t(`${KEY}.tripTimeZone`)}
            required
            options={timeZoneOptions}
            value={form.timezone}
            error={errors.timezone}
            onValueChange={(value) => update({ timezone: value })}
          />
          <OrgSelect
            label={t(`${KEY}.origin`)}
            required
            options={originOptions}
            value={origin ? pointValue(origin) : CHOOSE}
            error={errors.origin}
            onValueChange={(value) => update({ origin: findPoint(value) })}
          />
        </OrgCard>
        <OrgCard title={t(`${KEY}.destinationsAndStops`)} className="flex-1">
          <OrgTable
            columns={stopColumns}
            rows={stopRows}
            rowKey={(row) => row.key}
            caption={t(`${KEY}.destinationsAndStops`)}
            loading={tripQuery.isLoading}
            empty={t(`${KEY}.noStops`)}
          />
          {errors.stops && form.stops.length === 0 ? (
            <p role="alert" className="m-0 text-sm leading-5 text-[var(--te-danger)]">
              {errors.stops}
            </p>
          ) : null}
          <div className="flex flex-wrap items-end gap-3">
            <OrgSelect
              label={t(`${KEY}.newStop`)}
              fieldClassName="min-w-[200px] flex-1"
              options={[chooseOption, ...regionOptions]}
              value={newStop}
              onValueChange={setNewStop}
            />
            <OrgButton variant="secondary" disabled={!newStop} onClick={addStop}>
              {t(`${KEY}.addStop`)}
            </OrgButton>
          </div>
        </OrgCard>
      </OrgRow>
      <RouteStrip caption={routeCaption} />
    </TripWizardFrame>
  );
}
