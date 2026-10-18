import { useEffect, useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeButton } from "@trips-app/ui/components/te-button";
import { TeCard } from "@trips-app/ui/components/te-card";
import { TeDataTable, type TeDataTableColumn } from "@trips-app/ui/components/te-data-table";
import { TeInlineAlert } from "@trips-app/ui/components/te-inline-alert";
import { TeInput } from "@trips-app/ui/components/te-input";
import { TePageHeader } from "@trips-app/ui/components/te-page-header";
import { t } from "@trips-app/i18n";
import { useAuth } from "@/auth/auth-context";
import { orpc } from "@/utils/orpc";

import { OrgButtonLink, WorkspaceBackLink, useOrgNavigate } from "../common/org-link";
import { getSelectedBookingId, OrgSection, StateBadge } from "../common/org-shared";
import { StatePreview } from "../common/organization-state-preview";

interface BookingLineRow {
  id: string;
  traveler: string;
  program: string;
  quantity: string;
  seat: string;
}

const LINE_COLUMNS = (): readonly TeDataTableColumn<BookingLineRow>[] => [
  { key: "traveler", header: t("screen.organization.bookings.bookingDetail.traveler") },
  { key: "program", header: t("screen.organization.bookings.bookingDetail.program") },
  {
    key: "quantity",
    header: t("screen.organization.bookings.bookingDetail.quantity"),
    align: "end",
  },
  { key: "seat", header: t("screen.organization.bookings.bookingDetail.seat") },
];

export function BookingDetail() {
  const goTo = useOrgNavigate();
  const queryClient = useQueryClient();
  const { status: authStatus } = useAuth();
  const [seatLabel, setSeatLabel] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedBookingId = getSelectedBookingId();
  const bookingsListQuery = useQuery(
    orpc.booking.listOrganizationBookings.queryOptions({
      input: {},
      enabled: authStatus === "authenticated",
    }),
  );

  const effectiveBookingId = selectedBookingId ?? bookingsListQuery.data?.[0]?.id ?? "";

  const bookingDetailQuery = useQuery(
    orpc.booking.getBooking.queryOptions({
      input: { bookingId: effectiveBookingId },
      enabled: authStatus === "authenticated" && Boolean(effectiveBookingId),
    }),
  );

  const paymentsQuery = useQuery(
    orpc.payments.listPayments.queryOptions({
      input: undefined,
      enabled: authStatus === "authenticated",
    }),
  );

  const b = bookingDetailQuery.data?.booking;

  useEffect(() => {
    if (b && typeof b.seatLabels[0] === "string") {
      setSeatLabel(b.seatLabels[0]);
    }
  }, [b]);

  const matchingPayment = useMemo(() => {
    if (!b?.id || !paymentsQuery.data) return undefined;
    return paymentsQuery.data.find((p) => p.bookingId === b.id);
  }, [b?.id, paymentsQuery.data]);
  const paymentId = matchingPayment?.id ?? null;

  const lineRows = useMemo<readonly BookingLineRow[]>(() => {
    if (!b) return [];
    return b.passengers.map((raw, idx) => {
      const p = (raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {}) as {
        id?: string;
        fullName?: string;
        seatLabel?: string;
      };
      const fallbackSeat = b.seatLabels[idx];
      return {
        id: typeof p.id === "string" ? p.id : `${b.id}-${idx}`,
        traveler: typeof p.fullName === "string" ? p.fullName : `Passenger ${idx + 1}`,
        program:
          b.selectedProgramIds.length > 0 ? `${b.selectedProgramIds.length} programs` : "Base trip",
        quantity: "1",
        seat:
          typeof p.seatLabel === "string"
            ? p.seatLabel
            : typeof fallbackSeat === "string"
              ? fallbackSeat
              : "-",
      };
    });
  }, [b]);

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

  const cancelBookingMutation = useMutation(
    orpc.booking.cancelBooking.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
      },
    }),
  );

  async function handleSaveSeat() {
    if (authStatus === "authenticated" && b?.tripId && b?.vehicleId && seatLabel.trim()) {
      setErrorMsg(null);
      try {
        await assignSeatMutation.mutateAsync({
          tripId: b.tripId,
          vehicleId: b.vehicleId,
          seatLabel: seatLabel.trim(),
          status: "reserved",
          bookingId: b.id,
          passengerName: lineRows[0]?.traveler ?? null,
        });
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not assign seat.");
        return;
      }
    }
    void goTo("bookings-and-travelers");
  }

  async function handleIssueRefund() {
    if (authStatus === "authenticated") {
      setErrorMsg(null);
      try {
        if (paymentId) {
          await refundPaymentMutation.mutateAsync({
            paymentId,
            reason: "Refund issued by organization from booking detail",
          });
        } else if (b?.id) {
          await cancelBookingMutation.mutateAsync({
            bookingId: b.id,
            reason: "Cancelled and refunded by organization",
          });
        }
      } catch (caught) {
        setErrorMsg(caught instanceof Error ? caught.message : "Could not issue refund.");
        return;
      }
    }
    void goTo("bookings-and-travelers");
  }

  const busy =
    assignSeatMutation.isPending ||
    refundPaymentMutation.isPending ||
    cancelBookingMutation.isPending;

  const reference = b?.bookingReference ?? "";
  const statusLabel = b?.status ?? t("screen.organization.bookings.bookingDetail.confirmed");
  const couponCode = b?.couponCode ?? "";

  return (
    <StatePreview>
      <div className="flex flex-col gap-8">
        <WorkspaceBackLink
          parent={{
            slug: "bookings-and-travelers",
            label: t("screen.organization.bookings.bookingDetail.backToBookings"),
          }}
        />
        <TePageHeader
          title={t("screen.organization.bookings.bookingDetail.bookingDetail")}
          description={
            reference || t("screen.organization.bookings.bookingDetail.bookingReference")
          }
          actions={<StateBadge tone="success" icon="check" label={statusLabel} />}
        />
        {errorMsg ? <TeInlineAlert tone="error">{errorMsg}</TeInlineAlert> : null}
        <OrgSection title={t("screen.organization.bookings.bookingDetail.travelersAndPrograms")}>
          <TeDataTable
            columns={LINE_COLUMNS()}
            rows={lineRows}
            getRowKey={(row) => row.id}
            caption={t("screen.organization.bookings.bookingDetail.travelersAndProgramsOnThis")}
            emptyTitle={t("screen.organization.bookings.bookingDetail.noTravelers")}
            emptyDescription={t(
              "screen.organization.bookings.bookingDetail.travelersAppearHereOnceThey",
            )}
          />
        </OrgSection>
        <OrgSection
          title={t("screen.organization.bookings.bookingDetail.seatTitle")}
          actions={
            <OrgButtonLink slug="seat-map-and-seat-assignment" variant="secondary">
              {t("screen.organization.bookings.bookingDetail.openSeatMap")}
            </OrgButtonLink>
          }
        >
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <TeInput
                label={t("screen.organization.bookings.bookingDetail.seatLabel")}
                placeholder={t("screen.organization.bookings.bookingDetail.seatPlaceholder")}
                supportingText={t(
                  "screen.organization.bookings.bookingDetail.organizationAssignedSeatsOnly",
                )}
                value={seatLabel}
                onChange={(e) => setSeatLabel(e.target.value)}
              />
              <TeInput
                label={t("screen.organization.bookings.bookingDetail.coupon")}
                placeholder={t("screen.organization.bookings.bookingDetail.couponCode")}
                value={couponCode}
                readOnly
              />
            </div>
          </TeCard>
        </OrgSection>
        <OrgSection title={t("screen.organization.bookings.bookingDetail.payment")}>
          <TeCard>
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="te-body">
                {t("screen.organization.bookings.bookingDetail.paymentStatusPaymentStatus")}
              </p>
              <p className="te-body">
                {t("screen.organization.bookings.bookingDetail.reversalStateReversalState")}
              </p>
            </div>
          </TeCard>
          <TeInlineAlert tone="info">
            {t("screen.organization.bookings.bookingDetail.aPendingRefundShowsTo")}
          </TeInlineAlert>
        </OrgSection>
        <div className="flex flex-wrap justify-end gap-3">
          <TeButton variant="secondary" disabled={busy} onClick={() => void handleIssueRefund()}>
            {t("screen.organization.bookings.bookingDetail.issueRefund")}
          </TeButton>
          <TeButton disabled={busy} onClick={() => void handleSaveSeat()}>
            {t("screen.organization.bookings.bookingDetail.saveChange")}
          </TeButton>
        </div>
      </div>
    </StatePreview>
  );
}
