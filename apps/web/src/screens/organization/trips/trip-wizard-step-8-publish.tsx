// SCR-ORG-12 Trip wizard step 8: readiness checklist, publish mode and the monthly trip limit.
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgButtonLink, useOrgNavigate } from "../common/org-link";
import { OrgChoice, OrgInput } from "../common/org-form";
import {
  TripWizardFrame,
  getActiveWizardTripId,
  wizardStepSlug,
  type TripWizardStepId,
} from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgAlert, OrgBadge, OrgCard, OrgKpi, OrgRow } from "../common/org-ui";
import { limitText, useOrgPlan, useWizardTrip } from "./trip-parts";

type RequiredStep = Exclude<TripWizardStepId, "publish">;
type PublishMode = "public" | "draft" | "targeted";

const REQUIRED_STEPS: readonly RequiredStep[] = [
  "basics",
  "schedule",
  "vehicles",
  "staffing",
  "programs",
  "seating",
  "pricing",
];

const STEP_LABEL_KEY: Record<RequiredStep, string> = {
  basics: "screen.organization.trips.tripWizardStep8Publish.basics",
  schedule: "screen.organization.trips.tripWizardStep8Publish.scheduleAndRoute",
  vehicles: "screen.organization.trips.tripWizardStep8Publish.vehicles",
  staffing: "screen.organization.trips.tripWizardStep8Publish.staffing",
  programs: "screen.organization.trips.tripWizardStep8Publish.programs",
  seating: "screen.organization.trips.tripWizardStep8Publish.seating",
  pricing: "screen.organization.trips.tripWizardStep8Publish.pricingAndCapacity",
};

interface ChecklistRow {
  step: RequiredStep;
  number: number;
  complete: boolean;
  /** A staffing gap the step leaves open (missing driver or moderator). */
  gap: string | null;
}

const BLOCKED_NOTE_ID = "trip-publish-blocked-note";

function isThisMonth(value: string | Date | null | undefined): boolean {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function TripWizardStep8Publish() {
  const { authStatus, tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const goTo = useOrgNavigate();
  const { limits } = useOrgPlan();
  const [publishMode, setPublishMode] = useState<PublishMode>("public");
  const [audienceList, setAudienceList] = useState("");
  const [actionFailed, setActionFailed] = useState(false);

  const tripsQuery = useQuery({
    ...orpc.trips.listOrganizationTrips.queryOptions({ input: {} }),
    enabled: authStatus === "authenticated",
  });

  useEffect(() => {
    if (tripQuery.data) {
      const detail = tripQuery.data;
      setPublishMode(
        detail.publishMode === "targeted" || detail.publishMode === "draft"
          ? detail.publishMode
          : "public",
      );
      setAudienceList(detail.targetedAudienceIds.join(", "));
    }
  }, [tripQuery.data]);

  const saveWizardStepMutation = useMutation(
    orpc.trips.saveWizardStep.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const publishMutation = useMutation(
    orpc.trips.publish.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const detail = tripQuery.data;
  const missingDriver = detail?.vehicles.find((vehicle) => vehicle.driverSource === "unassigned");
  const missingModerator = detail?.vehicles.find(
    (vehicle) => vehicle.moderatorSource === "unassigned",
  );
  const staffingGap = missingDriver
    ? t("screen.organization.trips.tripWizardStep8Publish.missingDriver")
    : missingModerator
      ? t("screen.organization.trips.tripWizardStep8Publish.missingModerator")
      : null;

  const checklist: readonly ChecklistRow[] = REQUIRED_STEPS.map((step, index) => {
    const gap = step === "staffing" ? staffingGap : null;
    return {
      step,
      number: index + 1,
      complete: Boolean(detail?.wizardSteps[step]) && !gap,
      gap,
    };
  });
  const firstIncomplete = detail ? checklist.find((row) => !row.complete) : undefined;
  const blocked = Boolean(firstIncomplete);

  const blockedReason = (() => {
    if (!firstIncomplete) return null;
    if (missingDriver && firstIncomplete.step === "staffing") {
      return t("screen.organization.trips.tripWizardStep8Publish.blockedMissingDriver", {
        plate: missingDriver.plateNumber ?? NO_VALUE,
      });
    }
    if (missingModerator && firstIncomplete.step === "staffing") {
      return t("screen.organization.trips.tripWizardStep8Publish.blockedMissingModerator", {
        plate: missingModerator.plateNumber ?? NO_VALUE,
      });
    }
    return t("screen.organization.trips.tripWizardStep8Publish.blockedIncompleteStep", {
      step: t(STEP_LABEL_KEY[firstIncomplete.step]),
    });
  })();

  const parseAudienceIds = (): string[] =>
    audienceList
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);

  const handleSaveDraft = async (): Promise<boolean> => {
    if (authStatus !== "authenticated") return true;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return true;
    setActionFailed(false);
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "publish",
        publishMode,
        targetedAudienceIds: parseAudienceIds(),
        vipEarlyAccessUntil: null,
      });
      return true;
    } catch {
      setActionFailed(true);
      return false;
    }
  };

  const handlePublish = async () => {
    if (authStatus !== "authenticated") return;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return;
    if (publishMode === "draft") {
      await handleSaveDraft();
      return;
    }
    setActionFailed(false);
    try {
      await publishMutation.mutateAsync({
        tripId: currentTripId,
        publishMode,
        targetedAudienceIds: parseAudienceIds(),
        vipEarlyAccessUntil: null,
      });
      void goTo("trip-command-view", { tripId: currentTripId });
    } catch {
      setActionFailed(true);
    }
  };

  const columns: readonly OrgColumn<ChecklistRow>[] = [
    {
      key: "step",
      header: t("screen.organization.trips.tripWizardStep8Publish.requiredStep"),
      render: (row) => t(STEP_LABEL_KEY[row.step]),
    },
    {
      key: "status",
      header: t("screen.organization.trips.tripWizardStep8Publish.status"),
      render: (row) => {
        if (row.complete)
          return (
            <OrgBadge tone="ok">
              {t("screen.organization.trips.tripWizardStep8Publish.complete")}
            </OrgBadge>
          );
        if (row.gap) return <OrgBadge tone="err">{row.gap}</OrgBadge>;
        if (!detail) return <OrgBadge tone="neu">{NO_VALUE}</OrgBadge>;
        return (
          <OrgBadge tone="warn">
            {t("screen.organization.trips.tripWizardStep8Publish.incomplete")}
          </OrgBadge>
        );
      },
    },
    {
      key: "action",
      header: t("screen.organization.trips.tripWizardStep8Publish.action"),
      render: (row) => (
        <OrgButtonLink slug={wizardStepSlug(row.step)} variant="text">
          {row.complete
            ? t("screen.organization.trips.tripWizardStep8Publish.open")
            : t("screen.organization.trips.tripWizardStep8Publish.openStepN", { n: row.number })}
        </OrgButtonLink>
      ),
    },
  ];

  const publishedThisMonth = tripsQuery.isSuccess
    ? tripsQuery.data.items.filter((trip) => isThisMonth(trip.publishedAt)).length
    : null;
  const modes: readonly { value: PublishMode; key: string }[] = [
    { value: "public", key: "screen.organization.trips.tripWizardStep8Publish.public" },
    { value: "draft", key: "screen.organization.trips.tripWizardStep8Publish.draft" },
    {
      value: "targeted",
      key: "screen.organization.trips.tripWizardStep8Publish.targetedAudienceList",
    },
  ];

  return (
    <TripWizardFrame
      stepId="publish"
      title={t("screen.organization.trips.tripWizardStep8Publish.publishTrip")}
      tripName={tripName}
      primaryLabel={t("screen.organization.trips.tripWizardStep8Publish.publish")}
      secondaryLabel={t("screen.organization.trips.tripWizardStep8Publish.saveDraft")}
      primaryDisabled={blocked || (authStatus === "authenticated" && !tripId)}
      primaryDescribedBy={BLOCKED_NOTE_ID}
      busy={publishMutation.isPending || saveWizardStepMutation.isPending}
      onPrimary={handlePublish}
      onSaveDraft={async () => {
        await handleSaveDraft();
      }}
      footerNote={
        <p id={BLOCKED_NOTE_ID} className="te-caption m-0 text-end text-[var(--te-ink-muted)]">
          {t("screen.organization.trips.tripWizardStep8Publish.publishUnlocksNote")}
        </p>
      }
    >
      {blockedReason ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep8Publish.publishBlocked")}
        >
          {blockedReason}
        </OrgAlert>
      ) : null}
      {actionFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep8Publish.actionFailedTitle")}
        >
          {t("screen.organization.trips.tripWizardStep8Publish.actionFailedBody")}
        </OrgAlert>
      ) : null}
      <OrgRow align="start">
        <OrgCard
          title={t("screen.organization.trips.tripWizardStep8Publish.readinessChecklist")}
          className="lg:flex-[2]"
        >
          <OrgTable
            columns={columns}
            rows={checklist}
            rowKey={(row) => row.step}
            caption={t("screen.organization.trips.tripWizardStep8Publish.readinessChecklist")}
            loading={tripQuery.isLoading}
          />
        </OrgCard>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <OrgCard title={t("screen.organization.trips.tripWizardStep8Publish.publishMode")}>
            <fieldset className="m-0 flex flex-col border-0 p-0">
              <legend className="sr-only">
                {t("screen.organization.trips.tripWizardStep8Publish.publishMode")}
              </legend>
              {modes.map((mode) => (
                <OrgChoice
                  key={mode.value}
                  type="radio"
                  name="publish-mode"
                  checked={publishMode === mode.value}
                  onChange={() => setPublishMode(mode.value)}
                >
                  {t(mode.key)}
                </OrgChoice>
              ))}
            </fieldset>
            {publishMode === "targeted" ? (
              <OrgInput
                label={t("screen.organization.trips.tripWizardStep8Publish.audienceList")}
                hint={t("screen.organization.trips.tripWizardStep8Publish.audienceListHint")}
                value={audienceList}
                onChange={(event) => setAudienceList(event.target.value)}
              />
            ) : null}
          </OrgCard>
          <OrgKpi
            label={t("screen.organization.trips.tripWizardStep8Publish.tripsPublishedThisMonth")}
            value={
              publishedThisMonth === null || publishedThisMonth === undefined
                ? NO_VALUE
                : t("screen.organization.trips.tripWizardStep8Publish.nOfLimit", {
                    n: publishedThisMonth,
                    limit: limitText(limits, "activeTripsPerMonth"),
                  })
            }
          />
        </div>
      </OrgRow>
    </TripWizardFrame>
  );
}
