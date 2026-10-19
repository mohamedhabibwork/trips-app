// SCR-SHR-15 Seat map for the first public trip's vehicle: pick a seat, then hold it. The hold time
// comes back from the server.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { Button, Notice } from "@/components/kit/controls";
import { formatDateTime } from "@/components/kit/format";
import { PhoneColumn } from "@/components/kit/layout";
import { orpc } from "@/utils/orpc";

import { SeatMap, SeatMapLegend, type SeatView } from "./seat-map";
import { SignInRequired } from "./sign-in-required";

const MINUTE_MS = 60 * 1000;

function toSeatState(status: string): SeatView["state"] {
  if (status === "held") return "held";
  if (status === "reserved" || status === "blocked") return "taken";
  return "available";
}

export function ScrShr15SeatMap() {
  const { t, locale, status } = useAuth();
  const signedIn = status === "authenticated";
  const queryClient = useQueryClient();
  const tripsQuery = useQuery(orpc.trips.browsePublicTrips.queryOptions({ input: {} }));
  const trip = tripsQuery.data?.items?.[0];
  const seatMapQuery = useQuery({
    ...orpc.seats.getSeatMap.queryOptions({ input: { tripId: trip?.id ?? "" } }),
    enabled: signedIn && Boolean(trip?.id),
  });
  const holdMutation = useMutation(
    orpc.seats.holdSeats.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.seats.key() });
      },
    }),
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [heldUntil, setHeldUntil] = useState<Date | null>(null);

  const seatMap = seatMapQuery.data;
  const now = Date.now();
  const seats: SeatView[] = (seatMap?.seats ?? []).map((seat) => ({
    label: seat.seatLabel,
    rowIndex: seat.rowIndex,
    colIndex: seat.colIndex,
    state: toSeatState(seat.status),
    holdMinutes: seat.holdExpiresAt
      ? Math.max(0, Math.ceil((new Date(seat.holdExpiresAt).getTime() - now) / MINUTE_MS))
      : undefined,
  }));
  const tripTitle = trip
    ? locale === "ar"
      ? trip.titleAr || trip.titleEn
      : trip.titleEn || trip.titleAr
    : "";

  async function confirmSeat() {
    if (!selected || !trip || !seatMap) return;
    try {
      const result = await holdMutation.mutateAsync({
        tripId: trip.id,
        vehicleId: seatMap.vehicleId,
        seatLabels: [selected],
      });
      setHeldUntil(new Date(result.holdExpiresAt));
    } catch {
      setHeldUntil(null);
    }
  }

  if (!signedIn) {
    return (
      <PhoneColumn>
        <SignInRequired message={t("screen.shared.seatMap.signIn")} />
      </PhoneColumn>
    );
  }
  if (tripsQuery.isPending || (trip && seatMapQuery.isPending)) {
    return (
      <PhoneColumn>
        <p role="status" className="m-0 text-sm text-[var(--te-ink-muted)]">
          {t("screen.shared.seatMap.loading")}
        </p>
      </PhoneColumn>
    );
  }
  if (!trip || !seatMap || seats.length === 0) {
    return (
      <PhoneColumn>
        <Notice tone="info">{t("screen.shared.seatMap.noSeats")}</Notice>
      </PhoneColumn>
    );
  }

  return (
    <PhoneColumn className="gap-3.5">
      <h1 className="sr-only">{t("screen.shared.seatMap.title")}</h1>
      <p className="m-0 text-sm leading-5 text-[var(--te-ink-muted)]">
        {t("screen.shared.seatMap.lead", { trip: tripTitle })}
      </p>
      <SeatMapLegend />
      <SeatMap
        seats={seats}
        columns={seatMap.cols}
        selected={selected}
        onSelect={(label) => {
          setSelected(label === selected ? null : label);
          setHeldUntil(null);
        }}
        disabled={holdMutation.isPending}
      />
      {heldUntil && selected ? (
        <p className="m-0 text-[13px] leading-[18px] text-[var(--te-ink-muted)]">
          {t("screen.shared.seatMap.heldNote", {
            seat: selected,
            time: formatDateTime(heldUntil, locale),
          })}
        </p>
      ) : null}
      {holdMutation.isError ? (
        <Notice tone="danger">{t("screen.shared.seatMap.holdFailed")}</Notice>
      ) : null}
      <Button
        className="mt-auto"
        disabled={!selected || holdMutation.isPending || heldUntil !== null}
        onClick={() => void confirmSeat()}
      >
        {selected
          ? t("screen.shared.seatMap.confirm", { seat: selected })
          : t("screen.shared.seatMap.choose")}
      </Button>
    </PhoneColumn>
  );
}
