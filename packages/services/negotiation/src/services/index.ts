// Business logic for Negotiation. Routes call this factory with context.db; repositories are created here.
import { NegotiationServiceError } from "../errors";
import { findPlanCatalogEntry, isActiveNegotiationStatus, money } from "../model";
import { createNegotiationRepository, type ServiceDatabase } from "../repository";
import type {
  CreateNegotiationOfferInput,
  ListNegotiationsInput,
  NegotiationActorContext,
  RespondNegotiationOfferInput,
  SupplierNegotiationDto,
} from "../types";

export function createNegotiationService(db: ServiceDatabase) {
  const repo = createNegotiationRepository(db);

  function toDto(
    row: NonNullable<Awaited<ReturnType<typeof repo.findNegotiationById>>>,
  ): SupplierNegotiationDto {
    return {
      id: row.id,
      tenantId: row.tenantId,
      tripId: row.tripId,
      vehicleId: row.vehicleId,
      supplierAccountId: row.supplierAccountId,
      supplierRole: row.supplierRole,
      status: row.status,
      initialOffer: money(row.initialOfferMinor, row.currencyCode),
      initialOfferMinor: row.initialOfferMinor,
      currentOffer: money(row.currentOfferMinor, row.currencyCode),
      currentOfferMinor: row.currentOfferMinor,
      agreedPrice:
        row.agreedPriceMinor !== null ? money(row.agreedPriceMinor, row.currencyCode) : null,
      agreedPriceMinor: row.agreedPriceMinor,
      currencyCode: row.currencyCode,
      lastOfferedBy: row.lastOfferedBy,
      roundsCount: row.roundsCount,
      notes: row.notes,
      expiresAt: row.expiresAt,
      respondedAt: row.respondedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  return {
    async createOffer(
      actor: NegotiationActorContext,
      input: CreateNegotiationOfferInput,
    ): Promise<SupplierNegotiationDto> {
      const tenantId = actor.activeTenantId;
      if (!tenantId) {
        throw new NegotiationServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const trip = await repo.findTripForTenant(tenantId, input.tripId);
      if (!trip) {
        throw new NegotiationServiceError("RESOURCE_NOT_FOUND", "Trip not found.");
      }

      const orgPlanInfo = await repo.findOrganizationPlan(tenantId);
      if (!orgPlanInfo) {
        throw new NegotiationServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }

      const fallbackPlan = findPlanCatalogEntry("organization", orgPlanInfo.org.planTier);
      const allowsSuppliers =
        orgPlanInfo.plan?.features.platformSuppliers ??
        fallbackPlan?.features.platformSuppliers ??
        false;
      if (!allowsSuppliers) {
        throw new NegotiationServiceError(
          "PLAN_REQUIRED",
          `Organization plan "${orgPlanInfo.org.planTier}" does not include platform supplier marketplace negotiations.`,
          { feature: "platformSuppliers", planTier: orgPlanInfo.org.planTier },
        );
      }

      const expiryHours = input.expiryHours ?? 24;
      const expiresAt = new Date(Date.now() + expiryHours * 3600 * 1000);

      const created = await repo.insertNegotiation({
        tenantId,
        tripId: input.tripId,
        vehicleId: input.vehicleId ?? null,
        supplierAccountId: input.supplierAccountId,
        supplierRole: input.supplierRole,
        initialOfferMinor: input.offerAmountMinor,
        currentOfferMinor: input.offerAmountMinor,
        currencyCode: input.currencyCode ?? trip.currencyCode,
        notes: input.notes?.trim() ?? null,
        expiresAt,
        createdByAccountId: actor.accountId,
      });

      return toDto(created);
    },

    async respondToOffer(
      actor: NegotiationActorContext,
      input: RespondNegotiationOfferInput,
    ): Promise<SupplierNegotiationDto> {
      const existing = await repo.findNegotiationById(input.negotiationId);
      if (!existing) {
        throw new NegotiationServiceError("RESOURCE_NOT_FOUND", "Negotiation offer not found.");
      }

      const isOrgActor =
        Boolean(actor.activeTenantId) && actor.activeTenantId === existing.tenantId;
      const isSupplierActor = actor.accountId === existing.supplierAccountId;

      if (!isOrgActor && !isSupplierActor) {
        throw new NegotiationServiceError("RESOURCE_NOT_FOUND", "Negotiation offer not found.");
      }

      if (!isActiveNegotiationStatus(existing.status)) {
        throw new NegotiationServiceError(
          "INVALID_STATE_TRANSITION",
          `Cannot respond to negotiation in state "${existing.status}".`,
          { currentState: existing.status },
        );
      }

      const now = new Date();
      if (existing.expiresAt.getTime() <= now.getTime()) {
        await repo.updateNegotiation(existing.id, { status: "expired", respondedAt: now });
        throw new NegotiationServiceError(
          "INVALID_STATE_TRANSITION",
          "Negotiation offer has expired.",
          { expiredAt: existing.expiresAt.toISOString() },
        );
      }

      const party: "organization" | "supplier" = isOrgActor ? "organization" : "supplier";

      if (input.action === "cancel") {
        if (!isOrgActor) {
          throw new NegotiationServiceError(
            "FORBIDDEN",
            "Only the organization can cancel an offer.",
          );
        }
        const updated = await repo.updateNegotiation(existing.id, {
          status: "cancelled",
          notes: input.notes?.trim() ?? existing.notes,
          respondedAt: now,
        });
        return toDto(updated!);
      }

      if (input.action === "decline") {
        const updated = await repo.updateNegotiation(existing.id, {
          status: "declined",
          notes: input.notes?.trim() ?? existing.notes,
          respondedAt: now,
        });
        return toDto(updated!);
      }

      if (input.action === "accept") {
        if (existing.lastOfferedBy === party) {
          throw new NegotiationServiceError(
            "INVALID_STATE_TRANSITION",
            "Waiting for the counterparty to respond to your latest offer.",
          );
        }
        const updated = await repo.updateNegotiation(existing.id, {
          status: "accepted",
          agreedPriceMinor: existing.currentOfferMinor,
          notes: input.notes?.trim() ?? existing.notes,
          respondedAt: now,
        });

        if (existing.vehicleId) {
          await repo.assignAcceptedSupplierToVehicle(
            existing.tenantId,
            existing.tripId,
            existing.vehicleId,
            existing.supplierRole,
            existing.supplierAccountId,
          );
        }
        return toDto(updated!);
      }

      // action === "counter"
      if (!input.counterOfferMinor) {
        throw new NegotiationServiceError(
          "VALIDATION_ERROR",
          "counterOfferMinor is required when countering an offer.",
          { field: "counterOfferMinor" },
        );
      }

      const nextStatus = party === "supplier" ? "countered_by_supplier" : "countered_by_org";
      const updated = await repo.updateNegotiation(existing.id, {
        status: nextStatus,
        currentOfferMinor: input.counterOfferMinor,
        lastOfferedBy: party,
        roundsCount: existing.roundsCount + 1,
        notes: input.notes?.trim() ?? existing.notes,
        respondedAt: now,
      });

      return toDto(updated!);
    },

    async listOrganizationNegotiations(
      actor: NegotiationActorContext,
      input?: ListNegotiationsInput,
    ): Promise<{ items: SupplierNegotiationDto[] }> {
      if (!actor.activeTenantId) {
        throw new NegotiationServiceError("TENANT_NOT_FOUND", "Organization resource not found.");
      }
      const rows = await repo.listForTenant(actor.activeTenantId, input);
      return { items: rows.map(toDto) };
    },

    async listSupplierOffers(
      actor: NegotiationActorContext,
      input?: ListNegotiationsInput,
    ): Promise<{ items: SupplierNegotiationDto[] }> {
      const rows = await repo.listForSupplier(actor.accountId, input);
      return { items: rows.map(toDto) };
    },
  };
}
