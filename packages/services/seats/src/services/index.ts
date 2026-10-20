// Business logic for Seats. Routes call this factory with context.db; repositories are created here.
import { PAYMENT_CONFIRM_TIMEOUT_SECONDS } from "@trips-app/domain";

import { SeatsServiceError } from "../errors";
import { DEFAULT_SEAT_HOLD_MINUTES, findPlanCatalogEntry } from "../model";
import { createSeatsRepository, type ServiceDatabase } from "../repository";
import type {
  AssignSeatByOrgInput,
  GetSeatMapInput,
  HoldSeatsInput,
  ReleaseSeatHoldInput,
  SeatsActorContext,
  TripSeatDto,
} from "../types";

export function createSeatsService(db: ServiceDatabase) {
  const repo = createSeatsRepository(db);

  async function resolveVehicleAndInventory(tripId: string, requestedVehicleId?: string) {
    const trip = await repo.findTripById(tripId);
    if (!trip) {
      throw new SeatsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
    }
    const vehicles = await repo.listTripVehicles(tripId);
    if (vehicles.length === 0) {
      throw new SeatsServiceError(
        "PRECONDITION_FAILED",
        "No vehicles are assigned to this trip yet.",
      );
    }
    const targetVehicle = requestedVehicleId
      ? vehicles.find((v) => v.vehicleId === requestedVehicleId)
      : vehicles[0];
    if (!targetVehicle) {
      throw new SeatsServiceError("RESOURCE_NOT_FOUND", "Vehicle not assigned to this trip.");
    }

    await repo.ensureSeatInventoryMaterialized(
      trip.tenantId,
      trip.id,
      targetVehicle.vehicleId,
      targetVehicle.seatLayoutSnapshot,
    );
    await repo.releaseExpiredHolds(trip.id, new Date());
    await repo.releaseStaleReservations(
      trip.id,
      new Date(Date.now() - PAYMENT_CONFIRM_TIMEOUT_SECONDS * 1000),
      new Date(),
    );
    await repo.syncTripSeatCounts(trip.id);

    const seats = await repo.listSeats(trip.id, targetVehicle.vehicleId);
    return { trip, targetVehicle, seats };
  }

  return {
    async getSeatMap(
      _actor: SeatsActorContext,
      input: GetSeatMapInput,
    ): Promise<{
      tripId: string;
      vehicleId: string;
      seatAssignmentMode: string;
      rows: number;
      cols: number;
      seats: TripSeatDto[];
    }> {
      const { trip, targetVehicle, seats } = await resolveVehicleAndInventory(
        input.tripId,
        input.vehicleId,
      );
      return {
        tripId: trip.id,
        vehicleId: targetVehicle.vehicleId,
        seatAssignmentMode: trip.seatAssignmentMode,
        rows: targetVehicle.seatLayoutSnapshot.rows,
        cols: targetVehicle.seatLayoutSnapshot.cols,
        seats,
      };
    },

    async holdSeats(
      actor: SeatsActorContext,
      input: HoldSeatsInput,
    ): Promise<{
      tripId: string;
      vehicleId: string;
      heldSeats: TripSeatDto[];
      holdExpiresAt: Date;
    }> {
      const { trip } = await resolveVehicleAndInventory(input.tripId, input.vehicleId);

      if (trip.seatAssignmentMode !== "traveler_choice") {
        throw new SeatsServiceError(
          "BUSINESS_RULE_VIOLATION",
          "This trip uses organization-assigned seating rather than traveler self-selection.",
        );
      }

      // Check traveler plan feature seatSelfSelection (Explorer or VIP required)
      const account = await repo.findAccountById(actor.accountId);
      const travelerTier =
        actor.planTier && actor.planTier !== "free"
          ? actor.planTier
          : (account?.travelerPlanTier ?? actor.planTier ?? "free");
      const planEntry = findPlanCatalogEntry("traveler", travelerTier);
      if (!planEntry?.features.seatSelfSelection) {
        throw new SeatsServiceError(
          "PLAN_REQUIRED",
          `Traveler plan "${travelerTier}" does not include seat self-selection. Upgrade to Explorer or VIP.`,
          { feature: "seatSelfSelection", planTier: travelerTier },
        );
      }

      const uniqueLabels = [...new Set(input.seatLabels.map((s) => s.trim()))];
      const holdExpiresAt = new Date(Date.now() + DEFAULT_SEAT_HOLD_MINUTES * 60 * 1000);
      const holdResult = await repo.holdSeatsAtomically(
        input.tripId,
        input.vehicleId,
        uniqueLabels,
        actor.accountId,
        holdExpiresAt,
      );

      if (holdResult.kind === "missing") {
        throw new SeatsServiceError(
          "RESOURCE_NOT_FOUND",
          `Seat "${holdResult.seatLabel}" does not exist on this vehicle.`,
        );
      }
      if (holdResult.kind === "unavailable") {
        throw new SeatsServiceError(
          "SEAT_NOT_AVAILABLE",
          `Seat "${holdResult.seatLabel}" is not available (current status: "${holdResult.status}").`,
          { seatLabel: holdResult.seatLabel, status: holdResult.status },
        );
      }

      await repo.syncTripSeatCounts(input.tripId);

      return {
        tripId: input.tripId,
        vehicleId: input.vehicleId,
        heldSeats: holdResult.heldSeats,
        holdExpiresAt,
      };
    },

    async releaseHold(
      actor: SeatsActorContext,
      input: ReleaseSeatHoldInput,
    ): Promise<{ releasedCount: number }> {
      const { trip } = await resolveVehicleAndInventory(input.tripId, input.vehicleId);
      const isTenantOrAdmin =
        actor.role === "admin" ||
        (Boolean(actor.activeTenantId) && actor.activeTenantId === trip.tenantId);
      const released = await repo.releaseSeatsByLabels(
        input.tripId,
        input.vehicleId,
        input.seatLabels.map((s) => s.trim()),
        isTenantOrAdmin ? null : actor.accountId,
      );
      await repo.syncTripSeatCounts(input.tripId);
      return { releasedCount: released.length };
    },

    async assignSeatByOrganization(
      actor: SeatsActorContext,
      input: AssignSeatByOrgInput,
    ): Promise<TripSeatDto> {
      if (!actor.activeTenantId) {
        throw new SeatsServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }
      const { trip } = await resolveVehicleAndInventory(input.tripId, input.vehicleId);
      if (trip.tenantId !== actor.activeTenantId) {
        throw new SeatsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const updated = await repo.updateSeatByOrg(
        actor.activeTenantId,
        input.tripId,
        input.vehicleId,
        input.seatLabel.trim(),
        {
          status: input.status,
          bookingId: input.bookingId ?? null,
          passengerName: input.passengerName?.trim() ?? null,
        },
      );
      if (!updated) {
        throw new SeatsServiceError(
          "RESOURCE_NOT_FOUND",
          `Seat "${input.seatLabel}" not found on this vehicle.`,
        );
      }
      await repo.syncTripSeatCounts(input.tripId);
      return updated;
    },
  };
}
