import {
  moderatorAssignmentDtoSchema,
  moderatorManifestItemDtoSchema,
  moderatorTrackingEventDtoSchema,
  raiseSafetyAlertSchema,
  recordBoardingCheckInSchema,
  recordHeadcountSchema,
} from "../schemas";
import { createModeratorService } from "../services";
import { moderatorVehicleProcedure, procedure } from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/moderator/status",
    summary: "Health check for the moderator service",
    tags: ["moderator"],
  })
  .handler(async () => ({ service: "moderator" as const, status: "ok" as const }));

const getActiveAssignment = moderatorVehicleProcedure
  .output(moderatorAssignmentDtoSchema)
  .handler(async ({ context }) => {
    const svc = createModeratorService({ db: context.db });
    return await svc.getActiveAssignment({
      accountId: context.auth.accountId,
      tripId: context.auth.moderatorTripId!,
      vehicleId: context.auth.moderatorVehicleId!,
    });
  });

const getVehicleManifest = moderatorVehicleProcedure
  .output(moderatorManifestItemDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createModeratorService({ db: context.db });
    return await svc.getVehicleManifest({
      accountId: context.auth.accountId,
      tripId: context.auth.moderatorTripId!,
      vehicleId: context.auth.moderatorVehicleId!,
    });
  });

const recordBoardingCheckIn = moderatorVehicleProcedure
  .input(recordBoardingCheckInSchema)
  .output(moderatorManifestItemDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createModeratorService({ db: context.db });
    return await svc.recordBoardingCheckIn(
      {
        accountId: context.auth.accountId,
        tripId: context.auth.moderatorTripId!,
        vehicleId: context.auth.moderatorVehicleId!,
      },
      input,
    );
  });

const recordHeadcount = moderatorVehicleProcedure
  .input(recordHeadcountSchema)
  .output(moderatorTrackingEventDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createModeratorService({ db: context.db });
    return await svc.recordHeadcount(
      {
        accountId: context.auth.accountId,
        tripId: context.auth.moderatorTripId!,
        vehicleId: context.auth.moderatorVehicleId!,
      },
      input,
    );
  });

const raiseSafetyAlert = moderatorVehicleProcedure
  .input(raiseSafetyAlertSchema)
  .output(moderatorTrackingEventDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createModeratorService({ db: context.db });
    return await svc.raiseSafetyAlert(
      {
        accountId: context.auth.accountId,
        tripId: context.auth.moderatorTripId!,
        vehicleId: context.auth.moderatorVehicleId!,
      },
      input,
    );
  });

export const routes = {
  status,
  getActiveAssignment,
  getVehicleManifest,
  recordBoardingCheckIn,
  recordHeadcount,
  raiseSafetyAlert,
};
