import type { DriverLabTestKind } from "@trips-app/domain";
import { desc, eq } from "@trips-app/db";
import type { Database, Database as ServiceDatabase } from "@trips-app/db";
import { schema } from "@trips-app/db/zod";
import type { UpdateDriverProfileInput } from "../types";

export type { ServiceDatabase };

export function createDriverRepository(db: Database) {
  return {
    async findProfileByAccountId(accountId: string) {
      const [row] = await db
        .select()
        .from(schema.driverProfiles)
        .where(eq(schema.driverProfiles.accountId, accountId))
        .limit(1);
      return row ?? null;
    },

    async updateProfile(accountId: string, patch: UpdateDriverProfileInput) {
      const [updated] = await db
        .update(schema.driverProfiles)
        .set({
          ...patch,
          updatedAt: new Date(),
        })
        .where(eq(schema.driverProfiles.accountId, accountId))
        .returning();
      return updated ?? null;
    },

    async listLabTestsByDriver(driverAccountId: string) {
      return db
        .select()
        .from(schema.driverLabTests)
        .where(eq(schema.driverLabTests.driverAccountId, driverAccountId))
        .orderBy(desc(schema.driverLabTests.createdAt));
    },

    async findLabTestById(labTestId: string) {
      const [row] = await db
        .select()
        .from(schema.driverLabTests)
        .where(eq(schema.driverLabTests.id, labTestId))
        .limit(1);
      return row ?? null;
    },

    async insertLabTestRequest(values: {
      driverAccountId: string;
      requestedByAdminAccountId: string;
      deadlineAt: Date;
      testType: DriverLabTestKind;
    }) {
      const [created] = await db
        .insert(schema.driverLabTests)
        .values({
          driverAccountId: values.driverAccountId,
          requestedByAdminAccountId: values.requestedByAdminAccountId,
          status: "requested",
          testType: values.testType,
          deadlineAt: values.deadlineAt,
        })
        .returning();
      return created!;
    },

    async updateLabTestBooked(labTestId: string, labCenterName: string, appointmentAt: Date) {
      const [updated] = await db
        .update(schema.driverLabTests)
        .set({
          status: "booked",
          labCenterName,
          appointmentAt,
          updatedAt: new Date(),
        })
        .where(eq(schema.driverLabTests.id, labTestId))
        .returning();
      return updated ?? null;
    },

    async updateLabTestResultUploaded(labTestId: string, resultDocumentUrl: string) {
      const now = new Date();
      const [updated] = await db
        .update(schema.driverLabTests)
        .set({
          status: "result_uploaded",
          resultDocumentUrl,
          uploadedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.driverLabTests.id, labTestId))
        .returning();
      return updated ?? null;
    },

    async reviewLabTest(
      labTestId: string,
      values: {
        status: "verified_pass" | "verified_fail";
        reviewedByAdminAccountId: string;
        reviewNotes: string | null;
        validUntil: Date | null;
      },
    ) {
      const now = new Date();
      const [updated] = await db
        .update(schema.driverLabTests)
        .set({
          status: values.status,
          reviewedByAdminAccountId: values.reviewedByAdminAccountId,
          reviewedAt: now,
          reviewNotes: values.reviewNotes,
          validUntil: values.validUntil,
          updatedAt: now,
        })
        .where(eq(schema.driverLabTests.id, labTestId))
        .returning();
      return updated ?? null;
    },

    async syncDriverLabStatus(
      driverAccountId: string,
      passed: boolean,
      validUntil: Date | null,
      pauseReason: string | null,
    ) {
      await db
        .update(schema.driverProfiles)
        .set({
          status: passed ? "active" : "paused_lab_test",
          lastLabResultValidUntil: validUntil,
          activeLabPauseReason: pauseReason,
          updatedAt: new Date(),
        })
        .where(eq(schema.driverProfiles.accountId, driverAccountId));
    },

    async listAssignedTripVehicles(driverAccountId: string) {
      return db
        .select()
        .from(schema.tripVehicles)
        .where(eq(schema.tripVehicles.driverAccountId, driverAccountId));
    },
  };
}

export type DriverRepository = ReturnType<typeof createDriverRepository>;
