import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeKpiTile } from "@trips-app/ui/components/te-kpi-tile";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import {
  OrgSection,
  TripWizardFrame,
  getActiveWizardTripId,
  setSelectedProgramId,
} from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface TripProgramRow {
  id: string;
  name: string;
  pricingModel: string;
  typeFlags: string;
  cap: string;
}

const COLUMNS = (): readonly TeDataTableColumn<TripProgramRow>[] => [
  {
    key: "name",
    header: t("screen.organization.trips.tripWizardStep5Programs.program"),
    render: (row) => (
      <OrgLink slug="program-editor" onClick={() => setSelectedProgramId(row.id)}>
        {row.name}
      </OrgLink>
    ),
  },
  {
    key: "pricingModel",
    header: t("screen.organization.trips.tripWizardStep5Programs.pricingModel"),
  },
  { key: "typeFlags", header: t("screen.organization.trips.tripWizardStep5Programs.typeFlags") },
  { key: "cap", header: t("screen.organization.trips.tripWizardStep5Programs.cap"), align: "end" },
];

export function TripWizardStep5Programs() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const tripId = getActiveWizardTripId();

  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(tripId),
  });

  const rows: readonly TripProgramRow[] =
    programsQuery.data?.items.map((item) => ({
      id: item.id,
      name: item.titleEn || item.titleAr,
      pricingModel: item.isIncludedInBase
        ? "Included"
        : `${(item.priceMinor / 100).toFixed(2)} ${item.currencyCode}`,
      typeFlags: `Day ${item.dayNumber}`,
      cap: item.capacity !== null ? String(item.capacity) : "Unlimited",
    })) ?? [];

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
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "programs",
        notes: "Programs reviewed",
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t("screen.organization.trips.tripWizardStep5Programs.tripWizardStep5Programs")}
        stepId="programs"
        previousSlug="trip-wizard-step-4-staffing"
        nextSlug="trip-wizard-step-6-seating"
        beforeNext={saveStep}
        onSaveDraft={async () => {
          await saveStep();
        }}
      >
        <TeKpiTile
          label={t("screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip")}
          value={
            authStatus === "authenticated"
              ? `${rows.length} of 15`
              : t("screen.organization.trips.tripWizardStep5Programs.0Of15")
          }
          hint={t("screen.organization.trips.tripWizardStep5Programs.growthPlanLimitPerTrip")}
        />
        <OrgSection
          title={t("screen.organization.trips.tripWizardStep5Programs.programs")}
          actions={
            <OrgButtonLink
              slug="program-editor"
              variant="secondary"
              onClick={() => setSelectedProgramId(null)}
            >
              {t("screen.organization.trips.tripWizardStep5Programs.addProgram")}
            </OrgButtonLink>
          }
        >
          <TeDataTable
            columns={COLUMNS()}
            rows={rows}
            getRowKey={(row) => row.id}
            caption={t(
              "screen.organization.trips.tripWizardStep5Programs.programsOnThisTripCaption",
            )}
            emptyTitle={t("screen.organization.trips.tripWizardStep5Programs.noProgramsYet")}
            emptyDescription={t(
              "screen.organization.trips.tripWizardStep5Programs.addAProgramOrContinue",
            )}
          />
        </OrgSection>
      </TripWizardFrame>
    </StatePreview>
  );
}
