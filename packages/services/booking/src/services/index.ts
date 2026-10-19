import { BookingServiceError } from "../errors";
import {
  calculateRefundAmountMinor,
  generateBookingReference,
  generateQrCodeToken,
} from "../model";
import { createBookingRepository, type ServiceDatabase } from "../repository";
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
        if (
          trip.totalCapacity > 0 &&
          trip.confirmedSeatsCount + passengersCount > trip.totalCapacity
        ) {
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
        const grossMinor = subtotalMinor + programsTotalMinor;

        let couponId: string | null = null;
        let couponCode: string | null = null;
        let discountMinor = 0;

        if (input.couponCode) {
          const coupon = await txRepo.findCouponByCode(input.couponCode, trip.tenantId);
          const now = new Date();
          if (
            !coupon ||
            (coupon.tripId !== null && coupon.tripId !== trip.id) ||
            (coupon.startsAt !== null && coupon.startsAt.getTime() > now.getTime()) ||
            (coupon.expiresAt !== null && coupon.expiresAt.getTime() < now.getTime()) ||
            (coupon.maxRedemptions !== null && coupon.redemptionsCount >= coupon.maxRedemptions) ||
            grossMinor < coupon.minOrderMinor
          ) {
            throw new BookingServiceError("COUPON_INVALID", "Coupon is invalid or not applicable.");
          }
          couponId = coupon.id;
          couponCode = coupon.code;
          if (coupon.discountType === "percentage") {
            const raw = Math.floor((grossMinor * coupon.discountValue) / 100);
            discountMinor =
              coupon.maxDiscountMinor !== null ? Math.min(raw, coupon.maxDiscountMinor) : raw;
          } else {
            discountMinor = Math.min(grossMinor, coupon.discountValue);
          }
          await txRepo.incrementCouponRedemption(coupon.id);
        }

        const uniqueSeatLabels = [...new Set(input.seatLabels.map((s) => s.trim()))];
        if (input.vehicleId && uniqueSeatLabels.length > 0) {
          const existingSeats = await txRepo.findSeatInventoryForLabels(
            trip.id,
            input.vehicleId,
            uniqueSeatLabels,
          );
          const now = new Date();
          for (const seat of existingSeats) {
            const heldByOther =
              seat.status === "held" &&
              seat.heldByAccountId !== travelerAccountId &&
              seat.holdExpiresAt &&
              seat.holdExpiresAt.getTime() > now.getTime();
            if (seat.status === "reserved" || seat.status === "blocked" || heldByOther) {
              throw new BookingServiceError(
                "SEAT_UNAVAILABLE",
                `Seat ${seat.seatLabel} is unavailable.`,
              );
            }
          }
        }

        const bookingReference = generateBookingReference();
        const totalAmountMinor = Math.max(0, grossMinor - discountMinor);

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
          couponId,
          couponCode,
          subtotalMinor,
          programsTotalMinor,
          discountMinor,
          totalAmountMinor,
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

        await txRepo.adjustTripConfirmedSeats(trip.id, passengersCount);

        return { booking, boardingPasses };
      });
    },

    async cancelBooking(
      actor: { accountId: string; tenantId?: string | null; role: string },
      input: CancelBookingInput,
    ) {
      const booking = await repo.findBookingById(input.bookingId);
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
        throw new BookingServiceError("BOOKING_ALREADY_CANCELLED", "Booking is already cancelled.");
      }

      const trip = await repo.findTripById(booking.tripId);
      const refundAmountMinor = calculateRefundAmountMinor(
        booking.totalAmountMinor,
        trip?.startsAt ?? null,
      );

      await repo.releaseReservedSeats(booking.tripId, booking.vehicleId, booking.seatLabels);
      if (booking.selectedProgramIds.length > 0) {
        await repo.adjustProgramsBookedCount(booking.selectedProgramIds, -booking.passengersCount);
      }
      await repo.adjustTripConfirmedSeats(booking.tripId, -booking.passengersCount);

      const updated = await repo.markBookingCancelled(booking.id, input.reason, refundAmountMinor);
      if (!updated) {
        throw new BookingServiceError("BOOKING_NOT_FOUND", "Booking not found.");
      }
      return updated;
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

    async listMyBookings(travelerAccountId: string) {
      return repo.listTravelerBookings(travelerAccountId);
    },

    async listOrganizationBookings(tenantId: string, tripId?: string) {
      return repo.listOrganizationBookings(tenantId, tripId);
    },
  };
}

export type BookingService = ReturnType<typeof createBookingService>;
