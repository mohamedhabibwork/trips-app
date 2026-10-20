// SCR-ORG-09 Trip wizard step 5: the programs offered on the trip, within the plan's limit.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";
import { serverQueryOptions, serverMutationOptions } from "@/utils/server-rpc";

import { OrgButtonLink, OrgLink } from "../common/org-link";
import { TripWizardFrame, setSelectedProgramId } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import { NO_VALUE, OrgAlert, OrgBadge, OrgCard, OrgEmpty, OrgError } from "../common/org-ui";
import {
  NEW_PROGRAM_ID,
  WizardSaveAlert,
  formatMoney,
  limitText,
  useOrgPlan,
  useWizardStepSave,
  useWizardTrip,
} from "./trip-parts";

interface TripProgramRow {
  id: string;
  tripId: string;
  name: string;
  pricingModel: string;
  typeFlags: string;
  cap: string;
  price: string;
}

function columns(): readonly OrgColumn<TripProgramRow>[] {
  return [
    {
      key: "name",
      header: t("screen.organization.trips.tripWizardStep5Programs.program"),
      render: (row) => (
        <OrgLink
          slug="program-editor"
          params={{ tripId: row.tripId, programId: row.id }}
          className="text-[var(--te-ink)]"
          onClick={() => setSelectedProgramId(row.id)}
        >
          {row.name}
        </OrgLink>
      ),
    },
    {
      key: "pricingModel",
      header: t("screen.organization.trips.tripWizardStep5Programs.pricingModel"),
    },
    { key: "typeFlags", header: t("screen.organization.trips.tripWizardStep5Programs.typeFlags") },
    { key: "cap", header: t("screen.organization.trips.tripWizardStep5Programs.cap") },
    { key: "price", header: t("screen.organization.trips.tripWizardStep5Programs.price") },
  ];
}

export function TripWizardStep5Programs() {
  const { authStatus, locale, tripId, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { limits } = useOrgPlan();
  const { error: saveError, run } = useWizardStepSave(tripId);

  const programsQuery = useQuery({
    ...serverQueryOptions(orpc.programs.listTripPrograms, "programs/listTripPrograms", {
      input: { tripId: tripId ?? "" },
    }),
    enabled: authStatus === "authenticated" && Boolean(tripId),
  });

  const rows: readonly TripProgramRow[] =
    programsQuery.data?.items.map((item) => {
      const free = item.priceMinor === 0;
      const flags = [
        item.isIncludedInBase
          ? t("screen.organization.trips.tripWizardStep5Programs.preRequired")
          : t("screen.organization.trips.tripWizardStep5Programs.optional"),
        item.capacity !== null
          ? t("screen.organization.trips.tripWizardStep5Programs.capacityLimited")
          : null,
      ].filter(Boolean);
      return {
        id: item.id,
        tripId: item.tripId,
        name:
          (locale === "ar" ? item.titleAr || item.titleEn : item.titleEn || item.titleAr) ||
          NO_VALUE,
        pricingModel: free
          ? t("screen.organization.trips.tripWizardStep5Programs.free")
          : t("screen.organization.trips.tripWizardStep5Programs.perPerson"),
        typeFlags: flags.join(t("screen.organization.trips.tripWizardStep5Programs.listSeparator")),
        cap:
          item.capacity !== null
            ? String(item.capacity)
            : t("screen.organization.trips.tripWizardStep5Programs.none"),
        price: free
          ? t("screen.organization.trips.tripWizardStep5Programs.free")
          : formatMoney(item.priceMinor, item.currencyCode),
      };
    }) ?? [];

  const saveWizardStepMutation = useMutation(
    serverMutationOptions(orpc.trips.saveWizardStep, "trips/saveWizardStep", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  // Programs save in the program editor; this marks the step done on the trip.
  const saveStep = (): Promise<boolean> =>
    run((id) => saveWizardStepMutation.mutateAsync({ tripId: id, step: "programs" }));

  const programLimit = limits?.programsPerTrip ?? null;
  const atLimit = programLimit !== null && rows.length >= programLimit;
  const countText = t("screen.organization.trips.tripWizardStep5Programs.nOfLimitPrograms", {
    n: programsQuery.isSuccess ? rows.length : NO_VALUE,
    limit: limitText(limits, "programsPerTrip"),
  });

  const addProgram = (
    <OrgButtonLink
      slug="program-editor"
      params={{ tripId, programId: NEW_PROGRAM_ID }}
      variant="secondary"
      onClick={() => setSelectedProgramId(null)}
    >
      {t("screen.organization.trips.tripWizardStep5Programs.addProgram")}
    </OrgButtonLink>
  );

  return (
    <TripWizardFrame
      stepId="programs"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStepMutation.isPending}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      <WizardSaveAlert error={saveError} />
      <OrgCard
        title={t("screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip")}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <OrgBadge tone="neu">{countText}</OrgBadge>
            {atLimit ? null : addProgram}
          </div>
        }
      >
        {programsQuery.isError ? <OrgError onRetry={() => void programsQuery.refetch()} /> : null}
        <OrgTable
          columns={columns()}
          rows={rows}
          rowKey={(row) => row.id}
          caption={t("screen.organization.trips.tripWizardStep5Programs.programsOnThisTrip")}
          loading={programsQuery.isLoading}
          empty={
            programsQuery.isError ? undefined : (
              <OrgEmpty
                title={t("screen.organization.trips.tripWizardStep5Programs.noProgramsYet")}
              >
                {t("screen.organization.trips.tripWizardStep5Programs.noProgramsBody")}
              </OrgEmpty>
            )
          }
        />
        {atLimit ? (
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.trips.tripWizardStep5Programs.atLimitNote")}
          </p>
        ) : null}
      </OrgCard>
      <OrgAlert tone="info">
        {t("screen.organization.trips.tripWizardStep5Programs.onePricingModelNote")}
      </OrgAlert>
    </TripWizardFrame>
  );
}
