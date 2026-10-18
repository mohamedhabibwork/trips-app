import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TeSwitch } from "@trips-app/ui/components/te-switch";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { TripWizardFrame, getActiveWizardTripId } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

export function TripWizardStep7PricingAndCapacity() {
  const { status: authStatus } = useAuth();
  const queryClient = useQueryClient();
  const [basePrice, setBasePrice] = useState("250.00");
  const [currency, setCurrency] = useState("USD");
  const [capacity, setCapacity] = useState("");
  const [childTracking, setChildTracking] = useState(false);

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
      if (detail.basePriceMinor > 0) {
        setBasePrice((detail.basePriceMinor / 100).toFixed(2));
      }
      if (detail.currencyCode) setCurrency(detail.currencyCode);
      if (detail.totalCapacity > 0) setCapacity(String(detail.totalCapacity));
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
    const parsedPrice = Math.max(0, Math.round((Number.parseFloat(basePrice) || 0) * 100));
    const upperCurrency = currency.trim().toUpperCase();
    const resolvedCurrency =
      upperCurrency === "SAR" || upperCurrency === "AED" ? upperCurrency : ("EGP" as const);
    try {
      await saveWizardStepMutation.mutateAsync({
        tripId: currentTripId,
        step: "pricing",
        basePrice: {
          amountMinor: parsedPrice,
          currency: resolvedCurrency,
        },
        childTrackingEnabled: childTracking,
      });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <StatePreview>
      <TripWizardFrame
        title={t(
          "screen.organization.trips.tripWizardStep7PricingAndCapacity.tripWizardStep7Pricing",
        )}
        stepId="pricing"
        previousSlug="trip-wizard-step-6-seating"
        nextSlug="trip-wizard-step-8-publish"
        beforeNext={saveStep}
        onSaveDraft={async () => {
          await saveStep();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TeInput
            label={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.basePrice")}
            placeholder={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.amount")}
            inputMode="decimal"
            value={basePrice}
            onChange={(event) => setBasePrice(event.target.value)}
          />
          <TeInput
            label={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.currency")}
            placeholder={t(
              "screen.organization.trips.tripWizardStep7PricingAndCapacity.currencyCode",
            )}
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          />
        </div>
        <TeInput
          label={t(
            "screen.organization.trips.tripWizardStep7PricingAndCapacity.capacityPerVehicle",
          )}
          placeholder={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.seatCount")}
          value={capacity}
          readOnly
          supportingText={t(
            "screen.organization.trips.tripWizardStep7PricingAndCapacity.setByTheSeatCount",
          )}
        />
        <TeSwitch
          checked={childTracking}
          onCheckedChange={setChildTracking}
          label={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.childTracking")}
          onLabel={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.on")}
          offLabel={t("screen.organization.trips.tripWizardStep7PricingAndCapacity.off")}
        />
        <TeInlineAlert tone="info">
          {t(
            "screen.organization.trips.tripWizardStep7PricingAndCapacity.childTrackingNeedsAParent",
          )}
        </TeInlineAlert>
      </TripWizardFrame>
    </StatePreview>
  );
}
