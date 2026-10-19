import {
  adminRequestLabTestSchema,
  adminReviewLabTestSchema,
  bookLabTestSchema,
  driverAssignedTripVehicleDtoSchema,
  driverLabTestDtoSchema,
  driverProfileDtoSchema,
  updateDriverProfileSchema,
  uploadLabTestResultSchema,
} from "../schemas";
import { createDriverService } from "../services";
import { driverRoleProcedure, driverSafetyAdminProcedure, procedure } from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/driver/status",
    summary: "Health check for the driver service",
    tags: ["driver"],
  })
  .handler(async () => ({ service: "driver" as const, status: "ok" as const }));

const getProfile = driverRoleProcedure
  .output(driverProfileDtoSchema)
  .handler(async ({ context }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.getProfile(context.auth.accountId);
  });

const updateProfile = driverRoleProcedure
  .input(updateDriverProfileSchema)
  .output(driverProfileDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.updateProfile(context.auth.accountId, input);
  });

const getLabTestStatus = driverRoleProcedure
  .output(driverLabTestDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.getLabTestStatus(context.auth.accountId);
  });

const bookLabTest = driverRoleProcedure
  .input(bookLabTestSchema)
  .output(driverLabTestDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.bookLabTest(context.auth.accountId, input);
  });

const uploadLabTestResult = driverRoleProcedure
  .input(uploadLabTestResultSchema)
  .output(driverLabTestDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.uploadLabTestResult(context.auth.accountId, input);
  });

const adminRequestLabTest = driverSafetyAdminProcedure
  .input(adminRequestLabTestSchema)
  .output(driverLabTestDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.adminRequestLabTest(context.auth.accountId, input);
  });

const adminReviewLabTest = driverSafetyAdminProcedure
  .input(adminReviewLabTestSchema)
  .output(driverLabTestDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.adminReviewLabTest(context.auth.accountId, input);
  });

const listAssignedTrips = driverRoleProcedure
  .output(driverAssignedTripVehicleDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createDriverService({ db: context.db });
    return await svc.listAssignedTrips(context.auth.accountId);
  });

export const routes = {
  status,
  getProfile,
  updateProfile,
  getLabTestStatus,
  bookLabTest,
  uploadLabTestResult,
  adminRequestLabTest,
  adminReviewLabTest,
  listAssignedTrips,
};
