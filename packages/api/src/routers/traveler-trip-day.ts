// Traveler trip-day surface (SCR-TRV-11..13): the traveler sees their own booking's vehicle,
// seat and boarding state — never another traveler's data (BRL-01) — plus trip notices.
import { and, desc, eq, inArray, schema } from "@trips-app/db";
import { authenticatedProcedure, publicProcedure } from "@trips-app/rpc";
import { z } from "zod/v4";

const getTripDayInputSchema = z.object({
  bookingId: z.uuid(),
});

const listNoticesInputSchema = z
  .object({
    limit: z.number().int().min(1).max(50).default(20),
  })
  .optional();

export const travelerTripDayRouter = {
  /** Health probe. */
  status: publicProcedure
    .route({
      method: "GET",
      path: "/traveler/trip-day/status",
      operationId: "travelerTripDayStatus",
      summary: "Traveler trip-day service health status",
      tags: ["traveler"],
    })
    .handler(() => ({ service: "traveler-trip-day", status: "ok" as const })),

  /**
   * Trip-day payload for one of the signed-in traveler's bookings: assigned vehicle, own
   * passengers with seat labels and boarding state, and the trip notice board (SCR-TRV-12).
   */
  getMyTripDay: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/trip-day/get",
      operationId: "travelerTripDayGet",
      summary: "Own vehicle, seat, boarding state and notices for one booking (BRL-01)",
      tags: ["traveler"],
    })
    .input(getTripDayInputSchema)
    .handler(async ({ context, input }) => {
      const accountId = context.auth.accountId;
      const [booking] = await context.db
        .select()
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.id, input.bookingId),
            eq(schema.bookings.travelerAccountId, accountId),
          ),
        )
        .limit(1);
      if (!booking) {
        return { tripDay: null };
      }

      const [trip] = await context.db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, booking.tripId))
        .limit(1);
      if (!trip) {
        return { tripDay: null };
      }

      const boardingPasses = await context.db
        .select({
          passengerId: schema.checkInRecords.passengerId,
          passengerName: schema.checkInRecords.passengerName,
          seatLabel: schema.checkInRecords.seatLabel,
          qrCodeToken: schema.checkInRecords.qrCodeToken,
          status: schema.checkInRecords.status,
          checkedInAt: schema.checkInRecords.checkedInAt,
          method: schema.checkInRecords.method,
        })
        .from(schema.checkInRecords)
        .where(eq(schema.checkInRecords.bookingId, booking.id));

      let vehicle: {
        id: string;
        plateNumber: string;
        model: string;
        manufacturingYear: number;
        seatCount: number;
      } | null = null;
      if (booking.vehicleId) {
        const [row] = await context.db
          .select({
            id: schema.vehicles.id,
            plateNumber: schema.vehicles.plateNumber,
            model: schema.vehicles.model,
            manufacturingYear: schema.vehicles.manufacturingYear,
            seatCount: schema.vehicles.seatCount,
          })
          .from(schema.vehicles)
          .where(eq(schema.vehicles.id, booking.vehicleId))
          .limit(1);
        vehicle = row ?? null;
      }

      const notices = await context.db
        .select({
          id: schema.notificationMessages.id,
          category: schema.notificationMessages.category,
          titleAr: schema.notificationMessages.titleAr,
          titleEn: schema.notificationMessages.titleEn,
          bodyAr: schema.notificationMessages.bodyAr,
          bodyEn: schema.notificationMessages.bodyEn,
          createdAt: schema.notificationMessages.createdAt,
        })
        .from(schema.notificationMessages)
        .where(
          and(
            eq(schema.notificationMessages.recipientAccountId, accountId),
            inArray(schema.notificationMessages.category, [
              "trip_updates",
              "operations",
              "safety",
            ] as const),
          ),
        )
        .orderBy(desc(schema.notificationMessages.createdAt))
        .limit(20);

      return {
        tripDay: {
          booking: {
            id: booking.id,
            bookingReference: booking.bookingReference,
            status: booking.status,
            passengersCount: booking.passengersCount,
            seatLabels: booking.seatLabels,
          },
          trip: {
            id: trip.id,
            titleAr: trip.titleAr,
            titleEn: trip.titleEn,
            startsAt: trip.startsAt,
            endsAt: trip.endsAt,
            timezone: trip.timezone,
            origin: trip.origin,
            destinations: trip.destinations,
            state: trip.state,
            seatAssignmentMode: trip.seatAssignmentMode,
            childTrackingEnabled: trip.childTrackingEnabled,
          },
          vehicle,
          boardingPasses,
          notices,
        },
      };
    }),

  /** Notice board for the signed-in traveler across bookings. */
  listMyNotices: authenticatedProcedure
    .route({
      method: "POST",
      path: "/traveler/trip-day/notices",
      operationId: "travelerTripDayNotices",
      summary: "Recent trip notices for the signed-in traveler",
      tags: ["traveler"],
    })
    .input(listNoticesInputSchema)
    .handler(async ({ context, input }) => {
      const notices = await context.db
        .select({
          id: schema.notificationMessages.id,
          category: schema.notificationMessages.category,
          titleAr: schema.notificationMessages.titleAr,
          titleEn: schema.notificationMessages.titleEn,
          bodyAr: schema.notificationMessages.bodyAr,
          bodyEn: schema.notificationMessages.bodyEn,
          actionUrl: schema.notificationMessages.actionUrl,
          isRead: schema.notificationMessages.isRead,
          createdAt: schema.notificationMessages.createdAt,
        })
        .from(schema.notificationMessages)
        .where(eq(schema.notificationMessages.recipientAccountId, context.auth.accountId))
        .orderBy(desc(schema.notificationMessages.createdAt))
        .limit(input?.limit ?? 20);
      return { notices };
    }),
};
