// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import {
  and,
  type Database,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  linkUploadedFilesOnItemSave,
  ne,
  or,
  schema,
} from "@trips-app/db";

import type {
  SeatLayoutConfig,
  UserRole,
  VehicleRegistrationStatus,
  VehicleStatus,
  VehicleTypeScope,
  VehicleTypeStatus,
} from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { auditLogs, trips, tripVehicles, vehicles, vehicleTypes } = schema;

export function createFleetRepository(db: Database) {
  return {
    async listVehicleTypesForTenant(
      tenantId: string,
      options?: { scope?: VehicleTypeScope; includeArchived?: boolean },
    ) {
      const scopeClause =
        options?.scope === "platform"
          ? and(eq(vehicleTypes.scope, "platform"), isNull(vehicleTypes.tenantId))
          : options?.scope === "organization"
            ? eq(vehicleTypes.tenantId, tenantId)
            : or(
                and(eq(vehicleTypes.scope, "platform"), isNull(vehicleTypes.tenantId)),
                eq(vehicleTypes.tenantId, tenantId),
              );

      const conditions = [scopeClause];
      if (!options?.includeArchived) {
        conditions.push(eq(vehicleTypes.status, "active"));
      }

      return db
        .select()
        .from(vehicleTypes)
        .where(and(...conditions))
        .orderBy(desc(vehicleTypes.createdAt));
    },

    async findAccessibleVehicleTypeById(tenantId: string, vehicleTypeId: string) {
      const [row] = await db
        .select()
        .from(vehicleTypes)
        .where(
          and(
            eq(vehicleTypes.id, vehicleTypeId),
            or(
              and(eq(vehicleTypes.scope, "platform"), isNull(vehicleTypes.tenantId)),
              eq(vehicleTypes.tenantId, tenantId),
            ),
          ),
        )
        .limit(1);
      return row ?? null;
    },

    async findTenantOwnedVehicleTypeById(tenantId: string, vehicleTypeId: string) {
      const [row] = await db
        .select()
        .from(vehicleTypes)
        .where(and(eq(vehicleTypes.id, vehicleTypeId), eq(vehicleTypes.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async insertVehicleType(values: {
      tenantId: string | null;
      scope: VehicleTypeScope;
      categoryLookupCode: string;
      nameAr: string;
      nameEn: string;
      descriptionAr: string | null;
      descriptionEn: string | null;
      seatCount: number;
      seatLayout: SeatLayoutConfig;
      createdByAccountId: string;
    }) {
      const now = new Date();
      const [created] = await db
        .insert(vehicleTypes)
        .values({
          ...values,
          status: "active",
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return created!;
    },

    async updateTenantVehicleType(
      tenantId: string,
      vehicleTypeId: string,
      patch: {
        categoryLookupCode?: string;
        nameAr?: string;
        nameEn?: string;
        descriptionAr?: string | null;
        descriptionEn?: string | null;
        seatCount?: number;
        seatLayout?: SeatLayoutConfig;
        status?: VehicleTypeStatus;
      },
    ) {
      const [updated] = await db
        .update(vehicleTypes)
        .set({
          ...patch,
          updatedAt: new Date(),
        })
        .where(and(eq(vehicleTypes.id, vehicleTypeId), eq(vehicleTypes.tenantId, tenantId)))
        .returning();
      return updated ?? null;
    },

    async listVehiclesForTenant(
      tenantId: string,
      filters?: {
        status?: VehicleStatus;
        vehicleTypeId?: string;
        search?: string;
      },
    ) {
      const conditions = [eq(vehicles.tenantId, tenantId)];
      if (filters?.status) {
        conditions.push(eq(vehicles.status, filters.status));
      }
      if (filters?.vehicleTypeId) {
        conditions.push(eq(vehicles.vehicleTypeId, filters.vehicleTypeId));
      }
      if (filters?.search) {
        const pattern = `%${filters.search}%`;
        conditions.push(or(ilike(vehicles.plateNumber, pattern), ilike(vehicles.model, pattern))!);
      }

      const rows = await db
        .select({
          vehicle: vehicles,
          vehicleType: vehicleTypes,
        })
        .from(vehicles)
        .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
        .where(and(...conditions))
        .orderBy(desc(vehicles.createdAt));

      return rows;
    },

    async findVehicleById(tenantId: string, vehicleId: string) {
      const [row] = await db
        .select({
          vehicle: vehicles,
          vehicleType: vehicleTypes,
        })
        .from(vehicles)
        .leftJoin(vehicleTypes, eq(vehicles.vehicleTypeId, vehicleTypes.id))
        .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async findVehicleByNormalizedPlate(
      tenantId: string,
      plateNumberNormalized: string,
      excludeVehicleId?: string,
    ) {
      const conditions = [
        eq(vehicles.tenantId, tenantId),
        eq(vehicles.plateNumberNormalized, plateNumberNormalized),
      ];
      if (excludeVehicleId) {
        conditions.push(ne(vehicles.id, excludeVehicleId));
      }
      const [row] = await db
        .select({ id: vehicles.id })
        .from(vehicles)
        .where(and(...conditions))
        .limit(1);
      return row ?? null;
    },

    async listTripAssignmentsForVehicles(tenantId: string, vehicleIds: readonly string[]) {
      if (vehicleIds.length === 0) return [];
      return db
        .select({
          tripVehicleId: tripVehicles.id,
          vehicleId: tripVehicles.vehicleId,
          tripId: trips.id,
          tripState: trips.state,
          confirmedSeatsCount: trips.confirmedSeatsCount,
        })
        .from(tripVehicles)
        .innerJoin(trips, eq(tripVehicles.tripId, trips.id))
        .where(
          and(
            eq(tripVehicles.tenantId, tenantId),
            inArray(tripVehicles.vehicleId, [...vehicleIds]),
          ),
        );
    },

    async insertVehicle(values: {
      tenantId: string;
      vehicleTypeId: string;
      plateNumber: string;
      plateNumberNormalized: string;
      model: string;
      manufacturingYear: number;
      seatCount: number;
      registrationStatus: VehicleRegistrationStatus;
      registrationExpiry: Date | null;
      registrationDocumentUrl: string | null;
      photoUrls: string[];
      amenityCodes: string[];
      status: VehicleStatus;
      notes: string | null;
      createdByAccountId: string;
      fileIds?: readonly string[];
    }) {
      const now = new Date();
      const [created] = await db
        .insert(vehicles)
        .values({
          tenantId: values.tenantId,
          vehicleTypeId: values.vehicleTypeId,
          plateNumber: values.plateNumber,
          plateNumberNormalized: values.plateNumberNormalized,
          model: values.model,
          manufacturingYear: values.manufacturingYear,
          seatCount: values.seatCount,
          registrationStatus: values.registrationStatus,
          registrationExpiry: values.registrationExpiry,
          registrationDocumentUrl: values.registrationDocumentUrl,
          photoUrls: values.photoUrls,
          amenityCodes: values.amenityCodes,
          status: values.status,
          notes: values.notes,
          createdByAccountId: values.createdByAccountId,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      const allUrls = [values.registrationDocumentUrl, ...values.photoUrls].filter(
        (u): u is string => Boolean(u),
      );

      if (allUrls.length > 0 || (values.fileIds && values.fileIds.length > 0)) {
        await linkUploadedFilesOnItemSave(db, {
          entityType: "vehicle",
          entityId: created!.id,
          tenantId: values.tenantId,
          uploaderAccountId: values.createdByAccountId,
          fileIds: values.fileIds,
          urls: allUrls,
          storageKeys: allUrls,
          replaceExistingForEntity: true,
          now,
        });
      }

      return created!;
    },

    async updateVehicle(
      tenantId: string,
      vehicleId: string,
      values: {
        vehicleTypeId?: string;
        plateNumber?: string;
        plateNumberNormalized?: string;
        model?: string;
        manufacturingYear?: number;
        seatCount?: number;
        registrationStatus?: VehicleRegistrationStatus;
        registrationExpiry?: Date | null;
        registrationDocumentUrl?: string | null;
        photoUrls?: string[];
        amenityCodes?: string[];
        status?: VehicleStatus;
        notes?: string | null;
        updatedByAccountId: string;
        fileIds?: readonly string[];
      },
    ) {
      const now = new Date();
      const { updatedByAccountId, fileIds, ...patch } = values;
      const [updated] = await db
        .update(vehicles)
        .set({
          ...patch,
          updatedAt: now,
        })
        .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
        .returning();

      if (!updated) return null;

      if (
        values.registrationDocumentUrl !== undefined ||
        values.photoUrls !== undefined ||
        fileIds !== undefined
      ) {
        const allUrls = [updated.registrationDocumentUrl, ...(updated.photoUrls ?? [])].filter(
          (u): u is string => Boolean(u),
        );

        await linkUploadedFilesOnItemSave(db, {
          entityType: "vehicle",
          entityId: updated.id,
          tenantId,
          uploaderAccountId: updatedByAccountId,
          fileIds,
          urls: allUrls,
          storageKeys: allUrls,
          replaceExistingForEntity: true,
          now,
        });
      }

      return updated;
    },

    async retireVehicleAndDetachFromDraftTrips(
      tenantId: string,
      vehicleId: string,
      draftTripVehicleIds: readonly string[],
    ) {
      const now = new Date();
      if (draftTripVehicleIds.length > 0) {
        await db
          .delete(tripVehicles)
          .where(
            and(
              eq(tripVehicles.tenantId, tenantId),
              inArray(tripVehicles.id, [...draftTripVehicleIds]),
            ),
          );
      }

      const [updated] = await db
        .update(vehicles)
        .set({
          status: "retired",
          updatedAt: now,
        })
        .where(and(eq(vehicles.id, vehicleId), eq(vehicles.tenantId, tenantId)))
        .returning();

      return updated ?? null;
    },

    async writeAuditLog(entry: {
      actorAccountId: string;
      actorRole: UserRole;
      tenantId: string | null;
      action: string;
      targetEntityType: string;
      targetEntityId: string;
      reason?: string | null;
      beforeState?: Record<string, unknown> | null;
      afterState?: Record<string, unknown> | null;
      ipAddress?: string | null;
      requestId?: string | null;
    }) {
      const [created] = await db.insert(auditLogs).values(entry).returning();
      return created!;
    },
  };
}
