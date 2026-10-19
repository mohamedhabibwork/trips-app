// Business logic for Fleet. Routes call this factory with context.db; repositories are created here.
import { FleetServiceError } from "../errors";
import {
  areValidAmenityCodes,
  isValidVehicleCategoryCode,
  normalizeAmenityCodes,
  normalizePlateNumber,
  validateSeatLayout,
} from "../model";
import { createFleetRepository, type ServiceDatabase } from "../repository";
import type {
  CreatePlatformVehicleTypeInput,
  CreateVehicleInput,
  CreateVehicleTypeInput,
  FleetAdminActorContext,
  FleetTenantActorContext,
  GetVehicleInput,
  ListVehiclesInput,
  ListVehicleTypesInput,
  RemoveVehicleInput,
  UpdateVehicleInput,
  UpdateVehicleTypeInput,
  VehicleDto,
  VehicleTypeDto,
} from "../types";

const ACTIVE_OPERATIONAL_TRIP_STATES = new Set(["scheduled", "Selection", "in_progress"]);

export function createFleetService(db: ServiceDatabase) {
  const repo = createFleetRepository(db);

  function toVehicleTypeDto(
    row: NonNullable<Awaited<ReturnType<typeof repo.findAccessibleVehicleTypeById>>>,
  ): VehicleTypeDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      scope: row.scope,
      categoryLookupCode: row.categoryLookupCode,
      nameAr: row.nameAr,
      nameEn: row.nameEn,
      descriptionAr: row.descriptionAr,
      descriptionEn: row.descriptionEn,
      seatCount: row.seatCount,
      seatLayout: row.seatLayout,
      status: row.status,
      createdByAccountId: row.createdByAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  return {
    async listVehicleTypes(
      actor: FleetTenantActorContext,
      input?: ListVehicleTypesInput,
    ): Promise<{ items: VehicleTypeDto[] }> {
      const rows = await repo.listVehicleTypesForTenant(actor.activeTenantId, {
        scope: input?.scope,
        includeArchived: input?.includeArchived,
      });
      return {
        items: rows.map(toVehicleTypeDto),
      };
    },

    async createVehicleType(
      actor: FleetTenantActorContext,
      input: CreateVehicleTypeInput,
    ): Promise<VehicleTypeDto> {
      if (!isValidVehicleCategoryCode(input.categoryLookupCode)) {
        throw new FleetServiceError(
          "VALIDATION_ERROR",
          `Invalid vehicle category code "${input.categoryLookupCode}".`,
          { field: "categoryLookupCode" },
        );
      }

      const layoutValidation = validateSeatLayout(input.seatCount, input.seatLayout);
      if (!layoutValidation.valid) {
        throw new FleetServiceError("VALIDATION_ERROR", layoutValidation.reason, {
          field: layoutValidation.field ?? "seatLayout",
        });
      }

      const created = await repo.insertVehicleType({
        tenantId: actor.activeTenantId,
        scope: "organization",
        categoryLookupCode: input.categoryLookupCode.trim().toUpperCase(),
        nameAr: input.nameAr.trim(),
        nameEn: input.nameEn.trim(),
        descriptionAr: input.descriptionAr?.trim() ?? null,
        descriptionEn: input.descriptionEn?.trim() ?? null,
        seatCount: input.seatCount,
        seatLayout: input.seatLayout,
        createdByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "fleet.vehicle_type.created",
        targetEntityType: "vehicle_type",
        targetEntityId: created.id,
        afterState: {
          scope: created.scope,
          categoryLookupCode: created.categoryLookupCode,
          nameEn: created.nameEn,
          seatCount: created.seatCount,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return toVehicleTypeDto(created);
    },

    async createPlatformVehicleType(
      actor: FleetAdminActorContext,
      input: CreatePlatformVehicleTypeInput,
    ): Promise<VehicleTypeDto> {
      if (!isValidVehicleCategoryCode(input.categoryLookupCode)) {
        throw new FleetServiceError(
          "VALIDATION_ERROR",
          `Invalid vehicle category code "${input.categoryLookupCode}".`,
          { field: "categoryLookupCode" },
        );
      }

      const layoutValidation = validateSeatLayout(input.seatCount, input.seatLayout);
      if (!layoutValidation.valid) {
        throw new FleetServiceError("VALIDATION_ERROR", layoutValidation.reason, {
          field: layoutValidation.field ?? "seatLayout",
        });
      }

      const created = await repo.insertVehicleType({
        tenantId: null,
        scope: "platform",
        categoryLookupCode: input.categoryLookupCode.trim().toUpperCase(),
        nameAr: input.nameAr.trim(),
        nameEn: input.nameEn.trim(),
        descriptionAr: input.descriptionAr?.trim() ?? null,
        descriptionEn: input.descriptionEn?.trim() ?? null,
        seatCount: input.seatCount,
        seatLayout: input.seatLayout,
        createdByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: null,
        action: "fleet.platform_vehicle_type.created",
        targetEntityType: "vehicle_type",
        targetEntityId: created.id,
        afterState: {
          scope: created.scope,
          categoryLookupCode: created.categoryLookupCode,
          nameEn: created.nameEn,
          seatCount: created.seatCount,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return toVehicleTypeDto(created);
    },

    async updateVehicleType(
      actor: FleetTenantActorContext,
      input: UpdateVehicleTypeInput,
    ): Promise<VehicleTypeDto> {
      const existing = await repo.findTenantOwnedVehicleTypeById(
        actor.activeTenantId,
        input.vehicleTypeId,
      );
      if (!existing) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle type not found.");
      }

      if (input.categoryLookupCode && !isValidVehicleCategoryCode(input.categoryLookupCode)) {
        throw new FleetServiceError(
          "VALIDATION_ERROR",
          `Invalid vehicle category code "${input.categoryLookupCode}".`,
          { field: "categoryLookupCode" },
        );
      }

      const nextSeatCount = input.seatCount ?? existing.seatCount;
      const nextSeatLayout = input.seatLayout ?? existing.seatLayout;
      const layoutValidation = validateSeatLayout(nextSeatCount, nextSeatLayout);
      if (!layoutValidation.valid) {
        throw new FleetServiceError("VALIDATION_ERROR", layoutValidation.reason, {
          field: layoutValidation.field ?? "seatLayout",
        });
      }

      const updated = await repo.updateTenantVehicleType(
        actor.activeTenantId,
        input.vehicleTypeId,
        {
          categoryLookupCode: input.categoryLookupCode
            ? input.categoryLookupCode.trim().toUpperCase()
            : undefined,
          nameAr: input.nameAr?.trim(),
          nameEn: input.nameEn?.trim(),
          descriptionAr:
            input.descriptionAr === undefined ? undefined : (input.descriptionAr?.trim() ?? null),
          descriptionEn:
            input.descriptionEn === undefined ? undefined : (input.descriptionEn?.trim() ?? null),
          seatCount: nextSeatCount,
          seatLayout: nextSeatLayout,
          status: input.status,
        },
      );

      if (!updated) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle type not found.");
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "fleet.vehicle_type.updated",
        targetEntityType: "vehicle_type",
        targetEntityId: updated.id,
        beforeState: {
          nameEn: existing.nameEn,
          seatCount: existing.seatCount,
          status: existing.status,
        },
        afterState: {
          nameEn: updated.nameEn,
          seatCount: updated.seatCount,
          status: updated.status,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return toVehicleTypeDto(updated);
    },

    async listVehicles(
      actor: FleetTenantActorContext,
      input?: ListVehiclesInput,
    ): Promise<{ items: VehicleDto[] }> {
      const rows = await repo.listVehiclesForTenant(actor.activeTenantId, {
        status: input?.status,
        vehicleTypeId: input?.vehicleTypeId,
        search: input?.search,
      });

      const vehicleIds = rows.map((r) => r.vehicle.id);
      const assignments = await repo.listTripAssignmentsForVehicles(
        actor.activeTenantId,
        vehicleIds,
      );

      const statsByVehicleId = new Map<
        string,
        { activeBookingsCount: number; assignedActiveTripsCount: number }
      >();
      for (const assignment of assignments) {
        const current = statsByVehicleId.get(assignment.vehicleId) ?? {
          activeBookingsCount: 0,
          assignedActiveTripsCount: 0,
        };
        if (assignment.tripState !== "cancelled" && assignment.tripState !== "completed") {
          current.activeBookingsCount += assignment.confirmedSeatsCount;
          current.assignedActiveTripsCount += 1;
        }
        statsByVehicleId.set(assignment.vehicleId, current);
      }

      return {
        items: rows.map(({ vehicle, vehicleType }) => {
          const stats = statsByVehicleId.get(vehicle.id) ?? {
            activeBookingsCount: 0,
            assignedActiveTripsCount: 0,
          };
          return {
            id: vehicle.id,
            tenantId: vehicle.tenantId,
            vehicleTypeId: vehicle.vehicleTypeId,
            plateNumber: vehicle.plateNumber,
            plateNumberNormalized: vehicle.plateNumberNormalized,
            model: vehicle.model,
            manufacturingYear: vehicle.manufacturingYear,
            seatCount: vehicle.seatCount,
            registrationStatus: vehicle.registrationStatus,
            registrationExpiry: vehicle.registrationExpiry,
            registrationDocumentUrl: vehicle.registrationDocumentUrl,
            photoUrls: vehicle.photoUrls ?? [],
            amenityCodes: vehicle.amenityCodes ?? [],
            status: vehicle.status,
            notes: vehicle.notes,
            createdByAccountId: vehicle.createdByAccountId,
            createdAt: vehicle.createdAt,
            updatedAt: vehicle.updatedAt,
            vehicleType: vehicleType ? toVehicleTypeDto(vehicleType) : null,
            activeBookingsCount: stats.activeBookingsCount,
            assignedActiveTripsCount: stats.assignedActiveTripsCount,
          };
        }),
      };
    },

    async getVehicle(actor: FleetTenantActorContext, input: GetVehicleInput): Promise<VehicleDto> {
      const row = await repo.findVehicleById(actor.activeTenantId, input.vehicleId);
      if (!row) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle not found.");
      }

      const assignments = await repo.listTripAssignmentsForVehicles(actor.activeTenantId, [
        row.vehicle.id,
      ]);
      let activeBookingsCount = 0;
      let assignedActiveTripsCount = 0;
      for (const assignment of assignments) {
        if (assignment.tripState !== "cancelled" && assignment.tripState !== "completed") {
          activeBookingsCount += assignment.confirmedSeatsCount;
          assignedActiveTripsCount += 1;
        }
      }

      return {
        id: row.vehicle.id,
        tenantId: row.vehicle.tenantId,
        vehicleTypeId: row.vehicle.vehicleTypeId,
        plateNumber: row.vehicle.plateNumber,
        plateNumberNormalized: row.vehicle.plateNumberNormalized,
        model: row.vehicle.model,
        manufacturingYear: row.vehicle.manufacturingYear,
        seatCount: row.vehicle.seatCount,
        registrationStatus: row.vehicle.registrationStatus,
        registrationExpiry: row.vehicle.registrationExpiry,
        registrationDocumentUrl: row.vehicle.registrationDocumentUrl,
        photoUrls: row.vehicle.photoUrls ?? [],
        amenityCodes: row.vehicle.amenityCodes ?? [],
        status: row.vehicle.status,
        notes: row.vehicle.notes,
        createdByAccountId: row.vehicle.createdByAccountId,
        createdAt: row.vehicle.createdAt,
        updatedAt: row.vehicle.updatedAt,
        vehicleType: row.vehicleType ? toVehicleTypeDto(row.vehicleType) : null,
        activeBookingsCount,
        assignedActiveTripsCount,
      };
    },

    async createVehicle(
      actor: FleetTenantActorContext,
      input: CreateVehicleInput,
    ): Promise<VehicleDto> {
      const vehicleType = await repo.findAccessibleVehicleTypeById(
        actor.activeTenantId,
        input.vehicleTypeId,
      );
      if (!vehicleType || vehicleType.status !== "active") {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Active vehicle type not found.");
      }

      // T-FLT-04: Vehicle seatCount must match its vehicleType.seatCount
      if (input.seatCount !== vehicleType.seatCount) {
        throw new FleetServiceError(
          "BUSINESS_RULE_VIOLATION",
          `Vehicle seatCount (${input.seatCount}) must match vehicleType seatCount (${vehicleType.seatCount}).`,
          { field: "seatCount", expected: vehicleType.seatCount, actual: input.seatCount },
        );
      }

      const rawAmenities = input.amenityCodes ?? [];
      if (!areValidAmenityCodes(rawAmenities)) {
        throw new FleetServiceError("VALIDATION_ERROR", "One or more amenity codes are invalid.", {
          field: "amenityCodes",
        });
      }

      const plateNumberNormalized = normalizePlateNumber(input.plateNumber);
      if (!plateNumberNormalized) {
        throw new FleetServiceError("VALIDATION_ERROR", "Plate number is required.", {
          field: "plateNumber",
        });
      }

      const duplicate = await repo.findVehicleByNormalizedPlate(
        actor.activeTenantId,
        plateNumberNormalized,
      );
      if (duplicate) {
        throw new FleetServiceError(
          "DUPLICATE_RESOURCE",
          `A vehicle with plate number "${input.plateNumber}" already exists in this organization.`,
          { field: "plateNumber" },
        );
      }

      const created = await repo.insertVehicle({
        tenantId: actor.activeTenantId,
        vehicleTypeId: vehicleType.id,
        plateNumber: input.plateNumber.trim(),
        plateNumberNormalized,
        model: input.model.trim(),
        manufacturingYear: input.manufacturingYear,
        seatCount: input.seatCount,
        registrationStatus: input.registrationStatus ?? "valid",
        registrationExpiry: input.registrationExpiry ? new Date(input.registrationExpiry) : null,
        registrationDocumentUrl: input.registrationDocumentUrl ?? null,
        photoUrls: input.photoUrls ?? [],
        amenityCodes: normalizeAmenityCodes(rawAmenities),
        status: input.status ?? "active",
        notes: input.notes?.trim() ?? null,
        createdByAccountId: actor.accountId,
        fileIds: input.fileIds,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "fleet.vehicle.created",
        targetEntityType: "vehicle",
        targetEntityId: created.id,
        afterState: {
          plateNumber: created.plateNumber,
          vehicleTypeId: created.vehicleTypeId,
          seatCount: created.seatCount,
          status: created.status,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return this.getVehicle(actor, { vehicleId: created.id });
    },

    async updateVehicle(
      actor: FleetTenantActorContext,
      input: UpdateVehicleInput,
    ): Promise<VehicleDto> {
      const existingRow = await repo.findVehicleById(actor.activeTenantId, input.vehicleId);
      if (!existingRow) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle not found.");
      }
      const existing = existingRow.vehicle;

      const targetVehicleTypeId = input.vehicleTypeId ?? existing.vehicleTypeId;
      const vehicleType = await repo.findAccessibleVehicleTypeById(
        actor.activeTenantId,
        targetVehicleTypeId,
      );
      if (!vehicleType) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle type not found.");
      }

      const targetSeatCount = input.seatCount ?? existing.seatCount;
      // T-FLT-04: Vehicle seatCount must match its vehicleType.seatCount
      if (targetSeatCount !== vehicleType.seatCount) {
        throw new FleetServiceError(
          "BUSINESS_RULE_VIOLATION",
          `Vehicle seatCount (${targetSeatCount}) must match vehicleType seatCount (${vehicleType.seatCount}).`,
          { field: "seatCount", expected: vehicleType.seatCount, actual: targetSeatCount },
        );
      }

      if (input.amenityCodes !== undefined && !areValidAmenityCodes(input.amenityCodes)) {
        throw new FleetServiceError("VALIDATION_ERROR", "One or more amenity codes are invalid.", {
          field: "amenityCodes",
        });
      }

      let plateNumberNormalized: string | undefined;
      if (input.plateNumber !== undefined) {
        plateNumberNormalized = normalizePlateNumber(input.plateNumber);
        if (!plateNumberNormalized) {
          throw new FleetServiceError("VALIDATION_ERROR", "Plate number is required.", {
            field: "plateNumber",
          });
        }
        const duplicate = await repo.findVehicleByNormalizedPlate(
          actor.activeTenantId,
          plateNumberNormalized,
          existing.id,
        );
        if (duplicate) {
          throw new FleetServiceError(
            "DUPLICATE_RESOURCE",
            `A vehicle with plate number "${input.plateNumber}" already exists in this organization.`,
            { field: "plateNumber" },
          );
        }
      }

      const updated = await repo.updateVehicle(actor.activeTenantId, existing.id, {
        vehicleTypeId: input.vehicleTypeId,
        plateNumber: input.plateNumber?.trim(),
        plateNumberNormalized,
        model: input.model?.trim(),
        manufacturingYear: input.manufacturingYear,
        seatCount: targetSeatCount,
        registrationStatus: input.registrationStatus,
        registrationExpiry:
          input.registrationExpiry === undefined
            ? undefined
            : input.registrationExpiry
              ? new Date(input.registrationExpiry)
              : null,
        registrationDocumentUrl: input.registrationDocumentUrl,
        photoUrls: input.photoUrls,
        amenityCodes:
          input.amenityCodes !== undefined ? normalizeAmenityCodes(input.amenityCodes) : undefined,
        status: input.status,
        notes: input.notes === undefined ? undefined : (input.notes?.trim() ?? null),
        updatedByAccountId: actor.accountId,
        fileIds: input.fileIds,
      });

      if (!updated) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle not found.");
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "fleet.vehicle.updated",
        targetEntityType: "vehicle",
        targetEntityId: updated.id,
        beforeState: {
          plateNumber: existing.plateNumber,
          seatCount: existing.seatCount,
          status: existing.status,
        },
        afterState: {
          plateNumber: updated.plateNumber,
          seatCount: updated.seatCount,
          status: updated.status,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return this.getVehicle(actor, { vehicleId: updated.id });
    },

    async removeVehicle(
      actor: FleetTenantActorContext,
      input: RemoveVehicleInput,
    ): Promise<VehicleDto> {
      const existingRow = await repo.findVehicleById(actor.activeTenantId, input.vehicleId);
      if (!existingRow) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle not found.");
      }

      const assignments = await repo.listTripAssignmentsForVehicles(actor.activeTenantId, [
        input.vehicleId,
      ]);

      const blockingAssignment = assignments.find(
        (assignment) =>
          assignment.confirmedSeatsCount > 0 ||
          ACTIVE_OPERATIONAL_TRIP_STATES.has(assignment.tripState),
      );

      if (blockingAssignment) {
        throw new FleetServiceError(
          "BUSINESS_RULE_VIOLATION",
          "Cannot remove a vehicle assigned to a trip with confirmed bookings or active operational status.",
          {
            vehicleId: input.vehicleId,
            tripId: blockingAssignment.tripId,
            tripState: blockingAssignment.tripState,
            confirmedSeatsCount: blockingAssignment.confirmedSeatsCount,
          },
        );
      }

      const draftTripVehicleIds = assignments
        .filter((assignment) => assignment.tripState === "draft")
        .map((assignment) => assignment.tripVehicleId);

      const retired = await repo.retireVehicleAndDetachFromDraftTrips(
        actor.activeTenantId,
        input.vehicleId,
        draftTripVehicleIds,
      );

      if (!retired) {
        throw new FleetServiceError("RESOURCE_NOT_FOUND", "Vehicle not found.");
      }

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "fleet.vehicle.removed",
        targetEntityType: "vehicle",
        targetEntityId: retired.id,
        beforeState: { status: existingRow.vehicle.status },
        afterState: {
          status: retired.status,
          detachedDraftAssignments: draftTripVehicleIds.length,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return this.getVehicle(actor, { vehicleId: retired.id });
    },
  };
}
