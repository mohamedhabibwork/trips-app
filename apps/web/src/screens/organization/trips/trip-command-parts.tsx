// Parts of the trip command view (SCR-ORG-14): the trip state flow and the Ready gap badges.
import { Fragment } from "react";

import { t } from "@trips-app/i18n";

import { TRIP_STATES, tripStateLabel, type TripState } from "../common/org-shared";
import { OrgBadge, OrgFlowArrow } from "../common/org-ui";

/** The main path of a trip, as the artboard draws it. */
const MAIN_FLOW: readonly TripState[] = [
  "Published",
  "Ready",
  "Filling Up",
  "Sold Out",
  "In Progress",
  "Completed",
];

const CANCELLED_STATES: readonly TripState[] = ["Cancelled", "Refunds Issued"];

/** The trip's states in order; past ones done, the current one highlighted, later ones neutral. */
export function TripStateFlow({ current }: { current: TripState }) {
  const states = MAIN_FLOW.includes(current)
    ? MAIN_FLOW
    : [...MAIN_FLOW, current].sort((a, b) => TRIP_STATES.indexOf(a) - TRIP_STATES.indexOf(b));
  const currentIndex = states.indexOf(current);
  const cancelled = CANCELLED_STATES.includes(current);
  return (
    <ol
      aria-label={t("screen.organization.trips.tripCommandParts.tripStateFlow")}
      className="m-0 flex list-none flex-wrap items-center gap-2 p-0"
    >
      {states.map((state, index) => {
        const isCurrent = index === currentIndex;
        const isPast = index < currentIndex && !cancelled;
        return (
          <Fragment key={state}>
            {index > 0 ? (
              <li aria-hidden="true" className="flex">
                <OrgFlowArrow />
              </li>
            ) : null}
            <li aria-current={isCurrent ? "step" : undefined}>
              {isCurrent ? (
                <OrgBadge tone={cancelled ? "err" : "acc"}>
                  {t("screen.organization.trips.tripCommandParts.currentState", {
                    state: tripStateLabel(state),
                  })}
                </OrgBadge>
              ) : (
                <OrgBadge tone={isPast ? "ok" : "neu"} icon={isPast ? "check" : false}>
                  {tripStateLabel(state)}
                </OrgBadge>
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}

/** "Assigned" / "Missing" for staff, "Open" / "None" for a platform deal. */
export function VehicleGapBadge({ assigned, deal = false }: { assigned: boolean; deal?: boolean }) {
  if (deal) {
    return assigned ? (
      <OrgBadge tone="info">{t("screen.organization.trips.tripCommandParts.open")}</OrgBadge>
    ) : (
      <OrgBadge tone="neu">{t("screen.organization.trips.tripCommandParts.none")}</OrgBadge>
    );
  }
  return assigned ? (
    <OrgBadge tone="ok">{t("screen.organization.trips.tripCommandParts.assigned")}</OrgBadge>
  ) : (
    <OrgBadge tone="err">{t("screen.organization.trips.tripCommandParts.missing")}</OrgBadge>
  );
}
