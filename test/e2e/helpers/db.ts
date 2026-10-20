import { randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createDb,
  type Database,
  demoAccountId,
  type DemoSeedSummary,
  eq,
  inArray,
  schema,
  seedDemoData,
} from "@trips-app/db";

export function resolveTestDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envPath = resolve(import.meta.dir, "../../../apps/server/.env");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    const match = content.match(/^DATABASE_URL=(.+)$/m);
    if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
  }
  return "postgresql://postgres:postgres@localhost:5432/trips";
}

let _db: Database | null = null;
export function getTestDb(): Database {
  if (!_db) {
    _db = createDb({ DATABASE_URL: resolveTestDatabaseUrl() });
  }
  return _db;
}

export interface TestFixtureContext {
  tenantId: string;
  ownerAccountId: string;
}

let _context: TestFixtureContext | null = null;
export async function getTestContext(): Promise<TestFixtureContext> {
  if (_context) return _context;
  const db = getTestDb();
  const [org] = await db.select().from(schema.organizations).limit(1);
  const [account] = await db.select().from(schema.accounts).limit(1);

  if (org && account) {
    _context = {
      tenantId: org.id,
      ownerAccountId: account.id,
    };
    return _context;
  }

  try {
    const summary = await seedDemoData(db);
    _context = {
      tenantId: summary.ids.organizations.nileHorizonEnterprise,
      ownerAccountId: summary.ids.accounts.nileOwner,
    };
    return _context;
  } catch {
    const [fallbackOrg] = await db.select().from(schema.organizations).limit(1);
    const [fallbackAccount] = await db.select().from(schema.accounts).limit(1);
    if (!fallbackOrg || !fallbackAccount) {
      throw new Error("Could not find or seed test organization/account");
    }
    _context = {
      tenantId: fallbackOrg.id,
      ownerAccountId: fallbackAccount.id,
    };
    return _context;
  }
}

export class TestEntityTracker {
  private tripIds: string[] = [];
  private vehicleIds: string[] = [];
  private vehicleTypeIds: string[] = [];
  private employeeMembershipIds: string[] = [];
  private bookingIds: string[] = [];
  private paymentTransactionIds: string[] = [];
  private uploadedFileIds: string[] = [];
  private accountIds: string[] = [];
  private organizationIds: string[] = [];
  private couponIds: string[] = [];

  trackTrip(id: string) {
    this.tripIds.push(id);
    return id;
  }
  trackVehicle(id: string) {
    this.vehicleIds.push(id);
    return id;
  }
  trackVehicleType(id: string) {
    this.vehicleTypeIds.push(id);
    return id;
  }
  trackEmployee(id: string) {
    this.employeeMembershipIds.push(id);
    return id;
  }
  trackBooking(id: string) {
    this.bookingIds.push(id);
    return id;
  }
  trackPayment(id: string) {
    this.paymentTransactionIds.push(id);
    return id;
  }
  trackFile(id: string) {
    this.uploadedFileIds.push(id);
    return id;
  }
  trackAccount(id: string) {
    this.accountIds.push(id);
    return id;
  }
  trackOrganization(id: string) {
    this.organizationIds.push(id);
    return id;
  }
  trackCoupon(id: string) {
    this.couponIds.push(id);
    return id;
  }

  async cleanup(db: Database = getTestDb()) {
    if (this.bookingIds.length > 0) {
      await db.delete(schema.bookings).where(inArray(schema.bookings.id, this.bookingIds));
      this.bookingIds = [];
    }
    if (this.paymentTransactionIds.length > 0) {
      await db
        .delete(schema.paymentTransactions)
        .where(inArray(schema.paymentTransactions.id, this.paymentTransactionIds));
      this.paymentTransactionIds = [];
    }
    if (this.tripIds.length > 0) {
      await db.delete(schema.tripVehicles).where(inArray(schema.tripVehicles.tripId, this.tripIds));
      await db.delete(schema.tripPrograms).where(inArray(schema.tripPrograms.tripId, this.tripIds));
      await db
        .delete(schema.tripSeatInventory)
        .where(inArray(schema.tripSeatInventory.tripId, this.tripIds));
      await db.delete(schema.trips).where(inArray(schema.trips.id, this.tripIds));
      this.tripIds = [];
    }
    if (this.vehicleIds.length > 0) {
      await db.delete(schema.vehicles).where(inArray(schema.vehicles.id, this.vehicleIds));
      this.vehicleIds = [];
    }
    if (this.vehicleTypeIds.length > 0) {
      await db
        .delete(schema.vehicleTypes)
        .where(inArray(schema.vehicleTypes.id, this.vehicleTypeIds));
      this.vehicleTypeIds = [];
    }
    if (this.couponIds.length > 0) {
      await db.delete(schema.coupons).where(inArray(schema.coupons.id, this.couponIds));
      this.couponIds = [];
    }
    if (this.employeeMembershipIds.length > 0) {
      await db
        .delete(schema.employeeMemberships)
        .where(inArray(schema.employeeMemberships.id, this.employeeMembershipIds));
      this.employeeMembershipIds = [];
    }
    if (this.uploadedFileIds.length > 0) {
      await db
        .delete(schema.uploadedFiles)
        .where(inArray(schema.uploadedFiles.id, this.uploadedFileIds));
      this.uploadedFileIds = [];
    }
    if (this.organizationIds.length > 0) {
      await db
        .delete(schema.organizations)
        .where(inArray(schema.organizations.id, this.organizationIds));
      this.organizationIds = [];
    }
    if (this.accountIds.length > 0) {
      await db.delete(schema.accounts).where(inArray(schema.accounts.id, this.accountIds));
      this.accountIds = [];
    }
  }
}

export function generateTestSuffix(): string {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}
