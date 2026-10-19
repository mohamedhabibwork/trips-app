// Business logic for Trips. Routes call this factory with context.db; repositories are created here.
import { TripsServiceError } from "../errors";
import {
  canCancelTripState,
  canTransitionTripState,
  computeHasStaffingGap,
  DEFAULT_WIZARD_STEPS,
  findPlanCatalogEntry,
  isTripEligibleForTravelerDiscovery,
  isValidTripCategoryCode,
  money,
  type PlanFeatures,
  type PlanLimits,
  type TripWizardStepCompletion,
} from "../model";
import { createTripsRepository, type ServiceDatabase } from "../repository";
import type {
  BrowsePublicTripsInput,
  CancelTripInput,
  CreateDraftTripInput,
  GetOrganizationTripInput,
  GetPublicTripDetailInput,
  ListOrganizationTripsInput,
  OrganizationTripDto,
  PublishTripInput,
  PublicTripSummaryDto,
  SaveWizardStepInput,
  TransitionTripStateInput,
  TripsTenantActorContext,
  TripsViewerContext,
  TripVehicleAssignmentDto,
} from "../types";

export function createTripsService(db: ServiceDatabase) {
  const repo = createTripsRepository(db);

  async function resolveOrganizationPlanAndStatus(tenantId: string): Promise<{
    status: string;
    planTier: string;
    limits: PlanLimits;
    features: PlanFeatures;
  }> {
    const org = await repo.findOrganizationByTenantId(tenantId);
    if (!org) {
      throw new TripsServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
    }

    const dbPlan = await repo.findOrganizationPlanInDb(org.planTier);
    if (dbPlan) {
      return {
        status: org.status,
        planTier: org.planTier,
        limits: dbPlan.limits,
        features: dbPlan.features,
      };
    }

    const fallback =
      findPlanCatalogEntry("organization", org.planTier) ??
      findPlanCatalogEntry("organization", "starter");
    if (!fallback) {
      throw new TripsServiceError(
        "INTERNAL_ERROR",
        "Organization plan catalog entry could not be resolved.",
      );
    }

    return {
      status: org.status,
      planTier: org.planTier,
      limits: fallback.limits,
      features: fallback.features,
    };
  }

  function toOrganizationTripDto(
    row: NonNullable<Awaited<ReturnType<typeof repo.findTripByIdForTenant>>>,
    vehicleRows: Awaited<ReturnType<typeof repo.listTripVehiclesForTrips>>,
  ): OrganizationTripDto {
    const vehicles: TripVehicleAssignmentDto[] = vehicleRows.map((v) => ({
      id: v.tripVehicle.id,
      tripId: v.tripVehicle.tripId,
      vehicleId: v.tripVehicle.vehicleId,
      plateNumber: v.plateNumber ?? null,
      model: v.model ?? null,
      seatCountSnapshot: v.tripVehicle.seatCountSnapshot,
      seatLayoutSnapshot: v.tripVehicle.seatLayoutSnapshot,
      driverSource: v.tripVehicle.driverSource,
      driverAccountId: v.tripVehicle.driverAccountId,
      moderatorSource: v.tripVehicle.moderatorSource,
      moderatorAccountId: v.tripVehicle.moderatorAccountId,
      photographerSource: v.tripVehicle.photographerSource,
      photographerAccountId: v.tripVehicle.photographerAccountId,
    }));

    const remainingSeatsCount = Math.max(
      0,
      row.totalCapacity - row.confirmedSeatsCount - row.heldSeatsCount,
    );

    return {
      id: row.id,
      tenantId: row.tenantId,
      titleAr: row.titleAr,
      titleEn: row.titleEn,
      descriptionAr: row.descriptionAr,
      descriptionEn: row.descriptionEn,
      categoryLookupCode: row.categoryLookupCode,
      language: row.language,
      coverImageUrl: row.coverImageUrl,
      galleryImageUrls: row.galleryImageUrls ?? [],
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      timezone: row.timezone,
      origin: row.origin ?? null,
      destinations: row.destinations ?? [],
      seatAssignmentMode: row.seatAssignmentMode,
      seatPriorityWindowHours: row.seatPriorityWindowHours,
      basePrice: money(row.basePriceMinor, row.currencyCode),
      basePriceMinor: row.basePriceMinor,
      currencyCode: row.currencyCode,
      totalCapacity: row.totalCapacity,
      confirmedSeatsCount: row.confirmedSeatsCount,
      heldSeatsCount: row.heldSeatsCount,
      remainingSeatsCount,
      childTrackingEnabled: row.childTrackingEnabled,
      state: row.state,
      publishMode: row.publishMode,
      targetedAudienceIds: row.targetedAudienceIds ?? [],
      vipEarlyAccessUntil: row.vipEarlyAccessUntil,
      wizardSteps: row.wizardSteps ?? DEFAULT_WIZARD_STEPS,
      hasStaffingGap: row.hasStaffingGap,
      publishedAt: row.publishedAt,
      cancelledAt: row.cancelledAt,
      cancellationReason: row.cancellationReason,
      cancelledByAccountId: row.cancelledByAccountId,
      createdByAccountId: row.createdByAccountId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      vehicles,
    };
  }

  function toPublicTripSummaryDto(
    row: NonNullable<Awaited<ReturnType<typeof repo.findPublicTripById>>>,
  ): PublicTripSummaryDto {
    const { trip, organizerNameAr, organizerNameEn } = row;
    const remainingSeatsCount = Math.max(
      0,
      trip.totalCapacity - trip.confirmedSeatsCount - trip.heldSeatsCount,
    );
    return {
      id: trip.id,
      tenantId: trip.tenantId,
      organizerNameAr,
      organizerNameEn,
      titleAr: trip.titleAr,
      titleEn: trip.titleEn,
      descriptionAr: trip.descriptionAr,
      descriptionEn: trip.descriptionEn,
      categoryLookupCode: trip.categoryLookupCode,
      language: trip.language,
      coverImageUrl: trip.coverImageUrl,
      galleryImageUrls: trip.galleryImageUrls ?? [],
      startsAt: trip.startsAt,
      endsAt: trip.endsAt,
      timezone: trip.timezone,
      origin: trip.origin ?? null,
      destinations: trip.destinations ?? [],
      seatAssignmentMode: trip.seatAssignmentMode,
      seatPriorityWindowHours: trip.seatPriorityWindowHours,
      basePrice: money(trip.basePriceMinor, trip.currencyCode),
      basePriceMinor: trip.basePriceMinor,
      currencyCode: trip.currencyCode,
      totalCapacity: trip.totalCapacity,
      confirmedSeatsCount: trip.confirmedSeatsCount,
      remainingSeatsCount,
      childTrackingEnabled: trip.childTrackingEnabled,
      state: trip.state,
    };
  }

  return {
    async createDraft(
      actor: TripsTenantActorContext,
      input: CreateDraftTripInput,
    ): Promise<OrganizationTripDto> {
      if (!isValidTripCategoryCode(input.categoryLookupCode)) {
        throw new TripsServiceError(
          "VALIDATION_ERROR",
          `Invalid trip category code "${input.categoryLookupCode}".`,
          { field: "categoryLookupCode" },
        );
      }

      const wizardSteps: TripWizardStepCompletion = {
        ...DEFAULT_WIZARD_STEPS,
        basics: true,
      };

      const created = await repo.insertDraftTrip({
        tenantId: actor.activeTenantId,
        titleAr: input.titleAr.trim(),
        titleEn: input.titleEn.trim(),
        descriptionAr: input.descriptionAr?.trim() ?? "",
        descriptionEn: input.descriptionEn?.trim() ?? "",
        categoryLookupCode: input.categoryLookupCode.trim().toUpperCase(),
        language: input.language ?? "ar",
        coverImageUrl: input.coverImageUrl ?? null,
        galleryImageUrls: input.galleryImageUrls ?? [],
        wizardSteps,
        createdByAccountId: actor.accountId,
        fileIds: input.fileIds,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "trips.draft.created",
        targetEntityType: "trip",
        targetEntityId: created.id,
        afterState: {
          titleEn: created.titleEn,
          categoryLookupCode: created.categoryLookupCode,
          state: created.state,
        },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      return toOrganizationTripDto(created, []);
    },

    async saveWizardStep(
      actor: TripsTenantActorContext,
      input: SaveWizardStepInput,
    ): Promise<OrganizationTripDto> {
      const existing = await repo.findTripByIdForTenant(actor.activeTenantId, input.tripId);
      if (!existing) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const currentWizardSteps: TripWizardStepCompletion = {
        ...DEFAULT_WIZARD_STEPS,
        ...existing.wizardSteps,
      };

      switch (input.step) {
        case "basics": {
          if (!isValidTripCategoryCode(input.categoryLookupCode)) {
            throw new TripsServiceError(
              "VALIDATION_ERROR",
              `Invalid trip category code "${input.categoryLookupCode}".`,
              { field: "categoryLookupCode" },
            );
          }
          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            titleAr: input.titleAr.trim(),
            titleEn: input.titleEn.trim(),
            descriptionAr: input.descriptionAr?.trim() ?? existing.descriptionAr,
            descriptionEn: input.descriptionEn?.trim() ?? existing.descriptionEn,
            categoryLookupCode: input.categoryLookupCode.trim().toUpperCase(),
            language: input.language ?? existing.language,
            coverImageUrl:
              input.coverImageUrl === undefined ? existing.coverImageUrl : input.coverImageUrl,
            galleryImageUrls: input.galleryImageUrls ?? existing.galleryImageUrls,
            wizardSteps: { ...currentWizardSteps, basics: true },
            updatedByAccountId: actor.accountId,
            fileIds: input.fileIds,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }

        case "schedule": {
          const startsAt = new Date(input.startsAt);
          const endsAt = new Date(input.endsAt);
          if (endsAt.getTime() <= startsAt.getTime()) {
            throw new TripsServiceError(
              "VALIDATION_ERROR",
              "Trip end time must be after start time.",
              { field: "endsAt" },
            );
          }

          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            startsAt,
            endsAt,
            timezone: input.timezone?.trim() ?? existing.timezone,
            origin: input.origin,
            destinations: input.destinations,
            wizardSteps: { ...currentWizardSteps, schedule: true },
            updatedByAccountId: actor.accountId,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }

        case "vehicles": {
          const uniqueVehicleIds = [...new Set(input.vehicleIds)];
          const orgPlan = await resolveOrganizationPlanAndStatus(actor.activeTenantId);
          if (
            orgPlan.limits.vehiclesPerTrip !== null &&
            uniqueVehicleIds.length > orgPlan.limits.vehiclesPerTrip
          ) {
            throw new TripsServiceError(
              "PLAN_LIMIT_EXCEEDED",
              `Organization plan "${orgPlan.planTier}" allows at most ${orgPlan.limits.vehiclesPerTrip} vehicle(s) per trip.`,
              {
                planTier: orgPlan.planTier,
                maxVehiclesPerTrip: orgPlan.limits.vehiclesPerTrip,
                requestedCount: uniqueVehicleIds.length,
              },
            );
          }

          const foundVehicles = await repo.findTenantVehiclesWithType(
            actor.activeTenantId,
            uniqueVehicleIds,
          );
          if (foundVehicles.length !== uniqueVehicleIds.length) {
            throw new TripsServiceError(
              "RESOURCE_NOT_FOUND",
              "One or more selected vehicles were not found in this organization.",
            );
          }

          const inactiveVehicle = foundVehicles.find((v) => v.vehicle.status !== "active");
          if (inactiveVehicle) {
            throw new TripsServiceError(
              "BUSINESS_RULE_VIOLATION",
              `Vehicle "${inactiveVehicle.vehicle.plateNumber}" is not active and cannot be assigned to a trip.`,
              { vehicleId: inactiveVehicle.vehicle.id, status: inactiveVehicle.vehicle.status },
            );
          }

          const snapshots = foundVehicles.map((v) => ({
            vehicleId: v.vehicle.id,
            seatCountSnapshot: v.vehicle.seatCount,
            seatLayoutSnapshot: v.vehicleType.seatLayout,
          }));

          await repo.replaceTripVehicles(actor.activeTenantId, existing.id, snapshots);

          const totalCapacity = snapshots.reduce((sum, item) => sum + item.seatCountSnapshot, 0);
          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            totalCapacity,
            hasStaffingGap: true,
            wizardSteps: { ...currentWizardSteps, vehicles: true },
            updatedByAccountId: actor.accountId,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }

        case "staffing": {
          const usesPlatformSuppliers = input.assignments.some(
            (a) =>
              a.driverSource === "platform_supplier" ||
              a.moderatorSource === "platform_supplier" ||
              a.photographerSource === "platform_supplier",
          );
          if (usesPlatformSuppliers) {
            const orgPlan = await resolveOrganizationPlanAndStatus(actor.activeTenantId);
            if (!orgPlan.features.platformSuppliers) {
              throw new TripsServiceError(
                "PLAN_REQUIRED",
                `Organization plan "${orgPlan.planTier}" does not include platform supplier booking.`,
                { feature: "platformSuppliers", planTier: orgPlan.planTier },
              );
            }
          }

          for (const assignment of input.assignments) {
            const updatedRow = await repo.updateTripVehicleStaffing(
              actor.activeTenantId,
              existing.id,
              assignment.vehicleId,
              {
                driverSource: assignment.driverSource,
                driverAccountId: assignment.driverAccountId ?? null,
                moderatorSource: assignment.moderatorSource,
                moderatorAccountId: assignment.moderatorAccountId ?? null,
                photographerSource: assignment.photographerSource ?? "unassigned",
                photographerAccountId: assignment.photographerAccountId ?? null,
              },
            );
            if (!updatedRow) {
              throw new TripsServiceError(
                "RESOURCE_NOT_FOUND",
                `Vehicle "${assignment.vehicleId}" is not assigned to this trip.`,
              );
            }
          }

          const currentTripVehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [
            existing.id,
          ]);
          const hasStaffingGap = computeHasStaffingGap(
            currentTripVehicles.map((v) => v.tripVehicle),
          );

          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            hasStaffingGap,
            wizardSteps: { ...currentWizardSteps, staffing: true },
            updatedByAccountId: actor.accountId,
          });
          return toOrganizationTripDto(updated!, currentTripVehicles);
        }

        case "programs": {
          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            wizardSteps: { ...currentWizardSteps, programs: true },
            updatedByAccountId: actor.accountId,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }

        case "seating": {
          if (input.seatAssignmentMode === "traveler_choice") {
            const orgPlan = await resolveOrganizationPlanAndStatus(actor.activeTenantId);
            if (!orgPlan.features.seatSelfSelection) {
              throw new TripsServiceError(
                "PLAN_REQUIRED",
                `Organization plan "${orgPlan.planTier}" does not include traveler seat self-selection.`,
                { feature: "seatSelfSelection", planTier: orgPlan.planTier },
              );
            }
          }

          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            seatAssignmentMode: input.seatAssignmentMode,
            seatPriorityWindowHours:
              input.seatPriorityWindowHours ?? existing.seatPriorityWindowHours,
            wizardSteps: { ...currentWizardSteps, seating: true },
            updatedByAccountId: actor.accountId,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }

        case "pricing": {
          if (input.childTrackingEnabled) {
            const orgPlan = await resolveOrganizationPlanAndStatus(actor.activeTenantId);
            if (!orgPlan.features.childTracking) {
              throw new TripsServiceError(
                "PLAN_REQUIRED",
                `Organization plan "${orgPlan.planTier}" does not include child safety tracking.`,
                { feature: "childTracking", planTier: orgPlan.planTier },
              );
            }
          }

          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            basePriceMinor: input.basePrice.amountMinor,
            currencyCode: input.basePrice.currency,
            childTrackingEnabled: input.childTrackingEnabled ?? existing.childTrackingEnabled,
            wizardSteps: { ...currentWizardSteps, pricing: true },
            updatedByAccountId: actor.accountId,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }

        case "publish": {
          const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
            publishMode: input.publishMode,
            targetedAudienceIds: input.targetedAudienceIds ?? existing.targetedAudienceIds,
            vipEarlyAccessUntil:
              input.vipEarlyAccessUntil === undefined
                ? existing.vipEarlyAccessUntil
                : input.vipEarlyAccessUntil
                  ? new Date(input.vipEarlyAccessUntil)
                  : null,
            wizardSteps: { ...currentWizardSteps, publish: true },
            updatedByAccountId: actor.accountId,
          });
          const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
          return toOrganizationTripDto(updated!, vehicles);
        }
      }
    },

    async publish(
      actor: TripsTenantActorContext,
      input: PublishTripInput,
    ): Promise<OrganizationTripDto> {
      const existing = await repo.findTripByIdForTenant(actor.activeTenantId, input.tripId);
      if (!existing) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      if (existing.state !== "draft") {
        throw new TripsServiceError(
          "INVALID_STATE_TRANSITION",
          `Only draft trips can be published (current state: "${existing.state}").`,
          { fromState: existing.state, toState: "published" },
        );
      }

      const orgPlan = await resolveOrganizationPlanAndStatus(actor.activeTenantId);
      if (orgPlan.status !== "active") {
        throw new TripsServiceError(
          "SUBSCRIPTION_INACTIVE",
          "Organization subscription or approval status is not active; publishing trips is blocked.",
          { organizationStatus: orgPlan.status },
        );
      }

      const steps = existing.wizardSteps ?? DEFAULT_WIZARD_STEPS;
      if (!steps.basics || !steps.schedule || !steps.vehicles || !steps.pricing) {
        throw new TripsServiceError(
          "PRECONDITION_FAILED",
          "Required trip wizard steps (basics, schedule, vehicles, pricing) must be completed before publishing.",
          { wizardSteps: steps },
        );
      }

      if (orgPlan.limits.activeTripsPerMonth !== null) {
        const now = new Date();
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
        const usedCount = await repo.countPublishedOrActiveTripsThisMonth(
          actor.activeTenantId,
          monthStart,
        );
        if (usedCount >= orgPlan.limits.activeTripsPerMonth) {
          throw new TripsServiceError(
            "PLAN_LIMIT_EXCEEDED",
            `Monthly active trips limit (${orgPlan.limits.activeTripsPerMonth}) reached for plan "${orgPlan.planTier}".`,
            {
              planTier: orgPlan.planTier,
              maxAllowed: orgPlan.limits.activeTripsPerMonth,
              usedCount,
            },
          );
        }
      }

      const nextPublishMode =
        input.publishMode ?? (existing.publishMode === "draft" ? "public" : existing.publishMode);
      const publishedAt = new Date();

      const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
        state: "published",
        publishMode: nextPublishMode,
        targetedAudienceIds: input.targetedAudienceIds ?? existing.targetedAudienceIds,
        vipEarlyAccessUntil:
          input.vipEarlyAccessUntil === undefined
            ? existing.vipEarlyAccessUntil
            : input.vipEarlyAccessUntil
              ? new Date(input.vipEarlyAccessUntil)
              : null,
        publishedAt,
        wizardSteps: { ...steps, publish: true },
        updatedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "trips.published",
        targetEntityType: "trip",
        targetEntityId: existing.id,
        beforeState: { state: existing.state, publishMode: existing.publishMode },
        afterState: { state: "published", publishMode: nextPublishMode },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
      return toOrganizationTripDto(updated!, vehicles);
    },

    async transitionState(
      actor: TripsTenantActorContext,
      input: TransitionTripStateInput,
    ): Promise<OrganizationTripDto> {
      const existing = await repo.findTripByIdForTenant(actor.activeTenantId, input.tripId);
      if (!existing) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      if (!canTransitionTripState(existing.state, input.targetState)) {
        throw new TripsServiceError(
          "INVALID_STATE_TRANSITION",
          `Invalid trip state transition from "${existing.state}" to "${input.targetState}".`,
          { fromState: existing.state, toState: input.targetState },
        );
      }

      if (
        (input.targetState === "Selection" || input.targetState === "in_progress") &&
        existing.hasStaffingGap
      ) {
        throw new TripsServiceError(
          "PRECONDITION_FAILED",
          `Trip cannot transition to "${input.targetState}" while vehicle staffing gaps remain.`,
          { tripId: existing.id, hasStaffingGap: true },
        );
      }

      const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
        state: input.targetState,
        updatedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "trips.state_transitioned",
        targetEntityType: "trip",
        targetEntityId: existing.id,
        reason: input.reason ?? null,
        beforeState: { state: existing.state },
        afterState: { state: input.targetState },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
      return toOrganizationTripDto(updated!, vehicles);
    },

    async cancel(
      actor: TripsTenantActorContext,
      input: CancelTripInput,
    ): Promise<OrganizationTripDto> {
      const existing = await repo.findTripByIdForTenant(actor.activeTenantId, input.tripId);
      if (!existing) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      if (!canCancelTripState(existing.state)) {
        throw new TripsServiceError(
          "INVALID_STATE_TRANSITION",
          `Trip in state "${existing.state}" cannot be cancelled.`,
          { fromState: existing.state, toState: "cancelled" },
        );
      }

      const reason = input.reason.trim();
      const cancelledAt = new Date();
      const updated = await repo.updateTripForTenant(actor.activeTenantId, existing.id, {
        state: "cancelled",
        cancelledAt,
        cancellationReason: reason,
        cancelledByAccountId: actor.accountId,
        updatedByAccountId: actor.accountId,
      });

      await repo.writeAuditLog({
        actorAccountId: actor.accountId,
        actorRole: actor.role,
        tenantId: actor.activeTenantId,
        action: "trips.cancelled",
        targetEntityType: "trip",
        targetEntityId: existing.id,
        reason,
        beforeState: { state: existing.state },
        afterState: { state: "cancelled", cancellationReason: reason },
        ipAddress: actor.ipAddress,
        requestId: actor.requestId,
      });

      const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [existing.id]);
      return toOrganizationTripDto(updated!, vehicles);
    },

    async listOrganizationTrips(
      actor: TripsTenantActorContext,
      input?: ListOrganizationTripsInput,
    ): Promise<{ items: OrganizationTripDto[] }> {
      const rows = await repo.listTripsForTenant(actor.activeTenantId, {
        state: input?.state,
        search: input?.search,
        hasStaffingGap: input?.hasStaffingGap,
      });

      const tripIds = rows.map((r) => r.id);
      const allVehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, tripIds);
      const vehiclesByTripId = new Map<string, typeof allVehicles>();
      for (const item of allVehicles) {
        const list = vehiclesByTripId.get(item.tripVehicle.tripId) ?? [];
        list.push(item);
        vehiclesByTripId.set(item.tripVehicle.tripId, list);
      }

      return {
        items: rows.map((row) => toOrganizationTripDto(row, vehiclesByTripId.get(row.id) ?? [])),
      };
    },

    async getOrganizationTrip(
      actor: TripsTenantActorContext,
      input: GetOrganizationTripInput,
    ): Promise<OrganizationTripDto> {
      const row = await repo.findTripByIdForTenant(actor.activeTenantId, input.tripId);
      if (!row) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }
      const vehicles = await repo.listTripVehiclesForTrips(actor.activeTenantId, [row.id]);
      return toOrganizationTripDto(row, vehicles);
    },

    async browsePublicTrips(
      viewer: TripsViewerContext,
      input?: BrowsePublicTripsInput,
    ): Promise<{ items: PublicTripSummaryDto[] }> {
      let resolvedPlanTier = viewer.travelerPlanTier ?? null;
      if (!resolvedPlanTier && viewer.accountId) {
        const account = await repo.findAccountById(viewer.accountId);
        resolvedPlanTier = account?.travelerPlanTier ?? "free";
      }

      const rows = await repo.listPublicDiscoverableTrips({
        search: input?.search,
        categoryLookupCode: input?.categoryLookupCode,
        maxPriceMinor: input?.maxPriceMinor,
      });

      const now = new Date();
      const regionFilter = input?.regionLookupCode?.trim().toUpperCase();

      const eligible = rows.filter(({ trip }) => {
        if (
          !isTripEligibleForTravelerDiscovery(
            {
              state: trip.state,
              publishMode: trip.publishMode,
              targetedAudienceIds: trip.targetedAudienceIds ?? [],
              vipEarlyAccessUntil: trip.vipEarlyAccessUntil,
            },
            {
              accountId: viewer.accountId,
              travelerPlanTier: resolvedPlanTier,
            },
            now,
          )
        ) {
          return false;
        }
        if (regionFilter) {
          const matchesOrigin =
            trip.origin?.regionLookupCode?.trim().toUpperCase() === regionFilter;
          const matchesDest = (trip.destinations ?? []).some(
            (d) => d.regionLookupCode?.trim().toUpperCase() === regionFilter,
          );
          if (!matchesOrigin && !matchesDest) return false;
        }
        return true;
      });

      return {
        items: eligible.map(toPublicTripSummaryDto),
      };
    },

    async getPublicTripDetail(
      viewer: TripsViewerContext,
      input?: GetPublicTripDetailInput,
    ): Promise<{ trip: PublicTripSummaryDto | null }> {
      if (!input?.tripId) {
        return { trip: null };
      }

      const row = await repo.findPublicTripById(input.tripId);
      if (!row) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      let resolvedPlanTier = viewer.travelerPlanTier ?? null;
      if (!resolvedPlanTier && viewer.accountId) {
        const account = await repo.findAccountById(viewer.accountId);
        resolvedPlanTier = account?.travelerPlanTier ?? "free";
      }

      const eligible = isTripEligibleForTravelerDiscovery(
        {
          state: row.trip.state,
          publishMode: row.trip.publishMode,
          targetedAudienceIds: row.trip.targetedAudienceIds ?? [],
          vipEarlyAccessUntil: row.trip.vipEarlyAccessUntil,
        },
        {
          accountId: viewer.accountId,
          travelerPlanTier: resolvedPlanTier,
        },
      );

      if (!eligible) {
        throw new TripsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      return {
        trip: toPublicTripSummaryDto(row),
      };
    },
  };
}
