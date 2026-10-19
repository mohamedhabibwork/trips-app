import { DriverServiceError } from "../errors";
import { DEFAULT_LAB_VALIDITY_DAYS } from "../model";
import { createDriverRepository, type ServiceDatabase } from "../repository";
import type {
  AdminRequestLabTestInput,
  AdminReviewLabTestInput,
  BookLabTestInput,
  UpdateDriverProfileInput,
  UploadLabTestResultInput,
} from "../types";

export function createDriverService(deps: { db: ServiceDatabase }) {
  const repo = createDriverRepository(deps.db);

  return {
    async getProfile(accountId: string) {
      const profile = await repo.findProfileByAccountId(accountId);
      if (!profile) {
        throw new DriverServiceError("DRIVER_PROFILE_NOT_FOUND", "Driver profile not found.");
      }
      return profile;
    },

    async updateProfile(accountId: string, input: UpdateDriverProfileInput) {
      const updated = await repo.updateProfile(accountId, input);
      if (!updated) {
        throw new DriverServiceError("DRIVER_PROFILE_NOT_FOUND", "Driver profile not found.");
      }
      return updated;
    },

    async getLabTestStatus(driverAccountId: string) {
      return repo.listLabTestsByDriver(driverAccountId);
    },

    async bookLabTest(driverAccountId: string, input: BookLabTestInput) {
      const test = await repo.findLabTestById(input.labTestId);
      if (!test) {
        throw new DriverServiceError("LAB_TEST_NOT_FOUND", "Lab test not found.");
      }
      if (test.driverAccountId !== driverAccountId) {
        throw new DriverServiceError(
          "FORBIDDEN_LAB_TEST_ACCESS",
          "You cannot book another driver's lab test.",
        );
      }
      const updated = await repo.updateLabTestBooked(
        test.id,
        input.labCenterName,
        new Date(input.appointmentAt),
      );
      if (!updated) {
        throw new DriverServiceError("LAB_TEST_NOT_FOUND", "Lab test not found.");
      }
      return updated;
    },

    async uploadLabTestResult(driverAccountId: string, input: UploadLabTestResultInput) {
      const test = await repo.findLabTestById(input.labTestId);
      if (!test) {
        throw new DriverServiceError("LAB_TEST_NOT_FOUND", "Lab test not found.");
      }
      if (test.driverAccountId !== driverAccountId) {
        throw new DriverServiceError(
          "FORBIDDEN_LAB_TEST_ACCESS",
          "You cannot upload results for another driver's lab test.",
        );
      }
      const updated = await repo.updateLabTestResultUploaded(test.id, input.resultDocumentUrl);
      if (!updated) {
        throw new DriverServiceError("LAB_TEST_NOT_FOUND", "Lab test not found.");
      }
      return updated;
    },

    async adminRequestLabTest(adminAccountId: string, input: AdminRequestLabTestInput) {
      const requested = await repo.insertLabTestRequest({
        driverAccountId: input.driverAccountId,
        requestedByAdminAccountId: adminAccountId,
        deadlineAt: new Date(input.deadlineAt),
      });
      await repo.syncDriverLabStatus(
        input.driverAccountId,
        false,
        null,
        "Pending mandatory lab test",
      );
      return requested;
    },

    async adminReviewLabTest(adminAccountId: string, input: AdminReviewLabTestInput) {
      const test = await repo.findLabTestById(input.labTestId);
      if (!test) {
        throw new DriverServiceError("LAB_TEST_NOT_FOUND", "Lab test not found.");
      }
      const passed = input.decision === "verified_pass";
      const validUntil = passed
        ? new Date(Date.now() + DEFAULT_LAB_VALIDITY_DAYS * 24 * 60 * 60 * 1000)
        : null;

      const updated = await repo.reviewLabTest(test.id, {
        status: input.decision,
        reviewedByAdminAccountId: adminAccountId,
        reviewNotes: input.reviewNotes ?? null,
        validUntil,
      });
      if (!updated) {
        throw new DriverServiceError("LAB_TEST_NOT_FOUND", "Lab test not found.");
      }

      await repo.syncDriverLabStatus(
        test.driverAccountId,
        passed,
        validUntil,
        passed ? null : (input.reviewNotes ?? "Failed lab test verification"),
      );
      return updated;
    },

    async listAssignedTrips(driverAccountId: string) {
      return repo.listAssignedTripVehicles(driverAccountId);
    },
  };
}

export type DriverService = ReturnType<typeof createDriverService>;
