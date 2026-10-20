import {
  and,
  desc,
  eq,
  gte,
  inArray,
  lte,
  or,
  schema,
  type ServiceDatabase,
  sql,
} from "@trips-app/db";
import {
  PAYMENT_CONFIRM_TIMEOUT_SECONDS,
  type BookingPassenger,
  type CurrencyCode,
  type PaymentGatewayCode,
} from "../model";

export type { ServiceDatabase };

export function createBookingRepository(db: ServiceDatabase) {
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

    /** Seats taken by live bookings: confirmed always, pending payment only within its D-30
     * confirm window (older pendings are expired, so they must not block new bookings). */
    async sumActiveBookedPassengers(tripId: string, pendingCutoff: Date) {
      const [row] = await db
        .select({
          total: sql<number>`coalesce(sum(${schema.bookings.passengersCount}), 0)::int`,
        })
        .from(schema.bookings)
        .where(
          and(
            eq(schema.bookings.tripId, tripId),
            or(
              eq(schema.bookings.status, "confirmed"),
              and(
                eq(schema.bookings.status, "pending_payment"),
                sql`${schema.bookings.createdAt} >= ${pendingCutoff}`,
              ),
            ),
          ),
        );
      return Number(row?.total ?? 0);
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

    /** Of the given booking ids, the ones whose seat reservations still occupy their
     * seats: paid states always, pendings within the D-30 confirm window. */
    async findBlockingBookingIds(bookingIds: string[], now: Date) {
      if (bookingIds.length === 0) return [];
      const rows = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(
          and(
            inArray(schema.bookings.id, bookingIds),
            or(
              inArray(schema.bookings.status, ["confirmed", "checked_in", "completed"]),
              and(
                eq(schema.bookings.status, "pending_payment"),
                gte(
                  schema.bookings.createdAt,
                  new Date(now.getTime() - PAYMENT_CONFIRM_TIMEOUT_SECONDS * 1000),
                ),
              ),
            ),
          ),
        );
      return rows.map((row) => row.id);
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
      const existingByLabel = new Map(existing.map((r) => [r.seatLabel, r]));
      const existingIds = existing.map((r) => r.id);
      const missingLabels = seatLabels.filter((label) => !existingByLabel.has(label));
      const now = new Date();

      const operations: Promise<unknown>[] = [];

      // 1. Bulk update existing seat inventory rows in 1 query
      if (existingIds.length > 0) {
        operations.push(
          db
            .update(schema.tripSeatInventory)
            .set({
              status: "reserved",
              bookingId,
              heldByAccountId: null,
              holdExpiresAt: null,
              updatedAt: now,
            })
            .where(inArray(schema.tripSeatInventory.id, existingIds)),
        );
      }

      // 2. Bulk insert missing seat inventory rows in 1 query
      if (missingLabels.length > 0) {
        operations.push(
          db.insert(schema.tripSeatInventory).values(
            missingLabels.map((label) => ({
              tenantId,
              tripId,
              vehicleId,
              seatLabel: label,
              status: "reserved" as const,
              bookingId,
              updatedAt: now,
            })),
          ),
        );
      }

      if (operations.length > 0) {
        await Promise.all(operations);
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

    async listTravelerBookings(
      travelerAccountId: string,
      filters?: {
        status?: string;
        dateRange?: { from?: Date; to?: Date };
      },
    ) {
      let query = db.select().from(schema.bookings).$dynamic();

      const conditions = [eq(schema.bookings.travelerAccountId, travelerAccountId)];
      if (filters?.status) {
        conditions.push(eq(schema.bookings.status, filters.status as any));
      }
      if (filters?.dateRange?.from) {
        conditions.push(gte(schema.bookings.createdAt, filters.dateRange.from));
      }
      if (filters?.dateRange?.to) {
        conditions.push(lte(schema.bookings.createdAt, filters.dateRange.to));
      }

      query = query.where(and(...conditions));
      query = query.orderBy(desc(schema.bookings.createdAt));
      return query;
    },

    async listOrganizationBookings(
      tenantId: string,
      filtersOrTripId?:
        | string
        | {
            tripId?: string;
            status?: string;
            travelerAccountId?: string;
            dateRange?: { from?: Date; to?: Date };
          },
    ) {
      const tripId =
        typeof filtersOrTripId === "string" ? filtersOrTripId : filtersOrTripId?.tripId;
      const status = typeof filtersOrTripId === "object" ? filtersOrTripId?.status : undefined;
      const travelerAccountId =
        typeof filtersOrTripId === "object" ? filtersOrTripId?.travelerAccountId : undefined;
      const dateRange =
        typeof filtersOrTripId === "object" ? filtersOrTripId?.dateRange : undefined;

      let query = db.select().from(schema.bookings).$dynamic();

      const conditions = [eq(schema.bookings.tenantId, tenantId)];
      if (tripId) {
        conditions.push(eq(schema.bookings.tripId, tripId));
      }
      if (status) {
        conditions.push(eq(schema.bookings.status, status as any));
      }
      if (travelerAccountId) {
        conditions.push(eq(schema.bookings.travelerAccountId, travelerAccountId));
      }
      if (dateRange?.from) {
        conditions.push(gte(schema.bookings.createdAt, dateRange.from));
      }
      if (dateRange?.to) {
        conditions.push(lte(schema.bookings.createdAt, dateRange.to));
      }

      query = query.where(and(...conditions));
      query = query.orderBy(desc(schema.bookings.createdAt));
      return query;
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
