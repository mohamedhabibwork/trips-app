// SCR-ORG-11 Trip wizard step 7: base price, capacity from the vehicles, and child tracking.
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { t } from "@trips-app/i18n";

import { orpc } from "@/utils/orpc";

import { OrgInput, OrgSelect } from "../common/org-form";
import { TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { NO_VALUE, OrgAlert, OrgBadge, OrgCard } from "../common/org-ui";
import {
  CURRENCY_OPTIONS,
  OrgOptionCard,
  toMinorUnits,
  toTripCurrency,
  useOrgPlan,
  useWizardTrip,
  type TripCurrency,
} from "./trip-parts";

export function TripWizardStep7PricingAndCapacity() {
  const { authStatus, tripQuery, tripName } = useWizardTrip();
  const queryClient = useQueryClient();
  const { features } = useOrgPlan();
  const [basePrice, setBasePrice] = useState("250.00");
  const [currency, setCurrency] = useState<TripCurrency>("EGP");
  const [childTracking, setChildTracking] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (tripQuery.data) {
      const detail = tripQuery.data;
      if (detail.basePriceMinor > 0) setBasePrice((detail.basePriceMinor / 100).toFixed(2));
      if (detail.currencyCode) setCurrency(toTripCurrency(detail.currencyCode));
      setChildTracking(detail.childTrackingEnabled);
    }
  }, [tripQuery.data]);

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
    setSaveFailed(false);
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "pricing",
        basePrice: { amountMinor: toMinorUnits(basePrice), currency },
        childTrackingEnabled: childTracking,
      });
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
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
      tripName={tripName}
      beforeNext={saveStep}
      onSaveDraft={async () => {
        await saveStep();
      }}
    >
      {saveFailed ? (
        <OrgAlert
          tone="err"
          title={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.saveFailedTitle")}
          className="max-w-[860px]"
        >
          {t("screen.organization.trips.tripWizardStep7PricingAndCapacity.saveFailedBody")}
        </OrgAlert>
      ) : null}
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
