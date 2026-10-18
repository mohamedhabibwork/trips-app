import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeChecklist, type TeChecklistItem } from "@trips-app/ui/components/te-checklist";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { TeSelect, type TeSelectOption } from "@trips-app/ui/components/te-select";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgSection, TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

const REQUIRED_STEPS = (): readonly TeChecklistItem[] => [
  {
    id: "basics",
    label: t("screen.organization.trips.tripWizardStep8Publish.basics"),
    checked: true,
  },
  {
    id: "schedule",
    label: t("screen.organization.trips.tripWizardStep8Publish.scheduleAndRoute"),
    checked: true,
  },
  {
    id: "vehicles",
    label: t("screen.organization.trips.tripWizardStep8Publish.vehicles"),
    checked: true,
  },
  {
    id: "staffing",
    label: t("screen.organization.trips.tripWizardStep8Publish.staffing"),
    checked: true,
  },
  {
    id: "programs",
    label: t("screen.organization.trips.tripWizardStep8Publish.programs"),
    checked: true,
  },
  {
    id: "seating",
    label: t("screen.organization.trips.tripWizardStep8Publish.seating"),
    checked: true,
  },
  {
    id: "pricing",
    label: t("screen.organization.trips.tripWizardStep8Publish.pricingAndCapacity"),
    checked: true,
  },
];

const PUBLISH_MODE_OPTIONS = (): readonly TeSelectOption[] => [
  { value: "draft", label: t("screen.organization.trips.tripWizardStep8Publish.saveAsDraft") },
  {
    value: "public",
    label: t("screen.organization.trips.tripWizardStep8Publish.publishToEveryone"),
  },
  {
    value: "targeted",
    label: t("screen.organization.trips.tripWizardStep8Publish.publishToATargetedAudience"),
  },
];

export function TripWizardStep8Publish() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [publishMode, setPublishMode] = useState("public");
  const [audienceList, setAudienceList] = useState("");
  const [checklist, setChecklist] = useState<readonly TeChecklistItem[]>(REQUIRED_STEPS());

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
      setPublishMode(detail.publishMode);
      setAudienceList(detail.targetedAudienceIds.join(", "));
      setChecklist(
        REQUIRED_STEPS().map((step) => ({
          ...step,
          checked: Boolean(detail.wizardSteps[step.id as keyof typeof detail.wizardSteps]),
        })),
      );
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

  const parseAudienceIds = (): string[] =>
    audienceList
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSaveDraft = async () => {
    if (authStatus !== "authenticated") return;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return;
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "publish",
        publishMode:
          publishMode === "targeted" ? "targeted" : publishMode === "draft" ? "draft" : "public",
        targetedAudienceIds: parseAudienceIds(),
        vipEarlyAccessUntil: null,
      });
    } catch {
      // Ignore draft save error in preview
    }
  };

  const handlePublish = async (): Promise<boolean> => {
    if (authStatus !== "authenticated") return true;
    const currentTripId = getActiveWizardTripId();
    if (!currentTripId) return true;
    if (publishMode === "draft") {
      await handleSaveDraft();
      return true;
    }
    try {
      await publishMutation.mutateAsync({
        tripId: currentTripId,
        publishMode: publishMode === "targeted" ? "targeted" : "public",
        targetedAudienceIds: parseAudienceIds(),
        vipEarlyAccessUntil: null,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t("screen.organization.trips.tripWizardStep8Publish.tripWizardStep8Publish")}
        stepId="publish"
        previousSlug="trip-wizard-step-7-pricing-and-capacity"
        nextSlug="trip-command-view"
        primaryLabel={t("screen.organization.trips.tripWizardStep8Publish.publish")}
        secondaryLabel={t("screen.organization.trips.tripWizardStep8Publish.saveDraft")}
        beforeNext={handlePublish}
        onSaveDraft={handleSaveDraft}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeKpiTile
            label={t("screen.organization.trips.tripWizardStep8Publish.tripsPublishedThisMonth")}
            value="0"
            hint={t("screen.organization.trips.tripWizardStep8Publish.monthlyLimitPlanLimit")}
          />
        </div>
        <OrgSection title={t("screen.organization.trips.tripWizardStep8Publish.readiness")}>
          <TeChecklist
            items={checklist}
            ariaLabel={t("screen.organization.trips.tripWizardStep8Publish.requiredSteps")}
          />
        </OrgSection>
        <OrgSection title={t("screen.organization.trips.tripWizardStep8Publish.publishMode")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TeSelect
              label={t("screen.organization.trips.tripWizardStep8Publish.publishModeLabel")}
              options={PUBLISH_MODE_OPTIONS()}
              value={publishMode}
              onValueChange={setPublishMode}
            />
            <TeInput
              label={t("screen.organization.trips.tripWizardStep8Publish.audienceList")}
              placeholder={t(
                "screen.organization.trips.tripWizardStep8Publish.audienceListPlaceholder",
              )}
              value={audienceList}
              onChange={(event) => setAudienceList(event.target.value)}
              supportingText={t(
                "screen.organization.trips.tripWizardStep8Publish.usedOnlyWhenPublishingTo",
              )}
            />
          </div>
        </OrgSection>
      </TripWizardFrame>
    </StatePreview>
  );
}
