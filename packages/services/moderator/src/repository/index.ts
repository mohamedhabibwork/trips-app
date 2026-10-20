import { and, eq, isNull, or } from "@trips-app/db";
import type { ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { CheckInStatus, TrackingAlertSeverity } from "../model";

export type { ServiceDatabase };

export function createModeratorRepository(db: ServiceDatabase) {
  return {
    async findTripById(tripId: string) {
      const [row] = await db
        .select()
        .from(schema.trips)
        .where(eq(schema.trips.id, tripId))
        .limit(1);
      return row ?? null;
    },

    async listVehicleManifest(tripId: string, vehicleId: string) {
      return db
        .select()
        .from(schema.checkInRecords)
        .where(
          and(
            eq(schema.checkInRecords.tripId, tripId),
            or(
              eq(schema.checkInRecords.vehicleId, vehicleId),
              isNull(schema.checkInRecords.vehicleId),
            ),
          ),
        );
    },

    async findCheckInRecordById(id: string) {
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
          method: "qr_scan",
          notes: values.notes ?? null,
          updatedAt: now,
        })
        .where(eq(schema.checkInRecords.id, id))
        .returning();
      return updated ?? null;
    },

    async insertTrackingEvent(values: {
      tenantId: string;
      tripId: string;
      vehicleId: string;
      recordedByAccountId: string;
      eventType: "headcount_verified" | "safety_alert";
      severity: TrackingAlertSeverity;
      messageAr?: string | null;
      messageEn?: string | null;
      metadata?: Record<string, unknown> | null;
    }) {
      const [created] = await db
        .insert(schema.tripTrackingEvents)
        .values({
          tenantId: values.tenantId,
          tripId: values.tripId,
          vehicleId: values.vehicleId,
          recordedByAccountId: values.recordedByAccountId,
          eventType: values.eventType,
          severity: values.severity,
          messageAr: values.messageAr ?? null,
          messageEn: values.messageEn ?? null,
          metadata: values.metadata ?? null,
        })
        .returning();
      return created!;
    },
  };
}

export type ModeratorRepository = ReturnType<typeof createModeratorRepository>;
