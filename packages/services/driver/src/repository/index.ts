import { and, desc, eq, gte, lte, schema, type ServiceDatabase } from "@trips-app/db";
import type { DriverLabTestKind, UpdateDriverProfileInput } from "../types";

export type { ServiceDatabase };

export function createDriverRepository(db: ServiceDatabase) {
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

    async listLabTestsByDriver(
      driverAccountId: string,
      filters?: {
        status?: string;
        testType?: DriverLabTestKind;
        dateRange?: { from?: Date; to?: Date };
      },
    ) {
      let query = db.select().from(schema.driverLabTests).$dynamic();

      const conditions = [eq(schema.driverLabTests.driverAccountId, driverAccountId)];
      if (filters?.status) {
        conditions.push(eq(schema.driverLabTests.status, filters.status as any));
      }
      if (filters?.testType) {
        conditions.push(eq(schema.driverLabTests.testType, filters.testType));
      }
      if (filters?.dateRange?.from) {
        conditions.push(gte(schema.driverLabTests.createdAt, filters.dateRange.from));
      }
      if (filters?.dateRange?.to) {
        conditions.push(lte(schema.driverLabTests.createdAt, filters.dateRange.to));
      }

      query = query.where(and(...conditions));
      query = query.orderBy(desc(schema.driverLabTests.createdAt));
      return query;
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

    async listAssignedTripVehicles(
      driverAccountId: string,
      filters?: {
        tripId?: string;
        tenantId?: string;
      },
    ) {
      let query = db.select().from(schema.tripVehicles).$dynamic();

      const conditions = [eq(schema.tripVehicles.driverAccountId, driverAccountId)];
      if (filters?.tripId) {
        conditions.push(eq(schema.tripVehicles.tripId, filters.tripId));
      }
      if (filters?.tenantId) {
        conditions.push(eq(schema.tripVehicles.tenantId, filters.tenantId));
      }

      query = query.where(and(...conditions));
      return query;
    },

    async insertLabTestRequestsBatch(
      requests: Array<{
        driverAccountId: string;
        requestedByAdminAccountId: string;
        deadlineAt: Date;
        testType: DriverLabTestKind;
      }>,
    ) {
      if (requests.length === 0) return [];
      return db
        .insert(schema.driverLabTests)
        .values(
          requests.map((r) => ({
            driverAccountId: r.driverAccountId,
            requestedByAdminAccountId: r.requestedByAdminAccountId,
            status: "requested" as const,
            testType: r.testType,
            deadlineAt: r.deadlineAt,
          })),
        )
        .returning();
    },
  };
}

export type DriverRepository = ReturnType<typeof createDriverRepository>;
