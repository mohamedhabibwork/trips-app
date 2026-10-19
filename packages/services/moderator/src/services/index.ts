import { ModeratorServiceError } from "../errors";
import type { ModeratorAssignmentSummary } from "../model";
import { createModeratorRepository, type ServiceDatabase } from "../repository";
import type {
  RaiseSafetyAlertInput,
  RecordBoardingCheckInInput,
  RecordHeadcountInput,
} from "../types";

export interface ModeratorScope {
  accountId: string;
  tripId: string;
  vehicleId: string;
}

export function createModeratorService(deps: { db: ServiceDatabase }) {
  const repo = createModeratorRepository(deps.db);

  return {
    async getActiveAssignment(scope: ModeratorScope): Promise<ModeratorAssignmentSummary> {
      const trip = await repo.findTripById(scope.tripId);
      if (!trip) {
        throw new ModeratorServiceError("ASSIGNMENT_NOT_FOUND", "Assigned trip not found.");
      }
      const manifest = await repo.listVehicleManifest(scope.tripId, scope.vehicleId);
      const checkedInPassengers = manifest.filter((r) => r.status === "checked_in").length;
      return {
        tenantId: trip.tenantId,
        tripId: scope.tripId,
        vehicleId: scope.vehicleId,
        tripTitleAr: trip.titleAr,
        tripTitleEn: trip.titleEn,
        totalPassengers: manifest.length,
        checkedInPassengers,
      };
    },

    async getVehicleManifest(scope: ModeratorScope) {
      return repo.listVehicleManifest(scope.tripId, scope.vehicleId);
    },

    async recordBoardingCheckIn(scope: ModeratorScope, input: RecordBoardingCheckInInput) {
      const record = await repo.findCheckInRecordById(input.checkInRecordId);
      if (
        !record ||
        record.tripId !== scope.tripId ||
        (record.vehicleId !== null && record.vehicleId !== scope.vehicleId)
      ) {
        throw new ModeratorServiceError(
          "PASSENGER_NOT_IN_VEHICLE_MANIFEST",
          "Passenger does not belong to this vehicle manifest.",
        );
      }
      const updated = await repo.updateCheckInRecord(record.id, {
        status: input.status,
        checkedInByAccountId: scope.accountId,
        notes: input.notes ?? null,
      });
      if (!updated) {
        throw new ModeratorServiceError(
          "PASSENGER_NOT_IN_VEHICLE_MANIFEST",
          "Passenger record not found.",
        );
      }
      return updated;
    },

    async recordHeadcount(scope: ModeratorScope, input: RecordHeadcountInput) {
      const trip = await repo.findTripById(scope.tripId);
      if (!trip) {
        throw new ModeratorServiceError("ASSIGNMENT_NOT_FOUND", "Assigned trip not found.");
      }
      return repo.insertTrackingEvent({
        tenantId: trip.tenantId,
        tripId: scope.tripId,
        vehicleId: scope.vehicleId,
        recordedByAccountId: scope.accountId,
        eventType: "headcount_verified",
        severity: "info",
        messageAr: `تم التحقق من عدد الركاب: ${input.countedPassengers}`,
        messageEn: `Headcount verified: ${input.countedPassengers} passengers`,
        metadata: {
          countedPassengers: input.countedPassengers,
          notes: input.notes ?? null,
        },
      });
    },

    async raiseSafetyAlert(scope: ModeratorScope, input: RaiseSafetyAlertInput) {
      const trip = await repo.findTripById(scope.tripId);
      if (!trip) {
        throw new ModeratorServiceError("ASSIGNMENT_NOT_FOUND", "Assigned trip not found.");
      }
      return repo.insertTrackingEvent({
        tenantId: trip.tenantId,
        tripId: scope.tripId,
        vehicleId: scope.vehicleId,
        recordedByAccountId: scope.accountId,
        eventType: "safety_alert",
        severity: input.severity,
        messageAr: input.messageAr,
        messageEn: input.messageEn,
      });
    },
  };
}

export type ModeratorService = ReturnType<typeof createModeratorService>;
