// SCR-ORG-11 Trip wizard step 7: base price, capacity from the vehicles, and child tracking.
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";
import { serverMutationOptions } from "@/utils/server-rpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import { TripWizardFrame } from "../common/org-shared";
import { NO_VALUE, OrgAlert, OrgBadge, OrgCard, OrgError } from "../common/org-ui";
import {
  CURRENCY_OPTIONS,
  OrgOptionCard,
  WizardSaveAlert,
  toMinorUnits,
  toTripCurrency,
  useOrgPlan,
  useWizardStepSave,
  useWizardTrip,
  type TripCurrency,
} from "./trip-parts";

/** A price in major units with at most two decimals, e.g. `250` or `250.50`. */
const PRICE_PATTERN = /^\d{1,7}(\.\d{1,2})?$/;

export function TripWizardStep7PricingAndCapacity() {
  const { tripId, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { features } = useOrgPlan();
  const [basePrice, setBasePrice] = useState("");
  const [priceError, setPriceError] = useState<string | undefined>(undefined);
  const [currency, setCurrency] = useState<TripCurrency>("EGP");
  const [childTracking, setChildTracking] = useState(false);
  const { error: saveError, run } = useWizardStepSave(tripId);

  useEffect(() => {
    if (tripQuery.data) {
      const detail = tripQuery.data;
      if (detail.basePriceMinor > 0) setBasePrice((detail.basePriceMinor / 100).toFixed(2));
      if (detail.currencyCode) setCurrency(toTripCurrency(detail.currencyCode));
      setChildTracking(detail.childTrackingEnabled);
    }
  }, [tripQuery.data]);

  const saveWizardStepMutation = useMutation(
    serverMutationOptions(orpc.trips.saveWizardStep, "trips/saveWizardStep", {
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.trips.key() });
      },
    }),
  );

  const saveStep = async (): Promise<boolean> => {
    const price = basePrice.trim();
    if (!PRICE_PATTERN.test(price)) {
      setPriceError(t("screen.organization.trips.tripWizardStep7PricingAndCapacity.priceInvalid"));
      return false;
    }
    setPriceError(undefined);
    return run((id) =>
      saveWizardStepMutation.mutateAsync({
        tripId: id,
        step: "pricing",
        basePrice: { amountMinor: toMinorUnits(price), currency },
        childTrackingEnabled: childTracking,
      }),
    );
  };

  const vehicles = tripQuery.data?.vehicles ?? [];
  const seatCounts = [...new Set(vehicles.map((vehicle) => vehicle.seatCountSnapshot))];
  const totalSeats = vehicles.reduce((sum, vehicle) => sum + vehicle.seatCountSnapshot, 0);
  const perVehicle =
    seatCounts.length === 0
      ? NO_VALUE
      : t("screen.organization.trips.tripWizardStep7PricingAndCapacity.perVehicleValue", {
          n: seatCounts.join(" / "),
        });
  const total = tripQuery.data
    ? t("screen.organization.trips.tripWizardStep7PricingAndCapacity.nSeats", {
        n: tripQuery.data.totalCapacity || totalSeats,
      })
    : NO_VALUE;
  const childTrackingLocked = !features?.childTracking;

  return (
    <TripWizardFrame
      stepId="pricing"
      tripId={tripId}
      tripName={tripName}
      busy={saveWizardStepMutation.isPending}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      <WizardSaveAlert error={saveError} className="max-w-[860px]" />
      {tripQuery.isError ? <OrgError onRetry={() => void tripQuery.refetch()} /> : null}
      <OrgCard
        title={t(
          "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePriceAndCapacity",
        )}
        className="max-w-[860px]"
      >
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
          <OrgInput
            label={t(
              "screen.organization.trips.tripWizardStep7PricingAndCapacity.basePricePerPerson",
            )}
            inputMode="decimal"
            required
            error={priceError}
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
          />
          <OrgSelect
            label={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.currency")}
            options={CURRENCY_OPTIONS}
            value={currency}
            onValueChange={(value) => setCurrency(toTripCurrency(value))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <OrgInput
            label={t(
              "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityPerVehicle",
            )}
            disabled
            value={perVehicle}
            readOnly
          />
          <OrgInput
            label={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.totalCapacity")}
            disabled
            value={total}
            readOnly
          />
        </div>
      </OrgCard>
      <OrgCard
        title={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.childTracking")}
        actions={
          childTrackingLocked ? (
            <OrgBadge tone="neu" icon="lock">
              {t("screen.organization.trips.tripWizardStep7PricingAndCapacity.growthOrEnterprise")}
            </OrgBadge>
          ) : null
        }
        className="max-w-[860px]"
      >
        <OrgOptionCard
          type="checkbox"
          checked={childTracking}
          disabled={childTrackingLocked}
          onChange={(event) => setChildTracking(event.target.checked)}
          className="border-0 p-0"
        >
          <b className="block">
            {t("screen.organization.trips.tripWizardStep7PricingAndCapacity.turnOnChildTracking")}
          </b>
          <span className="te-caption text-[var(--te-ink-muted)]">
            {childTrackingLocked
              ? t("screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingLocked")
              : t("screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingBody")}
          </span>
        </OrgOptionCard>
      </OrgCard>
      <OrgAlert tone="info" className="max-w-[860px]">
        {t("screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityNote")}
      </OrgAlert>
    </TripWizardFrame>
  );
}
