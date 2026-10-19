import {
  getTripLiveTrackingSchema,
  recordChildSafetyEventSchema,
  recordGpsPingSchema,
  trackingEventDtoSchema,
  tripLiveTrackingDtoSchema,
} from "../schemas";
import { createTrackingService } from "../services";
import {
  procedure,
  trackingAlertsProcedure,
  trackingAuthenticatedProcedure,
  trackingChildSafetyProcedure,
  trackingGpsPingProcedure,
} from "./procedure";

const status = procedure
  .route({
    method: "GET",
    path: "/tracking/status",
    summary: "Health check for the tracking service",
    tags: ["tracking"],
  })
  .handler(async () => ({ service: "tracking" as const, status: "ok" as const }));

const recordGpsPing = trackingGpsPingProcedure
  .input(recordGpsPingSchema)
  .output(trackingEventDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createTrackingService({ db: context.db });
    return await svc.recordGpsPing(context.auth.accountId, input, {
      role: context.auth.activeRole,
      tenantId: context.auth.activeTenantId,
      moderatorTripId: context.auth.moderatorTripId,
    });
  });

const recordChildSafetyEvent = trackingChildSafetyProcedure
  .input(recordChildSafetyEventSchema)
  .output(trackingEventDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createTrackingService({ db: context.db });
    return await svc.recordChildSafetyEvent(context.auth.accountId, input, {
      role: context.auth.activeRole,
      tenantId: context.auth.activeTenantId,
      moderatorTripId: context.auth.moderatorTripId,
    });
  });

const getTripLiveTracking = trackingAuthenticatedProcedure
  .input(getTripLiveTrackingSchema)
  .output(tripLiveTrackingDtoSchema)
  .handler(async ({ context, input }) => {
    const svc = createTrackingService({ db: context.db });
    return await svc.getTripLiveTracking(input.tripId);
  });

const listSafetyAlerts = trackingAlertsProcedure
  .output(trackingEventDtoSchema.array())
  .handler(async ({ context }) => {
    const svc = createTrackingService({ db: context.db });
    return await svc.listSafetyAlerts(context.auth.activeTenantId, context.auth.activeRole);
  });

export const routes = {
  status,
  recordGpsPing,
  recordChildSafetyEvent,
  getTripLiveTracking,
  listSafetyAlerts,
};
