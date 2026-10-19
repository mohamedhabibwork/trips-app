// SCR-ORG-15 Cancel trip decision: the reason, what happens to bookings, and the final confirm.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgTextarea } from "../common/org-form";
import { OrgButtonLink, useOrgNavigate, useOrgParams } from "../common/org-link";
import { getSelectedTripId, isoDay, toTripState, tripTitle } from "../common/org-shared";
import {
  NO_VALUE,
  OrgAlert,
  OrgButton,
  OrgCard,
  OrgError,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import { OrgFieldLabel } from "./trip-parts";

/** The cancel input needs at least this many characters of reason. */
const MIN_REASON_LENGTH = 3;
const BLOCKED_NOTE_ID = "trip-cancel-blocked-note";

export function CancelTripDecision() {
  const { status: authStatus, locale } = useAuth();
  const params = useOrgParams();
  const queryClient = useQueryClient();
  const goTo = useOrgNavigate();
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | undefined>(undefined);
  const [cancelFailed, setCancelFailed] = useState(false);
  const signedIn = authStatus === "authenticated";

  const knownTripId = params.tripId ?? getSelectedTripId();
  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: signedIn && !knownTripId,
  });
  const tripId = knownTripId || tripsQuery.data?.items[0]?.id || null;

  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: tripId ?? "" } }),
    enabled: signedIn && Boolean(tripId),
  });

  const cancelTripMutation = useMutation(
    orpc.trips.cancel.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const detail = tripQuery.data;
  const state = detail ? toTripState(detail.state) : null;
  const inProgress = state === "In Progress";
  const start = isoDay(detail?.startsAt);
  const end = isoDay(detail?.endsAt);
  const caption = [
    detail ? tripTitle(detail, locale) : null,
    start && end
      ? t("screen.organization.trips.cancelTripDecision.dateRange", { start, end })
      : start,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleCancel = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) {
      setReasonError(t("screen.organization.trips.cancelTripDecision.reasonRequired"));
      return;
    }
    setReasonError(undefined);
    if (!signedIn || !tripId) return;
    setCancelFailed(false);
    try {
      await cancelTripMutation.mutateAsync({ tripId, reason: trimmed });
      void goTo("trip-command-view", { tripId });
    } catch {
      setCancelFailed(true);
    }
  };

  return (
    <OrgPage>
      <OrgPageHeader
        title={t("screen.organization.trips.cancelTripDecision.cancelTrip")}
        caption={caption || undefined}
      />
      <OrgAlert
        tone="err"
        title={t("screen.organization.trips.cancelTripDecision.cannotBeUndoneTitle")}
      >
        {t("screen.organization.trips.cancelTripDecision.cannotBeUndoneBody")}
      </OrgAlert>
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
      {cancelFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.cancelTripDecision.cancelFailedTitle")}
        >
          {t("screen.organization.trips.cancelTripDecision.cancelFailedBody")}
        </OrgAlert>
      ) : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.trips.cancelTripDecision.reason")}
          className="flex-1"
        >
          <OrgTextarea
            label={t("screen.organization.trips.cancelTripDecision.reasonLabel")}
            rows={4}
            dir="auto"
            required
            maxLength={500}
            value={reason}
            error={reasonError}
            onChange={(event) => setReason(event.target.value)}
          />
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.trips.cancelTripDecision.auditNote")}
          </p>
        </OrgCard>
        <OrgCard
          title={t("screen.organization.trips.cancelTripDecision.whatHappensNext")}
          className="flex-1"
        >
          <div className="flex flex-col">
            <OrgFieldLabel>
              {t("screen.organization.trips.cancelTripDecision.affectedBookings")}
            </OrgFieldLabel>
            <b className="text-[28px] leading-9 font-semibold">
              {detail
                ? t("screen.organization.trips.cancelTripDecision.nConfirmed", {
                    n: detail.confirmedSeatsCount,
                  })
                : NO_VALUE}
            </b>
          </div>
          <div className="flex flex-col gap-1">
            <OrgFieldLabel>
              {t("screen.organization.trips.cancelTripDecision.refundPolicy")}
            </OrgFieldLabel>
            <p className="m-0 text-base leading-6">
              {t("screen.organization.trips.cancelTripDecision.refundPolicySummary")}
            </p>
          </div>
          <ul className="m-0 flex flex-col gap-1 ps-5 text-sm leading-5">
            <li>{t("screen.organization.trips.cancelTripDecision.bookingsMoveToCancelled")}</li>
            <li>{t("screen.organization.trips.cancelTripDecision.travelersNotified")}</li>
            <li>{t("screen.organization.trips.cancelTripDecision.refundsQueued")}</li>
          </ul>
        </OrgCard>
      </OrgRow>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap justify-end gap-3">
          <OrgButtonLink slug="trip-command-view" params={{ tripId }} variant="secondary">
            {t("screen.organization.trips.cancelTripDecision.keepTrip")}
          </OrgButtonLink>
          <OrgButton
            disabled={inProgress || cancelTripMutation.isPending || (signedIn && !tripId)}
            aria-describedby={BLOCKED_NOTE_ID}
            onClick={() => void handleCancel()}
          >
            {t("screen.organization.trips.cancelTripDecision.cancelTrip")}
          </OrgButton>
        </div>
        <p id={BLOCKED_NOTE_ID} className="te-caption m-0 text-end text-[var(--te-ink-muted)]">
          {t("screen.organization.trips.cancelTripDecision.blockedWhileInProgress")}
        </p>
      </div>
    </OrgPage>
  );
}
