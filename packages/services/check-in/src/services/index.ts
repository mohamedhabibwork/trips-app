import { CheckInServiceError } from "../errors";
import { createCheckInRepository, type ServiceDatabase } from "../repository";
import type {
  ListTripManifestInput,
  ManualCheckInOverrideInput,
  VerifyAndCheckInByQrInput,
} from "../types";

export function createCheckInService(deps: { db: ServiceDatabase }) {
  const repo = createCheckInRepository(deps.db);

  return {
    async listTripManifest(tenantId: string, input: ListTripManifestInput) {
      return repo.listManifest(tenantId, input.tripId, input.vehicleId);
    },

    async verifyAndCheckInByQr(
      tenantId: string,
      actorAccountId: string,
      input: VerifyAndCheckInByQrInput,
    ) {
      const record = await repo.findByQrToken(input.qrCodeToken);
      if (!record || record.tenantId !== tenantId) {
        throw new CheckInServiceError(
          "BOARDING_PASS_NOT_FOUND",
          "Boarding pass QR code not found.",
        );
      }
      if (record.status === "checked_in") {
        throw new CheckInServiceError("ALREADY_CHECKED_IN", "Passenger is already checked in.");
      }
      const updated = await repo.updateCheckInRecord(record.id, {
        status: "checked_in",
        checkedInByAccountId: actorAccountId,
        method: "qr_scan",
      });
      if (!updated) {
        throw new CheckInServiceError("BOARDING_PASS_NOT_FOUND", "Boarding pass not found.");
      }
      await repo.syncBookingCheckedInIfComplete(record.bookingId);
      return updated;
    },

    async manualCheckInOverride(
      tenantId: string,
      actorAccountId: string,
      input: ManualCheckInOverrideInput,
    ) {
      const record = await repo.findById(input.checkInRecordId);
      if (!record || record.tenantId !== tenantId) {
        throw new CheckInServiceError("BOARDING_PASS_NOT_FOUND", "Boarding pass not found.");
      }
      const updated = await repo.updateCheckInRecord(record.id, {
        status: input.status,
        checkedInByAccountId: actorAccountId,
        method: "manual_override",
        notes: input.notes,
      });
      if (!updated) {
        throw new CheckInServiceError("BOARDING_PASS_NOT_FOUND", "Boarding pass not found.");
      }
      await repo.syncBookingCheckedInIfComplete(record.bookingId);
      return updated;
    },

    async getMyBoardingPasses(travelerAccountId: string, bookingId?: string) {
      return repo.listBoardingPassesForTraveler(travelerAccountId, bookingId);
    },
  };
}

export type CheckInService = ReturnType<typeof createCheckInService>;
