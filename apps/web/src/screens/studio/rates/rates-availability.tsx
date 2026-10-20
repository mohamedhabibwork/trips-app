// SCR-PHO-04 Rates and availability: a month calendar of unavailable/assigned days, the range
// form and the per-service starting rates (docs/design/web/PhoWebRates.dc.html). Blocks persist
// through `availability.listMyBlocks / upsertBlock / deleteBlock`; the per-service rates have no
// store yet, so that card keeps its structure and explains how rates are actually agreed.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { TeIcon } from "@trips-app/ui/components/te-icon";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions, serverQueryOptions } from "@/utils/server-rpc";

import {
  NO_VALUE,
  StudioButton,
  StudioCard,
  StudioNotice,
  StudioPage,
  StudioPageHeader,
  StudioRow,
} from "../studio-ui";

/** `YYYY-MM-DD` of a Date in UTC (block windows are whole days). */
function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function startOfUtcDay(day: string): Date {
  return new Date(`${day}T00:00:00.000Z`);
}

function addDays(day: string, count: number): string {
  const date = startOfUtcDay(day);
  date.setUTCDate(date.getUTCDate() + count);
  return isoDay(date);
}

interface DayCell {
  day: string;
  label: number;
  inMonth: boolean;
  past: boolean;
  unavailable: boolean;
  assigned: boolean;
  today: boolean;
}

const RATE_SERVICES = ["dayTrip", "multiDay", "halfDay"] as const;

export function RatesAvailability() {
  const { t, locale } = useAuth();
  const enabled = typeof window !== "undefined";
  const queryClient = useQueryClient();

  const blocksQuery = useQuery({
    ...serverQueryOptions(orpc.availability.listMyBlocks, "availability/listMyBlocks", {
      input: undefined,
      enabled,
      retry: false,
    }),
  });

  const [monthOffset, setMonthOffset] = useState(0);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [rangeError, setRangeError] = useState<string | undefined>(undefined);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const upsertMutation = useMutation(
    serverMutationOptions(orpc.availability.upsertBlock, "availability/upsertBlock", {
      onSuccess: () => {
        setSavedAt(new Date().toISOString().slice(11, 16));
        setRangeError(undefined);
        void queryClient.invalidateQueries({ queryKey: orpc.availability.key() });
      },
      onError: () => setRangeError(t("screen.studio.rates.blockFailed")),
    }),
  );
  const deleteMutation = useMutation(
    serverMutationOptions(orpc.availability.deleteBlock, "availability/deleteBlock", {
      onSuccess: () => {
        setSavedAt(new Date().toISOString().slice(11, 16));
        void queryClient.invalidateQueries({ queryKey: orpc.availability.key() });
      },
    }),
  );

  const blocks = blocksQuery.data?.items ?? [];
  const byDay = useMemo(() => {
    const map = new Map<string, { unavailable: boolean; assigned: boolean; blockId?: string }>();
    for (const block of blocks) {
      let cursor = isoDay(new Date(block.startsAt));
      const end = isoDay(new Date(block.endsAt));
      let guard = 0;
      while (cursor <= end && guard < 370) {
        const entry = map.get(cursor) ?? { unavailable: false, assigned: false };
        if (block.blockType === "unavailable") {
          entry.unavailable = true;
          entry.blockId = block.id;
        }
        if (block.blockType === "assigned_trip") entry.assigned = true;
        map.set(cursor, entry);
        cursor = addDays(cursor, 1);
        guard += 1;
      }
    }
    return map;
  }, [blocks]);

  const cells = useMemo<DayCell[]>(() => {
    const base = new Date();
    base.setUTCDate(1);
    base.setUTCMonth(base.getUTCMonth() + monthOffset);
    const year = base.getUTCFullYear();
    const month = base.getUTCMonth();
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const today = isoDay(new Date());
    const list: DayCell[] = [];
    for (let index = 0; index < firstWeekday; index += 1) {
      const day = addDays(isoDay(new Date(Date.UTC(year, month, 1))), index - firstWeekday);
      list.push({
        day,
        label: new Date(`${day}T00:00:00.000Z`).getUTCDate(),
        inMonth: false,
        past: true,
        unavailable: false,
        assigned: false,
        today: false,
      });
    }
    for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
      const day = isoDay(new Date(Date.UTC(year, month, dayNumber)));
      const entry = byDay.get(day);
      list.push({
        day,
        label: dayNumber,
        inMonth: true,
        past: day < today,
        unavailable: entry?.unavailable === true,
        assigned: entry?.assigned === true,
        today: day === today,
      });
    }
    while (list.length % 7 !== 0) {
      const last = list[list.length - 1]?.day ?? today;
      const day = addDays(last, 1);
      list.push({
        day,
        label: new Date(`${day}T00:00:00.000Z`).getUTCDate(),
        inMonth: false,
        past: true,
        unavailable: false,
        assigned: false,
        today: false,
      });
    }
    return list;
  }, [monthOffset, byDay]);

  const monthTitle = useMemo(() => {
    const base = new Date();
    base.setUTCDate(1);
    base.setUTCMonth(base.getUTCMonth() + monthOffset);
    return new Intl.DateTimeFormat(locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(base);
  }, [monthOffset, locale]);

  const weekdays = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
    return Array.from({ length: 7 }, (_, index) =>
      format.format(new Date(Date.UTC(2026, 9, 4 + index))),
    );
  }, [locale]);

  function toggleDay(cell: DayCell) {
    if (cell.past || cell.assigned) return;
    if (cell.unavailable) {
      const blockId = byDay.get(cell.day)?.blockId;
      if (blockId) deleteMutation.mutate({ blockId });
      return;
    }
    upsertMutation.mutate({
      blockType: "unavailable",
      startsAt: startOfUtcDay(cell.day).toISOString(),
      endsAt: startOfUtcDay(addDays(cell.day, 1)).toISOString(),
    });
  }

  function markRange() {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(rangeFrom) || !/^\d{4}-\d{2}-\d{2}$/.test(rangeTo)) {
      setRangeError(t("screen.studio.rates.rangeInvalid"));
      return;
    }
    if (rangeTo < rangeFrom) {
      setRangeError(t("screen.studio.rates.rangeInvalid"));
      return;
    }
    if (rangeFrom < isoDay(new Date())) {
      setRangeError(t("screen.studio.rates.rangePast"));
      return;
    }
    upsertMutation.mutate({
      blockType: "unavailable",
      startsAt: startOfUtcDay(rangeFrom).toISOString(),
      endsAt: startOfUtcDay(addDays(rangeTo, 1)).toISOString(),
    });
  }

  const rangeDays =
    /^\d{4}-\d{2}-\d{2}$/.test(rangeFrom) &&
    /^\d{4}-\d{2}-\d{2}$/.test(rangeTo) &&
    rangeTo >= rangeFrom
      ? Math.round(
          (startOfUtcDay(rangeTo).getTime() - startOfUtcDay(rangeFrom).getTime()) / 86_400_000,
        ) + 1
      : null;

  const busy = upsertMutation.isPending || deleteMutation.isPending;

  return (
    <StudioPage>
      <StudioPageHeader
        title={t("screen.studio.rates.title")}
        caption={t("screen.studio.rates.caption")}
        actions={
          <>
            {savedAt ? (
              <span role="status" className="text-sm font-semibold text-[var(--te-success)]">
                {t("screen.studio.rates.saved", { when: savedAt })}
              </span>
            ) : null}
            <span className="text-sm text-[var(--te-ink-muted)]">
              {busy ? t("screen.studio.common.saving") : ""}
            </span>
          </>
        }
      />

      <StudioRow align="start">
        <StudioCard className="basis-[600px] lg:flex-[3]">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-label={t("screen.studio.rates.previousMonth")}
              onClick={() => setMonthOffset((value) => value - 1)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[var(--te-control-border)] bg-[var(--te-surface-raised)]"
            >
              <TeIcon name="back" className="size-5" />
            </button>
            <h2 className="m-0 text-xl font-semibold">{monthTitle}</h2>
            <button
              type="button"
              aria-label={t("screen.studio.rates.nextMonth")}
              onClick={() => setMonthOffset((value) => value + 1)}
              className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-[var(--te-control-border)] bg-[var(--te-surface-raised)]"
            >
              <TeIcon name="arrow" className="size-5" />
            </button>
            <span className="flex-1" />
            <span className="text-[13px] text-[var(--te-ink-muted)]">
              {t("screen.studio.rates.calendarHint")}
            </span>
          </div>

          <div role="grid" aria-label={monthTitle} className="grid grid-cols-7 gap-1.5">
            {weekdays.map((weekday) => (
              <span
                key={weekday}
                role="columnheader"
                className="py-1 text-center text-[13px] font-semibold text-[var(--te-ink-muted)]"
              >
                {weekday}
              </span>
            ))}
            {cells.map((cell) => {
              const disabled = cell.past || cell.assigned;
              const active = cell.unavailable;
              return (
                <button
                  key={cell.day}
                  type="button"
                  role="gridcell"
                  aria-pressed={active}
                  aria-label={`${cell.day}${
                    cell.assigned
                      ? `, ${t("screen.studio.rates.legendAssigned")}`
                      : active
                        ? `, ${t("screen.studio.rates.legendUnavailable")}`
                        : ""
                  }`}
                  disabled={disabled || !cell.inMonth}
                  onClick={() => toggleDay(cell)}
                  className={`flex min-h-16 cursor-pointer flex-col items-start justify-between gap-0.5 rounded-[var(--te-radius-md)] border p-1.5 text-start ${
                    !cell.inMonth
                      ? "border-0 bg-transparent opacity-40"
                      : cell.assigned
                        ? "border-[var(--te-ink)] bg-[var(--te-info-soft)]"
                        : active
                          ? "border-[var(--te-ink)] bg-[var(--te-ink)] text-[var(--te-ink-inverse)]"
                          : cell.today
                            ? "border-2 border-[var(--te-accent)] bg-[var(--te-surface-raised)]"
                            : cell.past
                              ? "border-[var(--te-hairline)] bg-[var(--te-surface)] text-[var(--te-ink-muted)]"
                              : "border-[var(--te-hairline)] bg-[var(--te-surface-raised)]"
                  } disabled:cursor-not-allowed`}
                >
                  <span className="text-[15px] font-semibold">
                    {cell.inMonth ? cell.label : ""}
                  </span>
                  {cell.assigned ? (
                    <span className="text-[11px] font-bold">
                      {t("screen.studio.rates.legendAssigned")}
                    </span>
                  ) : active ? (
                    <span className="text-[11px] font-bold">
                      {t("screen.studio.rates.legendUnavailable")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 text-[13px] text-[var(--te-ink-muted)]">
            <LegendSwatch
              className="bg-[var(--te-ink)]"
              label={t("screen.studio.rates.legendUnavailable")}
            />
            <LegendSwatch
              className="border border-[var(--te-ink)] bg-[var(--te-info-soft)]"
              label={t("screen.studio.rates.legendAssigned")}
            />
          </div>
        </StudioCard>

        <div className="flex min-w-0 basis-[360px] flex-[2] flex-col gap-4">
          <StudioCard title={t("screen.studio.rates.rangeTitle")}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm leading-5">
                <span className="font-semibold">{t("screen.studio.rates.from")}</span>
                <input
                  type="date"
                  value={rangeFrom}
                  onChange={(event) => setRangeFrom(event.target.value)}
                  className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3 text-base"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm leading-5">
                <span className="font-semibold">{t("screen.studio.rates.to")}</span>
                <input
                  type="date"
                  value={rangeTo}
                  onChange={(event) => setRangeTo(event.target.value)}
                  className="h-12 rounded-[var(--te-radius-sm)] border border-[var(--te-control-border)] bg-[var(--te-surface-raised)] px-3 text-base"
                />
              </label>
            </div>
            {rangeError ? (
              <span role="alert" className="text-[13px] font-semibold text-[var(--te-danger)]">
                {rangeError}
              </span>
            ) : null}
            <StudioButton variant="secondary" onClick={markRange} disabled={busy}>
              {t("screen.studio.rates.markRange", { count: rangeDays ?? 0 })}
            </StudioButton>
            <span className="text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
              {t("screen.studio.rates.rangeCaption")}
            </span>
          </StudioCard>

          <StudioCard title={t("screen.studio.rates.ratesTitle")}>
            <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
              {t("screen.studio.rates.ratesCaption")}
            </p>
            {RATE_SERVICES.map((service) => (
              <ReadOnlyRate
                key={service}
                label={t(`screen.studio.rates.service.${service}`)}
                value={NO_VALUE}
                hint={t("screen.studio.rates.serviceHint")}
              />
            ))}
          </StudioCard>

          <StudioNotice tone="info" title={t("screen.studio.rates.rulesTitle")}>
            <p className="m-0 text-sm leading-5">{t("screen.studio.rates.rulesBody")}</p>
          </StudioNotice>
        </div>
      </StudioRow>
    </StudioPage>
  );
}

function LegendSwatch({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true" className={`inline-block size-3.5 rounded ${className}`} />
      {label}
    </span>
  );
}

function ReadOnlyRate({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm leading-5">
      <span className="font-semibold">{label}</span>
      <span className="flex h-12 items-center justify-between rounded-[var(--te-radius-sm)] border border-[var(--te-hairline)] bg-[var(--te-surface)] px-3.5 text-base text-[var(--te-ink-muted)]">
        {value}
        <span className="text-sm font-semibold">EGP</span>
      </span>
      <span className="text-[13px] leading-[18px] text-[var(--te-ink-muted)]">{hint}</span>
    </label>
  );
}
