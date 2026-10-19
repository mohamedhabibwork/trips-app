// Business logic for Availability. Routes call this factory with context.db; repositories are created here.
import { AvailabilityServiceError } from "../errors";
import { SUPPLIER_ROLES, type SupplierRole, windowsOverlap } from "../model";
import { createAvailabilityRepository, type ServiceDatabase } from "../repository";
import type {
  AvailabilityActorContext,
  CheckSupplierAvailabilityInput,
  DeleteAvailabilityBlockInput,
  ListMyBlocksInput,
  SupplierAvailabilityBlockDto,
  UpsertAvailabilityBlockInput,
} from "../types";

export function createAvailabilityService(db: ServiceDatabase) {
  const repo = createAvailabilityRepository(db);

  function resolveSupplierRole(role: string): SupplierRole {
    if ((SUPPLIER_ROLES as readonly string[]).includes(role)) {
      return role as SupplierRole;
    }
    return "platform_driver";
  }

  return {
    async listMyBlocks(
      actor: AvailabilityActorContext,
      input?: ListMyBlocksInput,
    ): Promise<{ items: SupplierAvailabilityBlockDto[] }> {
      const items = await repo.listBlocksForSupplier(actor.accountId, {
        from: input?.from ? new Date(input.from) : undefined,
        to: input?.to ? new Date(input.to) : undefined,
      });
      return { items };
    },

    async upsertBlock(
      actor: AvailabilityActorContext,
      input: UpsertAvailabilityBlockInput,
    ): Promise<SupplierAvailabilityBlockDto> {
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);
      if (endsAt.getTime() <= startsAt.getTime()) {
        throw new AvailabilityServiceError(
          "VALIDATION_ERROR",
          "Availability block end time must be after start time.",
          { field: "endsAt" },
        );
      }

      const existing = await repo.listBlocksForSupplier(actor.accountId, {
        from: startsAt,
        to: endsAt,
      });
      const assignedConflict = existing.find(
        (b) =>
          b.blockType === "assigned_trip" && windowsOverlap(startsAt, endsAt, b.startsAt, b.endsAt),
      );
      if (assignedConflict) {
        throw new AvailabilityServiceError(
          "CONFLICT",
          "This time window conflicts with an assigned trip.",
          { conflictingBlockId: assignedConflict.id, tripId: assignedConflict.tripId },
        );
      }

      return repo.insertBlock({
        supplierAccountId: actor.accountId,
        supplierRole: resolveSupplierRole(actor.role),
        tenantId: actor.activeTenantId ?? null,
        blockType: input.blockType,
        startsAt,
        endsAt,
        tripId: input.tripId ?? null,
        notes: input.notes?.trim() ?? null,
      });
    },

    async deleteBlock(
      actor: AvailabilityActorContext,
      input: DeleteAvailabilityBlockInput,
    ): Promise<{ deleted: true; blockId: string }> {
      const deleted = await repo.deleteBlockForSupplier(actor.accountId, input.blockId);
      if (!deleted) {
        throw new AvailabilityServiceError("RESOURCE_NOT_FOUND", "Availability block not found.");
      }
      return { deleted: true, blockId: deleted.id };
    },

    async checkSupplierAvailability(input: CheckSupplierAvailabilityInput): Promise<{
      supplierAccountId: string;
      isAvailable: boolean;
      conflictingBlocks: SupplierAvailabilityBlockDto[];
    }> {
      const startsAt = new Date(input.startsAt);
      const endsAt = new Date(input.endsAt);
      if (endsAt.getTime() <= startsAt.getTime()) {
        throw new AvailabilityServiceError(
          "VALIDATION_ERROR",
          "Check window end time must be after start time.",
          { field: "endsAt" },
        );
      }

      const blocks = await repo.listBlocksForSupplier(input.supplierAccountId, {
        from: startsAt,
        to: endsAt,
      });
      const conflictingBlocks = blocks.filter(
        (b) =>
          (b.blockType === "unavailable" || b.blockType === "assigned_trip") &&
          windowsOverlap(startsAt, endsAt, b.startsAt, b.endsAt),
      );

      return {
        supplierAccountId: input.supplierAccountId,
        isAvailable: conflictingBlocks.length === 0,
        conflictingBlocks,
      };
    },
  };
}
