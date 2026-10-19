// SCR-ORG-24 Booking detail: travelers and seats, programs, payment and coupon of one booking.
import { useId, useState, type ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { TeDialog } from "@trips-app/ui/components/te-dialog";
import { t } from "@trips-app/i18n";

import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgInput } from "../common/org-form";
import { useOrgNavigate, useOrgParams } from "../common/org-link";
import { tripTitle } from "../common/org-shared";
import { OrgTable, type OrgColumn } from "../common/org-table";
import {
  NO_VALUE,
  OrgAlert,
  OrgBadge,
  OrgButton,
  OrgCard,
  OrgEmpty,
  OrgError,
  OrgLoading,
  OrgPage,
  OrgPageHeader,
  OrgRow,
} from "../common/org-ui";
import {
  BookingStateBadge,
  PaymentBadge,
  money,
  toBookingDetail,
  toPaymentRecords,
} from "./booking-parts";

interface TravelerRow {
  id: string;
  name: string;
  seat: string | null;
  checkedIn: boolean;
}

interface ProgramRow {
  id: string;
  name: string;
  quantity: number;
  amount: string;
}

function SummaryLine({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm leading-5">
      <span className="font-semibold">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function BookingDetail() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus, locale } = useAuth();
  const enabled = authStatus === "authenticated";
  const { bookingId: routeBookingId } = useOrgParams();
  const [editing, setEditing] = useState<{ rowId: string; seat: string } | null>(null);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [actionFailed, setActionFailed] = useState(false);
  const saveHintId = useId();

  // The booking comes only from the URL (`/business/bookings/$bookingId`).
  const bookingId = routeBookingId ?? "";

  const detailQuery = useQuery({
    ...orpc.booking.getBooking.queryOptions({ input: { bookingId } }),
    enabled: enabled && Boolean(bookingId),
  });
  const { booking, checkIns } = toBookingDetail(detailQuery.data);

  const paymentsQuery = useQuery({
    ...orpc.payments.listPayments.queryOptions({ input: undefined }),
    enabled,
  });
  const tripQuery = useQuery({
    ...orpc.trips.getOrganizationTrip.queryOptions({ input: { tripId: booking?.tripId ?? "" } }),
    enabled: enabled && Boolean(booking?.tripId),
  });
  const programsQuery = useQuery({
    ...orpc.programs.listTripPrograms.queryOptions({ input: { tripId: booking?.tripId ?? "" } }),
    enabled: enabled && Boolean(booking?.tripId),
  });
  const seatMapQuery = useQuery({
    ...orpc.seats.getSeatMap.queryOptions({
      input: { tripId: booking?.tripId ?? "", vehicleId: booking?.vehicleId ?? undefined },
    }),
    enabled: enabled && Boolean(booking?.tripId && booking.vehicleId),
  });

  const assignSeatMutation = useMutation(
    orpc.seats.assignSeatByOrganization.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.seats.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
      },
    }),
  );
  const refundPaymentMutation = useMutation(
    orpc.payments.refundPayment.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.payments.key() });
        void queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
      },
    }),
  );

  const seats = seatMapQuery.data?.seats ?? [];
  const travelers: readonly TravelerRow[] = (booking?.passengers ?? []).map((passenger, index) => {
    const inventorySeat = seats.find(
      (seat) => seat.bookingId === booking?.id && seat.passengerName === passenger.fullName,
    );
    const id = passenger.id ?? `${booking?.id}-${index}`;
    return {
      id,
      name: passenger.fullName || NO_VALUE,
      seat: inventorySeat?.seatLabel ?? passenger.seatLabel ?? booking?.seatLabels[index] ?? null,
      checkedIn: checkIns.some(
        (record) => record.passengerId === passenger.id && record.status === "checked_in",
      ),
    };
  });

  const programRows: readonly ProgramRow[] = (booking?.selectedProgramIds ?? []).map((id) => {
    const program = programsQuery.data?.items.find((item) => item.id === id);
    const quantity = booking?.passengersCount ?? 0;
    return {
      id,
      name: program ? tripTitle(program, locale) || NO_VALUE : NO_VALUE,
      quantity,
      amount: program ? money(program.priceMinor * quantity, program.currencyCode) : NO_VALUE,
    };
  });

  const paymentId =
    toPaymentRecords(paymentsQuery.data).find((payment) => payment.bookingId === booking?.id)?.id ??
    null;
  const busy = assignSeatMutation.isPending || refundPaymentMutation.isPending;
  const editingRow = travelers.find((row) => row.id === editing?.rowId);
  const canSave = Boolean(editingRow && editing?.seat.trim() && booking?.vehicleId) && !busy;
  const canRefund =
    Boolean(booking && paymentId) &&
    booking?.status !== "cancelled" &&
    booking?.status !== "refunded";

  async function handleSaveSeat() {
    if (!booking?.vehicleId || !editingRow || !editing) return;
    const seatLabel = editing.seat.trim();
    setActionFailed(false);
    try {
      await assignSeatMutation.mutateAsync({
        tripId: booking.tripId,
        vehicleId: booking.vehicleId,
        seatLabel,
        status: "reserved",
        bookingId: booking.id,
        passengerName: editingRow.name,
      });
      if (editingRow.seat && editingRow.seat !== seatLabel) {
        await assignSeatMutation.mutateAsync({
          tripId: booking.tripId,
          vehicleId: booking.vehicleId,
          seatLabel: editingRow.seat,
          status: "available",
          bookingId: null,
          passengerName: null,
        });
      }
      setEditing(null);
    } catch {
      setActionFailed(true);
    }
  }

  async function handleIssueRefund() {
    setConfirmRefund(false);
    if (!booking) return;
    setActionFailed(false);
    try {
      // A refund needs the booking's payment; without one the button stays disabled.
      if (!paymentId) throw new Error("No payment to refund");
      await refundPaymentMutation.mutateAsync({
        paymentId,
        reason: "Refund issued by organization from booking detail",
      });
      void goTo("bookings-and-travelers");
    } catch {
      setActionFailed(true);
    }
  }

  const travelerColumns: readonly OrgColumn<TravelerRow>[] = [
    {
      key: "name",
      header: t("screen.organization.bookings.bookingDetail.traveler"),
      render: (row) => <b>{row.name}</b>,
    },
    {
      key: "seat",
      header: t("screen.organization.bookings.bookingDetail.seat"),
      render: (row) =>
        editing?.rowId === row.id ? (
          <OrgInput
            label={t("screen.organization.bookings.bookingDetail.newSeatFor", { name: row.name })}
            value={editing.seat}
            onChange={(event) => setEditing({ rowId: row.id, seat: event.target.value })}
            fieldClassName="min-w-28"
          />
        ) : (
          (row.seat ?? t("screen.organization.bookings.bookingDetail.notAssigned"))
        ),
    },
    {
      key: "checkIn",
      header: t("screen.organization.bookings.bookingDetail.checkIn"),
      render: (row) =>
        row.checkedIn ? (
          <OrgBadge tone="ok">{t("screen.organization.bookings.bookingDetail.checkedIn")}</OrgBadge>
        ) : (
          <OrgBadge tone="neu">
            {t("screen.organization.bookings.bookingDetail.notCheckedIn")}
          </OrgBadge>
        ),
    },
    {
      key: "action",
      header: t("screen.organization.bookings.bookingDetail.action"),
      render: (row) => (
        <OrgButton
          variant="text"
          disabled={row.checkedIn || !booking?.vehicleId}
          onClick={() =>
            setEditing(editing?.rowId === row.id ? null : { rowId: row.id, seat: row.seat ?? "" })
          }
        >
          {editing?.rowId === row.id
            ? t("screen.organization.bookings.bookingDetail.cancel")
            : t("screen.organization.bookings.bookingDetail.reassignSeat")}
        </OrgButton>
      ),
    },
  ];

  const programColumns: readonly OrgColumn<ProgramRow>[] = [
    { key: "name", header: t("screen.organization.bookings.bookingDetail.program") },
    {
      key: "quantity",
      header: t("screen.organization.bookings.bookingDetail.quantity"),
      render: (row) => String(row.quantity),
    },
    { key: "amount", header: t("screen.organization.bookings.bookingDetail.amount") },
  ];

  if (detailQuery.isLoading) return <OrgLoading rows={6} />;

  return (
    <OrgPage className="gap-5">
      <OrgPageHeader
        title={t("screen.organization.bookings.bookingDetail.title", {
          reference: booking?.bookingReference ?? NO_VALUE,
        })}
        badge={booking ? <BookingStateBadge booking={booking} /> : null}
        caption={t("screen.organization.bookings.bookingDetail.caption", {
          trip: tripQuery.data ? tripTitle(tripQuery.data, locale) || NO_VALUE : NO_VALUE,
          booker: booking?.passengers[0]?.fullName || NO_VALUE,
        })}
        actions={
          <>
            <OrgButton
              variant="secondary"
              disabled={!canRefund || busy}
              onClick={() => setConfirmRefund(true)}
            >
              {t("screen.organization.bookings.bookingDetail.issueRefund")}
            </OrgButton>
            <OrgButton
              disabled={!canSave}
              aria-describedby={canSave ? undefined : saveHintId}
              onClick={() => void handleSaveSeat()}
            >
              {t("screen.organization.bookings.bookingDetail.saveChange")}
            </OrgButton>
            <span id={saveHintId} className="sr-only">
              {t("screen.organization.bookings.bookingDetail.saveHint")}
            </span>
          </>
        }
      />
      {detailQuery.isError ? <OrgError onRetry={() => void detailQuery.refetch()} /> : null}
      {!booking && !detailQuery.isError ? (
        <OrgEmpty title={t("screen.organization.bookings.bookingDetail.emptyTitle")}>
          {t("screen.organization.bookings.bookingDetail.emptyBody")}
        </OrgEmpty>
      ) : null}
      {actionFailed ? (
        <OrgAlert tone="err" title={t("screen.organization.bookings.bookingDetail.actionFailed")} />
      ) : null}
      <OrgRow align="start">
        <div className="flex min-w-0 flex-col gap-5 lg:flex-[2]">
          <OrgCard title={t("screen.organization.bookings.bookingDetail.travelersAndSeats")}>
            <OrgTable
              columns={travelerColumns}
              rows={travelers}
              rowKey={(row) => row.id}
              caption={t("screen.organization.bookings.bookingDetail.travelersAndSeats")}
              empty={t("screen.organization.bookings.bookingDetail.noTravelers")}
            />
          </OrgCard>
          <OrgCard title={t("screen.organization.bookings.bookingDetail.programsAndQuantities")}>
            <OrgTable
              columns={programColumns}
              rows={programRows}
              rowKey={(row) => row.id}
              caption={t("screen.organization.bookings.bookingDetail.programsAndQuantities")}
              empty={t("screen.organization.bookings.bookingDetail.noPrograms")}
            />
          </OrgCard>
        </div>
        <OrgCard
          title={t("screen.organization.bookings.bookingDetail.paymentAndCoupon")}
          className="lg:flex-1"
        >
          <SummaryLine label={t("screen.organization.bookings.bookingDetail.paymentStatus")}>
            {booking ? <PaymentBadge booking={booking} /> : NO_VALUE}
          </SummaryLine>
          <SummaryLine label={t("screen.organization.bookings.bookingDetail.totalPaid")}>
            {money(booking?.totalAmountMinor, booking?.currencyCode)}
          </SummaryLine>
          <SummaryLine label={t("screen.organization.bookings.bookingDetail.coupon")}>
            {booking?.couponCode
              ? t("screen.organization.bookings.bookingDetail.couponApplied", {
                  code: booking.couponCode,
                })
              : t("screen.organization.bookings.bookingDetail.none")}
          </SummaryLine>
          <SummaryLine label={t("screen.organization.bookings.bookingDetail.refundUnderPolicy")}>
            {booking && booking.refundAmountMinor > 0
              ? money(booking.refundAmountMinor, booking.currencyCode)
              : NO_VALUE}
          </SummaryLine>
          <p className="te-caption m-0 text-[var(--te-ink-muted)]">
            {t("screen.organization.bookings.bookingDetail.refundNote")}
          </p>
        </OrgCard>
      </OrgRow>
      <TeDialog
        open={confirmRefund}
        onOpenChange={setConfirmRefund}
        title={t("screen.organization.bookings.bookingDetail.confirmRefundTitle")}
        description={t("screen.organization.bookings.bookingDetail.refundNote")}
        primaryLabel={t("screen.organization.bookings.bookingDetail.issueRefund")}
        onPrimary={() => void handleIssueRefund()}
        secondaryLabel={t("screen.organization.bookings.bookingDetail.keepBooking")}
        onSecondary={() => setConfirmRefund(false)}
        tone="danger"
      />
    </OrgPage>
  );
}
