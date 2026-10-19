import { and, desc, eq, inArray, or, sql } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { BookingPassenger, CurrencyCode, PaymentGatewayCode } from "../model";

export type { ServiceDatabase };

export function createBookingRepository(db: Database) {
  return {
    async findTripById(tripId: string) {
      const [row] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      return row ?? null;
    },

    async findTripByIdForUpdate(tripId: string) {
      const [row] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .for("update");
      return row ?? null;
    },

    async findActiveProgramsByIds(tripId: string, programIds: string[]) {
      if (programIds.length === 0) return [];
      return db
        .select()
        .from(schema.tripPrograms)
        .where(
          and(
            eq(schema.tripPrograms.tripId, tripId),
            eq(schema.tripPrograms.status, "active"),
            inArray(schema.tripPrograms.id, programIds),
          ),
        );
    },

    async adjustProgramsBookedCount(programIds: string[], delta: number) {
      if (programIds.length === 0) return;
      await db
        .update(schema.tripPrograms)
        .set({
          bookedCount: sql`GREATEST(0, ${schema.tripPrograms.bookedCount} + ${delta})`,
          updatedAt: new Date(),
        })
        .where(inArray(schema.tripPrograms.id, programIds));
    },

    async findCouponByCode(code: string, tenantId: string) {
      const normalized = code.trim().toUpperCase();
      const [row] = await db
        .select()
        .from(schema.coupons)
        .where(
          and(
            eq(schema.coupons.code, normalized),
            eq(schema.coupons.status, "active"),
            or(eq(schema.coupons.tenantId, tenantId), eq(schema.coupons.scope, "platform")),
          ),
        )
        .for("update");
      return row ?? null;
    },

    /** Unscoped existence probe so a foreign-creator coupon maps to the generic failure message. */
    async findAnyCouponByCode(code: string) {
      const normalized = code.trim().toUpperCase();
      const [row] = await db
        .select()
        .from(schema.coupons)
        .where(eq(schema.coupons.code, normalized))
        .limit(1);
      return row ?? null;
    },

    async decrementCouponRedemption(couponId: string) {
      await db
        .update(schema.coupons)
        .set({
          redemptionsCount: sql`GREATEST(0, ${schema.coupons.redemptionsCount} - 1)`,
          updatedAt: new Date(),
        })
        .where(eq(schema.coupons.id, couponId));
    },

    async findTripByBookingId(tripId: string) {
      const [row] = await db
        .select({ startsAt: schema.trips.startsAt })
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      return row ?? null;
    },

    async incrementCouponRedemption(couponId: string) {
      await db
        .update(schema.coupons)
        .set({
          redemptionsCount: sql`${schema.coupons.redemptionsCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(schema.coupons.id, couponId));
    },

    async findSeatInventoryForLabels(tripId: string, vehicleId: string, seatLabels: string[]) {
      if (seatLabels.length === 0) return [];
      return db
        .select()
        .from(schema.tripSeatInventory)
        .where(
          and(
            eq(schema.tripSeatInventory.tripId, tripId),
            eq(schema.tripSeatInventory.vehicleId, vehicleId),
            inArray(schema.tripSeatInventory.seatLabel, seatLabels),
          ),
        )
        .for("update");
    },

    async reserveSeatLabels(
      tenantId: string,
      tripId: string,
      vehicleId: string,
      bookingId: string,
      seatLabels: string[],
    ) {
      if (seatLabels.length === 0) return;
      const existing = await this.findSeatInventoryForLabels(tripId, vehicleId, seatLabels);
      const byLabel = new Map(existing.map((r) => [r.seatLabel, r]));
      const now = new Date();

      for (const label of seatLabels) {
        const row = byLabel.get(label);
        if (row) {
          await db
            .update(schema.tripSeatInventory)
            .set({
              status: "reserved",
              bookingId,
              heldByAccountId: null,
              holdExpiresAt: null,
              updatedAt: now,
            })
            .where(eq(schema.tripSeatInventory.id, row.id));
        } else {
          await db.insert(schema.tripSeatInventory).values({
            tenantId,
            tripId,
            vehicleId,
            seatLabel: label,
            status: "reserved",
            bookingId,
            updatedAt: now,
          });
        }
      }
    },

    async releaseReservedSeats(tripId: string, vehicleId: string | null, seatLabels: string[]) {
      if (!vehicleId || seatLabels.length === 0) return;
      await db
        .update(schema.tripSeatInventory)
        .set({
          status: "available",
          bookingId: null,
          passengerName: null,
          heldByAccountId: null,
          holdExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.tripSeatInventory.tripId, tripId),
            eq(schema.tripSeatInventory.vehicleId, vehicleId),
            inArray(schema.tripSeatInventory.seatLabel, seatLabels),
          ),
        );
    },

    async insertBooking(values: {
      bookingReference: string;
      tenantId: string;
      tripId: string;
      travelerAccountId: string;
      vehicleId: string | null;
      passengersCount: number;
      passengers: BookingPassenger[];
      selectedProgramIds: string[];
      seatLabels: string[];
      couponId: string | null;
      couponCode: string | null;
      subtotalMinor: number;
      programsTotalMinor: number;
      discountMinor: number;
      totalAmountMinor: number;
      currencyCode: CurrencyCode;
      paymentGateway: PaymentGatewayCode;
    }) {
      const [created] = await db.insert(schema.bookings).values(values).returning();
      return created!;
    },

    async insertCheckInRecords(
      records: Array<{
        tenantId: string;
        tripId: string;
        vehicleId: string | null;
        bookingId: string;
        passengerId: string;
        passengerName: string;
        seatLabel: string | null;
        qrCodeToken: string;
      }>,
    ) {
      if (records.length === 0) return [];
      return db.insert(schema.checkInRecords).values(records).returning();
    },

    async insertParentChildLinks(
      links: Array<{
        parentAccountId: string;
        tenantId: string;
        tripId: string;
        bookingId: string;
        childPassengerId: string;
        childFullName: string;
      }>,
    ) {
      if (links.length === 0) return [];
      return db.insert(schema.parentChildLinks).values(links).returning();
    },

    async adjustTripConfirmedSeats(tripId: string, delta: number) {
      await db
        .update(schema.trips)
        .set({
          confirmedSeatsCount: sql`GREATEST(0, ${schema.trips.confirmedSeatsCount} + ${delta})`,
          updatedAt: new Date(),
        })
        .where(eq(schema.trips.id, tripId));
    },

    async findBookingById(bookingId: string) {
      const [row] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId))
        .limit(1);
      return row ?? null;
    },

    async findCheckInRecordsByBooking(bookingId: string) {
      return db
        .select()
        .from(schema.checkInRecords)
        .where(eq(schema.checkInRecords.bookingId, bookingId));
    },

    async listTravelerBookings(travelerAccountId: string) {
      return db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.travelerAccountId, travelerAccountId))
        .orderBy(desc(schema.bookings.createdAt));
    },

    async listOrganizationBookings(tenantId: string, tripId?: string) {
      const condition = tripId
        ? and(eq(schema.bookings.tenantId, tenantId), eq(schema.bookings.tripId, tripId))
        : eq(schema.bookings.tenantId, tenantId);
      return db
        .select()
        .from(schema.bookings)
        .where(condition)
        .orderBy(desc(schema.bookings.createdAt));
    },

    async markBookingCancelled(bookingId: string, reason: string, refundAmountMinor: number) {
      const now = new Date();
      const [updated] = await db
        .update(schema.bookings)
        .set({
          status: "cancelled",
          cancelledAt: now,
          cancellationReason: reason,
          refundAmountMinor,
          updatedAt: now,
        })
        .where(eq(schema.bookings.id, bookingId))
        .returning();
      return updated ?? null;
    },
  };
}

export type BookingRepository = ReturnType<typeof createBookingRepository>;
