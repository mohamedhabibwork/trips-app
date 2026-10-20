// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, eq, schema, type ServiceDatabase, sql } from "@trips-app/db";

import type { TripStaffSource } from "../model";

export type { ServiceDatabase } from "@trips-app/db";

const { moderatorAssignments, organizations, planCatalog, trips, tripVehicles, vehicles } = schema;

export function createStaffingRepository(db: ServiceDatabase) {
  return {
    async findOrganizationPlan(tenantId: string) {
      const [row] = await db
        .select({
          org: organizations,
          plan: planCatalog,
        })
        .from(organizations)
        .leftJoin(
          planCatalog,
          and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, organizations.planTier)),
        )
        .where(eq(organizations.id, tenantId))
        .limit(1);
      if (!row) return null;
      return { org: row.org, plan: row.plan };
    },

    async findTripForTenant(tenantId: string, tripId: string) {
      const [row] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async listTripVehiclesForTrip(
      tenantId: string,
      tripId: string,
      filters?: {
        vehicleId?: string;
        driverSource?: TripStaffSource;
      },
    ) {
      let query = db
        .select({
          tripVehicle: tripVehicles,
          plateNumber: vehicles.plateNumber,
          model: vehicles.model,
        })
        .from(tripVehicles)
        .leftJoin(vehicles, eq(tripVehicles.vehicleId, vehicles.id))
        .$dynamic();

      const conditions = [eq(tripVehicles.tenantId, tenantId), eq(tripVehicles.tripId, tripId)];
      if (filters?.vehicleId) {
        conditions.push(eq(tripVehicles.vehicleId, filters.vehicleId));
      }
      if (filters?.driverSource) {
        conditions.push(eq(tripVehicles.driverSource, filters.driverSource));
      }

      query = query.where(and(...conditions));
      return query;
    },

    async listModeratorAssignments(
      tenantId: string,
      filters?: {
        tripId?: string;
        vehicleId?: string;
        accountId?: string;
        status?: typeof moderatorAssignments.$inferSelect.status;
      },
    ) {
      let query = db.select().from(moderatorAssignments).$dynamic();

      const conditions = [eq(moderatorAssignments.tenantId, tenantId)];
      if (filters?.tripId) {
        conditions.push(eq(moderatorAssignments.tripId, filters.tripId));
      }
      if (filters?.vehicleId) {
        conditions.push(eq(moderatorAssignments.vehicleId, filters.vehicleId));
      }
      if (filters?.accountId) {
        conditions.push(eq(moderatorAssignments.accountId, filters.accountId));
      }
      if (filters?.status) {
        conditions.push(eq(moderatorAssignments.status, filters.status));
      }

      query = query.where(and(...conditions));
      return query;
    },

    async listModeratorAssignmentsForTrip(tenantId: string, tripId: string) {
      return this.listModeratorAssignments(tenantId, { tripId });
    },

    async updateVehicleStaffAssignment(
      tenantId: string,
      tripId: string,
      vehicleId: string,
      staffing: {
        driverSource: TripStaffSource;
        driverAccountId: string | null;
        moderatorSource: TripStaffSource;
        moderatorAccountId: string | null;
        photographerSource: TripStaffSource;
        photographerAccountId: string | null;
      },
    ) {
      const [updated] = await db
        .update(tripVehicles)
        .set({
          ...staffing,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tripVehicles.tenantId, tenantId),
            eq(tripVehicles.tripId, tripId),
            eq(tripVehicles.vehicleId, vehicleId),
          ),
        )
        .returning();
      return updated ?? null;
    },

    async updateTripStaffingGap(tenantId: string, tripId: string, hasStaffingGap: boolean) {
      const [updated] = await db
        .update(trips)
        .set({
          hasStaffingGap,
          wizardSteps: sql`coalesce(${trips.wizardSteps}, '{}'::jsonb) || '{"staffing": true}'::jsonb`,
          updatedAt: new Date(),
        })
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .returning();
      return updated ?? null;
    },

    async insertModeratorAssignment(values: {
      tenantId: string;
      accountId: string;
      tripId: string;
      vehicleId: string;
      staffCodeHash: string;
      validFrom: Date;
      validUntil: Date;
    }) {
      const [created] = await db
        .insert(moderatorAssignments)
        .values({
          tenantId: values.tenantId,
          accountId: values.accountId,
          tripId: values.tripId,
          vehicleId: values.vehicleId,
          staffCodeHash: values.staffCodeHash,
          validFrom: values.validFrom,
          validUntil: values.validUntil,
          status: "assigned",
        })
        .returning();
      return created!;
    },

    async revokeModeratorAssignment(tenantId: string, assignmentId: string) {
      const [updated] = await db
        .update(moderatorAssignments)
        .set({ status: "revoked" })
        .where(
          and(
            eq(moderatorAssignments.id, assignmentId),
            eq(moderatorAssignments.tenantId, tenantId),
          ),
        )
        .returning();
      return updated ?? null;
    },
  };
}
