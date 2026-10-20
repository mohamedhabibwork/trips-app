import {
  COUPON_GENERIC_FAILURE_MESSAGE,
  PAYMENT_CONFIRM_TIMEOUT_SECONDS,
  computeRefundMinor,
} from "@trips-app/domain";
import { BookingServiceError } from "../errors";
import {
  calculateRefundAmountMinor,
  computeBookingPricing,
  generateBookingReference,
  generateQrCodeToken,
} from "../model";
import { createBookingRepository, type ServiceDatabase } from "../repository";
import type { BookingPricingDto } from "../schemas";
import type { CancelBookingInput, CreateBookingInput } from "../types";

export function createBookingService(deps: { db: ServiceDatabase }) {
  const repo = createBookingRepository(deps.db);

  return {
    async createBooking(travelerAccountId: string, input: CreateBookingInput) {
      return deps.db.transaction(async (tx) => {
        const txRepo = createBookingRepository(tx as unknown as ServiceDatabase);
        const trip = await txRepo.findTripByIdForUpdate(input.tripId);
        if (!trip || trip.state === "cancelled" || trip.state === "completed") {
          throw new BookingServiceError("TRIP_NOT_AVAILABLE", "Trip is not available for booking.");
        }

        const passengersCount = input.passengers.length;
        // Occupancy from live bookings, not the denormalized trips counters: confirmed seats
        // always count, pendings count only within the D-30 confirm window (D-30) so abandoned
        // payments never block new bookings. The row lock serializes concurrent creations.
        const bookedSeats = await txRepo.sumActiveBookedPassengers(
          trip.id,
          new Date(Date.now() - PAYMENT_CONFIRM_TIMEOUT_SECONDS * 1000),
        );
        if (trip.totalCapacity > 0 && bookedSeats + passengersCount > trip.totalCapacity) {
          throw new BookingServiceError(
            "INSUFFICIENT_CAPACITY",
            "Not enough available seats on this trip.",
          );
        }

        const uniqueProgramIds = [...new Set(input.selectedProgramIds)];
        const programs = await txRepo.findActiveProgramsByIds(trip.id, uniqueProgramIds);
        for (const program of programs) {
          if (
            program.capacity !== null &&
            program.bookedCount + passengersCount > program.capacity
          ) {
            throw new BookingServiceError(
              "INSUFFICIENT_CAPACITY",
              `Program "${program.titleEn}" does not have enough available capacity.`,
            );
          }
        }

        const programsTotalMinor = programs.reduce(
          (sum, p) => sum + (p.isIncludedInBase ? 0 : p.priceMinor * passengersCount),
          0,
        );
        const subtotalMinor = trip.basePriceMinor * passengersCount;

        let couponId: string | null = null;

        const pricing = computeBookingPricing({
          subtotalMinor,
          programsTotalMinor,
          planTier: input.planTier ?? "free",
          coupon: input.couponCode
            ? ((await txRepo.findCouponByCode(input.couponCode, trip.tenantId)) ??
              (await txRepo.findAnyCouponByCode(input.couponCode)))
            : null,
          tripId: trip.id,
          tripTenantId: trip.tenantId,
        });

        if (input.couponCode && pricing.couponFailureReason) {
          const generic =
            pricing.couponFailureReason === "not_applicable"
              ? COUPON_GENERIC_FAILURE_MESSAGE
              : `Coupon rejected: ${pricing.couponFailureReason}.`;
          throw new BookingServiceError("COUPON_INVALID", generic, {
            couponFailureReason: pricing.couponFailureReason,
          });
        }

        if (pricing.couponCode) {
          const coupon = await txRepo.findCouponByCode(input.couponCode!, trip.tenantId);
          if (coupon) {
            couponId = coupon.id;
            await txRepo.incrementCouponRedemption(coupon.id);
          }
        }

        const discountMinor = pricing.planDiscountMinor + pricing.couponDiscountMinor;

        const uniqueSeatLabels = [...new Set(input.seatLabels.map((s) => s.trim()))];
        if (input.vehicleId && uniqueSeatLabels.length > 0) {
          const existingSeats = await txRepo.findSeatInventoryForLabels(
            trip.id,
            input.vehicleId,
            uniqueSeatLabels,
          );
          const now = new Date();
          // A "reserved" row only blocks while its booking still occupies the seat:
          // paid states always, pendings within the D-30 window. Stale reservations from
          // abandoned checkouts must not reject new bookings (same rule as the seat map).
          const reservingBookingIds = [
            ...new Set(
              existingSeats
                .filter((seat) => seat.status === "reserved" && seat.bookingId)
                .map((seat) => seat.bookingId as string),
            ),
          ];
          const blockingBookingIds = new Set(
            await txRepo.findBlockingBookingIds(reservingBookingIds, now),
          );
          for (const seat of existingSeats) {
            const heldByOther =
              seat.status === "held" &&
              seat.heldByAccountId !== travelerAccountId &&
              seat.holdExpiresAt &&
              seat.holdExpiresAt.getTime() > now.getTime();
            // A "reserved" row only blocks while its booking still occupies the seat:
            // paid states always, pendings within the D-30 window. Stale reservations
            // from abandoned checkouts must not reject new bookings (same rule as the
            // seat map).
            const reservedByBlockingBooking =
              seat.status === "reserved" &&
              Boolean(seat.bookingId) &&
              blockingBookingIds.has(seat.bookingId as string);
            if (seat.status === "blocked" || heldByOther || reservedByBlockingBooking) {
              throw new BookingServiceError(
                "SEAT_UNAVAILABLE",
                `Seat ${seat.seatLabel} is unavailable.`,
              );
            }
          }
        }

        const bookingReference = generateBookingReference();
        const booking = await txRepo.insertBooking({
          bookingReference,
          tenantId: trip.tenantId,
          tripId: trip.id,
          travelerAccountId,
          vehicleId: input.vehicleId ?? null,
          passengersCount,
          passengers: input.passengers,
          selectedProgramIds: uniqueProgramIds,
          seatLabels: uniqueSeatLabels,
          couponId: pricing.couponCode ? couponId : null,
          couponCode: pricing.couponCode,
          subtotalMinor,
          programsTotalMinor,
          discountMinor,
          totalAmountMinor: pricing.totalAmountMinor,
          currencyCode: trip.currencyCode,
          paymentGateway: input.paymentGateway,
        });

        if (input.vehicleId && uniqueSeatLabels.length > 0) {
          await txRepo.reserveSeatLabels(
            trip.tenantId,
            trip.id,
            input.vehicleId,
            booking.id,
            uniqueSeatLabels,
          );
        }

        if (uniqueProgramIds.length > 0) {
          await txRepo.adjustProgramsBookedCount(uniqueProgramIds, passengersCount);
        }

        const boardingPasses = await txRepo.insertCheckInRecords(
          input.passengers.map((passenger, idx) => ({
            tenantId: trip.tenantId,
            tripId: trip.id,
            vehicleId: input.vehicleId ?? null,
            bookingId: booking.id,
            passengerId: passenger.id,
            passengerName: passenger.fullName,
            seatLabel: passenger.seatLabel ?? uniqueSeatLabels[idx] ?? null,
            qrCodeToken: generateQrCodeToken(bookingReference, idx),
          })),
        );

        const childPassengers = input.passengers.filter((p) => p.isChild);
        if (childPassengers.length > 0) {
          await txRepo.insertParentChildLinks(
            childPassengers.map((child) => ({
              parentAccountId: travelerAccountId,
              tenantId: trip.tenantId,
              tripId: trip.id,
              bookingId: booking.id,
              childPassengerId: child.id,
              childFullName: child.fullName,
            })),
          );
        }

        // Seat counters are claimed when the payment succeeds (payments service), not at
        // creation: unpaid bookings block only within the D-30 confirm window, so remaining
        // seats must drop on "mark as paid", not before.

        const pricingDto: BookingPricingDto = {
          subtotalMinor: pricing.subtotalMinor,
          programsTotalMinor: pricing.programsTotalMinor,
          planDiscountMinor: pricing.planDiscountMinor,
          couponDiscountMinor: pricing.couponDiscountMinor,
          totalAmountMinor: pricing.totalAmountMinor,
          planTier: input.planTier ?? "free",
          couponCode: pricing.couponCode,
          couponFailureReason: null,
        };

        return { booking, boardingPasses, pricing: pricingDto };
      });
    },

    async cancelBooking(
      actor: { accountId: string; tenantId?: string | null; role: string },
      input: CancelBookingInput,
    ) {
      return deps.db.transaction(async (tx) => {
        const txRepo = createBookingRepository(tx as unknown as ServiceDatabase);
        const booking = await txRepo.findBookingById(input.bookingId);
        if (!booking) {
          throw new BookingServiceError("BOOKING_NOT_FOUND", "Booking not found.");
        }
        const isOwner = booking.travelerAccountId === actor.accountId;
        const isTenantStaff = actor.tenantId && booking.tenantId === actor.tenantId;
        const isAdmin = actor.role === "admin";
        if (!isOwner && !isTenantStaff && !isAdmin) {
          throw new BookingServiceError(
            "FORBIDDEN_BOOKING_ACCESS",
            "You do not have permission to cancel this booking.",
          );
        }
        if (booking.status === "cancelled" || booking.status === "refunded") {
          throw new BookingServiceError(
            "BOOKING_ALREADY_CANCELLED",
            "Booking is already cancelled.",
          );
        }

        const trip = await txRepo.findTripById(booking.tripId);
        const refundAmountMinor = calculateRefundAmountMinor(
          booking.totalAmountMinor,
          trip?.startsAt ?? null,
        );

        await txRepo.releaseReservedSeats(booking.tripId, booking.vehicleId, booking.seatLabels);
        // FR-CPN-06 / BRL-11: a cancelled booking frees its coupon redemption back to the pool.
        if (booking.couponId) {
          await txRepo.decrementCouponRedemption(booking.couponId);
        }
        if (booking.selectedProgramIds.length > 0) {
          await txRepo.adjustProgramsBookedCount(
            booking.selectedProgramIds,
            -booking.passengersCount,
          );
        }
        // Only paid bookings hold confirmed-seat counters (claimed on payment success);
        // cancelling a pending_payment booking releases nothing from the trips counters.
        if (["confirmed", "checked_in", "completed"].includes(booking.status)) {
          await txRepo.adjustTripConfirmedSeats(booking.tripId, -booking.passengersCount);
        }

        const updated = await txRepo.markBookingCancelled(
          booking.id,
          input.reason,
          refundAmountMinor,
        );
        if (!updated) {
          throw new BookingServiceError("BOOKING_NOT_FOUND", "Booking not found.");
        }
        return updated;
      });
    },

    async getBooking(
      actor: { accountId: string; tenantId?: string | null; role: string },
      bookingId: string,
    ) {
      const booking = await repo.findBookingById(bookingId);
      if (!booking) {
        throw new BookingServiceError("BOOKING_NOT_FOUND", "Booking not found.");
      }
      const isOwner = booking.travelerAccountId === actor.accountId;
      const isTenantStaff = actor.tenantId && booking.tenantId === actor.tenantId;
      const isAdmin = actor.role === "admin";
      if (!isOwner && !isTenantStaff && !isAdmin) {
        throw new BookingServiceError(
          "FORBIDDEN_BOOKING_ACCESS",
          "You do not have permission to view this booking.",
        );
      }
      const boardingPasses = await repo.findCheckInRecordsByBooking(booking.id);
      return { booking, boardingPasses };
    },

    /** Refund preview (D-07 tiers) without mutating anything. */
    async refundPreview(
      actor: { accountId: string; tenantId?: string | null; role: string },
      bookingId: string,
    ) {
      const booking = await repo.findBookingById(bookingId);
      if (!booking) {
        throw new BookingServiceError("BOOKING_NOT_FOUND", "Booking not found.");
      }
      const isOwner = booking.travelerAccountId === actor.accountId;
      const isTenantStaff = actor.tenantId && booking.tenantId === actor.tenantId;
      const isAdmin = actor.role === "admin";
      if (!isOwner && !isTenantStaff && !isAdmin) {
        throw new BookingServiceError(
          "FORBIDDEN_BOOKING_ACCESS",
          "You do not have permission to preview this refund.",
        );
      }
      const trip = await repo.findTripByBookingId(booking.tripId);
      const now = new Date();
      const { amountMinor, tier } = computeRefundMinor(
        booking.totalAmountMinor,
        trip?.startsAt ?? null,
        now,
      );
      return {
        bookingId: booking.id,
        totalAmountMinor: booking.totalAmountMinor,
        refundAmountMinor: amountMinor,
        refundPercent: tier.refundPercent,
        minHoursBeforeDeparture: tier.minHoursBeforeDeparture,
        departureAt: trip?.startsAt ?? null,
        couponReversed: booking.couponId !== null,
      };
    },

    async listMyBookings(travelerAccountId: string) {
      return repo.listTravelerBookings(travelerAccountId);
    },

    async listOrganizationBookings(tenantId: string, tripId?: string) {
      return repo.listOrganizationBookings(tenantId, tripId);
    },
  };
}

export type BookingService = ReturnType<typeof createBookingService>;
