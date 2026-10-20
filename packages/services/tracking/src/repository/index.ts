import { and, desc, eq, gte, lte } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { TrackingAlertSeverity, TrackingCoordinates, TrackingEventType } from "../model";

export type { ServiceDatabase };

export function createTrackingRepository(db: ServiceDatabase) {
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

    async insertTrackingEvents(
      events: Array<{
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
      }>,
    ) {
      if (events.length === 0) return [];
      return db
        .insert(schema.tripTrackingEvents)
        .values(
          events.map((e) => ({
            tenantId: e.tenantId,
            tripId: e.tripId,
            vehicleId: e.vehicleId,
            recordedByAccountId: e.recordedByAccountId,
            eventType: e.eventType,
            coordinates: e.coordinates ?? null,
            severity: e.severity,
            childPassengerId: e.childPassengerId ?? null,
            messageAr: e.messageAr ?? null,
            messageEn: e.messageEn ?? null,
          })),
        )
        .returning();
    },

    async listEventsForTrip(
      tripId: string,
      filters?: {
        eventType?: TrackingEventType;
        severity?: TrackingAlertSeverity;
        since?: Date;
        limit?: number;
        offset?: number;
      },
    ) {
      let query = db.select().from(schema.tripTrackingEvents).$dynamic();
      const conditions = [eq(schema.tripTrackingEvents.tripId, tripId)];
      if (filters?.eventType)
        conditions.push(eq(schema.tripTrackingEvents.eventType, filters.eventType));
      if (filters?.severity)
        conditions.push(eq(schema.tripTrackingEvents.severity, filters.severity));
      if (filters?.since) conditions.push(gte(schema.tripTrackingEvents.occurredAt, filters.since));
      query = query.where(and(...conditions)).orderBy(desc(schema.tripTrackingEvents.occurredAt));
      query = query.limit(filters?.limit !== undefined ? filters.limit : 100);
      if (filters?.offset !== undefined) query = query.offset(filters.offset);
      return query;
    },

    async listSafetyAlerts(
      filtersOrTenantId?:
        | string
        | null
        | {
            tenantId?: string | null;
            severity?: TrackingAlertSeverity;
            from?: Date;
            to?: Date;
            limit?: number;
            offset?: number;
          },
    ) {
      const tenantId =
        typeof filtersOrTenantId === "string" || filtersOrTenantId === null
          ? filtersOrTenantId
          : filtersOrTenantId?.tenantId;
      const severity =
        typeof filtersOrTenantId === "object" ? filtersOrTenantId?.severity : undefined;
      const from = typeof filtersOrTenantId === "object" ? filtersOrTenantId?.from : undefined;
      const to = typeof filtersOrTenantId === "object" ? filtersOrTenantId?.to : undefined;
      const limit = typeof filtersOrTenantId === "object" ? filtersOrTenantId?.limit : undefined;
      const offset = typeof filtersOrTenantId === "object" ? filtersOrTenantId?.offset : undefined;

      let query = db.select().from(schema.tripTrackingEvents).$dynamic();
      const conditions = [eq(schema.tripTrackingEvents.eventType, "safety_alert")];
      if (tenantId) conditions.push(eq(schema.tripTrackingEvents.tenantId, tenantId));
      if (severity) conditions.push(eq(schema.tripTrackingEvents.severity, severity));
      if (from) conditions.push(gte(schema.tripTrackingEvents.occurredAt, from));
      if (to) conditions.push(lte(schema.tripTrackingEvents.occurredAt, to));

      query = query.where(and(...conditions)).orderBy(desc(schema.tripTrackingEvents.occurredAt));
      if (limit !== undefined) query = query.limit(limit);
      if (offset !== undefined) query = query.offset(offset);
      return query;
    },
  };
}

export type TrackingRepository = ReturnType<typeof createTrackingRepository>;
