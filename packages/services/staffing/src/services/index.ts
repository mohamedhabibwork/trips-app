// Business logic for Staffing. Routes call this factory with context.db; repositories are created here.
import { StaffingServiceError } from "../errors";
import {
  computeTripStaffingGap,
  findPlanCatalogEntry,
  generateSixDigitStaffCode,
  hashSha256,
} from "../model";
import { createStaffingRepository, type ServiceDatabase } from "../repository";
import type {
  AssignVehicleStaffInput,
  IssueModeratorStaffCodeInput,
  ListTripStaffingInput,
  ModeratorAssignmentDto,
  RevokeModeratorAssignmentInput,
  StaffingTenantActorContext,
  TripVehicleStaffingDto,
} from "../types";

export function createStaffingService(db: ServiceDatabase) {
  const repo = createStaffingRepository(db);

  function toVehicleStaffingDto(
    item: Awaited<ReturnType<typeof repo.listTripVehiclesForTrip>>[number],
  ): TripVehicleStaffingDto {
    return {
      id: item.tripVehicle.id,
      tripId: item.tripVehicle.tripId,
      vehicleId: item.tripVehicle.vehicleId,
      plateNumber: item.plateNumber ?? null,
      model: item.model ?? null,
      driverSource: item.tripVehicle.driverSource,
      driverAccountId: item.tripVehicle.driverAccountId,
      moderatorSource: item.tripVehicle.moderatorSource,
      moderatorAccountId: item.tripVehicle.moderatorAccountId,
      photographerSource: item.tripVehicle.photographerSource,
      photographerAccountId: item.tripVehicle.photographerAccountId,
    };
  }

  return {
    async listTripStaffing(
      actor: StaffingTenantActorContext,
      input: ListTripStaffingInput,
    ): Promise<{
      tripId: string;
      hasStaffingGap: boolean;
      vehicles: TripVehicleStaffingDto[];
      moderatorAssignments: ModeratorAssignmentDto[];
    }> {
      const trip = await repo.findTripForTenant(actor.activeTenantId, input.tripId);
      if (!trip) {
        throw new StaffingServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const [vehicleRows, moderatorRows] = await Promise.all([
        repo.listTripVehiclesForTrip(actor.activeTenantId, input.tripId),
        repo.listModeratorAssignmentsForTrip(actor.activeTenantId, input.tripId),
      ]);

      return {
        tripId: trip.id,
        hasStaffingGap: trip.hasStaffingGap,
        vehicles: vehicleRows.map(toVehicleStaffingDto),
        moderatorAssignments: moderatorRows,
      };
    },

    async assignVehicleStaff(
      actor: StaffingTenantActorContext,
      input: AssignVehicleStaffInput,
    ): Promise<{
      tripId: string;
      hasStaffingGap: boolean;
      vehicle: TripVehicleStaffingDto;
    }> {
      const trip = await repo.findTripForTenant(actor.activeTenantId, input.tripId);
      if (!trip) {
        throw new StaffingServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const usesPlatformSuppliers =
        input.driverSource === "platform_supplier" ||
        input.moderatorSource === "platform_supplier" ||
        input.photographerSource === "platform_supplier";

      if (usesPlatformSuppliers) {
        const orgPlanInfo = await repo.findOrganizationPlan(actor.activeTenantId);
        if (!orgPlanInfo) {
          throw new StaffingServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
        }
        const fallback = findPlanCatalogEntry("organization", orgPlanInfo.org.planTier);
        const allowed =
          orgPlanInfo.plan?.features.platformSuppliers ??
          fallback?.features.platformSuppliers ??
          false;
        if (!allowed) {
          throw new StaffingServiceError(
            "PLAN_REQUIRED",
            `Organization plan "${orgPlanInfo.org.planTier}" does not include platform supplier assignments.`,
            { feature: "platformSuppliers", planTier: orgPlanInfo.org.planTier },
          );
        }
      }

      const updated = await repo.updateVehicleStaffAssignment(
        actor.activeTenantId,
        input.tripId,
        input.vehicleId,
        {
          driverSource: input.driverSource,
          driverAccountId: input.driverAccountId ?? null,
          moderatorSource: input.moderatorSource,
          moderatorAccountId: input.moderatorAccountId ?? null,
          photographerSource: input.photographerSource ?? "unassigned",
          photographerAccountId: input.photographerAccountId ?? null,
        },
      );
      if (!updated) {
        throw new StaffingServiceError(
          "RESOURCE_NOT_FOUND",
          "Vehicle assignment not found on this trip.",
        );
      }

      const allVehicles = await repo.listTripVehiclesForTrip(actor.activeTenantId, input.tripId);
      const hasStaffingGap = computeTripStaffingGap(allVehicles.map((v) => v.tripVehicle));
      await repo.updateTripStaffingGap(actor.activeTenantId, input.tripId, hasStaffingGap);

      const matched = allVehicles.find((v) => v.tripVehicle.vehicleId === input.vehicleId)!;
      return {
        tripId: input.tripId,
        hasStaffingGap,
        vehicle: toVehicleStaffingDto(matched),
      };
    },

    async issueModeratorStaffCode(
      actor: StaffingTenantActorContext,
      input: IssueModeratorStaffCodeInput,
    ): Promise<{
      staffCode: string;
      assignment: ModeratorAssignmentDto;
    }> {
      const trip = await repo.findTripForTenant(actor.activeTenantId, input.tripId);
      if (!trip) {
        throw new StaffingServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const now = new Date();
      const validFrom = input.validFrom ? new Date(input.validFrom) : (trip.startsAt ?? now);
      const validUntil = input.validUntil
        ? new Date(input.validUntil)
        : new Date(
            (trip.endsAt ?? new Date(now.getTime() + 48 * 3600 * 1000)).getTime() +
              24 * 3600 * 1000,
          );

      const staffCode = generateSixDigitStaffCode();
      const staffCodeHash = hashSha256(staffCode);

      const assignment = await repo.insertModeratorAssignment({
        tenantId: actor.activeTenantId,
        accountId: input.moderatorAccountId,
        tripId: input.tripId,
        vehicleId: input.vehicleId,
        staffCodeHash,
        validFrom,
        validUntil,
      });

      return {
        staffCode,
        assignment,
      };
    },

    async revokeModeratorAssignment(
      actor: StaffingTenantActorContext,
      input: RevokeModeratorAssignmentInput,
    ): Promise<{ assignment: ModeratorAssignmentDto }> {
      const updated = await repo.revokeModeratorAssignment(
        actor.activeTenantId,
        input.assignmentId,
      );
      if (!updated) {
        throw new StaffingServiceError("RESOURCE_NOT_FOUND", "Moderator assignment not found.");
      }
      return { assignment: updated };
    },
  };
}
