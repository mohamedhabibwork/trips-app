// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, desc, type Database, eq, schema } from "@trips-app/db";

import type {
  CurrencyCode,
  NegotiationOfferParty,
  NegotiationStatus,
  PlatformSupplierRole,
} from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { organizations, planCatalog, supplierNegotiations, trips, tripVehicles } = schema;

export function createNegotiationRepository(db: Database) {
  return {
    async findOrganizationPlan(tenantId: string) {
      const [org] = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, tenantId))
        .limit(1);
      if (!org) return null;
      const [plan] = await db
        .select()
        .from(planCatalog)
        .where(and(eq(planCatalog.role, "organization"), eq(planCatalog.tier, org.planTier)))
        .limit(1);
      return { org, plan: plan ?? null };
    },

    async findTripForTenant(tenantId: string, tripId: string) {
      const [row] = await db
        .select()
        .from(trips)
        .where(and(eq(trips.id, tripId), eq(trips.tenantId, tenantId)))
        .limit(1);
      return row ?? null;
    },

    async insertNegotiation(values: {
      tenantId: string;
      tripId: string;
      vehicleId: string | null;
      supplierAccountId: string;
      supplierRole: PlatformSupplierRole;
      initialOfferMinor: number;
      currentOfferMinor: number;
      currencyCode: CurrencyCode;
      notes: string | null;
      expiresAt: Date;
      createdByAccountId: string;
    }) {
      const now = new Date();
      const [created] = await db
        .insert(supplierNegotiations)
        .values({
          ...values,
          status: "pending_supplier",
          lastOfferedBy: "organization",
          roundsCount: 1,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      return created!;
    },

    async findNegotiationById(negotiationId: string) {
      const [row] = await db
        .select()
        .from(supplierNegotiations)
        .where(eq(supplierNegotiations.id, negotiationId))
        .limit(1);
      return row ?? null;
    },

    async updateNegotiation(
      negotiationId: string,
      patch: {
        status?: NegotiationStatus;
        currentOfferMinor?: number;
        agreedPriceMinor?: number | null;
        lastOfferedBy?: NegotiationOfferParty;
        roundsCount?: number;
        notes?: string | null;
        respondedAt?: Date;
      },
    ) {
      const [updated] = await db
        .update(supplierNegotiations)
        .set({
          ...patch,
          updatedAt: new Date(),
        })
        .where(eq(supplierNegotiations.id, negotiationId))
        .returning();
      return updated ?? null;
    },

    async assignAcceptedSupplierToVehicle(
      tenantId: string,
      tripId: string,
      vehicleId: string,
      supplierRole: PlatformSupplierRole,
      supplierAccountId: string,
    ) {
      const patch =
        supplierRole === "platform_driver"
          ? { driverSource: "platform_supplier" as const, driverAccountId: supplierAccountId }
          : {
              photographerSource: "platform_supplier" as const,
              photographerAccountId: supplierAccountId,
            };
      await db
        .update(tripVehicles)
        .set({ ...patch, updatedAt: new Date() })
        .where(
          and(
            eq(tripVehicles.tenantId, tenantId),
            eq(tripVehicles.tripId, tripId),
            eq(tripVehicles.vehicleId, vehicleId),
          ),
        );
    },

    async listForTenant(
      tenantId: string,
      filters?: { tripId?: string; status?: NegotiationStatus },
    ) {
      const conditions = [eq(supplierNegotiations.tenantId, tenantId)];
      if (filters?.tripId) {
        conditions.push(eq(supplierNegotiations.tripId, filters.tripId));
      }
      if (filters?.status) {
        conditions.push(eq(supplierNegotiations.status, filters.status));
      }
      return db
        .select()
        .from(supplierNegotiations)
        .where(and(...conditions))
        .orderBy(desc(supplierNegotiations.createdAt));
    },

    async listForSupplier(
      supplierAccountId: string,
      filters?: { tripId?: string; status?: NegotiationStatus },
    ) {
      const conditions = [eq(supplierNegotiations.supplierAccountId, supplierAccountId)];
      if (filters?.tripId) {
        conditions.push(eq(supplierNegotiations.tripId, filters.tripId));
      }
      if (filters?.status) {
        conditions.push(eq(supplierNegotiations.status, filters.status));
      }
      return db
        .select()
        .from(supplierNegotiations)
        .where(and(...conditions))
        .orderBy(desc(supplierNegotiations.createdAt));
    },
  };
}
