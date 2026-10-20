import { and, eq, inArray } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { CheckInMethod, CheckInStatus } from "../model";

export type { ServiceDatabase };

export function createCheckInRepository(db: ServiceDatabase) {
  return {
    async listManifest(tenantId: string, tripId: string, vehicleId?: string) {
      let query = db.select().from(schema.checkInRecords).$dynamic();
      const conditions = [
        eq(schema.checkInRecords.tenantId, tenantId),
        eq(schema.checkInRecords.tripId, tripId),
      ];
      if (vehicleId) {
        conditions.push(eq(schema.checkInRecords.vehicleId, vehicleId));
      }
      return query.where(and(...conditions));
    },

    async findByQrToken(qrCodeToken: string) {
      const [row] = await db
        .select()
        .from(schema.checkInRecords)
        .where(eq(schema.checkInRecords.qrCodeToken, qrCodeToken))
        .limit(1);
      return row ?? null;
    },

    async findById(id: string) {
      const [row] = await db
        .select()
        .from(schema.checkInRecords)
        .where(eq(schema.checkInRecords.id, id))
        .limit(1);
      return row ?? null;
    },

    async updateCheckInRecord(
      id: string,
      values: {
        status: CheckInStatus;
        checkedInByAccountId: string;
        method: CheckInMethod;
        notes?: string | null;
      },
    ) {
      const now = new Date();
      const [updated] = await db
        .update(schema.checkInRecords)
        .set({
          status: values.status,
          checkedInByAccountId: values.checkedInByAccountId,
          checkedInAt: now,
          method: values.method,
          notes: values.notes ?? null,
          updatedAt: now,
        })
        .where(eq(schema.checkInRecords.id, id))
        .returning();
      return updated ?? null;
    },

    async syncBookingCheckedInIfComplete(bookingId: string) {
      const records = await db
        .select()
        .from(schema.checkInRecords)
        .where(eq(schema.checkInRecords.bookingId, bookingId));
      if (records.length > 0 && records.every((r) => r.status === "checked_in")) {
        await db
          .update(schema.bookings)
          .set({ status: "checked_in", updatedAt: new Date() })
          .where(eq(schema.bookings.id, bookingId));
      }
    },

    async listBoardingPassesForTraveler(travelerAccountId: string, bookingId?: string) {
      const bookings = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(
          bookingId
            ? and(
                eq(schema.bookings.travelerAccountId, travelerAccountId),
                eq(schema.bookings.id, bookingId),
              )
            : eq(schema.bookings.travelerAccountId, travelerAccountId),
        );
      if (bookings.length === 0) return [];
      return db
        .select()
        .from(schema.checkInRecords)
        .where(
          inArray(
            schema.checkInRecords.bookingId,
            bookings.map((b) => b.id),
          ),
        );
    },
  };
}

export type CheckInRepository = ReturnType<typeof createCheckInRepository>;
