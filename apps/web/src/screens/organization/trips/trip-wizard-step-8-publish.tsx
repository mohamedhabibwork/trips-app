// SCR-ORG-12 Trip wizard step 8: readiness checklist, publish mode and the monthly trip limit.
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { t } from "@trips-app/i18n";

import { trackEvent } from "@/utils/analytics";
import { orpc } from "@/utils/orpc";
import { serverMutationOptions } from "@/utils/server-rpc";

import { useOrgNavigate } from "../common/org-link";
import { OrgChoice, OrgInput } from "../common/org-form";
import { TripWizardFrame, wizardStepHref, type TripWizardStepId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgCard,
  OrgError,
  OrgKpi,
  OrgRow,
  orgButtonClass,
} from "../common/org-ui";
import {
  WizardSaveAlert,
  limitText,
  useOrgPlan,
  useOrgUsage,
  useWizardStepSave,
  useWizardTrip,
} from "./trip-parts";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

export function TripWizardStep8Publish() {
  const { tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const goTo = useOrgNavigate();
  const { limits } = useOrgPlan();
  const [publishMode, setPublishMode] = useState<PublishMode>("public");
  const [audienceList, setAudienceList] = useState("");
  const [audienceError, setAudienceError] = useState<string | undefined>(undefined);
  const { error: saveError, run } = useWizardStepSave(tripId);

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
    serverMutationOptions(orpc.trips.saveWizardStep, "trips/saveWizardStep", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const publishMutation = useMutation(
    serverMutationOptions(orpc.trips.publish, "trips/publish", {
      onSuccess: () => {
        trackEvent("trip_published", { surface: "organization" });
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
      onError: () => trackEvent("trip_publish_failed", { surface: "organization" }),
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

  /** The audience ids, or null (with a field error) when one is not a valid id. */
  const readAudienceIds = (): string[] | null => {
    if (publishMode !== "targeted") return [];
    const ids = audienceList
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    const valid = ids.length > 0 && ids.every((id) => UUID_PATTERN.test(id));
    setAudienceError(
      valid ? undefined : t("screen.organization.trips.tripWizardStep8Publish.audienceInvalid"),
    );
    return valid ? ids : null;
  };

  const handleSaveDraft = async (): Promise<boolean> => {
    const targetedAudienceIds = readAudienceIds();
    if (!targetedAudienceIds) return false;
    return run((id) =>
      saveWizardStepMutation.mutateAsync({
        tripId: id,
        step: "publish",
        publishMode,
        targetedAudienceIds,
        vipEarlyAccessUntil: null,
      }),
    );
  };

  const handlePublish = async () => {
    if (publishMode === "draft") {
      await handleSaveDraft();
      return;
    }
    const targetedAudienceIds = readAudienceIds();
    if (!targetedAudienceIds) return;
    const published = await run((id) =>
      publishMutation.mutateAsync({
        tripId: id,
        publishMode,
        targetedAudienceIds,
        vipEarlyAccessUntil: null,
      }),
    );
    if (published && tripId) void goTo("trip-command-view", { tripId });
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
        <Link to={wizardStepHref(row.step, tripId)} className={orgButtonClass("text")}>
          {row.complete
            ? t("screen.organization.trips.tripWizardStep8Publish.open")
            : t("screen.organization.trips.tripWizardStep8Publish.openStepN", { n: row.number })}
        </Link>
      ),
    },
  ];

  const usageQuery = useOrgUsage();
  const publishedThisMonth = usageQuery.data?.activeTripsThisMonth ?? null;
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
      tripId={tripId}
      title={t("screen.organization.trips.tripWizardStep8Publish.publishTrip")}
      tripName={tripName}
      primaryLabel={t("screen.organization.trips.tripWizardStep8Publish.publish")}
      secondaryLabel={t("screen.organization.trips.tripWizardStep8Publish.saveDraft")}
      primaryDisabled={blocked || !detail}
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
      <WizardSaveAlert error={saveError} />
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
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
                required
                error={audienceError}
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
