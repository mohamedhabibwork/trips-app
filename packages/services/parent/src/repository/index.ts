import { and, desc, eq, isNull, or } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";

export type { ServiceDatabase };

export function createParentRepository(db: ServiceDatabase) {
  return {
    async listLinksByParent(parentAccountId: string) {
      return db
        .select()
        .from(schema.parentChildLinks)
        .where(eq(schema.parentChildLinks.parentAccountId, parentAccountId))
        .orderBy(desc(schema.parentChildLinks.createdAt));
    },

    async findBookingById(bookingId: string) {
      const [row] = await db
        .select()
        .from(schema.bookings)
        .where(eq(schema.bookings.id, bookingId))
        .limit(1);
      return row ?? null;
    },

    async insertLink(values: {
      parentAccountId: string;
      tenantId: string;
      tripId: string;
      bookingId: string;
      childPassengerId: string;
      childFullName: string;
      relationship: string;
    }) {
      const [created] = await db
        .insert(schema.parentChildLinks)
        .values({
          ...values,
          consentSigned: true,
          status: "active",
        })
        .returning();
      return created!;
    },

    async findLinkById(linkId: string) {
      const [row] = await db
        .select()
        .from(schema.parentChildLinks)
        .where(eq(schema.parentChildLinks.id, linkId))
        .limit(1);
      return row ?? null;
    },

    async markLinkRevoked(linkId: string) {
      const [updated] = await db
        .update(schema.parentChildLinks)
        .set({ status: "revoked", updatedAt: new Date() })
        .where(eq(schema.parentChildLinks.id, linkId))
        .returning();
      return updated ?? null;
    },

    async findChildCheckInRecord(bookingId: string, childPassengerId: string) {
      const [row] = await db
        .select()
        .from(schema.checkInRecords)
        .where(
          and(
            eq(schema.checkInRecords.bookingId, bookingId),
            eq(schema.checkInRecords.passengerId, childPassengerId),
          ),
        )
        .limit(1);
      return row ?? null;
    },

    async listChildTripEvents(tripId: string, childPassengerId: string) {
      return db
        .select()
        .from(schema.tripTrackingEvents)
        .where(
          and(
            eq(schema.tripTrackingEvents.tripId, tripId),
            or(
              eq(schema.tripTrackingEvents.childPassengerId, childPassengerId),
              isNull(schema.tripTrackingEvents.childPassengerId),
            ),
          ),
        )
        .orderBy(desc(schema.tripTrackingEvents.occurredAt))
        .limit(50);
    },
  };
}

export type ParentRepository = ReturnType<typeof createParentRepository>;
