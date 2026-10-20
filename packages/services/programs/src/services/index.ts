// Business logic for Programs. Routes call this factory with context.db; repositories are created here.
import { ProgramsServiceError } from "../errors";
import { findPlanCatalogEntry, money } from "../model";
import { createProgramsRepository, type ServiceDatabase } from "../repository";
import type {
  CreateProgramInput,
  DeleteProgramInput,
  ListPublicTripProgramsInput,
  ListTripProgramsInput,
  ProgramsTenantActorContext,
  TripProgramDto,
  UpdateProgramInput,
} from "../types";

export function createProgramsService(
  dbOrDeps:
    | ServiceDatabase
    | { db: ServiceDatabase; repo?: ReturnType<typeof createProgramsRepository> },
) {
  const db = "db" in dbOrDeps ? dbOrDeps.db : dbOrDeps;
  const repo = "repo" in dbOrDeps && dbOrDeps.repo ? dbOrDeps.repo : createProgramsRepository(db);

  function toProgramDto(
    row: NonNullable<Awaited<ReturnType<typeof repo.findProgramByIdForTenant>>>,
  ): TripProgramDto {
    const remainingCapacity =
      row.capacity === null ? null : Math.max(0, row.capacity - row.bookedCount);
    return {
      id: row.id,
      tenantId: row.tenantId,
      tripId: row.tripId,
      titleAr: row.titleAr,
      titleEn: row.titleEn,
      descriptionAr: row.descriptionAr,
      descriptionEn: row.descriptionEn,
      dayNumber: row.dayNumber,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      locationNameAr: row.locationNameAr,
      locationNameEn: row.locationNameEn,
      price: money(row.priceMinor, row.currencyCode),
      priceMinor: row.priceMinor,
      currencyCode: row.currencyCode,
      isIncludedInBase: row.isIncludedInBase,
      capacity: row.capacity,
      bookedCount: row.bookedCount,
      remainingCapacity,
      sortOrder: row.sortOrder,
      attachmentUrls: row.attachmentUrls ?? [],
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  return {
    async createProgram(
      actor: ProgramsTenantActorContext,
      input: CreateProgramInput,
    ): Promise<TripProgramDto> {
      const trip = await repo.findTripForTenant(actor.activeTenantId, input.tripId);
      if (!trip) {
        throw new ProgramsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const orgPlanInfo = await repo.findOrganizationPlan(actor.activeTenantId);
      if (!orgPlanInfo) {
        throw new ProgramsServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const fallbackPlan = findPlanCatalogEntry("organization", orgPlanInfo.org.planTier);
      const maxPrograms =
        orgPlanInfo.plan?.limits.programsPerTrip ?? fallbackPlan?.limits.programsPerTrip ?? null;

      if (maxPrograms !== null) {
        const currentCount = await repo.countActiveProgramsForTrip(
          actor.activeTenantId,
          input.tripId,
        );
        if (currentCount >= maxPrograms) {
          throw new ProgramsServiceError(
            "PLAN_LIMIT_EXCEEDED",
            `Organization plan "${orgPlanInfo.org.planTier}" allows at most ${maxPrograms} program(s) per trip.`,
            {
              planTier: orgPlanInfo.org.planTier,
              maxProgramsPerTrip: maxPrograms,
              currentCount,
            },
          );
        }
      }

      if (input.startsAt && input.endsAt) {
        if (new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()) {
          throw new ProgramsServiceError(
            "VALIDATION_ERROR",
            "Program end time must be after start time.",
            { field: "endsAt" },
          );
        }
      }

      const created = await repo.insertProgram({
        tenantId: actor.activeTenantId,
        tripId: input.tripId,
        titleAr: input.titleAr.trim(),
        titleEn: input.titleEn.trim(),
        descriptionAr: input.descriptionAr?.trim() ?? "",
        descriptionEn: input.descriptionEn?.trim() ?? "",
        dayNumber: input.dayNumber ?? 1,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        locationNameAr: input.locationNameAr?.trim() ?? null,
        locationNameEn: input.locationNameEn?.trim() ?? null,
        priceMinor: input.priceMinor ?? 0,
        currencyCode: input.currencyCode ?? trip.currencyCode,
        isIncludedInBase: input.isIncludedInBase ?? (input.priceMinor ?? 0) === 0,
        capacity: input.capacity ?? null,
        sortOrder: input.sortOrder ?? 0,
        attachmentUrls: input.attachmentUrls ?? [],
        createdByAccountId: actor.accountId,
        fileIds: input.fileIds,
      });

      return toProgramDto(created);
    },

    async updateProgram(
      actor: ProgramsTenantActorContext,
      input: UpdateProgramInput,
    ): Promise<TripProgramDto> {
      const existing = await repo.findProgramByIdForTenant(actor.activeTenantId, input.programId);
      if (!existing) {
        throw new ProgramsServiceError("RESOURCE_NOT_FOUND", "Trip program not found.");
      }

      const nextStartsAt =
        input.startsAt === undefined
          ? existing.startsAt
          : input.startsAt
            ? new Date(input.startsAt)
            : null;
      const nextEndsAt =
        input.endsAt === undefined ? existing.endsAt : input.endsAt ? new Date(input.endsAt) : null;

      if (nextStartsAt && nextEndsAt && nextEndsAt.getTime() <= nextStartsAt.getTime()) {
        throw new ProgramsServiceError(
          "VALIDATION_ERROR",
          "Program end time must be after start time.",
          { field: "endsAt" },
        );
      }

      const updated = await repo.updateProgramForTenant(actor.activeTenantId, existing.id, {
        titleAr: input.titleAr?.trim(),
        titleEn: input.titleEn?.trim(),
        descriptionAr: input.descriptionAr?.trim(),
        descriptionEn: input.descriptionEn?.trim(),
        dayNumber: input.dayNumber,
        startsAt: nextStartsAt,
        endsAt: nextEndsAt,
        locationNameAr: input.locationNameAr,
        locationNameEn: input.locationNameEn,
        priceMinor: input.priceMinor,
        currencyCode: input.currencyCode,
        isIncludedInBase: input.isIncludedInBase,
        capacity: input.capacity,
        sortOrder: input.sortOrder,
        attachmentUrls: input.attachmentUrls,
        status: input.status,
        updatedByAccountId: actor.accountId,
        fileIds: input.fileIds,
      });

      return toProgramDto(updated!);
    },

    async deleteProgram(
      actor: ProgramsTenantActorContext,
      input: DeleteProgramInput,
    ): Promise<{ deleted: true; programId: string }> {
      const deleted = await repo.deleteProgramForTenant(actor.activeTenantId, input.programId);
      if (!deleted) {
        throw new ProgramsServiceError("RESOURCE_NOT_FOUND", "Trip program not found.");
      }
      return { deleted: true, programId: deleted.id };
    },

    async listTripPrograms(
      actor: ProgramsTenantActorContext,
      input: ListTripProgramsInput,
    ): Promise<{ items: TripProgramDto[] }> {
      const trip = await repo.findTripForTenant(actor.activeTenantId, input.tripId);
      if (!trip) {
        throw new ProgramsServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }
      const rows = await repo.listProgramsForTrip(
        actor.activeTenantId,
        input.tripId,
        input.includeCancelled ?? false,
      );
      return { items: rows.map(toProgramDto) };
    },

    async listPublicTripPrograms(
      input?: ListPublicTripProgramsInput,
    ): Promise<{ items: TripProgramDto[] }> {
      if (!input?.tripId) {
        return { items: [] };
      }
      const rows = await repo.listPublicProgramsForTrip(input.tripId);
      return { items: rows.map(toProgramDto) };
    },
  };
}
