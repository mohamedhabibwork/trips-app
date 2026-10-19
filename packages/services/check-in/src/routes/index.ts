import {
  checkInRecordDtoSchema,
  getMyBoardingPassesSchema,
  listTripManifestSchema,
  manualCheckInOverrideSchema,
  verifyAndCheckInByQrSchema,
} from "../schemas";
import { createCheckInService } from "../services";
import {
  checkInAuthenticatedProcedure,
  checkInOrgManageProcedure,
  checkInOrgViewProcedure,
  procedure,
} from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/check-in/status",
    summary: "Health check for the check-in service",
    tags: ["check-in"],
  })
  .handler(async () => ({ service: "check-in" as const, status: "ok" as const }));

const listTripManifest = checkInOrgViewProcedure
  .input(listTripManifestSchema)
  .output(checkInRecordDtoSchema.array())
  .handler(async ({ context, input }) => {
    const svc = createCheckInService({ db: context.db });
    return await svc.listTripManifest(context.auth.activeTenantId, input);
  });

const verifyAndCheckInByQr = checkInOrgManageProcedure
  .input(verifyAndCheckInByQrSchema)
  .output(checkInRecordDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createCheckInService({ db: context.db });
    return await svc.verifyAndCheckInByQr(
      context.auth.activeTenantId,
      context.auth.accountId,
      input,
    );
  });

const manualCheckInOverride = checkInOrgManageProcedure
  .input(manualCheckInOverrideSchema)
  .output(checkInRecordDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createCheckInService({ db: context.db });
    return await svc.manualCheckInOverride(
      context.auth.activeTenantId,
      context.auth.accountId,
      input,
    );
  });

const getMyBoardingPasses = checkInAuthenticatedProcedure
  .input(getMyBoardingPassesSchema)
  .output(checkInRecordDtoSchema.array())
  .handler(async ({ context, input }) => {
    const svc = createCheckInService({ db: context.db });
    return await svc.getMyBoardingPasses(context.auth.accountId, input?.bookingId);
  });

export const routes = {
  status,
  listTripManifest,
  verifyAndCheckInByQr,
  manualCheckInOverride,
  getMyBoardingPasses,
};
