import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { OrgSection, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function CancelTripDecision() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const goTo = useOrgNavigate();
  const [tripId, setTripId] = useState<string | null>(getActiveWizardTripId());
  const [reason, setReason] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeTripId = getActiveWizardTripId();
  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated" && !activeTripId,
  });

  const effectiveTripId = activeTripId || tripsQuery.data?.items[0]?.id || null;

  useEffect(() => {
    if (!activeTripId && tripsQuery.data?.items[0]?.id) {
      setTripId(tripsQuery.data.items[0].id);
    }
  }, [activeTripId, tripsQuery.data]);

  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({
      input: { tripId: effectiveTripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(effectiveTripId),
  });

  const detail = tripQuery.data;
  const tripName = detail ? detail.titleEn || detail.titleAr : "";
  const affectedBookings = detail ? String(detail.confirmedSeatsCount) : "0";
  const refundPolicy = "100% refund on organizer cancellation";

  const hasReason = reason.trim().length > 0;

  const cancelTripMutation = useMutation(
    orpc.trips.cancel.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const handleConfirm = async () => {
    const targetTripId = tripId || effectiveTripId;
    if (authStatus === "authenticated" && targetTripId && hasReason) {
      try {
        await cancelTripMutation.mutateAsync({ tripId: targetTripId, reason: reason.trim() });
      } catch {
        // Proceed with navigation fallback
      }
    }
    setConfirmOpen(false);
    void goTo("trip-command-view");
  };

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "trip-command-view",
            label: t("screen.organization.trips.cancelTripDecision.backToTrip"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.trips.cancelTripDecision.cancelTripDecision")}
          description={tripName}
        />
        <TeInlineAlert
          tone="warning"
          title={t("screen.organization.trips.cancelTripDecision.thisCancelsTheTripFor")}
        >
          {t("screen.organization.trips.cancelTripDecision.confirmedBookingsMoveToCancelled")}
        </TeInlineAlert>
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t("screen.organization.trips.cancelTripDecision.affectedBookings")}
            value={affectedBookings}
          />
          <TeKpiTile
            label={t("screen.organization.trips.cancelTripDecision.refundPolicy")}
            value={refundPolicy}
          />
        </div>
        <OrgSection title={t("screen.organization.trips.cancelTripDecision.reason")}>
          <TeInput
            label={t("screen.organization.trips.cancelTripDecision.reasonForCancellation")}
            placeholder={t("screen.organization.trips.cancelTripDecision.reasonPlaceholder")}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            supportingText={t(
              "screen.organization.trips.cancelTripDecision.requiredTheReasonIsRecorded",
            )}
            dir="auto"
          />
        </OrgSection>
        <TeCard>
          <ul className="flex flex-col gap-2">
            <li className="te-body">
              {t("screen.organization.trips.cancelTripDecision.travelersAreNotifiedOfThe")}
            </li>
            <li className="te-body">
              {t("screen.organization.trips.cancelTripDecision.refundsAreQueuedUnderThe")}
            </li>
          </ul>
        </TeCard>
        <div className="flex flex-wrap justify-end gap-3">
          <OrgButtonLink slug="trip-command-view" variant="secondary">
            {t("screen.organization.trips.cancelTripDecision.keepTrip")}
          </OrgButtonLink>
          <TeButton disabled={!hasReason} onClick={() => setConfirmOpen(true)}>
            {t("screen.organization.trips.cancelTripDecision.cancelTrip")}
          </TeButton>
        </div>
        <TeDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={t("screen.organization.trips.cancelTripDecision.cancelThisTrip")}
          description={t(
            "screen.organization.trips.cancelTripDecision.confirmedBookingsMoveToCancelledDescription",
          )}
          primaryLabel={t("screen.organization.trips.cancelTripDecision.cancelTripPrimaryLabel")}
          onPrimary={() => {
            void handleConfirm();
          }}
          secondaryLabel={t("screen.organization.trips.cancelTripDecision.keepTripSecondaryLabel")}
          onSecondary={() => setConfirmOpen(false)}
          tone="danger"
          confirmDisabled={!hasReason}
        />
      </div>
    </StatePreview>
  );
}
