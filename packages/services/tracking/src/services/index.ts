import { TrackingServiceError } from "../errors";
import { createTrackingRepository, type ServiceDatabase } from "../repository";
import type {
  RecordChildSafetyEventInput,
  RecordGpsPingInput,
  TripLiveTrackingDto,
} from "../types";

export interface TrackingActorScope {
  role?: string;
  tenantId?: string | null;
  moderatorTripId?: string | null;
}

export function createTrackingService(deps: { db: ServiceDatabase }) {
  const repo = createTrackingRepository(deps.db);

  function assertTripScope(trip: { id: string; tenantId: string }, scope?: TrackingActorScope) {
    if (!scope) return;
    if (
      (scope.role === "organization_owner" || scope.role === "organization_employee") &&
      scope.tenantId !== trip.tenantId
    ) {
      throw new TrackingServiceError(
        "FORBIDDEN_TRACKING_ACCESS",
        "Cannot record tracking events for another organization's trip.",
      );
    }
    if (scope.role === "moderator" && scope.moderatorTripId && scope.moderatorTripId !== trip.id) {
      throw new TrackingServiceError(
        "FORBIDDEN_TRACKING_ACCESS",
        "Moderator is not scoped to this trip.",
      );
    }
  }

  return {
    async recordGpsPing(
      actorAccountId: string,
      input: RecordGpsPingInput,
      scope?: TrackingActorScope,
    ) {
      const trip = await repo.findTripById(input.tripId);
      if (!trip) {
        throw new TrackingServiceError("TRIP_NOT_FOUND", "Trip not found.");
      }
      assertTripScope(trip, scope);
      return repo.insertTrackingEvent({
        tenantId: trip.tenantId,
        tripId: trip.id,
        vehicleId: input.vehicleId ?? null,
        recordedByAccountId: actorAccountId,
        eventType: "gps_ping",
        coordinates: input.coordinates,
        severity: "info",
      });
    },

    async recordChildSafetyEvent(
      actorAccountId: string,
      input: RecordChildSafetyEventInput,
      scope?: TrackingActorScope,
    ) {
      const trip = await repo.findTripById(input.tripId);
      if (!trip) {
        throw new TrackingServiceError("TRIP_NOT_FOUND", "Trip not found.");
      }
      assertTripScope(trip, scope);
      return repo.insertTrackingEvent({
        tenantId: trip.tenantId,
        tripId: trip.id,
        vehicleId: input.vehicleId ?? null,
        recordedByAccountId: actorAccountId,
        eventType: input.eventType,
        severity: "info",
        childPassengerId: input.childPassengerId,
        messageAr:
          input.messageAr ??
          (input.eventType === "child_boarded"
            ? "صعد الطفل إلى المركبة"
            : "غادر الطفل المركبة بأمان"),
        messageEn:
          input.messageEn ??
          (input.eventType === "child_boarded"
            ? "Child boarded the vehicle"
            : "Child disembarked safely"),
      });
    },

    async getTripLiveTracking(tripId: string): Promise<TripLiveTrackingDto> {
      const trip = await repo.findTripById(tripId);
      if (!trip) {
        throw new TrackingServiceError("TRIP_NOT_FOUND", "Trip not found.");
      }
      const events = await repo.listEventsForTrip(tripId);
      const latestGps = events.find((e) => e.coordinates !== null);
      return {
        tripId,
        latestCoordinates: latestGps?.coordinates ?? null,
        events,
      };
    },

    async listSafetyAlerts(tenantId?: string | null, role?: string) {
      if (!tenantId && role && role !== "admin") {
        throw new TrackingServiceError(
          "TENANT_NOT_FOUND",
          "Organization context is required to list safety alerts.",
        );
      }
      return repo.listSafetyAlerts(tenantId);
    },
  };
}

export type TrackingService = ReturnType<typeof createTrackingService>;
