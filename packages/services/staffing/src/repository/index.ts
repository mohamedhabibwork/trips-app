// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, type Database, eq, schema } from "@trips-app/db";

import type { TripStaffSource } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { moderatorAssignments, organizations, planCatalog, trips, tripVehicles, vehicles } = schema;

export function createStaffingRepository(db: Database) {
  return {
    async findOrganizationPlan(tenantId: string) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      if (!org) return null;
      const [plan] = await db
        .select()
        .from(planCatalog)
        .where(and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, org.planTier)))
        .limit(1);
      return { org, plan: plan ?? null };
    },

    async findTripForTenant(tenantId: string, tripId: string) {
      const [row] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async listTripVehiclesForTrip(tenantId: string, tripId: string) {
      return db
        .select({
          tripVehicle: tripVehicles,
          plateNumber: vehicles.plateNumber,
          model: vehicles.model,
        })
        .from(tripVehicles)
        .leftJoin(vehicles, eq(tripVehicles.vehicleId, vehicles.id))
        .where(and(eq(tripVehicles.tenantId, tenantId), eq(tripVehicles.tripId, tripId)));
    },

    async listModeratorAssignmentsForTrip(tenantId: string, tripId: string) {
      return db
        .select()
        .from(moderatorAssignments)
        .where(
          and(eq(moderatorAssignments.tenantId, tenantId), eq(moderatorAssignments.tripId, tripId)),
        );
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
      const [tripRow] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .limit(1);
      if (!tripRow) return null;
      const [updated] = await db
        .update(trips)
        .set({
          hasStaffingGap,
          wizardSteps: {
            ...tripRow.wizardSteps,
            staffing: true,
          },
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
