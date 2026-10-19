// Data access through @trips-app/db. Every tenant-owned query filters by tenant (DAT-01).
import { and, asc, type Database, eq, inArray, lte, schema, sql } from "@trips-app/db";

import type { SeatInventoryStatus, SeatLayoutConfig } from "../model";

export type { Database as ServiceDatabase } from "@trips-app/db";

const { accounts, bookings, trips, tripSeatInventory, tripVehicles } = schema;

export function createSeatsRepository(db: Database) {
  return {
    async findTripById(tripId: string) {
      const [row] = await db.select().from(trips).where(eq(trips.id, tripId)).limit(1);
      return row ?? null;
    },

    async findAccountById(accountId: string) {
      const [row] = await db.select().from(accounts).where(eq(accounts.id, accountId)).limit(1);
      return row ?? null;
    },

    async listTripVehicles(tripId: string) {
      return db.select().from(tripVehicles).where(eq(tripVehicles.tripId, tripId));
    },

    async ensureSeatInventoryMaterialized(
      tenantId: string,
      tripId: string,
      vehicleId: string,
      layout: SeatLayoutConfig,
    ) {
      const existing = await db
        .select()
        .from(tripSeatInventory)
        .where(
          and(eq(tripSeatInventory.tripId, tripId), eq(tripSeatInventory.vehicleId, vehicleId)),
        );
      if (existing.length > 0) return existing;

      const seatCells = layout.cells.filter((c) => c.type === "seat");
      if (seatCells.length === 0) return [];

      const now = new Date();
      return db
        .insert(tripSeatInventory)
        .values(
          seatCells.map((cell, idx) => ({
            tenantId,
            tripId,
            vehicleId,
            seatLabel: cell.seatLabel ?? `S${idx + 1}`,
            rowIndex: cell.row,
            colIndex: cell.col,
            isAccessible: cell.isAccessible ?? false,
            isPriority: cell.isPriority ?? false,
            status: "available" as const,
            updatedAt: now,
          })),
        )
        .onConflictDoNothing()
        .returning();
    },

    async releaseExpiredHolds(tripId: string, now: Date) {
      await db
        .update(tripSeatInventory)
        .set({
          status: "available",
          heldByAccountId: null,
          holdExpiresAt: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(tripSeatInventory.tripId, tripId),
            eq(tripSeatInventory.status, "held"),
            lte(tripSeatInventory.holdExpiresAt, now),
          ),
        );
    },

    async listSeats(tripId: string, vehicleId: string) {
      return db
        .select()
        .from(tripSeatInventory)
        .where(
          and(eq(tripSeatInventory.tripId, tripId), eq(tripSeatInventory.vehicleId, vehicleId)),
        )
        .orderBy(asc(tripSeatInventory.rowIndex), asc(tripSeatInventory.colIndex));
    },

    async holdSeatsAtomically(
      tripId: string,
      vehicleId: string,
      seatLabels: readonly string[],
      accountId: string,
      holdExpiresAt: Date,
    ): Promise<
      | { kind: "ok"; heldSeats: (typeof tripSeatInventory.$inferSelect)[] }
      | { kind: "missing"; seatLabel: string }
      | { kind: "unavailable"; seatLabel: string; status: SeatInventoryStatus }
    > {
      return db.transaction(async (tx) => {
        const now = new Date();
        const rows = await tx
          .select()
          .from(tripSeatInventory)
          .where(
            and(
              eq(tripSeatInventory.tripId, tripId),
              eq(tripSeatInventory.vehicleId, vehicleId),
              inArray(tripSeatInventory.seatLabel, [...seatLabels]),
            ),
          )
          .for("update");

        const byLabel = new Map(rows.map((r) => [r.seatLabel, r]));
        for (const label of seatLabels) {
          const seat = byLabel.get(label);
          if (!seat) {
            return { kind: "missing", seatLabel: label };
          }
          const isExpiredHold =
            seat.status === "held" &&
            seat.holdExpiresAt !== null &&
            seat.holdExpiresAt.getTime() <= now.getTime();
          const isOwnHold = seat.status === "held" && seat.heldByAccountId === accountId;
          if (seat.status !== "available" && !isOwnHold && !isExpiredHold) {
            return {
              kind: "unavailable",
              seatLabel: label,
              status: seat.status,
            };
          }
        }

        const heldSeats = await tx
          .update(tripSeatInventory)
          .set({
            status: "held",
            heldByAccountId: accountId,
            holdExpiresAt,
            updatedAt: now,
          })
          .where(
            and(
              eq(tripSeatInventory.tripId, tripId),
              eq(tripSeatInventory.vehicleId, vehicleId),
              inArray(tripSeatInventory.seatLabel, [...seatLabels]),
            ),
          )
          .returning();

        return { kind: "ok", heldSeats };
      });
    },

    async releaseSeatsByLabels(
      tripId: string,
      vehicleId: string,
      seatLabels: readonly string[],
      heldByAccountId?: string | null,
    ) {
      const conditions = [
        eq(tripSeatInventory.tripId, tripId),
        eq(tripSeatInventory.vehicleId, vehicleId),
        inArray(tripSeatInventory.seatLabel, [...seatLabels]),
        eq(tripSeatInventory.status, "held"),
      ];
      if (heldByAccountId) {
        conditions.push(eq(tripSeatInventory.heldByAccountId, heldByAccountId));
      }
      return db
        .update(tripSeatInventory)
        .set({
          status: "available",
          heldByAccountId: null,
          holdExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(and(...conditions))
        .returning();
    },

    async updateSeatByOrg(
      tenantId: string,
      tripId: string,
      vehicleId: string,
      seatLabel: string,
      patch: {
        status: SeatInventoryStatus;
        bookingId: string | null;
        passengerName: string | null;
      },
    ) {
      const [updated] = await db
        .update(tripSeatInventory)
        .set({
          status: patch.status,
          bookingId: patch.bookingId,
          passengerName: patch.passengerName,
          heldByAccountId: null,
          holdExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tripSeatInventory.tenantId, tenantId),
            eq(tripSeatInventory.tripId, tripId),
            eq(tripSeatInventory.vehicleId, vehicleId),
            eq(tripSeatInventory.seatLabel, seatLabel),
          ),
        )
        .returning();
      return updated ?? null;
    },

    async syncTripSeatCounts(tripId: string) {
      const [counts] = await db
        .select({
          heldCount: sql<number>`count(*) filter (where ${tripSeatInventory.status} = 'held')::int`,
          reservedCount: sql<number>`count(*) filter (where ${tripSeatInventory.status} = 'reserved')::int`,
        })
        .from(tripSeatInventory)
        .where(eq(tripSeatInventory.tripId, tripId));
      const [bookingSum] = await db
        .select({
          bookedPassengers: sql<number>`coalesce(sum(${bookings.passengersCount}), 0)::int`,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.tripId, tripId),
            inArray(bookings.status, ["pending_payment", "confirmed"]),
          ),
        );
      const reservedCount = Number(counts?.reservedCount ?? 0);
      const bookedPassengers = Number(bookingSum?.bookedPassengers ?? 0);
      await db
        .update(trips)
        .set({
          heldSeatsCount: Number(counts?.heldCount ?? 0),
          confirmedSeatsCount: Math.max(reservedCount, bookedPassengers),
          updatedAt: new Date(),
        })
        .where(eq(trips.id, tripId));
    },
  };
}
