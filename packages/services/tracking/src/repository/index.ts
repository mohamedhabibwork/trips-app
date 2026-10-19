import { and, desc, eq } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { TrackingAlertSeverity, TrackingCoordinates, TrackingEventType } from "../model";

export type { ServiceDatabase };

export function createTrackingRepository(db: Database) {
  return {
    async findTripById(tripId: string) {
      const [row] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      return row ?? null;
    },

    async insertTrackingEvent(values: {
      tenantId: string;
      tripId: string;
      vehicleId: string | null;
      recordedByAccountId: string;
      eventType: TrackingEventType;
      coordinates?: TrackingCoordinates | null;
      severity: TrackingAlertSeverity;
      childPassengerId?: string | null;
      messageAr?: string | null;
      messageEn?: string | null;
    }) {
      const [created] = await db
        .insert(schema.tripTrackingEvents)
        .values({
          tenantId: values.tenantId,
          tripId: values.tripId,
          vehicleId: values.vehicleId,
          recordedByAccountId: values.recordedByAccountId,
          eventType: values.eventType,
          coordinates: values.coordinates ?? null,
          severity: values.severity,
          childPassengerId: values.childPassengerId ?? null,
          messageAr: values.messageAr ?? null,
          messageEn: values.messageEn ?? null,
        })
        .returning();
      return created!;
    },

    async listEventsForTrip(tripId: string) {
      return db
        .select()
        .from(schema.tripTrackingEvents)
        .where(eq(schema.tripTrackingEvents.tripId, tripId))
        .orderBy(desc(schema.tripTrackingEvents.occurredAt))
        .limit(100);
    },

    async listSafetyAlerts(tenantId?: string | null) {
      const condition = tenantId
        ? and(
            eq(schema.tripTrackingEvents.tenantId, tenantId),
            eq(schema.tripTrackingEvents.eventType, "safety_alert"),
          )
        : eq(schema.tripTrackingEvents.eventType, "safety_alert");
      return db
        .select()
        .from(schema.tripTrackingEvents)
        .where(condition)
        .orderBy(desc(schema.tripTrackingEvents.occurredAt));
    },
  };
}

export type TrackingRepository = ReturnType<typeof createTrackingRepository>;
